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

    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('planId')
    const timeRange = searchParams.get('timeRange') || '30' // days
    const chartType = searchParams.get('type') || 'progress'

    let whereClause: any = { userId: session.user.id }
    if (planId) {
      whereClause.learningPlanId = planId
    }

    // Calculate date range
    const daysAgo = parseInt(timeRange)
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)

    switch (chartType) {
      case 'progress':
        return NextResponse.json(await generateProgressChart(session.user.id, planId, startDate))
      
      case 'time':
        return NextResponse.json(await generateTimeChart(session.user.id, planId, startDate))
      
      case 'performance':
        return NextResponse.json(await generatePerformanceChart(session.user.id, planId, startDate))
      
      case 'streak':
        return NextResponse.json(await generateStreakChart(session.user.id, startDate))
      
      case 'topics':
        return NextResponse.json(await generateTopicsChart(session.user.id, planId))
      
      default:
        return NextResponse.json(
          { error: 'Invalid chart type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error generating chart data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateProgressChart(userId: string, planId?: string | null, startDate?: Date) {
  const whereClause: any = { userId }
  if (planId) whereClause.learningPlanId = planId
  if (startDate) whereClause.completedAt = { gte: startDate }

  const progressData = await db.learningProgress.findMany({
    where: {
      ...whereClause,
      status: 'completed',
      completedAt: { not: null }
    },
    include: {
      topic: {
        select: {
          title: true,
          dayIndex: true
        }
      },
      learningPlan: {
        select: {
          title: true
        }
      }
    },
    orderBy: { completedAt: 'asc' }
  })

  // Group by date and calculate cumulative progress
  const dailyProgress: { [date: string]: number } = {}
  let cumulativeTopics = 0

  progressData.forEach(progress => {
    if (progress.completedAt) {
      const date = progress.completedAt.toISOString().split('T')[0]
      if (!dailyProgress[date]) {
        dailyProgress[date] = 0
      }
      dailyProgress[date]++
    }
  })

  // Convert to chart format with cumulative values
  const chartData = Object.entries(dailyProgress)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => {
      cumulativeTopics += count
      return {
        date,
        topicsCompleted: count,
        cumulativeTopics,
        label: new Date(date).toLocaleDateString()
      }
    })

  return {
    type: 'progress',
    title: 'Learning Progress Over Time',
    data: chartData,
    summary: {
      totalTopicsCompleted: cumulativeTopics,
      averagePerDay: chartData.length > 0 ? (cumulativeTopics / chartData.length).toFixed(1) : 0,
      mostProductiveDay: chartData.reduce((max, day) => 
        day.topicsCompleted > max.topicsCompleted ? day : max, 
        { topicsCompleted: 0, date: '' }
      )
    }
  }
}

async function generateTimeChart(userId: string, planId?: string | null, startDate?: Date) {
  const whereClause: any = { userId }
  if (planId) whereClause.learningPlanId = planId
  if (startDate) whereClause.completedAt = { gte: startDate }

  const progressData = await db.learningProgress.findMany({
    where: {
      ...whereClause,
      completedAt: { not: null }
    },
    include: {
      topic: {
        select: {
          title: true,
          timeEstimate: true
        }
      }
    },
    orderBy: { completedAt: 'asc' }
  })

  // Group by date and sum time spent
  const dailyTime: { [date: string]: { actual: number, estimated: number } } = {}

  progressData.forEach(progress => {
    if (progress.completedAt) {
      const date = progress.completedAt.toISOString().split('T')[0]
      if (!dailyTime[date]) {
        dailyTime[date] = { actual: 0, estimated: 0 }
      }
      dailyTime[date].actual += progress.timeSpent
      dailyTime[date].estimated += progress.topic.timeEstimate || 60
    }
  })

  const chartData = Object.entries(dailyTime)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, time]) => ({
      date,
      actualTime: Math.round(time.actual),
      estimatedTime: Math.round(time.estimated),
      efficiency: time.estimated > 0 ? Math.round((time.estimated / time.actual) * 100) : 100,
      label: new Date(date).toLocaleDateString()
    }))

  const totalActual = chartData.reduce((sum, day) => sum + day.actualTime, 0)
  const totalEstimated = chartData.reduce((sum, day) => sum + day.estimatedTime, 0)

  return {
    type: 'time',
    title: 'Study Time Analysis',
    data: chartData,
    summary: {
      totalActualTime: totalActual,
      totalEstimatedTime: totalEstimated,
      overallEfficiency: totalEstimated > 0 ? Math.round((totalEstimated / totalActual) * 100) : 100,
      averageDailyTime: chartData.length > 0 ? Math.round(totalActual / chartData.length) : 0
    }
  }
}

