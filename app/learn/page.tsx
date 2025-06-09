'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LanguageProvider, useLanguage } from '@/lib/language-context'
import { SidebarLayout } from '@/components/layout/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
  Clock, 
  Target, 
  Lock,
  CheckCircle,
  Play,
  Upload,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

interface LearningPlan {
  id: string
  title: string
  description: string
  totalDays: number
  status: string
  statistics: {
    overallProgress: number
    completedTopics: number
    totalTopics: number
    totalTimeSpent: number
    averageQuizScore: number
  }
  topics: Array<{
    id: string
    title: string
    description: string
    dayIndex: number
    status: string
    timeEstimate: number
    isUnlocked: boolean
    canStart: boolean
    progress: {
      status: string
      completedAt?: string
      timeSpent: number
      masteryScore?: number
    }
    quiz?: {
      id: string
      title: string
      passingScore: number
      lastResult?: {
        score: number
        passed: boolean
        completedAt: string
      }
    }
  }>
}

function LearnContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const { t } = useLanguage()
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchLearningPlans()
  }, [session, router])

  const fetchLearningPlans = async () => {
    try {
      // For now, we'll fetch the first learning plan
      // In a real app, you'd fetch all user's learning plans
      const response = await fetch('/api/analytics/dashboard')
      if (response.ok) {
        const data = await response.json()
        // Mock learning plan data based on dashboard data
        if (data.overview.totalPlans > 0) {
          const mockPlan: LearningPlan = {
            id: '1',
            title: 'Master Advanced Calculus in 10 Days',
            description: 'A comprehensive learning plan covering limits, derivatives, and integrals',
            totalDays: 10,
            status: 'active',
            statistics: {
              overallProgress: (data.overview.completedTopics / data.overview.totalTopics) * 100,
              completedTopics: data.overview.completedTopics,
              totalTopics: data.overview.totalTopics,
              totalTimeSpent: data.overview.totalStudyTime,
              averageQuizScore: data.overview.averageQuizScore
            },
            topics: [
              {
                id: '1',
                title: 'Introduction to Limits',
                description: 'Understanding the fundamental concept of limits',
                dayIndex: 1,
                status: 'completed',
                timeEstimate: 45,
                isUnlocked: true,
                canStart: true,
                progress: {
                  status: 'completed',
                  completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                  timeSpent: 45,
                  masteryScore: 85
                },
                quiz: {
                  id: 'q1',
                  title: 'Limits Quiz',
                  passingScore: 70,
                  lastResult: {
                    score: 85,
                    passed: true,
                    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                  }
                }
              },
              {
                id: '2',
                title: 'Limit Laws and Techniques',
                description: 'Learn various techniques for evaluating limits',
                dayIndex: 2,
                status: 'unlocked',
                timeEstimate: 60,
                isUnlocked: true,
                canStart: true,
                progress: {
                  status: 'not_started',
                  timeSpent: 0
                },
                quiz: {
                  id: 'q2',
                  title: 'Limit Techniques Quiz',
                  passingScore: 70
                }
              },
              {
                id: '3',
                title: 'Continuity and Discontinuity',
                description: 'Explore continuous functions and discontinuities',
                dayIndex: 3,
                status: 'locked',
                timeEstimate: 50,
                isUnlocked: false,
                canStart: false,
                progress: {
                  status: 'not_started',
                  timeSpent: 0
                }
              }
            ]
          }
          setLearningPlans([mockPlan])
        }
      }
    } catch (error) {
      console.error('Failed to fetch learning plans:', error)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'unlocked': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (topic: any) => {
    if (topic.progress.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    } else if (topic.isUnlocked) {
      return <Play className="h-5 w-5 text-blue-600" />
    } else {
      return <Lock className="h-5 w-5 text-gray-400" />
    }
  }

  if (!session) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your learning plans...</p>
        </div>
      </div>
    )
  }

  if (learningPlans.length === 0) {
    return (
      <div className="text-center py-12">
        <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Learning Plans Yet</h3>
        <p className="text-gray-600 mb-6">Upload your first learning material to get started!</p>
        <Link href="/upload">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Upload className="h-4 w-4 mr-2" />
            Upload Learning Material
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {learningPlans.map((plan) => (
        <div key={plan.id} className="space-y-6">
          {/* Plan Overview */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{plan.title}</CardTitle>
                  <CardDescription className="mt-1">{plan.description}</CardDescription>
                </div>
                <Badge className={getStatusColor(plan.status)}>
                  {plan.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{plan.statistics.overallProgress.toFixed(0)}%</div>
                  <div className="text-sm text-gray-600">Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{plan.statistics.completedTopics}</div>
                  <div className="text-sm text-gray-600">Topics Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{formatTime(plan.statistics.totalTimeSpent)}</div>
                  <div className="text-sm text-gray-600">Time Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{plan.statistics.averageQuizScore}%</div>
                  <div className="text-sm text-gray-600">Avg Quiz Score</div>
                </div>
              </div>
              <Progress value={plan.statistics.overallProgress} className="h-2" />
            </CardContent>
          </Card>

          {/* Topics */}
          <div className="grid gap-4">
            {plan.topics.map((topic) => (
              <Card key={topic.id} className={`transition-all ${topic.isUnlocked ? 'hover:shadow-md' : 'opacity-60'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(topic)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{topic.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            Day {topic.dayIndex}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(topic.timeEstimate)}
                          </div>
                          {topic.progress.masteryScore && (
                            <div className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {topic.progress.masteryScore}% mastery
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {topic.quiz?.lastResult && (
                        <Badge variant={topic.quiz.lastResult.passed ? "default" : "secondary"}>
                          Quiz: {topic.quiz.lastResult.score}%
                        </Badge>
                      )}
                      
                      {topic.canStart ? (
                        <Button size="sm">
                          {topic.progress.status === 'completed' ? 'Review' : 'Start'}
                        </Button>
                      ) : (
                        <Button size="sm" disabled>
                          <Lock className="h-4 w-4 mr-1" />
                          Locked
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function LearnPage() {
  return (
    <LanguageProvider>
      <SidebarLayout>
        <div className="h-full overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Learning Plans</h1>
              <p className="text-gray-600 mt-1">Continue your learning journey</p>
            </div>

            <LearnContent />
          </div>
        </div>
      </SidebarLayout>
    </LanguageProvider>
  )
}
