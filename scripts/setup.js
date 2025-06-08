#!/usr/bin/env node

/**
 * Setup script for Kumba.AI
 * This script helps initialize the project with sample data
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Setting up Kumba.AI...')

  try {
    // Create a sample user
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    const user = await prisma.user.upsert({
      where: { email: 'student@kumba.ai' },
      update: {},
      create: {
        email: 'student@kumba.ai',
        password: hashedPassword,
        name: 'Sample Student',
        language: 'en',
      },
    })

    console.log('✅ Sample user created:', user.email)

    // Create sample learning material
    const material = await prisma.learningMaterial.upsert({
      where: { id: 'sample-material-1' },
      update: {},
      create: {
        id: 'sample-material-1',
        title: 'Introduction to Mathematics',
        description: 'Basic mathematical concepts and principles',
        fileUrl: 'https://example.com/sample.pdf',
        fileType: 'pdf',
        extractedText: 'This is sample extracted text from a mathematics textbook covering basic concepts like algebra, geometry, and calculus.',
        status: 'completed',
        userId: user.id,
      },
    })

    console.log('✅ Sample learning material created:', material.title)

    // Create sample learning plan
    const learningPlan = await prisma.learningPlan.upsert({
      where: { id: 'sample-plan-1' },
      update: {},
      create: {
        id: 'sample-plan-1',
        title: 'Mathematics Learning Plan',
        description: '10-day structured plan for learning mathematics',
        totalDays: 10,
        status: 'active',
        userId: user.id,
        learningMaterialId: material.id,
      },
    })

    console.log('✅ Sample learning plan created:', learningPlan.title)

    // Create sample topics
    const topics = [
      {
        title: 'Basic Algebra',
        description: 'Introduction to algebraic concepts',
        content: 'Learn the fundamentals of algebra including variables, equations, and basic operations.',
        dayIndex: 1,
        goals: ['Understand variables', 'Solve simple equations', 'Learn basic operations'],
        timeEstimate: 90,
        status: 'unlocked',
      },
      {
        title: 'Linear Equations',
        description: 'Working with linear equations',
        content: 'Master linear equations and their applications in real-world problems.',
        dayIndex: 2,
        goals: ['Solve linear equations', 'Graph linear functions', 'Apply to word problems'],
        timeEstimate: 120,
        status: 'locked',
      },
      {
        title: 'Quadratic Equations',
        description: 'Understanding quadratic equations',
        content: 'Learn to solve quadratic equations using various methods.',
        dayIndex: 3,
        goals: ['Factor quadratics', 'Use quadratic formula', 'Graph parabolas'],
        timeEstimate: 150,
        status: 'locked',
      },
    ]

    for (const topicData of topics) {
      const topic = await prisma.topic.create({
        data: {
          ...topicData,
          learningPlanId: learningPlan.id,
        },
      })

      // Create a sample quiz for each topic
      await prisma.quiz.create({
        data: {
          title: `Quiz: ${topicData.title}`,
          description: `Test your understanding of ${topicData.title}`,
          questions: [
            {
              id: 1,
              type: 'multiple_choice',
              question: `What is the main focus of ${topicData.title}?`,
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 0,
              explanation: 'This is the correct answer because it covers the main concept.',
              points: 25,
            },
            {
              id: 2,
              type: 'fill_in_blank',
              question: `The key principle of ${topicData.title} is ______.`,
              correctAnswer: 'understanding',
              explanation: 'Understanding is fundamental to mastering this topic.',
              points: 25,
            },
          ],
          passingScore: 70,
          topicId: topic.id,
        },
      })

      console.log(`✅ Created topic and quiz: ${topicData.title}`)
    }

    console.log('\n🎉 Setup completed successfully!')
    console.log('\n📝 Sample credentials:')
    console.log('   Email: student@kumba.ai')
    console.log('   Password: password123')
    console.log('\n🌐 Visit http://localhost:3000 to get started!')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
