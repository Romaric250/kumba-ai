'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/lib/language-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  TrendingUp, 
  Upload,
  Brain,
  Target,
  Calendar,
  BarChart3,
  Flame
} from 'lucide-react'
import Link from 'next/link'

interface DashboardData {
  overview: {
    totalPlans: number
    activePlans: number
    completedPlans: number
    totalTopics: number
    completedTopics: number
    totalQuizzes: number
    passedQuizzes: number
    averageQuizScore: number
    totalStudyTime: number
    learningStreak: number
    weeklyVelocity: number
  }
  recentActivity: Array<{
    id: string
    topicTitle: string
    dayIndex: number
    completedAt: string
    timeSpent: number
    masteryScore: number
  }>
  upcomingTopics: Array<{
    id: string
    title: string
    dayIndex: number
    timeEstimate: number
    planTitle: string
  }>
  insights: string[]
}

export function DynamicDashboard() {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics/dashboard')
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      
      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} ${t('common.minutes')}`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}${t('common.hours')} ${remainingMinutes}${t('common.minutes')}`
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{t('common.error')}: {error}</p>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!dashboardData || dashboardData.overview.totalPlans === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t('dashboard.noData')}</h3>
          <p className="text-gray-600 mb-6">{t('dashboard.noData')}</p>
          <Link href="/upload">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Upload className="h-4 w-4 mr-2" />
              {t('dashboard.uploadFirst')}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const { overview, recentActivity, upcomingTopics, insights } = dashboardData

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">
          {t('dashboard.welcome')}, {session?.user?.name || 'Student'}! 👋
        </h1>
        <p className="opacity-90">
          {insights[0] || "Keep up the great work on your learning journey!"}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.learningStreak')}</CardTitle>
            <Flame className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.learningStreak}</div>
            <p className="text-xs text-muted-foreground">
              {overview.learningStreak} {t('achievement.streakDescription')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.completedTopics')}</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.completedTopics}</div>
            <p className="text-xs text-muted-foreground">
              of {overview.totalTopics} {t('dashboard.totalTopics').toLowerCase()}
            </p>
            <Progress 
              value={(overview.completedTopics / overview.totalTopics) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.averageScore')}</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.averageQuizScore}%</div>
            <p className="text-xs text-muted-foreground">
              {overview.passedQuizzes}/{overview.totalQuizzes} {t('progress.passed').toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalStudyTime')}</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(overview.totalStudyTime)}</div>
            <p className="text-xs text-muted-foreground">
              {overview.weeklyVelocity} topics this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('dashboard.recentActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{activity.topicTitle}</p>
                      <p className="text-sm text-gray-600">
                        {t('progress.day')} {activity.dayIndex} • {formatDate(activity.completedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={activity.masteryScore >= 70 ? "default" : "secondary"}>
                        {activity.masteryScore}%
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(activity.timeSpent)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {t('dashboard.upcomingTopics')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingTopics.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming topics</p>
            ) : (
              <div className="space-y-3">
                {upcomingTopics.slice(0, 5).map((topic) => (
                  <div key={topic.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">{topic.title}</p>
                      <p className="text-sm text-gray-600">
                        {topic.planTitle} • {t('progress.day')} {topic.dayIndex}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatTime(topic.timeEstimate)}</p>
                      <Link href={`/learn/${topic.id}`}>
                        <Button size="sm" className="mt-1">
                          {t('learn.startTopic')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
