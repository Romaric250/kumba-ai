'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DynamicDashboard } from '@/components/dashboard/dynamic-dashboard'
import { LanguageProvider } from '@/lib/language-context'
import { SidebarLayout } from '@/components/layout/sidebar'

export default function EnhancedDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Kumba.AI...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <LanguageProvider>
      <SidebarLayout>
        <div className="h-full overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Your AI-powered learning companion</p>
            </div>

            {/* Dynamic Dashboard Content */}
            <DynamicDashboard />
          </div>
        </div>
      </SidebarLayout>
    </LanguageProvider>
  )
}
