import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateLearningRoadmap, generateQuiz } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { materialId } = body

    if (!materialId) {
      return NextResponse.json(
        { error: 'Missing material ID' },
        { status: 400 }
      )
    }

    // Get the learning material
    const material = await db.learningMaterial.findUnique({
      where: { 
        id: materialId,
        userId: session.user.id // Ensure user owns the material
      }
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      )
    }

    if (!material.extractedText) {
      return NextResponse.json(
        { error: 'Material has not been processed yet' },
        { status: 400 }
      )
    }

    // Generate roadmap using OpenAI
    const userLanguage = session.user.language as 'en' | 'fr' || 'en'
    
    // For demo purposes, we'll create a sample roadmap
    // In production, uncomment the line below:
    // const roadmapData = await generateLearningRoadmap(material.extractedText, userLanguage)
    
    const roadmapData = {
      roadmap: [
        {
          dayIndex: 1,
          title: "Foundation Concepts",
          description: "Understanding the basic principles and terminology",
          goals: ["Learn key vocabulary", "Understand basic concepts", "Identify main themes"],
          timeEstimate: 90,
          prerequisites: [],
          keyPoints: ["Definition of terms", "Core principles", "Historical context"]
        },
        {
          dayIndex: 2,
          title: "Building Knowledge",
          description: "Expanding on foundation concepts with deeper understanding",
          goals: ["Connect concepts", "Analyze relationships", "Apply basic principles"],
          timeEstimate: 120,
          prerequisites: ["Day 1 completion"],
          keyPoints: ["Concept relationships", "Practical applications", "Real-world examples"]
        },
        // Add more days...
      ]
    }

    // Create learning plan
    const learningPlan = await db.learningPlan.create({
      data: {
        title: `Learning Plan: ${material.title}`,
        description: `10-day structured learning plan for ${material.title}`,
        totalDays: 10,
        status: 'active',
        userId: session.user.id,
        learningMaterialId: material.id,
      }
    })

    // Create topics and quizzes
    for (const topicData of roadmapData.roadmap) {
      const topic = await db.topic.create({
        data: {
          title: topicData.title,
          description: topicData.description,
          content: `Content for ${topicData.title}. ${topicData.keyPoints.join('. ')}.`,
          dayIndex: topicData.dayIndex,
          goals: topicData.goals,
          timeEstimate: topicData.timeEstimate,
          status: topicData.dayIndex === 1 ? 'unlocked' : 'locked',
          learningPlanId: learningPlan.id,
        }
      })

      // Generate quiz for each topic (demo version)
      const sampleQuiz = {
        quiz: {
          title: `Quiz: ${topicData.title}`,
          description: `Test your understanding of ${topicData.title}`,
          passingScore: 70,
          questions: [
            {
              id: 1,
              type: "multiple_choice",
              question: `What is the main focus of ${topicData.title}?`,
              options: ["Option A", "Option B", "Option C", "Option D"],
              correctAnswer: 0,
              explanation: "This is the correct answer because...",
              points: 20
            },
            {
              id: 2,
              type: "fill_in_blank",
              question: `Complete this sentence: The key concept of ${topicData.title} is ______.`,
              correctAnswer: "understanding",
              explanation: "Understanding is fundamental to this topic.",
              points: 20
            }
          ]
        }
      }

      // Create quiz
      await db.quiz.create({
        data: {
          title: sampleQuiz.quiz.title,
          description: sampleQuiz.quiz.description,
          questions: sampleQuiz.quiz.questions,
          passingScore: sampleQuiz.quiz.passingScore,
          topicId: topic.id,
        }
      })
    }

    return NextResponse.json(
      {
        message: 'Learning roadmap generated successfully',
        learningPlan: {
          id: learningPlan.id,
          title: learningPlan.title,
          description: learningPlan.description,
          totalDays: learningPlan.totalDays,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Roadmap generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate roadmap' },
      { status: 500 }
    )
  }
}
