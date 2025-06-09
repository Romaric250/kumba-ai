import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

interface CompleteTopicRequest {
  timeSpent: number
  masteryScore?: number
  notes?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { topicId } = params
    const body: CompleteTopicRequest = await request.json()

    // Validate input
    if (typeof body.timeSpent !== 'number' || body.timeSpent < 0) {
      return NextResponse.json(
        { error: 'Invalid time spent value' },
        { status: 400 }
      )
    }

    // Get topic with learning plan
    const topic = await db.topic.findUnique({
      where: { id: topicId },
      include: {
        learningPlan: true,
        quizzes: {
          include: {
            quizResults: {
              where: { userId: session.user.id },
              orderBy: { completedAt: 'desc' },
              take: 1
            }
          }
        }
      }
    })

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // Check if user has access
    if (topic.learningPlan.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if topic is unlocked
    if (topic.status === 'locked') {
      return NextResponse.json(
        { error: 'Topic is locked. Complete previous topics first.' },
        { status: 403 }
      )
    }

    // Check if quiz is required and passed
    const hasQuiz = topic.quizzes.length > 0
    let quizPassed = true
    let finalMasteryScore = body.masteryScore || 100

    if (hasQuiz) {
      const latestQuizResult = topic.quizzes[0]?.quizResults[0]
      if (!latestQuizResult || !latestQuizResult.passed) {
        return NextResponse.json(
          { error: 'You must pass the quiz before completing this topic' },
          { status: 403 }
        )
      }
      finalMasteryScore = latestQuizResult.score
      quizPassed = latestQuizResult.passed
    }

    // Update or create learning progress
    const progress = await db.learningProgress.upsert({
      where: {
        userId_topicId: {
          userId: session.user.id,
          topicId: topic.id
        }
      },
      update: {
        status: 'completed',
        completedAt: new Date(),
        timeSpent: {
          increment: body.timeSpent
        },
        masteryScore: finalMasteryScore
      },
      create: {
        userId: session.user.id,
        topicId: topic.id,
        learningPlanId: topic.learningPlanId,
        status: 'completed',
        completedAt: new Date(),
        timeSpent: body.timeSpent,
        masteryScore: finalMasteryScore
      }
    })

    // Update topic status
    await db.topic.update({
      where: { id: topic.id },
      data: { status: 'completed' }
    })

    // Unlock next topic
    const nextTopic = await db.topic.findFirst({
      where: {
        learningPlanId: topic.learningPlanId,
        dayIndex: topic.dayIndex + 1
      }
    })

    let nextTopicUnlocked = false
    if (nextTopic && nextTopic.status === 'locked') {
      await db.topic.update({
        where: { id: nextTopic.id },
        data: { status: 'unlocked' }
      })
      nextTopicUnlocked = true
    }

    // Check if learning plan is completed
    const totalTopics = await db.topic.count({
      where: { learningPlanId: topic.learningPlanId }
    })

    const completedTopics = await db.learningProgress.count({
      where: {
        learningPlanId: topic.learningPlanId,
        userId: session.user.id,
        status: 'completed'
      }
    })

    let planCompleted = false
    if (completedTopics === totalTopics) {
      await db.learningPlan.update({
        where: { id: topic.learningPlanId },
        data: { status: 'completed' }
      })
      planCompleted = true
    }

    // Calculate achievement data
    const achievements = await calculateAchievements(session.user.id, topic.learningPlanId)

    // Generate personalized feedback
    const feedback = generateCompletionFeedback(
      finalMasteryScore,
      body.timeSpent,
      topic.timeEstimate || 60,
      quizPassed
    )

    return NextResponse.json({
      success: true,
      progress: {
        id: progress.id,
        status: progress.status,
        completedAt: progress.completedAt,
        timeSpent: progress.timeSpent,
        masteryScore: progress.masteryScore
      },
      nextTopic: nextTopicUnlocked ? {
        id: nextTopic?.id,
        title: nextTopic?.title,
        dayIndex: nextTopic?.dayIndex
      } : null,
      planCompleted,
      achievements,
      feedback
    })
  } catch (error) {
    console.error('Error completing topic:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function calculateAchievements(userId: string, learningPlanId: string) {
  const achievements = []

  // Check for streak achievements
  const recentProgress = await db.learningProgress.findMany({
    where: {
      userId,
      learningPlanId,
      completedAt: {
        not: null,
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    },
    orderBy: { completedAt: 'desc' }
  })

  const streak = calculateStreak(recentProgress)
  if (streak >= 7) {
    achievements.push({
      type: 'streak',
      title: 'Week Warrior',
      description: '7 days learning streak!',
      icon: '🔥'
    })
  }
  if (streak >= 30) {
    achievements.push({
      type: 'streak',
      title: 'Monthly Master',
      description: '30 days learning streak!',
      icon: '🏆'
    })
  }

  // Check for quiz performance achievements
  const quizResults = await db.quizResult.findMany({
    where: {
      userId,
      quiz: {
        topic: {
          learningPlanId
        }
      }
    }
  })

  const perfectScores = quizResults.filter(r => r.score === 100).length
  if (perfectScores >= 5) {
    achievements.push({
      type: 'performance',
      title: 'Perfect Scholar',
      description: '5 perfect quiz scores!',
      icon: '⭐'
    })
  }

  return achievements
}

function calculateStreak(progressRecords: any[]): number {
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

function generateCompletionFeedback(
  masteryScore: number,
  timeSpent: number,
  estimatedTime: number,
  quizPassed: boolean
): string[] {
  const feedback = []

  if (masteryScore >= 90) {
    feedback.push("🌟 Excellent mastery! You've truly understood this topic.")
  } else if (masteryScore >= 70) {
    feedback.push("✅ Good job! You've grasped the key concepts well.")
  } else if (quizPassed) {
    feedback.push("👍 You passed! Consider reviewing to strengthen your understanding.")
  }

  const timeRatio = timeSpent / estimatedTime
  if (timeRatio > 1.5) {
    feedback.push("🔍 You took extra time to thoroughly understand the material - great dedication!")
  } else if (timeRatio < 0.5) {
    feedback.push("⚡ You completed this quickly! Make sure you've absorbed all the key points.")
  } else {
    feedback.push("⏰ Perfect pacing! You're managing your study time well.")
  }

  return feedback
}