async function generatePerformanceChart(userId: string, planId?: string | null, startDate?: Date) {
  let whereClause: any = { userId }
  if (startDate) whereClause.completedAt = { gte: startDate }

  if (planId) {
    whereClause.quiz = {
      topic: {
        learningPlanId: planId
      }
    }
  }

  const quizResults = await db.quizResult.findMany({
    where: whereClause,
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
    orderBy: { completedAt: 'asc' }
  })

  // Group by week for better visualization
  const weeklyPerformance: { [week: string]: { scores: number[], attempts: number } } = {}

  quizResults.forEach(result => {
    const date = new Date(result.completedAt)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekKey = weekStart.toISOString().split('T')[0]

    if (!weeklyPerformance[weekKey]) {
      weeklyPerformance[weekKey] = { scores: [], attempts: 0 }
    }
    weeklyPerformance[weekKey].scores.push(result.score)
    weeklyPerformance[weekKey].attempts++
  })

  const chartData = Object.entries(weeklyPerformance)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, data]) => {
      const avgScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length
      const passRate = (data.scores.filter(score => score >= 70).length / data.scores.length) * 100
      
      return {
        week,
        averageScore: Math.round(avgScore),
        passRate: Math.round(passRate),
        attempts: data.attempts,
        highestScore: Math.max(...data.scores),
        lowestScore: Math.min(...data.scores),
        label: new Date(week).toLocaleDateString()
      }
    })

  const allScores = quizResults.map(r => r.score)
  const overallAverage = allScores.length > 0 ? 
    Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length) : 0

  return {
    type: 'performance',
    title: 'Quiz Performance Trends',
    data: chartData,
    summary: {
      overallAverage,
      totalQuizzes: quizResults.length,
      overallPassRate: Math.round((quizResults.filter(r => r.passed).length / quizResults.length) * 100),
      bestWeek: chartData.reduce((best, week) => 
        week.averageScore > best.averageScore ? week : best,
        { averageScore: 0, week: '' }
      )
    }
  }
}

async function generateStreakChart(userId: string, startDate: Date) {
  const progressData = await db.learningProgress.findMany({
    where: {
      userId,
      completedAt: {
        gte: startDate,
        not: null
      }
    },
    orderBy: { completedAt: 'asc' }
  })

  // Calculate daily streaks
  const dailyActivity: { [date: string]: boolean } = {}
  
  progressData.forEach(progress => {
    if (progress.completedAt) {
      const date = progress.completedAt.toISOString().split('T')[0]
      dailyActivity[date] = true
    }
  })

  // Generate streak data for each day
  const chartData = []
  let currentStreak = 0
  const today = new Date()
  
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    const hasActivity = dailyActivity[dateStr] || false
    
    if (hasActivity) {
      currentStreak++
    } else {
      currentStreak = 0
    }
    
    chartData.push({
      date: dateStr,
      hasActivity,
      streak: currentStreak,
      label: d.toLocaleDateString()
    })
  }

  const maxStreak = Math.max(...chartData.map(d => d.streak))
  const activeDays = chartData.filter(d => d.hasActivity).length

  return {
    type: 'streak',
    title: 'Learning Streak Calendar',
    data: chartData,
    summary: {
      currentStreak: chartData[chartData.length - 1]?.streak || 0,
      maxStreak,
      activeDays,
      totalDays: chartData.length,
      consistencyRate: Math.round((activeDays / chartData.length) * 100)
    }
  }
}

async function generateTopicsChart(userId: string, planId?: string | null) {
  const whereClause: any = { userId }
  if (planId) whereClause.learningPlanId = planId

  const progressData = await db.learningProgress.findMany({
    where: whereClause,
    include: {
      topic: {
        select: {
          title: true,
          dayIndex: true,
          goals: true
        }
      }
    }
  })

  const statusCounts = {
    completed: progressData.filter(p => p.status === 'completed').length,
    in_progress: progressData.filter(p => p.status === 'in_progress').length,
    not_started: progressData.filter(p => p.status === 'not_started').length
  }

  const masteryDistribution = progressData
    .filter(p => p.masteryScore !== null)
    .reduce((acc, p) => {
      const score = p.masteryScore!
      if (score >= 90) acc.excellent++
      else if (score >= 80) acc.good++
      else if (score >= 70) acc.satisfactory++
      else acc.needsImprovement++
      return acc
    }, { excellent: 0, good: 0, satisfactory: 0, needsImprovement: 0 })

  return {
    type: 'topics',
    title: 'Topics Overview',
    data: {
      statusDistribution: [
        { status: 'Completed', count: statusCounts.completed, color: '#10B981' },
        { status: 'In Progress', count: statusCounts.in_progress, color: '#F59E0B' },
        { status: 'Not Started', count: statusCounts.not_started, color: '#6B7280' }
      ],
      masteryDistribution: [
        { level: 'Excellent (90-100%)', count: masteryDistribution.excellent, color: '#10B981' },
        { level: 'Good (80-89%)', count: masteryDistribution.good, color: '#3B82F6' },
        { level: 'Satisfactory (70-79%)', count: masteryDistribution.satisfactory, color: '#F59E0B' },
        { level: 'Needs Improvement (<70%)', count: masteryDistribution.needsImprovement, color: '#EF4444' }
      ]
    },
    summary: {
      totalTopics: progressData.length,
      completionRate: Math.round((statusCounts.completed / progressData.length) * 100),
      averageMastery: progressData.filter(p => p.masteryScore).length > 0 ?
        Math.round(progressData.filter(p => p.masteryScore).reduce((sum, p) => sum + p.masteryScore!, 0) / 
        progressData.filter(p => p.masteryScore).length) : 0
    }
  }
}
