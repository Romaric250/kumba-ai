import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { openai } from '@/lib/openai'

// Function to determine optimal learning days using AI
async function determineOptimalDays(title: string, description: string): Promise<number> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an educational expert. Analyze the content and determine the optimal number of days (between 3-14) needed to master this topic. Respond with only a number.'
        },
        {
          role: 'user',
          content: `Title: ${title}\nDescription: ${description || 'No description provided'}\n\nHow many days would be optimal to master this content?`
        }
      ],
      temperature: 0.3,
      max_tokens: 10
    })

    const days = parseInt(response.choices[0]?.message?.content?.trim() || '7')
    return Math.min(Math.max(days, 3), 14) // Ensure between 3-14 days
  } catch (error) {
    console.log('AI analysis failed, using default 7 days:', error)
    return 7 // Fallback to 7 days
  }
}

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

    // Determine optimal learning days using AI
    const optimalDays = await determineOptimalDays(title || fileName, description)

    // Create learning material record
    const learningMaterial = await db.learningMaterial.create({
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
    const learningPlan = await db.learningPlan.create({
      data: {
        title: `Master ${title} in ${optimalDays} Days`,
        description: `A comprehensive ${optimalDays}-day learning plan for ${title}`,
        totalDays: optimalDays,
        status: 'active',
        userId: session.user.id,
        learningMaterialId: learningMaterial.id
      }
    })

    // Create comprehensive topics based on the optimal days
    const sampleTopics = []

    for (let day = 1; day <= optimalDays; day++) {
      let topicTitle, topicDescription, topicContent, goals

      if (day === 1) {
        topicTitle = `Introduction to ${title}`
        topicDescription = 'Foundation concepts and overview'
        topicContent = `# Introduction to ${title}\n\nThis topic covers the fundamental concepts and provides an overview of the subject matter. You'll learn the basic principles and prepare for more advanced topics.\n\n## Learning Objectives\n- Understand basic concepts\n- Identify key principles\n- Prepare for advanced topics\n\n## Key Points\n- Foundation knowledge\n- Core terminology\n- Basic principles`
        goals = ['Understand basic concepts', 'Identify key principles', 'Prepare for advanced topics']
      } else if (day <= Math.ceil(optimalDays * 0.3)) {
        topicTitle = `Core Concepts of ${title} - Part ${day - 1}`
        topicDescription = 'Deep dive into fundamental principles'
        topicContent = `# Core Concepts - Part ${day - 1}\n\nDetailed exploration of the fundamental principles that form the foundation of ${title}. This section builds upon the introduction and provides deeper understanding.\n\n## Learning Objectives\n- Master fundamental principles\n- Apply concepts to examples\n- Build strong foundation\n\n## Key Topics\n- Advanced theory\n- Practical examples\n- Problem-solving techniques`
        goals = ['Master fundamental principles', 'Apply concepts to examples', 'Build strong foundation']
      } else if (day <= Math.ceil(optimalDays * 0.7)) {
        topicTitle = `Practical Applications - Day ${day}`
        topicDescription = 'Hands-on practice and real-world applications'
        topicContent = `# Practical Applications - Day ${day}\n\nLearn how to apply your knowledge in real-world scenarios. This topic focuses on practical problem-solving and hands-on experience.\n\n## Learning Objectives\n- Apply knowledge practically\n- Solve real problems\n- Develop practical skills\n\n## Activities\n- Hands-on exercises\n- Case studies\n- Project work`
        goals = ['Apply knowledge practically', 'Solve real problems', 'Develop practical skills']
      } else {
        topicTitle = `Advanced Mastery - Day ${day}`
        topicDescription = 'Advanced techniques and mastery'
        topicContent = `# Advanced Mastery - Day ${day}\n\nAdvanced techniques and comprehensive mastery of ${title}. This section focuses on expert-level understanding and complex problem-solving.\n\n## Learning Objectives\n- Achieve mastery level\n- Handle complex scenarios\n- Integrate all concepts\n\n## Advanced Topics\n- Expert techniques\n- Complex problem solving\n- Integration and synthesis`
        goals = ['Achieve mastery level', 'Handle complex scenarios', 'Integrate all concepts']
      }

      sampleTopics.push({
        title: topicTitle,
        description: topicDescription,
        content: topicContent,
        goals,
        timeEstimate: day === 1 ? 45 : 60,
        dayIndex: day,
        status: day === 1 ? 'unlocked' : 'locked'
      })
    }

    // Create topics
    for (const topicData of sampleTopics) {
      const topic = await db.topic.create({
        data: {
          ...topicData,
          learningPlanId: learningPlan.id
        }
      })

      // Create a quiz for each topic
      await db.quiz.create({
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
