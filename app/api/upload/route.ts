import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { processUploadedFile, getFileType } from '@/lib/file-processing'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!file || !title) {
      return NextResponse.json(
        { error: 'Missing file or title' },
        { status: 400 }
      )
    }

    // Validate file
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF or image files.' },
        { status: 400 }
      )
    }

    // For now, we'll simulate file upload to a storage service
    // In production, you would upload to UploadThing, AWS S3, etc.
    const fileUrl = `https://example.com/uploads/${Date.now()}-${file.name}`
    const fileType = getFileType(file.type)

    // Create learning material record
    const material = await db.learningMaterial.create({
      data: {
        title,
        description,
        fileUrl,
        fileType,
        status: 'processing',
        userId: session.user.id,
      }
    })

    // Process file in background (in production, this would be a queue job)
    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      // Simulate file upload and processing
      // const extractedText = await processUploadedFile(fileUrl, fileType)
      
      // For demo purposes, we'll use sample text
      const extractedText = `Sample extracted text from ${file.name}. This would contain the actual content from the uploaded file.`

      // Update material with extracted text
      await db.learningMaterial.update({
        where: { id: material.id },
        data: {
          extractedText,
          status: 'completed'
        }
      })
    } catch (error) {
      console.error('File processing error:', error)
      await db.learningMaterial.update({
        where: { id: material.id },
        data: { status: 'failed' }
      })
    }

    return NextResponse.json(
      {
        message: 'File uploaded successfully',
        material: {
          id: material.id,
          title: material.title,
          fileUrl: material.fileUrl,
          fileType: material.fileType,
          status: material.status
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
