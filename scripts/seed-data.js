const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with sample data...')

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'student@kumba.ai' },
    update: {},
    create: {
      email: 'student@kumba.ai',
      name: 'Kumba Student',
      password: hashedPassword,
      language: 'en'
    }
  })

  console.log('✅ Created user:', user.email)

  // Create sample learning material
  const learningMaterial = await prisma.learningMaterial.create({
    data: {
      title: 'Advanced Mathematics - Calculus',
      description: 'Comprehensive calculus textbook covering derivatives, integrals, and applications',
      fileUrl: 'https://example.com/calculus.pdf',
      fileType: 'pdf',
      extractedText: `
# Advanced Calculus

## Chapter 1: Limits and Continuity
Understanding the fundamental concept of limits is crucial for calculus. A limit describes the behavior of a function as it approaches a particular point.

### Learning Objectives:
- Understand the definition of a limit
- Calculate limits using algebraic methods
- Identify continuous and discontinuous functions
- Apply the squeeze theorem

## Chapter 2: Derivatives
The derivative represents the rate of change of a function. It has numerous applications in physics, engineering, and economics.

### Learning Objectives:
- Master the definition of a derivative
- Learn differentiation rules (power, product, quotient, chain)
- Apply derivatives to solve optimization problems
- Understand the relationship between derivatives and graphs

## Chapter 3: Integrals
Integration is the reverse process of differentiation and is used to find areas, volumes, and accumulated quantities.

### Learning Objectives:
- Understand the fundamental theorem of calculus
- Master integration techniques
- Apply integrals to find areas and volumes
- Solve differential equations
      `,
      status: 'processed',
      userId: user.id
    }
  })

  console.log('✅ Created learning material:', learningMaterial.title)

  // Create learning plan
  const learningPlan = await prisma.learningPlan.create({
    data: {
      title: 'Master Advanced Calculus in 10 Days',
      description: 'A structured 10-day plan to master calculus concepts from limits to integrals',
      totalDays: 10,
      status: 'active',
      userId: user.id,
      learningMaterialId: learningMaterial.id
    }
  })

  console.log('✅ Created learning plan:', learningPlan.title)

  // Create topics for the learning plan
  const topics = [
    {
      title: 'Introduction to Limits',
      description: 'Understanding the fundamental concept of limits and their properties',
      content: 'Limits are the foundation of calculus. They describe the behavior of functions as inputs approach specific values.',
      goals: ['Understand limit definition', 'Calculate basic limits', 'Recognize limit notation'],
      timeEstimate: 45,
      dayIndex: 1,
      status: 'unlocked'
    },
    {
      title: 'Limit Laws and Techniques',
      description: 'Learn various techniques for evaluating limits including algebraic manipulation',
      content: 'Master the limit laws and techniques for evaluating complex limits.',
      goals: ['Apply limit laws', 'Use algebraic techniques', 'Handle indeterminate forms'],
      timeEstimate: 60,
      dayIndex: 2,
      status: 'locked'
    },
    {
      title: 'Continuity and Discontinuity',
      description: 'Explore continuous functions and identify types of discontinuities',
      content: 'A function is continuous if its limit equals its value at every point.',
      goals: ['Define continuity', 'Identify discontinuities', 'Apply intermediate value theorem'],
      timeEstimate: 50,
      dayIndex: 3,
      status: 'locked'
    },
    {
      title: 'Introduction to Derivatives',
      description: 'Understand the derivative as the limit of difference quotients',
      content: 'The derivative measures the instantaneous rate of change of a function.',
      goals: ['Understand derivative definition', 'Calculate derivatives from definition', 'Interpret geometric meaning'],
      timeEstimate: 55,
      dayIndex: 4,
      status: 'locked'
    },
    {
      title: 'Differentiation Rules',
      description: 'Master the power rule, product rule, quotient rule, and chain rule',
      content: 'Learn efficient techniques for finding derivatives of complex functions.',
      goals: ['Apply power rule', 'Use product and quotient rules', 'Master chain rule'],
      timeEstimate: 70,
      dayIndex: 5,
      status: 'locked'
    }
  ]

  for (const topicData of topics) {
    const topic = await prisma.topic.create({
      data: {
        ...topicData,
        learningPlanId: learningPlan.id
      }
    })

    // Create a quiz for each topic
    const quiz = await prisma.quiz.create({
      data: {
        title: `${topicData.title} - Mastery Quiz`,
        description: `Test your understanding of ${topicData.title.toLowerCase()}`,
        questions: [
          {
            id: 1,
            type: 'multiple_choice',
            question: `What is the main concept covered in ${topicData.title}?`,
            options: ['Limits', 'Derivatives', 'Integrals', 'Functions'],
            correctAnswer: 0,
            explanation: 'This topic focuses on the fundamental concepts.',
            points: 25
          },
          {
            id: 2,
            type: 'multiple_choice',
            question: 'Which technique is most important for this topic?',
            options: ['Memorization', 'Understanding', 'Speed', 'Guessing'],
            correctAnswer: 1,
            explanation: 'Understanding the underlying concepts is crucial.',
            points: 25
          },
          {
            id: 3,
            type: 'multiple_choice',
            question: 'How should you approach problem-solving?',
            options: ['Randomly', 'Systematically', 'Quickly', 'Carelessly'],
            correctAnswer: 1,
            explanation: 'A systematic approach leads to better results.',
            points: 25
          },
          {
            id: 4,
            type: 'multiple_choice',
            question: 'What is the best way to master this topic?',
            options: ['Practice', 'Reading only', 'Watching videos', 'Sleeping'],
            correctAnswer: 0,
            explanation: 'Practice is essential for mastery.',
            points: 25
          }
        ],
        passingScore: 70,
        topicId: topic.id
      }
    })

    console.log(`✅ Created topic and quiz: ${topic.title}`)
  }

  // Create some sample progress for the first topic
  const firstTopic = await prisma.topic.findFirst({
    where: { learningPlanId: learningPlan.id, dayIndex: 1 }
  })

  if (firstTopic) {
    await prisma.learningProgress.create({
      data: {
        userId: user.id,
        topicId: firstTopic.id,
        learningPlanId: learningPlan.id,
        status: 'completed',
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        timeSpent: 45,
        masteryScore: 85
      }
    })

    // Create a quiz result
    const quiz = await prisma.quiz.findFirst({
      where: { topicId: firstTopic.id }
    })

    if (quiz) {
      await prisma.quizResult.create({
        data: {
          userId: user.id,
          quizId: quiz.id,
          score: 85,
          passed: true,
          answers: [
            { questionId: 1, userAnswer: 0, correctAnswer: 0, isCorrect: true, points: 25 },
            { questionId: 2, userAnswer: 1, correctAnswer: 1, isCorrect: true, points: 25 },
            { questionId: 3, userAnswer: 1, correctAnswer: 1, isCorrect: true, points: 25 },
            { questionId: 4, userAnswer: 2, correctAnswer: 0, isCorrect: false, points: 0 }
          ],
          timeSpent: 15
        }
      })
    }

    // Unlock the second topic
    const secondTopic = await prisma.topic.findFirst({
      where: { learningPlanId: learningPlan.id, dayIndex: 2 }
    })

    if (secondTopic) {
      await prisma.topic.update({
        where: { id: secondTopic.id },
        data: { status: 'unlocked' }
      })
    }

    console.log('✅ Created sample progress and unlocked next topic')
  }

  console.log('🎉 Database seeded successfully!')
  console.log('\n📝 Sample credentials:')
  console.log('Email: student@kumba.ai')
  console.log('Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
