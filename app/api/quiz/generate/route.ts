import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { openai } from '@/lib/openai'

interface GenerateQuizRequest {
  topicId: string
  quizType?: 'practice' | 'assessment' | 'review' | 'adaptive'
  difficulty?: 'easy' | 'medium' | 'hard' | 'adaptive'
  questionCount?: number
  focusAreas?: string[]
  timeLimit?: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: GenerateQuizRequest = await request.json()

    if (!body.topicId) {
      return NextResponse.json(
        { error: 'Topic ID is required' },
        { status: 400 }
      )
    }

    // Get topic with learning plan
    const topic = await db.topic.findUnique({
      where: { id: body.topicId },
      include: {
        learningPlan: true,
        progress: {
          where: { userId: session.user.id }
        },
        quizzes: {
          include: {
            quizResults: {
              where: { userId: session.user.id },
              orderBy: { completedAt: 'desc' }
            }
          }
        }
      }
    })

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // Check access
    if (topic.learningPlan.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Determine quiz parameters based on user performance and request
    const quizConfig = await determineQuizConfiguration(
      topic,
      body,
      session.user.id,
      session.user.language || 'en'
    )

    // Generate quiz using AI
    const generatedQuiz = await generateAIQuiz(
      topic.content,
      quizConfig,
      session.user.language || 'en'
    )

    // Save quiz to database
    const savedQuiz = await db.quiz.create({
      data: {
        title: generatedQuiz.title,
        description: generatedQuiz.description,
        questions: generatedQuiz.questions,
        passingScore: quizConfig.passingScore,
        topicId: topic.id
      }
    })

    return NextResponse.json({
      quiz: {
        id: savedQuiz.id,
        title: savedQuiz.title,
        description: savedQuiz.description,
        questions: generatedQuiz.questions.map((q: any, index: number) => ({
          id: q.id || index + 1,
          type: q.type,
          question: q.question,
          options: q.options,
          points: q.points || 10,
          difficulty: q.difficulty || quizConfig.difficulty,
          category: q.category || 'general'
          // Note: correctAnswer and explanation excluded for security
        })),
        passingScore: savedQuiz.passingScore,
        timeLimit: quizConfig.timeLimit,
        configuration: quizConfig
      }
    })
  } catch (error) {
    console.error('Error generating quiz:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function determineQuizConfiguration(
  topic: any,
  request: GenerateQuizRequest,
  userId: string,
  language: string
) {
  // Get user's quiz history for this topic
  const previousResults = topic.quizzes.flatMap((quiz: any) => quiz.quizResults)
  
  // Calculate user's performance metrics
  const averageScore = previousResults.length > 0
    ? previousResults.reduce((sum: number, result: any) => sum + result.score, 0) / previousResults.length
    : 0

  const attempts = previousResults.length

  // Determine difficulty
  let difficulty = request.difficulty || 'medium'
  if (request.difficulty === 'adaptive') {
    if (averageScore >= 85) difficulty = 'hard'
    else if (averageScore >= 70) difficulty = 'medium'
    else difficulty = 'easy'
  }

  // Determine question count
  let questionCount = request.questionCount || 5
  if (request.quizType === 'practice') questionCount = Math.min(questionCount, 3)
  else if (request.quizType === 'assessment') questionCount = Math.max(questionCount, 8)

  // Determine passing score
  let passingScore = 70
  if (request.quizType === 'practice') passingScore = 60
  else if (request.quizType === 'assessment') passingScore = 80

  // Determine time limit
  let timeLimit = request.timeLimit || (questionCount * 60) // 60 seconds per question
  if (request.quizType === 'practice') timeLimit = Math.floor(timeLimit * 1.5) // More time for practice

  // Focus areas based on previous performance
  let focusAreas = request.focusAreas || []
  if (focusAreas.length === 0 && previousResults.length > 0) {
    // Analyze previous wrong answers to identify weak areas
    focusAreas = identifyWeakAreas(previousResults)
  }

  return {
    quizType: request.quizType || 'practice',
    difficulty,
    questionCount,
    passingScore,
    timeLimit,
    focusAreas,
    adaptiveMode: request.difficulty === 'adaptive',
    userPerformance: {
      averageScore,
      attempts,
      needsReview: averageScore < 70
    }
  }
}

async function generateAIQuiz(
  topicContent: string,
  config: any,
  language: string
) {
  const prompt = language === 'fr' 
    ? `Créez un quiz éducatif basé sur ce contenu. Configuration:
- Type: ${config.quizType}
- Difficulté: ${config.difficulty}
- Nombre de questions: ${config.questionCount}
- Score de passage: ${config.passingScore}%
- Domaines de focus: ${config.focusAreas.join(', ') || 'Général'}

Créez des questions variées (choix multiples, vrai/faux, correspondance) qui testent différents niveaux de compréhension.

Répondez au format JSON:
{
  "title": "Titre du quiz",
  "description": "Description du quiz",
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "Question",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Explication",
      "points": 10,
      "difficulty": "medium",
      "category": "comprehension"
    }
  ]
}

Contenu du sujet: ${topicContent.substring(0, 2000)}...`
    : `Create an educational quiz based on this content. Configuration:
- Type: ${config.quizType}
- Difficulty: ${config.difficulty}
- Question count: ${config.questionCount}
- Passing score: ${config.passingScore}%
- Focus areas: ${config.focusAreas.join(', ') || 'General'}

Create varied questions (multiple choice, true/false, matching) that test different levels of understanding.

Respond in JSON format:
{
  "title": "Quiz Title",
  "description": "Quiz Description",
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct",
      "points": 10,
      "difficulty": "medium",
      "category": "comprehension"
    }
  ]
}

Topic content: ${topicContent.substring(0, 2000)}...`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: language === 'fr'
            ? 'Vous êtes un expert en création de quiz éducatifs. Créez des questions engageantes et pédagogiques.'
            : 'You are an expert educational quiz creator. Create engaging and pedagogical questions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    })

    const result = response.choices[0]?.message?.content
    if (!result) throw new Error('No response from OpenAI')

    const parsedQuiz = JSON.parse(result)
    
    // Validate and enhance the generated quiz
    return enhanceGeneratedQuiz(parsedQuiz, config)
  } catch (error) {
    console.error('Error generating AI quiz:', error)
    
    // Fallback quiz generation
    return generateFallbackQuiz(config, language)
  }
}

function enhanceGeneratedQuiz(quiz: any, config: any) {
  // Ensure all questions have required fields
  quiz.questions = quiz.questions.map((q: any, index: number) => ({
    id: q.id || index + 1,
    type: q.type || 'multiple_choice',
    question: q.question,
    options: q.options || [],
    correctAnswer: q.correctAnswer,
    explanation: q.explanation || 'Correct answer explanation',
    points: q.points || Math.floor(100 / config.questionCount),
    difficulty: q.difficulty || config.difficulty,
    category: q.category || 'general',
    timeLimit: q.timeLimit || 60
  }))

  // Ensure total points add up to 100
  const totalPoints = quiz.questions.reduce((sum: number, q: any) => sum + q.points, 0)
  if (totalPoints !== 100) {
    const pointsPerQuestion = Math.floor(100 / quiz.questions.length)
    quiz.questions.forEach((q: any, index: number) => {
      q.points = index === quiz.questions.length - 1 
        ? 100 - (pointsPerQuestion * (quiz.questions.length - 1))
        : pointsPerQuestion
    })
  }

  return quiz
}

function generateFallbackQuiz(config: any, language: string) {
  const isEnglish = language === 'en'
  
  return {
    title: isEnglish ? 'Practice Quiz' : 'Quiz de Pratique',
    description: isEnglish 
      ? 'Test your understanding of the topic'
      : 'Testez votre compréhension du sujet',
    questions: Array.from({ length: config.questionCount }, (_, index) => ({
      id: index + 1,
      type: 'multiple_choice',
      question: isEnglish 
        ? `Sample question ${index + 1} about the topic`
        : `Question d'exemple ${index + 1} sur le sujet`,
      options: isEnglish
        ? ['Option A', 'Option B', 'Option C', 'Option D']
        : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: isEnglish
        ? 'This is the correct answer because...'
        : 'Ceci est la bonne réponse parce que...',
      points: Math.floor(100 / config.questionCount),
      difficulty: config.difficulty,
      category: 'general'
    }))
  }
}

function identifyWeakAreas(quizResults: any[]): string[] {
  // Analyze quiz results to identify patterns in wrong answers
  // This is a simplified implementation
  const weakAreas = []
  
  const averageScore = quizResults.reduce((sum, result) => sum + result.score, 0) / quizResults.length
  
  if (averageScore < 60) {
    weakAreas.push('fundamental concepts')
  } else if (averageScore < 80) {
    weakAreas.push('application of concepts')
  }
  
  return weakAreas
}
