const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkLearningPlans() {
  try {
    const learningPlans = await prisma.learningPlan.findMany({
      include: {
        topics: true,
        _count: {
          select: {
            topics: true
          }
        }
      }
    })
    
    console.log('Found learning plans:')
    learningPlans.forEach(plan => {
      console.log(`- ID: ${plan.id}`)
      console.log(`  Title: ${plan.title}`)
      console.log(`  Total Days: ${plan.totalDays}`)
      console.log(`  Topics Count: ${plan._count.topics}`)
      console.log(`  Status: ${plan.status}`)
      console.log(`  User ID: ${plan.userId}`)
      console.log('---')
    })
    
  } catch (error) {
    console.error('Error checking learning plans:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLearningPlans()
