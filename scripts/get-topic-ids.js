const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function getTopicIds() {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: {
        dayIndex: 'asc'
      }
    })
    
    console.log('Found topics:')
    topics.forEach(topic => {
      console.log(`- Topic ID: ${topic.id}`)
      console.log(`  Title: ${topic.title}`)
      console.log(`  Day: ${topic.dayIndex}`)
      console.log(`  Learning Plan ID: ${topic.learningPlanId}`)
      console.log(`  Status: ${topic.status}`)
      console.log('---')
    })
    
  } catch (error) {
    console.error('Error getting topic IDs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getTopicIds()
