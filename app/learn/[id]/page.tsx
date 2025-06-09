'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LanguageProvider } from '@/lib/language-context'
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
  ArrowLeft,
  Brain,
  FileText
} from 'lucide-react'
import Link from 'next/link'

interface Topic {
  id: string
  title: string
  description: string
  content: string
  goals: string[]
  timeEstimate: number
  dayIndex: number
  status: string
  quiz?: {
    id: string
    title: string
    passingScore: number
    questions: any[]
  }
}

interface LearningPlan {
  id: string
  title: string
  description: string
  totalDays: number
  status: string
  topics: Topic[]
}

export default function LearnTopicPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null)
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchLearningPlan()
  }, [session, router, params.id])

  const fetchLearningPlan = async () => {
    try {
      // First try to fetch as a learning plan
      let response = await fetch(`/api/learning-plans/${params.id}`)

      if (response.ok) {
        const data = await response.json()
        setLearningPlan(data.learningPlan)
        // If it's a learning plan, show the first topic
        if (data.learningPlan.topics && data.learningPlan.topics.length > 0) {
          setCurrentTopic(data.learningPlan.topics[0])
        }
      } else {
        // If not a learning plan, try to fetch as a topic
        response = await fetch(`/api/topics/${params.id}`)

        if (response.ok) {
          const data = await response.json()
          setCurrentTopic(data.topic)

          // Create a minimal learning plan object for context
          setLearningPlan({
            id: data.topic.learningPlan.id,
            title: data.topic.learningPlan.title,
            description: data.topic.learningPlan.description,
            totalDays: data.topic.learningPlan.totalDays,
            status: 'active',
            topics: data.topic.allTopics || []
          })
        } else {
          console.error('Failed to fetch topic or learning plan')
        }
      }
    } catch (error) {
      console.error('Failed to fetch learning plan:', error)
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading topic...</p>
          </div>
        </div>
      </LanguageProvider>
    )
  }

  if (!currentTopic) {
    return (
      <LanguageProvider>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Topic Not Found</h3>
            <p className="text-gray-600 mb-6">The requested learning topic could not be found.</p>
            <Link href="/learn">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Learning Plans
              </Button>
            </Link>
          </div>
        </div>
      </LanguageProvider>
    )
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link href="/learn">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Learning Plans
              </Button>
            </Link>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentTopic.title}</h1>
                <p className="text-gray-600">{currentTopic.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTime(currentTopic.timeEstimate)}
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                Day {currentTopic.dayIndex}
              </div>
              <Badge variant={currentTopic.status === 'completed' ? 'default' : 'secondary'}>
                {currentTopic.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap">{currentTopic.content}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Learning Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Learning Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {currentTopic.goals.map((goal, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Quiz Section */}
              {currentTopic.quiz && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Mastery Quiz
                    </CardTitle>
                    <CardDescription>
                      Test your understanding of this topic
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600">
                        <p><strong>Questions:</strong> {currentTopic.quiz.questions.length}</p>
                        <p><strong>Passing Score:</strong> {currentTopic.quiz.passingScore}%</p>
                      </div>
                      <Button className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Start Quiz
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Progress Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button 
                      className="w-full"
                      onClick={() => {
                        // Mark as completed logic here
                        console.log('Mark as completed')
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </Button>
                    
                    <Button variant="outline" className="w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Take Notes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </LanguageProvider>
  )
}
