import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

interface QuizSubmission {
  answers: Array<{
    questionId: number
    selectedAnswer: number | string
    timeSpent: number
  }>
  totalTimeSpent: number
}

export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quizId } = params
    const body: QuizSubmission = await request.json()

    // Validate submission
    if (!body.answers || !Array.isArray(body.answers)) {
      return NextResponse.json(
        { error: 'Invalid submission format' },
        { status: 400 }
      )
    }

    // Get quiz with questions
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        topic: {
          include: {
            learningPlan: true
          }
        }
      }
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Check access
    if (quiz.topic.learningPlan.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if topic is unlocked
    if (quiz.topic.status === 'locked') {
      return NextResponse.json(
        { error: 'This topic is locked' },
        { status: 403 }
      )
    }

    // Check attempts limit
    const previousAttempts = await db.quizResult.count({
      where: {
        quizId: quiz.id,
        userId: session.user.id
      }
    })

    if (previousAttempts >= 3) {
      return NextResponse.json(
        { error: 'Maximum attempts exceeded' },
        { status: 403 }
      )
    }

    // Grade the quiz
    const questions = quiz.questions as any[]
    let totalPoints = 0
    let earnedPoints = 0
    const gradedAnswers = []

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      const userAnswer = body.answers.find(a => a.questionId === (question.id || i + 1))
      
      const points = question.points || 10
      totalPoints += points
      
      const isCorrect = userAnswer?.selectedAnswer === question.correctAnswer
      if (isCorrect) {
        earnedPoints += points
      }

      gradedAnswers.push({
        questionId: question.id || i + 1,
        question: question.question,
        userAnswer: userAnswer?.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
        points: isCorrect ? points : 0,
        timeSpent: userAnswer?.timeSpent || 0
      })
    }

    const score = Math.round((earnedPoints / totalPoints) * 100)
    const passed = score >= quiz.passingScore

    // Save quiz result
    const quizResult = await db.quizResult.create({
      data: {
        userId: session.user.id,
        quizId: quiz.id,
        score,
        passed,
        answers: gradedAnswers,
        timeSpent: body.totalTimeSpent || 0
      }
    })

    // Update topic progress if quiz passed
    if (passed) {
      await db.learningProgress.upsert({
        where: {
          userId_topicId: {
            userId: session.user.id,
            topicId: quiz.topic.id
          }
        },
        update: {
          status: 'completed',
          completedAt: new Date(),
          masteryScore: score,
          timeSpent: {
            increment: body.totalTimeSpent || 0
          }
        },
        create: {
          userId: session.user.id,
          topicId: quiz.topic.id,
          learningPlanId: quiz.topic.learningPlanId,
          status: 'completed',
          completedAt: new Date(),
          masteryScore: score,
          timeSpent: body.totalTimeSpent || 0
        }
      })

      // Unlock next topic if this was the current one
      const nextTopic = await db.topic.findFirst({
        where: {
          learningPlanId: quiz.topic.learningPlanId,
          dayIndex: quiz.topic.dayIndex + 1
        }
      })

      if (nextTopic) {
        await db.topic.update({
          where: { id: nextTopic.id },
          data: { status: 'unlocked' }
        })
      }
    }

    return NextResponse.json({
      result: {
        id: quizResult.id,
        score,
        passed,
        totalQuestions: questions.length,
        correctAnswers: gradedAnswers.filter(a => a.isCorrect).length,
        timeSpent: body.totalTimeSpent,
        passingScore: quiz.passingScore,
        answers: gradedAnswers,
        attemptsUsed: previousAttempts + 1,
        attemptsRemaining: 3 - (previousAttempts + 1)
      }
    })
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
