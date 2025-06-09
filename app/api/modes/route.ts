import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

interface SetModeRequest {
  planId: string
  mode: 'strict' | 'flexible' | 'exam-prep' | 'review'
  settings?: {
    allowSkipping?: boolean
    requireQuizPass?: boolean
    minimumScore?: number
    timeLimit?: number
    reviewFrequency?: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: SetModeRequest = await request.json()

    if (!body.planId || !body.mode) {
      return NextResponse.json(
        { error: 'Plan ID and mode are required' },
        { status: 400 }
      )
    }

    // Validate learning plan ownership
    const learningPlan = await db.learningPlan.findUnique({
      where: {
        id: body.planId,
        userId: session.user.id
      },
      include: {
        topics: {
          include: {
            progress: {
              where: { userId: session.user.id }
            }
          },
          orderBy: { dayIndex: 'asc' }
        }
      }
    })

    if (!learningPlan) {
      return NextResponse.json(
        { error: 'Learning plan not found' },
        { status: 404 }
      )
    }

    // Apply mode-specific logic
    const modeConfig = await applyLearningMode(learningPlan, body.mode, body.settings)

    // Update learning plan with mode settings
    await db.learningPlan.update({
      where: { id: body.planId },
      data: {
        // Store mode configuration in description or add a new field
        description: `${learningPlan.description || ''}\n[MODE:${body.mode}]`
      }
    })

    return NextResponse.json({
      success: true,
      mode: body.mode,
      configuration: modeConfig,
      message: getModeDescription(body.mode, session.user.language || 'en')
    })
  } catch (error) {
    console.error('Error setting learning mode:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('planId')

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    // Get current mode from learning plan
    const learningPlan = await db.learningPlan.findUnique({
      where: {
        id: planId,
        userId: session.user.id
      }
    })

    if (!learningPlan) {
      return NextResponse.json(
        { error: 'Learning plan not found' },
        { status: 404 }
      )
    }

    // Extract mode from description (this is a simple implementation)
    const modeMatch = learningPlan.description?.match(/\[MODE:(\w+)\]/)
    const currentMode = modeMatch ? modeMatch[1] : 'strict'

    const availableModes = [
      {
        id: 'strict',
        name: session.user.language === 'fr' ? 'Mode Strict' : 'Strict Mode',
        description: session.user.language === 'fr' 
          ? 'Apprentissage séquentiel obligatoire. Chaque sujet doit être complété avant de passer au suivant.'
          : 'Sequential learning required. Each topic must be completed before moving to the next.',
        features: [
          session.user.language === 'fr' ? 'Progression séquentielle' : 'Sequential progression',
          session.user.language === 'fr' ? 'Quiz obligatoires' : 'Mandatory quizzes',
          session.user.language === 'fr' ? 'Score minimum requis' : 'Minimum score required'
        ],
        recommended: true
      },
      {
        id: 'flexible',
        name: session.user.language === 'fr' ? 'Mode Flexible' : 'Flexible Mode',
        description: session.user.language === 'fr'
          ? 'Permet de sauter des sujets et de revenir plus tard. Idéal pour la révision.'
          : 'Allows skipping topics and returning later. Great for review.',
        features: [
          session.user.language === 'fr' ? 'Saut de sujets autorisé' : 'Topic skipping allowed',
          session.user.language === 'fr' ? 'Quiz optionnels' : 'Optional quizzes',
          session.user.language === 'fr' ? 'Progression libre' : 'Free progression'
        ]
      },
      {
        id: 'exam-prep',
        name: session.user.language === 'fr' ? 'Préparation Examen' : 'Exam Preparation',
        description: session.user.language === 'fr'
          ? 'Mode intensif avec quiz fréquents et révisions ciblées.'
          : 'Intensive mode with frequent quizzes and targeted reviews.',
        features: [
          session.user.language === 'fr' ? 'Quiz fréquents' : 'Frequent quizzes',
          session.user.language === 'fr' ? 'Révisions automatiques' : 'Automatic reviews',
          session.user.language === 'fr' ? 'Suivi de performance' : 'Performance tracking'
        ]
      },
      {
        id: 'review',
        name: session.user.language === 'fr' ? 'Mode Révision' : 'Review Mode',
        description: session.user.language === 'fr'
          ? 'Focus sur les sujets déjà étudiés avec des quiz de révision.'
          : 'Focus on previously studied topics with review quizzes.',
        features: [
          session.user.language === 'fr' ? 'Révision ciblée' : 'Targeted review',
          session.user.language === 'fr' ? 'Quiz de rappel' : 'Recall quizzes',
          session.user.language === 'fr' ? 'Renforcement' : 'Reinforcement'
        ]
      }
    ]

    return NextResponse.json({
      currentMode,
      availableModes,
      recommendations: generateModeRecommendations(session.user.id, planId)
    })
  } catch (error) {
    console.error('Error fetching learning modes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function applyLearningMode(
  learningPlan: any,
  mode: string,
  settings?: any
) {
  const config = {
    mode,
    settings: settings || {},
    appliedAt: new Date()
  }

  switch (mode) {
    case 'strict':
      // Ensure sequential unlocking
      for (let i = 0; i < learningPlan.topics.length; i++) {
        const topic = learningPlan.topics[i]
        const shouldBeUnlocked = i === 0 || 
          learningPlan.topics[i - 1].progress[0]?.status === 'completed'
        
        await db.topic.update({
          where: { id: topic.id },
          data: {
            status: shouldBeUnlocked ? 'unlocked' : 'locked'
          }
        })
      }
      config.settings = {
        requireQuizPass: true,
        minimumScore: 70,
        allowSkipping: false,
        ...settings
      }
      break

    case 'flexible':
      // Unlock all topics
      await db.topic.updateMany({
        where: { learningPlanId: learningPlan.id },
        data: { status: 'unlocked' }
      })
      config.settings = {
        requireQuizPass: false,
        allowSkipping: true,
        minimumScore: 50,
        ...settings
      }
      break

    case 'exam-prep':
      // Unlock completed topics and next 2 topics
      const completedCount = learningPlan.topics.filter(
        (t: any) => t.progress[0]?.status === 'completed'
      ).length
      
      for (let i = 0; i < learningPlan.topics.length; i++) {
        const shouldBeUnlocked = i <= completedCount + 1
        await db.topic.update({
          where: { id: learningPlan.topics[i].id },
          data: {
            status: shouldBeUnlocked ? 'unlocked' : 'locked'
          }
        })
      }
      config.settings = {
        requireQuizPass: true,
        minimumScore: 80,
        reviewFrequency: 3, // Review every 3 topics
        timeLimit: true,
        ...settings
      }
      break

    case 'review':
      // Unlock only completed topics for review
      for (const topic of learningPlan.topics) {
        const isCompleted = topic.progress[0]?.status === 'completed'
        await db.topic.update({
          where: { id: topic.id },
          data: {
            status: isCompleted ? 'unlocked' : 'locked'
          }
        })
      }
      config.settings = {
        requireQuizPass: false,
        focusOnWeakAreas: true,
        ...settings
      }
      break
  }

  return config
}

function getModeDescription(mode: string, language: string): string {
  const descriptions = {
    en: {
      strict: "Strict mode activated. You must complete topics in order and pass all quizzes.",
      flexible: "Flexible mode activated. You can skip topics and return to them later.",
      'exam-prep': "Exam preparation mode activated. Intensive study with frequent assessments.",
      review: "Review mode activated. Focus on reinforcing previously learned material."
    },
    fr: {
      strict: "Mode strict activé. Vous devez compléter les sujets dans l'ordre et réussir tous les quiz.",
      flexible: "Mode flexible activé. Vous pouvez sauter des sujets et y revenir plus tard.",
      'exam-prep': "Mode préparation examen activé. Étude intensive avec évaluations fréquentes.",
      review: "Mode révision activé. Focus sur le renforcement du matériel déjà appris."
    }
  }

  return descriptions[language as keyof typeof descriptions]?.[mode as keyof typeof descriptions.en] || 
         descriptions.en[mode as keyof typeof descriptions.en]
}

async function generateModeRecommendations(userId: string, planId: string) {
  // This would analyze user's learning patterns and recommend the best mode
  // For now, return a simple recommendation
  return {
    recommended: 'strict',
    reason: 'Based on your learning pattern, strict mode will help you build strong foundations.'
  }
}
