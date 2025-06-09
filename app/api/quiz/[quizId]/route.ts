import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quizId } = params

    // Get quiz with topic information
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        topic: {
          include: {
            learningPlan: true
          }
        },
        quizResults: {
          where: { userId: session.user.id },
          orderBy: { completedAt: 'desc' },
          take: 1
        }
      }
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Check if user has access to this quiz
    if (quiz.topic.learningPlan.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if topic is unlocked
    if (quiz.topic.status === 'locked') {
      return NextResponse.json(
        { error: 'This topic is locked. Complete previous topics first.' },
        { status: 403 }
      )
    }

    // Get user's previous attempts
    const previousAttempts = await db.quizResult.count({
      where: {
        quizId: quiz.id,
        userId: session.user.id
      }
    })

    // Check if user has exceeded max attempts
    const maxAttempts = 3
    if (previousAttempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Maximum attempts exceeded' },
        { status: 403 }
      )
    }

    // Return quiz without correct answers for security
    const quizData = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      questions: (quiz.questions as any[]).map((q, index) => ({
        id: q.id || index + 1,
        type: q.type,
        question: q.question,
        options: q.options,
        points: q.points || 10
        // Note: correctAnswer and explanation are excluded for security
      })),
      timeLimit: (quiz.questions as any[]).length * 60, // 60 seconds per question
      attemptsRemaining: maxAttempts - previousAttempts,
      lastAttempt: quiz.quizResults[0] || null
    }

    return NextResponse.json({ quiz: quizData })
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
