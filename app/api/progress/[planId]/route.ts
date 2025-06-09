import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId } = params

    // Get learning plan with all related data
    const learningPlan = await db.learningPlan.findUnique({
      where: {
        id: planId,
        userId: session.user.id
      },
      include: {
        learningMaterial: {
          select: {
            title: true,
            fileType: true,
            status: true
          }
        },
        topics: {
          include: {
            quizzes: {
              include: {
                quizResults: {
                  where: { userId: session.user.id },
                  orderBy: { completedAt: 'desc' },
                  take: 1
                }
              }
            },
            progress: {
              where: { userId: session.user.id }
            }
          },
          orderBy: { dayIndex: 'asc' }
        },
        progress: {
          where: { userId: session.user.id }
        }
      }
    })

    if (!learningPlan) {
      return NextResponse.json(
        { error: 'Learning plan not found' },
        { status: 404 }
      )
    }

    // Calculate overall progress statistics
    const totalTopics = learningPlan.topics.length
    const completedTopics = learningPlan.topics.filter(
      topic => topic.progress[0]?.status === 'completed'
    ).length
    const inProgressTopics = learningPlan.topics.filter(
      topic => topic.progress[0]?.status === 'in_progress'
    ).length

    const overallProgress = Math.round((completedTopics / totalTopics) * 100)
    
    // Calculate total time spent
    const totalTimeSpent = learningPlan.progress.reduce(
      (sum, p) => sum + p.timeSpent, 0
    )

    // Calculate average quiz scores
    const quizScores = learningPlan.topics
      .flatMap(topic => topic.quizzes)
      .flatMap(quiz => quiz.quizResults)
      .map(result => result.score)
    
    const averageQuizScore = quizScores.length > 0
      ? Math.round(quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length)
      : 0

    // Get current topic (first unlocked/in-progress topic)
    const currentTopic = learningPlan.topics.find(
      topic => topic.status === 'unlocked' || 
               topic.progress[0]?.status === 'in_progress'
    ) || learningPlan.topics.find(topic => topic.status === 'unlocked')

    // Calculate estimated completion date
    const avgTimePerTopic = totalTimeSpent / Math.max(completedTopics, 1)
    const remainingTopics = totalTopics - completedTopics
    const estimatedRemainingTime = remainingTopics * avgTimePerTopic
    const estimatedCompletionDate = new Date(Date.now() + estimatedRemainingTime * 60 * 1000)

    // Prepare topic details
    const topicDetails = learningPlan.topics.map(topic => {
      const progress = topic.progress[0]
      const latestQuizResult = topic.quizzes[0]?.quizResults[0]
      
      return {
        id: topic.id,
        title: topic.title,
        description: topic.description,
        dayIndex: topic.dayIndex,
        status: topic.status,
        goals: topic.goals,
        timeEstimate: topic.timeEstimate,
        progress: {
          status: progress?.status || 'not_started',
          completedAt: progress?.completedAt,
          timeSpent: progress?.timeSpent || 0,
          masteryScore: progress?.masteryScore
        },
        quiz: topic.quizzes[0] ? {
          id: topic.quizzes[0].id,
          title: topic.quizzes[0].title,
          passingScore: topic.quizzes[0].passingScore,
          lastResult: latestQuizResult ? {
            score: latestQuizResult.score,
            passed: latestQuizResult.passed,
            completedAt: latestQuizResult.completedAt
          } : null
        } : null,
        isUnlocked: topic.status !== 'locked',
        canStart: topic.status === 'unlocked' || progress?.status === 'in_progress'
      }
    })

    // Learning streak calculation
    const recentProgress = await db.learningProgress.findMany({
      where: {
        userId: session.user.id,
        learningPlanId: planId,
        completedAt: {
          not: null
        }
      },
      orderBy: { completedAt: 'desc' },
      take: 30
    })

    const learningStreak = calculateLearningStreak(recentProgress)

    // Performance insights
    const insights = generatePerformanceInsights(
      learningPlan,
      overallProgress,
      averageQuizScore,
      totalTimeSpent
    )

    return NextResponse.json({
      plan: {
        id: learningPlan.id,
        title: learningPlan.title,
        description: learningPlan.description,
        totalDays: learningPlan.totalDays,
        status: learningPlan.status,
        createdAt: learningPlan.createdAt,
        material: learningPlan.learningMaterial
      },
      statistics: {
        overallProgress,
        completedTopics,
        totalTopics,
        inProgressTopics,
        totalTimeSpent,
        averageQuizScore,
        learningStreak,
        estimatedCompletionDate
      },
      currentTopic: currentTopic ? {
        id: currentTopic.id,
        title: currentTopic.title,
        dayIndex: currentTopic.dayIndex
      } : null,
      topics: topicDetails,
      insights
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateLearningStreak(progressRecords: any[]): number {
  if (progressRecords.length === 0) return 0

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (const record of progressRecords) {
    const recordDate = new Date(record.completedAt)
    recordDate.setHours(0, 0, 0, 0)

    const daysDiff = Math.floor((currentDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff === streak) {
      streak++
    } else if (daysDiff > streak) {
      break
    }
  }

  return streak
}

function generatePerformanceInsights(
  plan: any,
  progress: number,
  avgQuizScore: number,
  timeSpent: number
): string[] {
  const insights: string[] = []

  if (progress >= 80) {
    insights.push("🎉 Excellent progress! You're almost done with this learning plan.")
  } else if (progress >= 50) {
    insights.push("👍 Great job! You're halfway through your learning journey.")
  } else if (progress < 20) {
    insights.push("🚀 Just getting started! Stay consistent for best results.")
  }

  if (avgQuizScore >= 90) {
    insights.push("🌟 Outstanding quiz performance! You're mastering the material.")
  } else if (avgQuizScore >= 70) {
    insights.push("✅ Good quiz scores! Keep up the solid work.")
  } else if (avgQuizScore > 0 && avgQuizScore < 70) {
    insights.push("📚 Consider reviewing topics where quiz scores are lower.")
  }

  const avgTimePerTopic = timeSpent / Math.max(plan.topics.filter((t: any) => t.progress[0]?.status === 'completed').length, 1)
  if (avgTimePerTopic > 120) {
    insights.push("⏰ You're taking your time to thoroughly understand each topic.")
  } else if (avgTimePerTopic < 30) {
    insights.push("⚡ You're moving quickly! Make sure you're absorbing the material.")
  }

  return insights
}
