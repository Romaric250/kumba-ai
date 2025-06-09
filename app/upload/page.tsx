'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LanguageProvider } from '@/lib/language-context'
import { SidebarLayout } from '@/components/layout/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Upload as UploadIcon, 
  FileText, 
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Brain,
  Sparkles
} from 'lucide-react'
import { UploadButton, UploadDropzone } from '@uploadthing/react'
import type { OurFileRouter } from '@/app/api/uploadthing/core'

export default function UploadPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null)

  const handleUploadComplete = async (res: any) => {
    if (res && res[0]) {
      const file = res[0]
      setUploadedFile({ name: file.name, url: file.url })

      if (!title) {
        // Auto-generate title from filename
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
        setTitle(nameWithoutExt)
      }

      // Process the uploaded file
      setIsProcessing(true)
      try {
        const response = await fetch('/api/content/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileUrl: file.url,
            fileName: file.name,
            title: title || file.name,
            description: description
          }),
        })

        if (response.ok) {
          setUploadStatus('success')
          setTimeout(() => {
            router.push('/dashboard/enhanced')
          }, 2000)
        } else {
          throw new Error('Failed to process file')
        }
      } catch (error) {
        console.error('Processing error:', error)
        setError('Failed to process the uploaded file. Please try again.')
        setUploadStatus('error')
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error)
    setError('Upload failed. Please try again.')
    setUploadStatus('error')
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  return (
    <LanguageProvider>
      <SidebarLayout>
        <div className="h-full overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Learning Materials</h1>
              <p className="text-gray-600">
                Upload your study materials and let Kumba.AI create personalized learning plans for you.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {uploadStatus === 'success' ? (
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Successful!</h2>
                    <p className="text-gray-600 mb-4">
                      Your material has been uploaded and is being processed. You'll be redirected to your dashboard shortly.
                    </p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Upload Area */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UploadIcon className="h-5 w-5" />
                        Upload Files
                      </CardTitle>
                      <CardDescription>
                        Drag and drop your files or click to browse
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <UploadDropzone<OurFileRouter, "fileUploader">
                        endpoint="fileUploader"
                        onClientUploadComplete={handleUploadComplete}
                        onUploadError={handleUploadError}
                        appearance={{
                          container: "border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors",
                          uploadIcon: "text-gray-400",
                          label: "text-gray-600",
                          allowedContent: "text-gray-500 text-sm",
                          button: "bg-blue-600 hover:bg-blue-700 text-white"
                        }}
                      />

                      {uploadedFile && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                              <p className="text-sm text-gray-500">Upload complete</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                          <AlertCircle className="h-5 w-5 mr-2" />
                          {error}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* File Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>File Details</CardTitle>
                      <CardDescription>
                        Provide additional information about your material
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                          Title
                        </label>
                        <input
                          id="title"
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Advanced Calculus Notes"
                        />
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                          Description (Optional)
                        </label>
                        <textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Brief description of the material..."
                        />
                      </div>

                      {isProcessing && (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Processing your file with AI...</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* AI Features */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI-Powered Learning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Content Analysis</h3>
                        <p className="text-sm text-gray-600">AI extracts key concepts and topics</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 font-semibold text-sm">10</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Learning Plan</h3>
                        <p className="text-sm text-gray-600">10-day structured roadmap</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Brain className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Smart Quizzes</h3>
                        <p className="text-sm text-gray-600">AI-generated assessments</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Progress Tracking</h3>
                        <p className="text-sm text-gray-600">Monitor your learning journey</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarLayout>
    </LanguageProvider>
  )
}
