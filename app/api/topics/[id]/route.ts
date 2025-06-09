import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const topicId = params.id

    // Get the topic with its learning plan and quiz
    const topic = await db.topic.findUnique({
      where: { id: topicId },
      include: {
        learningPlan: {
          select: {
            id: true,
            title: true,
            description: true,
            totalDays: true,
            userId: true
          }
        },
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            questions: true,
            passingScore: true
          }
        }
      }
    })

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // Check if user has access to this topic
    if (topic.learningPlan.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get user's progress for this topic
    const progress = await db.learningProgress.findFirst({
      where: {
        userId: session.user.id,
        topicId: topicId
      }
    })

    // Get all topics in this learning plan for navigation
    const allTopics = await db.topic.findMany({
      where: {
        learningPlanId: topic.learningPlan.id
      },
      select: {
        id: true,
        title: true,
        dayIndex: true,
        status: true
      },
      orderBy: {
        dayIndex: 'asc'
      }
    })

    return NextResponse.json({
      topic: {
        ...topic,
        progress: progress || null,
        allTopics
      }
    })

  } catch (error) {
    console.error('Error fetching topic:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topic' },
      { status: 500 }
    )
  }
}
