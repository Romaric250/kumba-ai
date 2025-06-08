'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  BookOpen, 
  Upload, 
  BarChart3, 
  User, 
  LogOut, 
  Plus,
  Clock,
  Target,
  Trophy
} from 'lucide-react'

interface LearningMaterial {
  id: string
  title: string
  status: string
  createdAt: string
}

interface LearningPlan {
  id: string
  title: string
  totalDays: number
  completedTopics: number
  totalTopics: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [materials, setMaterials] = useState<LearningMaterial[]>([])
  const [plans, setPlans] = useState<LearningPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setMaterials([
        {
          id: '1',
          title: 'Mathematics Notes - Calculus',
          status: 'completed',
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          title: 'Physics Lecture Slides',
          status: 'processing',
          createdAt: '2024-01-14'
        }
      ])
      
      setPlans([
        {
          id: '1',
          title: 'Learning Plan: Mathematics Notes',
          totalDays: 10,
          completedTopics: 3,
          totalTopics: 10
        }
      ])
      
      setIsLoading(false)
    }, 1000)
  }, [])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-earth-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-earth-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">Kumba.AI</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-primary-600 font-medium">
                Dashboard
              </Link>
              <Link href="/learn" className="text-gray-600 hover:text-gray-900">
                Learn
              </Link>
              <Link href="/progress" className="text-gray-600 hover:text-gray-900">
                Progress
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session.user.name || 'Student'}
                </p>
                <p className="text-xs text-gray-500">{session.user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.name || 'Student'}!
          </h1>
          <p className="text-gray-600">
            Ready to continue your disciplined learning journey?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Learning Materials</p>
                <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-lg">
                <Target className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Plans</p>
                <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-lg">
                <Trophy className="h-6 w-6 text-accent-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Topics Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {plans.reduce((sum, plan) => sum + plan.completedTopics, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/upload" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-4 bg-primary-100 rounded-lg">
                <Upload className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Upload Materials</h3>
                <p className="text-gray-600">Add new study materials to create learning plans</p>
              </div>
            </div>
          </Link>

          <Link href="/progress" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-4 bg-secondary-100 rounded-lg">
                <BarChart3 className="h-8 w-8 text-secondary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">View Progress</h3>
                <p className="text-gray-600">Track your learning progress and achievements</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Materials */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Materials</h2>
            <div className="space-y-4">
              {materials.length > 0 ? (
                materials.map((material) => (
                  <div key={material.id} className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{material.title}</h3>
                        <p className="text-sm text-gray-500">
                          Uploaded on {new Date(material.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        material.status === 'completed' 
                          ? 'bg-success-100 text-success-800'
                          : 'bg-warning-100 text-warning-800'
                      }`}>
                        {material.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card text-center py-8">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No materials uploaded yet</p>
                  <Link href="/upload" className="btn-primary">
                    Upload Your First Material
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Active Learning Plans */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Learning Plans</h2>
            <div className="space-y-4">
              {plans.length > 0 ? (
                plans.map((plan) => (
                  <div key={plan.id} className="card">
                    <div className="mb-3">
                      <h3 className="font-medium text-gray-900">{plan.title}</h3>
                      <p className="text-sm text-gray-500">{plan.totalDays} day plan</p>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{plan.completedTopics}/{plan.totalTopics} topics</span>
                      </div>
                      <div className="progress-bar h-2">
                        <div 
                          className="progress-fill"
                          style={{ width: `${(plan.completedTopics / plan.totalTopics) * 100}%` }}
                        />
                      </div>
                    </div>
                    <Link 
                      href={`/learn/${plan.id}`}
                      className="btn-secondary text-sm"
                    >
                      Continue Learning
                    </Link>
                  </div>
                ))
              ) : (
                <div className="card text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No active learning plans</p>
                  <p className="text-sm text-gray-400">Upload materials to generate your first plan</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mentor Message */}
        <div className="mt-8 card bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200">
          <div className="flex items-start">
            <div className="p-3 bg-primary-100 rounded-lg">
              <User className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900 mb-2">Message from Kumba.AI</h3>
              <p className="text-gray-700 italic">
                "Welcome back! Remember, discipline is the bridge between goals and accomplishment. 
                Take your learning one step at a time, and master each concept before moving forward."
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
