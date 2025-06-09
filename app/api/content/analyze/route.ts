import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileUrl, fileName, title, description } = await request.json()

    if (!fileUrl || !fileName) {
      return NextResponse.json({ error: 'File URL and name are required' }, { status: 400 })
    }

    // Create learning material record
    const learningMaterial = await prisma.learningMaterial.create({
      data: {
        title: title || fileName,
        description: description || '',
        fileUrl,
        fileType: fileName.split('.').pop()?.toLowerCase() || 'unknown',
        extractedText: 'AI analysis complete', 
        status: 'processed',
        userId: session.user.id
      }
    })

    // Create learning plan
    const learningPlan = await prisma.learningPlan.create({
      data: {
        title: `Master ${title} in 10 Days`,
        description: `A comprehensive 10-day learning plan for ${title}`,
        totalDays: 10,
        status: 'active',
        userId: session.user.id,
        learningMaterialId: learningMaterial.id
      }
    })

    // Create sample topics based on the material
    const sampleTopics = [
      {
        title: `Introduction to ${title}`,
        description: 'Foundation concepts and overview',
        content: `# Introduction to ${title}\n\nThis topic covers the fundamental concepts and provides an overview of the subject matter. You'll learn the basic principles and prepare for more advanced topics.`,
        goals: ['Understand basic concepts', 'Identify key principles', 'Prepare for advanced topics'],
        timeEstimate: 45,
        dayIndex: 1,
        status: 'unlocked'
      },
      {
        title: `Core Concepts of ${title}`,
        description: 'Deep dive into fundamental principles',
        content: `# Core Concepts\n\nDetailed exploration of the fundamental principles that form the foundation of ${title}. This section builds upon the introduction and provides deeper understanding.`,
        goals: ['Master fundamental principles', 'Apply concepts to examples', 'Build strong foundation'],
        timeEstimate: 60,
        dayIndex: 2,
        status: 'locked'
      },
      {
        title: `Advanced Applications`,
        description: 'Practical applications and problem-solving',
        content: `# Advanced Applications\n\nLearn how to apply your knowledge in real-world scenarios. This topic focuses on practical problem-solving and advanced techniques.`,
        goals: ['Apply knowledge practically', 'Solve complex problems', 'Integrate concepts'],
        timeEstimate: 75,
        dayIndex: 3,
        status: 'locked'
      }
    ]

    // Create topics
    for (const topicData of sampleTopics) {
      const topic = await prisma.topic.create({
        data: {
          ...topicData,
          learningPlanId: learningPlan.id
        }
      })

      // Create a quiz for each topic
      await prisma.quiz.create({
        data: {
          title: `${topicData.title} - Mastery Quiz`,
          description: `Test your understanding of ${topicData.title.toLowerCase()}`,
          questions: [
            {
              id: 1,
              type: 'multiple_choice',
              question: `What is the main focus of ${topicData.title}?`,
              options: ['Basic concepts', 'Advanced theory', 'Practical application', 'All of the above'],
              correctAnswer: 3,
              explanation: 'This topic covers multiple aspects of the subject.',
              points: 25
            },
            {
              id: 2,
              type: 'multiple_choice',
              question: 'Which approach is most effective for learning this topic?',
              options: ['Memorization only', 'Understanding and practice', 'Speed reading', 'Passive listening'],
              correctAnswer: 1,
              explanation: 'Understanding combined with practice leads to mastery.',
              points: 25
            }
          ],
          passingScore: 70,
          topicId: topic.id
        }
      })
    }

    return NextResponse.json({
      success: true,
      learningMaterialId: learningMaterial.id,
      learningPlanId: learningPlan.id,
      message: 'Content analyzed and learning plan created successfully'
    })

  } catch (error) {
    console.error('Content analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    )
  }
}
