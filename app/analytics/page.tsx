'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LanguageProvider } from '@/lib/language-context'
import { SidebarLayout } from '@/components/layout/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  Calendar,
  Flame,
  BookOpen
} from 'lucide-react'

interface AnalyticsData {
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
  charts: {
    studyTime: Array<{
      date: string
      timeSpent: number
      topicsCompleted: number
    }>
    progress: Array<{
      planId: string
      planTitle: string
      progress: number
      completedTopics: number
      totalTopics: number
    }>
    quizPerformance: Array<{
      week: string
      averageScore: number
      passRate: number
      attempts: number
    }>
  }
  insights: string[]
}

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchAnalyticsData()
  }, [session, router])

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('/api/analytics/dashboard')
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  if (!session) return null

  if (loading) {
    return (
      <LanguageProvider>
        <SidebarLayout>
          <div className="h-full overflow-y-auto">
            <div className="container mx-auto px-6 py-8">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading analytics...</p>
                </div>
              </div>
            </div>
          </div>
        </SidebarLayout>
      </LanguageProvider>
    )
  }

  return (
    <LanguageProvider>
      <SidebarLayout>
        <div className="h-full overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Learning Analytics</h1>
              <p className="text-gray-600 mt-1">Detailed insights into your learning journey</p>
            </div>

          {!analyticsData || analyticsData.overview.totalPlans === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Analytics Data Yet</h3>
              <p className="text-gray-600 mb-6">Start learning to see your progress analytics!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
                    <Flame className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.overview.learningStreak}</div>
                    <p className="text-xs text-muted-foreground">days in a row</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Study Time</CardTitle>
                    <Clock className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatTime(analyticsData.overview.totalStudyTime)}</div>
                    <p className="text-xs text-muted-foreground">total time invested</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Quiz Performance</CardTitle>
                    <Award className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.overview.averageQuizScore}%</div>
                    <p className="text-xs text-muted-foreground">average score</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Weekly Velocity</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.overview.weeklyVelocity}</div>
                    <p className="text-xs text-muted-foreground">topics this week</p>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Learning Plans Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.charts.progress.map((plan) => (
                      <div key={plan.planId} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{plan.planTitle}</span>
                          <span className="text-sm text-gray-600">
                            {plan.completedTopics}/{plan.totalTopics} topics
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${plan.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-right text-sm text-gray-600">{plan.progress}%</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Study Time Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Daily Study Time (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.charts.studyTime.slice(-7).map((day, index) => (
                      <div key={day.date} className="flex items-center gap-4">
                        <div className="w-20 text-sm text-gray-600">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${Math.min((day.timeSpent / 120) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-12">{formatTime(day.timeSpent)}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {day.topicsCompleted} topics
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quiz Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Quiz Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.charts.quizPerformance.map((week) => (
                      <div key={week.week} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Week of {new Date(week.week).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">{week.attempts} quiz attempts</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{week.averageScore}%</p>
                          <p className="text-sm text-gray-600">{week.passRate}% pass rate</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights */}
              {analyticsData.insights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Insights & Recommendations</CardTitle>
                    <CardDescription>Personalized insights based on your learning patterns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData.insights.map((insight, index) => (
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
          )}
          </div>
        </div>
      </SidebarLayout>
    </LanguageProvider>
  )
}
