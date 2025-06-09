import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get all learning plans for the user
    const learningPlans = await db.learningPlan.findMany({
      where: { userId },
      include: {
        topics: {
          include: {
            progress: {
              where: { userId }
            },
            quizzes: {
              include: {
                quizResults: {
                  where: { userId },
                  orderBy: { completedAt: 'desc' }
                }
              }
            }
          }
        },
        learningMaterial: {
          select: {
            title: true,
            fileType: true
          }
        }
      }
    })

    // Calculate overall statistics
    const totalPlans = learningPlans.length
    const activePlans = learningPlans.filter(plan => plan.status === 'active').length
    const completedPlans = learningPlans.filter(plan => plan.status === 'completed').length

    const allTopics = learningPlans.flatMap(plan => plan.topics)
    const totalTopics = allTopics.length
    const completedTopics = allTopics.filter(
      topic => topic.progress[0]?.status === 'completed'
    ).length

    const allQuizResults = allTopics
      .flatMap(topic => topic.quizzes)
      .flatMap(quiz => quiz.quizResults)

    const totalQuizzes = allQuizResults.length
    const passedQuizzes = allQuizResults.filter(result => result.passed).length
    const averageQuizScore = totalQuizzes > 0
      ? Math.round(allQuizResults.reduce((sum, result) => sum + result.score, 0) / totalQuizzes)
      : 0

    // Calculate total study time
    const totalStudyTime = allTopics.reduce(
      (sum, topic) => sum + (topic.progress[0]?.timeSpent || 0), 0
    )

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentProgress = await db.learningProgress.findMany({
      where: {
        userId,
        completedAt: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        topic: {
          select: {
            title: true,
            dayIndex: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    })

    // Calculate learning streak
    const learningStreak = calculateLearningStreak(recentProgress)

    // Generate study time chart data (last 7 days)
    const studyTimeChart = generateStudyTimeChart(recentProgress)

    // Generate progress chart data
    const progressChart = generateProgressChart(learningPlans)

    // Generate quiz performance chart
    const quizPerformanceChart = generateQuizPerformanceChart(allQuizResults)

    // Calculate learning velocity (topics completed per week)
    const weeklyVelocity = calculateWeeklyVelocity(recentProgress)

    // Get upcoming topics
    const upcomingTopics = allTopics
      .filter(topic => topic.status === 'unlocked' || topic.progress[0]?.status === 'in_progress')
      .slice(0, 5)
      .map(topic => ({
        id: topic.id,
        title: topic.title,
        dayIndex: topic.dayIndex,
        timeEstimate: topic.timeEstimate,
        planTitle: learningPlans.find(plan => plan.id === topic.learningPlanId)?.title
      }))

    // Generate insights and recommendations
    const insights = generateInsights({
      totalStudyTime,
      averageQuizScore,
      learningStreak,
      weeklyVelocity,
      completedTopics,
      totalTopics
    })

    return NextResponse.json({
      overview: {
        totalPlans,
        activePlans,
        completedPlans,
        totalTopics,
        completedTopics,
        totalQuizzes,
        passedQuizzes,
        averageQuizScore,
        totalStudyTime,
        learningStreak,
        weeklyVelocity
      },
      charts: {
        studyTime: studyTimeChart,
        progress: progressChart,
        quizPerformance: quizPerformanceChart
      },
      recentActivity: recentProgress.slice(0, 10).map(progress => ({
        id: progress.id,
        topicTitle: progress.topic.title,
        dayIndex: progress.topic.dayIndex,
        completedAt: progress.completedAt,
        timeSpent: progress.timeSpent,
        masteryScore: progress.masteryScore
      })),
      upcomingTopics,
      insights
    })
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error)
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

  const uniqueDays = new Set<number>()
  progressRecords.forEach(record => {
    const date = new Date(record.completedAt)
    date.setHours(0, 0, 0, 0)
    uniqueDays.add(date.getTime())
  })

  const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a)

  for (const dayTime of sortedDays) {
    const daysDiff = Math.floor((currentDate.getTime() - dayTime) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === streak) {
      streak++
    } else if (daysDiff > streak) {
      break
    }
  }

  return streak
}

function generateStudyTimeChart(progressRecords: any[]) {
  const last7Days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    last7Days.push(date)
  }

  return last7Days.map(date => {
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    
    const dayProgress = progressRecords.filter(record => {
      const recordDate = new Date(record.completedAt)
      return recordDate >= date && recordDate < nextDay
    })

    const totalTime = dayProgress.reduce((sum, record) => sum + record.timeSpent, 0)

    return {
      date: date.toISOString().split('T')[0],
      timeSpent: totalTime,
      topicsCompleted: dayProgress.length
    }
  })
}

function generateProgressChart(learningPlans: any[]) {
  return learningPlans.map(plan => {
    const totalTopics = plan.topics.length
    const completedTopics = plan.topics.filter(
      (topic: any) => topic.progress[0]?.status === 'completed'
    ).length

    return {
      planId: plan.id,
      planTitle: plan.title,
      progress: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
      completedTopics,
      totalTopics
    }
  })
}

function generateQuizPerformanceChart(quizResults: any[]) {
  if (quizResults.length === 0) return []

  // Group by week
  const weeklyData: { [key: string]: { scores: number[], count: number } } = {}

  quizResults.forEach(result => {
    const date = new Date(result.completedAt)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekKey = weekStart.toISOString().split('T')[0]

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { scores: [], count: 0 }
    }
    weeklyData[weekKey].scores.push(result.score)
    weeklyData[weekKey].count++
  })

  return Object.entries(weeklyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8) // Last 8 weeks
    .map(([week, data]) => ({
      week,
      averageScore: Math.round(data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length),
      quizCount: data.count,
      passRate: Math.round((data.scores.filter(score => score >= 70).length / data.scores.length) * 100)
    }))
}

function calculateWeeklyVelocity(progressRecords: any[]): number {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recentCompletions = progressRecords.filter(
    record => new Date(record.completedAt) >= oneWeekAgo
  )
  return recentCompletions.length
}

function generateInsights(data: any): string[] {
  const insights = []

  if (data.learningStreak >= 7) {
    insights.push(`🔥 Amazing! You have a ${data.learningStreak}-day learning streak!`)
  } else if (data.learningStreak === 0) {
    insights.push("📚 Start a new learning streak today!")
  }

  if (data.averageQuizScore >= 90) {
    insights.push("🌟 Excellent quiz performance! You're mastering the material.")
  } else if (data.averageQuizScore < 70) {
    insights.push("📖 Consider spending more time reviewing before taking quizzes.")
  }

  const progressPercentage = (data.completedTopics / data.totalTopics) * 100
  if (progressPercentage >= 80) {
    insights.push("🎯 You're almost done! Keep up the momentum.")
  } else if (progressPercentage < 20) {
    insights.push("🚀 Great start! Consistency is key to success.")
  }

  if (data.weeklyVelocity >= 5) {
    insights.push("⚡ You're learning at an impressive pace!")
  } else if (data.weeklyVelocity === 0) {
    insights.push("⏰ Try to complete at least one topic this week.")
  }

  return insights
}
