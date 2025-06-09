import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quizId } = params

    // Get quiz results for the user
    const quizResults = await db.quizResult.findMany({
      where: {
        quizId,
        userId: session.user.id
      },
      include: {
        quiz: {
          select: {
            title: true,
            passingScore: true,
            topic: {
              select: {
                title: true,
                dayIndex: true
              }
            }
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    })

    if (quizResults.length === 0) {
      return NextResponse.json(
        { error: 'No quiz results found' },
        { status: 404 }
      )
    }

    // Calculate statistics
    const bestScore = Math.max(...quizResults.map(r => r.score))
    const averageScore = Math.round(
      quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length
    )
    const totalAttempts = quizResults.length
    const passedAttempts = quizResults.filter(r => r.passed).length
    const totalTimeSpent = quizResults.reduce((sum, r) => sum + r.timeSpent, 0)

    // Get detailed results
    const detailedResults = quizResults.map(result => ({
      id: result.id,
      score: result.score,
      passed: result.passed,
      completedAt: result.completedAt,
      timeSpent: result.timeSpent,
      answers: result.answers,
      attemptNumber: quizResults.length - quizResults.indexOf(result)
    }))

    // Performance analysis
    const performanceAnalysis = {
      improvement: quizResults.length > 1 
        ? quizResults[0].score - quizResults[quizResults.length - 1].score
        : 0,
      consistency: calculateConsistency(quizResults.map(r => r.score)),
      timeEfficiency: calculateTimeEfficiency(quizResults),
      strongAreas: identifyStrongAreas(quizResults),
      weakAreas: identifyWeakAreas(quizResults)
    }

    return NextResponse.json({
      quiz: {
        title: quizResults[0].quiz.title,
        topic: quizResults[0].quiz.topic.title,
        dayIndex: quizResults[0].quiz.topic.dayIndex,
        passingScore: quizResults[0].quiz.passingScore
      },
      statistics: {
        bestScore,
        averageScore,
        totalAttempts,
        passedAttempts,
        totalTimeSpent,
        passRate: Math.round((passedAttempts / totalAttempts) * 100)
      },
      results: detailedResults,
      analysis: performanceAnalysis
    })
  } catch (error) {
    console.error('Error fetching quiz results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateConsistency(scores: number[]): number {
  if (scores.length < 2) return 100
  
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
  const standardDeviation = Math.sqrt(variance)
  
  // Convert to consistency percentage (lower deviation = higher consistency)
  return Math.max(0, Math.round(100 - (standardDeviation / mean) * 100))
}

function calculateTimeEfficiency(results: any[]): number {
  if (results.length === 0) return 0
  
  const averageTime = results.reduce((sum, r) => sum + r.timeSpent, 0) / results.length
  const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length
  
  // Efficiency = score per minute (higher is better)
  return Math.round((averageScore / (averageTime / 60)) * 10) / 10
}

function identifyStrongAreas(results: any[]): string[] {
  if (results.length === 0) return []
  
  const questionPerformance: { [key: string]: { correct: number; total: number } } = {}
  
  results.forEach(result => {
    if (result.answers && Array.isArray(result.answers)) {
      result.answers.forEach((answer: any) => {
        const questionText = answer.question?.substring(0, 50) + '...'
        if (!questionPerformance[questionText]) {
          questionPerformance[questionText] = { correct: 0, total: 0 }
        }
        questionPerformance[questionText].total++
        if (answer.isCorrect) {
          questionPerformance[questionText].correct++
        }
      })
    }
  })
  
  return Object.entries(questionPerformance)
    .filter(([, perf]) => perf.correct / perf.total >= 0.8)
    .map(([question]) => question)
    .slice(0, 3)
}

function identifyWeakAreas(results: any[]): string[] {
  if (results.length === 0) return []
  
  const questionPerformance: { [key: string]: { correct: number; total: number } } = {}
  
  results.forEach(result => {
    if (result.answers && Array.isArray(result.answers)) {
      result.answers.forEach((answer: any) => {
        const questionText = answer.question?.substring(0, 50) + '...'
        if (!questionPerformance[questionText]) {
          questionPerformance[questionText] = { correct: 0, total: 0 }
        }
        questionPerformance[questionText].total++
        if (answer.isCorrect) {
          questionPerformance[questionText].correct++
        }
      })
    }
  })
  
  return Object.entries(questionPerformance)
    .filter(([, perf]) => perf.correct / perf.total < 0.5)
    .map(([question]) => question)
    .slice(0, 3)
}
