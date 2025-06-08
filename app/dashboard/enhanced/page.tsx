'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { 
  BookOpen, 
  Send, 
  Plus,
  Menu,
  User,
  LogOut,
  Upload,
  BarChart3,
  Target,
  Brain,
  Globe,
  Settings,
  Sparkles,
  Clock,
  Trophy,
  Zap,
  MessageCircle,
  FileText,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle
} from 'lucide-react'
import ProgressCard from '@/components/dashboard/ProgressCard'
import QuickActions from '@/components/dashboard/QuickActions'
import MentorMessage from '@/components/dashboard/MentorMessage'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    topic?: string
    progress?: number
    action?: string
    suggestions?: string[]
  }
}

interface LearningSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  progress: number
  status: 'active' | 'completed' | 'paused'
  subject: string
}

interface LearningStats {
  totalSessions: number
  completedTopics: number
  averageScore: number
  streakDays: number
  timeSpent: number
  nextMilestone: string
}

export default function EnhancedDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentSession, setCurrentSession] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessions, setSessions] = useState<LearningSession[]>([])
  const [stats, setStats] = useState<LearningStats>({
    totalSessions: 0,
    completedTopics: 0,
    averageScore: 0,
    streakDays: 0,
    timeSpent: 0,
    nextMilestone: ''
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    // Initialize with enhanced sample data
    const sampleSessions: LearningSession[] = [
      {
        id: '1',
        title: 'Advanced Calculus Mastery',
        lastMessage: 'Excellent work on derivatives! Ready for integrals?',
        timestamp: new Date(),
        progress: 78,
        status: 'active',
        subject: 'Mathematics'
      },
      {
        id: '2', 
        title: 'Quantum Physics Fundamentals',
        lastMessage: 'Wave-particle duality is fascinating!',
        timestamp: new Date(Date.now() - 86400000),
        progress: 45,
        status: 'active',
        subject: 'Physics'
      },
      {
        id: '3',
        title: 'Organic Chemistry Reactions',
        lastMessage: 'Mastered benzene reactions perfectly!',
        timestamp: new Date(Date.now() - 172800000),
        progress: 100,
        status: 'completed',
        subject: 'Chemistry'
      },
      {
        id: '4',
        title: 'African History & Culture',
        lastMessage: 'Learning about pre-colonial kingdoms...',
        timestamp: new Date(Date.now() - 259200000),
        progress: 30,
        status: 'active',
        subject: 'History'
      }
    ]
    setSessions(sampleSessions)
    
    // Set enhanced stats
    setStats({
      totalSessions: sampleSessions.length,
      completedTopics: 23,
      averageScore: 87,
      streakDays: 12,
      timeSpent: 156, // hours
      nextMilestone: 'Complete 25 topics'
    })
    
    // Set initial session with enhanced welcome message
    if (sampleSessions.length > 0) {
      setCurrentSession(sampleSessions[0].id)
      setMessages([
        {
          id: '1',
          type: 'assistant',
          content: `Sannu da zuwa! Welcome back to Kumba.AI! 🌍

I'm your dedicated learning mentor, and I'm impressed by your progress. You've maintained a ${stats.streakDays}-day learning streak - that's the discipline I love to see!

**Today's Focus: ${sampleSessions[0].title}**
Progress: ${sampleSessions[0].progress}% complete

You're currently working on advanced calculus. I can see you've mastered derivatives beautifully. Now we're ready to tackle integrals - but remember, no shortcuts! We build mastery step by step.

**What would you like to do today?**
• Continue with integral calculus
• Review and strengthen derivatives
• Take a mastery quiz
• Upload new study materials
• Explore a new subject

Remember: "However far the stream flows, it never forgets its source." - African Proverb

Choose your path, and let's continue this journey of disciplined learning!`,
          timestamp: new Date(),
          metadata: { 
            topic: 'Advanced Calculus Mastery', 
            progress: 78,
            suggestions: [
              'Continue with integrals',
              'Review derivatives',
              'Take mastery quiz',
              'Upload materials'
            ]
          }
        }
      ])
    }
  }, [stats.streakDays])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Enhanced AI responses with African context
    setTimeout(() => {
      const responses = [
        "Excellent question! In the spirit of Ubuntu - 'I am because we are' - let's explore this together. Your curiosity shows the right learning mindset.",
        "I can see you're thinking deeply about this concept. As we say in Cameroon, 'Petit à petit, l'oiseau fait son nid' - little by little, the bird builds its nest. Let's build your understanding step by step.",
        "That's a thoughtful approach! Remember, true mastery comes from understanding, not memorization. Let me guide you through this with the patience of a baobab tree.",
        "Good! You're showing the discipline I expect. Now, before we advance, let's ensure your foundation is solid. Can you explain the previous concept in your own words?",
        "I appreciate your eagerness, but as your mentor, I must ensure you're ready. Complete the current exercises first, then we'll unlock the next level together.",
        "Wonderful progress! You're embodying the African value of perseverance. Let's continue building on this strong foundation you've created."
      ]

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        metadata: {
          suggestions: [
            'Continue learning',
            'Take a quiz',
            'Review concepts',
            'Ask for help'
          ]
        }
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const startNewSession = () => {
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Literature']
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
    
    const newSession: LearningSession = {
      id: Date.now().toString(),
      title: `New ${randomSubject} Session`,
      lastMessage: 'Ready to start learning!',
      timestamp: new Date(),
      progress: 0,
      status: 'active',
      subject: randomSubject
    }
    setSessions(prev => [newSession, ...prev])
    setCurrentSession(newSession.id)
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: `Welcome to your new ${randomSubject} learning session! I'm excited to guide you through this journey. What specific topic would you like to explore today?`,
        timestamp: new Date()
      }
    ])
  }

  const quickActions = [
    {
      id: 'upload',
      title: 'Upload Study Materials',
      description: 'Add PDFs, notes, or images for AI analysis',
      icon: 'upload' as const,
      color: 'primary' as const,
      action: () => router.push('/upload')
    },
    {
      id: 'progress',
      title: 'View Detailed Progress',
      description: 'Track your learning journey and achievements',
      icon: 'chart' as const,
      color: 'secondary' as const,
      action: () => router.push('/progress')
    },
    {
      id: 'quiz',
      title: 'Take Mastery Quiz',
      description: 'Test your understanding with AI-generated quizzes',
      icon: 'brain' as const,
      color: 'accent' as const,
      action: () => console.log('Quiz mode')
    },
    {
      id: 'study-group',
      title: 'Join Study Group',
      description: 'Connect with other learners in your region',
      icon: 'users' as const,
      color: 'success' as const,
      action: () => console.log('Study group')
    }
  ]

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600">Loading Kumba.AI...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Enhanced Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <span className="text-xl font-bold text-gray-900">Kumba.AI</span>
                  <div className="text-xs text-gray-500">Your Learning Mentor</div>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-primary-50 rounded-lg">
                <div className="text-lg font-bold text-primary-600">{stats.streakDays}</div>
                <div className="text-xs text-gray-600">Day Streak</div>
              </div>
              <div className="text-center p-2 bg-success-50 rounded-lg">
                <div className="text-lg font-bold text-success-600">{stats.averageScore}%</div>
                <div className="text-xs text-gray-600">Avg Score</div>
              </div>
            </div>
          </div>
        )}

        {/* New Session Button */}
        {sidebarOpen && (
          <div className="p-4">
            <button
              onClick={startNewSession}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Learning Session</span>
            </button>
          </div>
        )}

        {/* Learning Sessions */}
        <div className="flex-1 overflow-y-auto">
          {sidebarOpen && (
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Learning Sessions</h3>
              <div className="space-y-2">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setCurrentSession(session.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentSession === session.id
                        ? 'bg-primary-50 border border-primary-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-gray-900 text-sm truncate">
                        {session.title}
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        session.status === 'completed' ? 'bg-success-500' :
                        session.status === 'active' ? 'bg-primary-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="text-xs text-gray-500 mb-2 truncate">
                      {session.lastMessage}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">
                        {session.timestamp.toLocaleDateString()}
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="text-xs text-primary-600 font-medium">
                          {session.progress}%
                        </div>
                        {session.status === 'completed' && (
                          <CheckCircle className="h-3 w-3 text-success-500" />
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${
                            session.status === 'completed' ? 'bg-success-500' : 'bg-primary-500'
                          }`}
                          style={{ width: `${session.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                <Upload className="h-4 w-4" />
                <span className="text-sm">Upload Materials</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm">View Progress</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                <Settings className="h-4 w-4" />
                <span className="text-sm">Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            {sidebarOpen && (
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {session.user?.name || 'Student'}
                </div>
                <div className="text-xs text-gray-500">{session.user?.email}</div>
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 flex items-center">
                  Kumba.AI Mentor
                  <Sparkles className="h-4 w-4 text-accent-500 ml-2" />
                </h1>
                <p className="text-sm text-gray-500">Your disciplined learning guide • Powered by African wisdom</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Globe className="h-4 w-4" />
                <span>English</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <span className="text-success-600 font-medium">Active Learning</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{stats.timeSpent}h total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-4xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`p-4 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
                      : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>

                  {/* Enhanced metadata display */}
                  {message.metadata && (
                    <div className={`mt-4 pt-4 border-t ${message.type === 'user' ? 'border-primary-500' : 'border-gray-200'}`}>
                      {message.metadata.topic && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Target className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">{message.metadata.topic}</span>
                        </div>
                      )}
                      {message.metadata.progress && (
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full"
                              style={{ width: `${message.metadata.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-600">{message.metadata.progress}%</span>
                        </div>
                      )}
                      {message.metadata.suggestions && (
                        <div className="flex flex-wrap gap-2">
                          {message.metadata.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => setInputMessage(suggestion)}
                              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                message.type === 'user'
                                  ? 'bg-primary-500 text-white hover:bg-primary-400'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className={`text-xs text-gray-500 mt-2 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>

              {/* Enhanced avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${message.type === 'user' ? 'order-1 mr-3' : 'order-2 ml-3'}`}>
                {message.type === 'user' ? (
                  <div className="w-10 h-10 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Enhanced typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-4xl order-1">
                <div className="bg-white border border-gray-200 text-gray-900 p-4 rounded-2xl shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500">Kumba.AI is thinking...</span>
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center order-2 ml-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <div className="relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask Kumba.AI anything about your learning journey..."
                  className="w-full p-4 pr-12 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                  rows={1}
                  style={{ minHeight: '52px', maxHeight: '120px' }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="absolute right-3 bottom-3 p-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setInputMessage('Continue with my current topic')}
                className="px-4 py-2 text-sm bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100 transition-colors flex items-center space-x-1"
              >
                <TrendingUp className="h-3 w-3" />
                <span>Continue Learning</span>
              </button>
              <button
                onClick={() => setInputMessage('I want to take a quiz')}
                className="px-4 py-2 text-sm bg-accent-50 text-accent-700 rounded-full hover:bg-accent-100 transition-colors flex items-center space-x-1"
              >
                <Brain className="h-3 w-3" />
                <span>Take Quiz</span>
              </button>
              <button
                onClick={() => setInputMessage('Show my progress')}
                className="px-4 py-2 text-sm bg-secondary-50 text-secondary-700 rounded-full hover:bg-secondary-100 transition-colors flex items-center space-x-1"
              >
                <BarChart3 className="h-3 w-3" />
                <span>View Progress</span>
              </button>
              <button
                onClick={() => setInputMessage('I want to upload new materials')}
                className="px-4 py-2 text-sm bg-success-50 text-success-700 rounded-full hover:bg-success-100 transition-colors flex items-center space-x-1"
              >
                <Upload className="h-3 w-3" />
                <span>Upload Materials</span>
              </button>
            </div>
            <div className="text-xs text-gray-500">
              Press Enter to send • Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
