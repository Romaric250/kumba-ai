import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { openai } from '@/lib/openai'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatRequest {
  message: string
  context?: {
    currentTopic?: string
    learningPlanId?: string
    recentQuizScore?: number
    strugglingAreas?: string[]
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ChatRequest = await request.json()

    if (!body.message || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get user's learning context
    const userContext = await getUserLearningContext(session.user.id, body.context?.learningPlanId)

    // Generate mentor response
    const mentorResponse = await generateMentorResponse(
      body.message,
      userContext,
      session.user.language || 'en'
    )

    // Save chat interaction (optional - for learning improvement)
    await saveChatInteraction(session.user.id, body.message, mentorResponse)

    return NextResponse.json({
      response: mentorResponse,
      timestamp: new Date().toISOString(),
      context: {
        userProgress: userContext.overallProgress,
        currentStreak: userContext.learningStreak,
        suggestions: generateActionableSuggestions(userContext)
      }
    })
  } catch (error) {
    console.error('Error in mentor chat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getUserLearningContext(userId: string, learningPlanId?: string) {
  // Get user's overall progress
  const learningPlans = await db.learningPlan.findMany({
    where: { 
      userId,
      ...(learningPlanId ? { id: learningPlanId } : {})
    },
    include: {
      topics: {
        include: {
          progress: {
            where: { userId }
          },
          quizzes: {
            include: {
              quizResults: {
                where: { userId },
                orderBy: { completedAt: 'desc' },
                take: 3
              }
            }
          }
        }
      }
    }
  })

  const allTopics = learningPlans.flatMap(plan => plan.topics)
  const completedTopics = allTopics.filter(topic => topic.progress[0]?.status === 'completed')
  const currentTopic = allTopics.find(topic => 
    topic.status === 'unlocked' || topic.progress[0]?.status === 'in_progress'
  )

  // Get recent quiz performance
  const recentQuizResults = allTopics
    .flatMap(topic => topic.quizzes)
    .flatMap(quiz => quiz.quizResults)
    .slice(0, 10)

  const averageQuizScore = recentQuizResults.length > 0
    ? recentQuizResults.reduce((sum, result) => sum + result.score, 0) / recentQuizResults.length
    : 0

  // Calculate learning streak
  const recentProgress = await db.learningProgress.findMany({
    where: {
      userId,
      completedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    orderBy: { completedAt: 'desc' }
  })

  const learningStreak = calculateLearningStreak(recentProgress)

  // Identify struggling areas
  const strugglingAreas = identifyStrugglingAreas(recentQuizResults)

  return {
    totalTopics: allTopics.length,
    completedTopics: completedTopics.length,
    overallProgress: allTopics.length > 0 ? (completedTopics.length / allTopics.length) * 100 : 0,
    currentTopic: currentTopic ? {
      title: currentTopic.title,
      dayIndex: currentTopic.dayIndex,
      goals: currentTopic.goals
    } : null,
    averageQuizScore,
    learningStreak,
    strugglingAreas,
    recentQuizResults: recentQuizResults.slice(0, 3),
    activePlans: learningPlans.filter(plan => plan.status === 'active').length
  }
}

async function generateMentorResponse(
  userMessage: string,
  context: any,
  language: string = 'en'
): Promise<string> {
  const systemPrompt = language === 'fr' 
    ? `Tu es Kumba.AI, un mentor IA strict mais bienveillant pour les étudiants africains. Tu encourages la discipline et l'apprentissage séquentiel.

Contexte de l'étudiant:
- Progression globale: ${context.overallProgress.toFixed(1)}%
- Sujets complétés: ${context.completedTopics}/${context.totalTopics}
- Score moyen aux quiz: ${context.averageQuizScore.toFixed(1)}%
- Série d'apprentissage: ${context.learningStreak} jours
- Sujet actuel: ${context.currentTopic?.title || 'Aucun'}
- Domaines de difficulté: ${context.strugglingAreas.join(', ') || 'Aucun identifié'}

Réponds de manière encourageante mais ferme. Donne des conseils pratiques et actionables. Utilise des proverbes africains quand c'est approprié.`
    : `You are Kumba.AI, a strict but caring AI mentor for African students. You encourage discipline and sequential learning.

Student context:
- Overall progress: ${context.overallProgress.toFixed(1)}%
- Topics completed: ${context.completedTopics}/${context.totalTopics}
- Average quiz score: ${context.averageQuizScore.toFixed(1)}%
- Learning streak: ${context.learningStreak} days
- Current topic: ${context.currentTopic?.title || 'None'}
- Struggling areas: ${context.strugglingAreas.join(', ') || 'None identified'}

Respond in an encouraging but firm manner. Give practical, actionable advice. Use African proverbs when appropriate.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.8,
      max_tokens: 500
    })

    return response.choices[0]?.message?.content || 
      (language === 'fr' 
        ? "Je suis désolé, je n'ai pas pu traiter votre message. Pouvez-vous reformuler votre question?"
        : "I'm sorry, I couldn't process your message. Could you please rephrase your question?")
  } catch (error) {
    console.error('Error generating mentor response:', error)
    return language === 'fr'
      ? "Je rencontre des difficultés techniques. Veuillez réessayer dans un moment."
      : "I'm experiencing technical difficulties. Please try again in a moment."
  }
}

function calculateLearningStreak(progressRecords: any[]): number {
  if (progressRecords.length === 0) return 0

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  const uniqueDays = new Set<number>()
  progressRecords.forEach(record => {
    const date = new Date(record.completedAt)
    date.setHours(0, 0, 0, 0)
    uniqueDays.add(date.getTime())
  })

  const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a)

  for (const dayTime of sortedDays) {
    const daysDiff = Math.floor((currentDate.getTime() - dayTime) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === streak) {
      streak++
    } else if (daysDiff > streak) {
      break
    }
  }

  return streak
}

function identifyStrugglingAreas(quizResults: any[]): string[] {
  if (quizResults.length === 0) return []

  // Group by quiz/topic and calculate average scores
  const topicPerformance: { [key: string]: number[] } = {}
  
  quizResults.forEach(result => {
    // This would need to be enhanced with actual topic/subject categorization
    const topicKey = `Topic ${Math.floor(Math.random() * 5) + 1}` // Placeholder
    if (!topicPerformance[topicKey]) {
      topicPerformance[topicKey] = []
    }
    topicPerformance[topicKey].push(result.score)
  })

  return Object.entries(topicPerformance)
    .filter(([, scores]) => {
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
      return avgScore < 70
    })
    .map(([topic]) => topic)
    .slice(0, 3)
}

function generateActionableSuggestions(context: any): string[] {
  const suggestions = []

  if (context.learningStreak === 0) {
    suggestions.push("Start your learning journey today - even 15 minutes counts!")
  } else if (context.learningStreak < 3) {
    suggestions.push("Build consistency - try to study a little each day")
  }

  if (context.averageQuizScore < 70) {
    suggestions.push("Review topics more thoroughly before taking quizzes")
  }

  if (context.overallProgress < 20) {
    suggestions.push("Focus on completing one topic at a time")
  } else if (context.overallProgress > 80) {
    suggestions.push("You're almost done! Push through to the finish line")
  }

  if (context.strugglingAreas.length > 0) {
    suggestions.push(`Focus extra attention on: ${context.strugglingAreas.join(', ')}`)
  }

  return suggestions
}

async function saveChatInteraction(userId: string, userMessage: string, mentorResponse: string) {
  // This could be implemented to save chat history for improving the AI
  // For now, we'll skip this to keep the database schema simple
  console.log(`Chat interaction for user ${userId}: ${userMessage.substring(0, 50)}...`)
}
