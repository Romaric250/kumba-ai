import { db } from './db'

export interface ProgressStatus {
  canAccess: boolean
  isCompleted: boolean
  isLocked: boolean
  prerequisitesMet: boolean
  nextTopicId?: string
  message?: string
}

// Check if user can access a specific topic
export async function checkTopicAccess(
  userId: string,
  topicId: string,
  language: 'en' | 'fr' = 'en'
): Promise<ProgressStatus> {
  try {
    // Get the topic and its learning plan
    const topic = await db.topic.findUnique({
      where: { id: topicId },
      include: {
        learningPlan: true,
        progress: {
          where: { userId }
        }
      }
    })

    if (!topic) {
      return {
        canAccess: false,
        isCompleted: false,
        isLocked: true,
        prerequisitesMet: false,
        message: language === 'fr' ? 'Sujet non trouvé' : 'Topic not found'
      }
    }

    // Check if user has progress for this topic
    const userProgress = topic.progress[0]
    const isCompleted = userProgress?.status === 'completed'

    // For Day 1, always allow access
    if (topic.dayIndex === 1) {
      return {
        canAccess: true,
        isCompleted,
        isLocked: false,
        prerequisitesMet: true
      }
    }

    // Check if previous topics are completed
    const previousTopics = await db.topic.findMany({
      where: {
        learningPlanId: topic.learningPlanId,
        dayIndex: { lt: topic.dayIndex }
      },
      include: {
        progress: {
          where: { userId }
        },
        quizzes: {
          include: {
            quizResults: {
              where: { userId },
              orderBy: { completedAt: 'desc' },
              take: 1
            }
          }
        }
      },
      orderBy: { dayIndex: 'asc' }
    })

    // Check if all previous topics are completed with passing quiz scores
    for (const prevTopic of previousTopics) {
      const prevProgress = prevTopic.progress[0]
      
      // Topic must be completed
      if (!prevProgress || prevProgress.status !== 'completed') {
        return {
          canAccess: false,
          isCompleted,
          isLocked: true,
          prerequisitesMet: false,
          message: language === 'fr' 
            ? `Vous devez terminer le Jour ${prevTopic.dayIndex}: ${prevTopic.title} avant de continuer.`
            : `You must complete Day ${prevTopic.dayIndex}: ${prevTopic.title} before continuing.`
        }
      }

      // Check if topic has quizzes and if they're passed
      if (prevTopic.quizzes.length > 0) {
        const hasPassedQuiz = prevTopic.quizzes.some(quiz => 
          quiz.quizResults.some(result => result.passed)
        )

        if (!hasPassedQuiz) {
          return {
            canAccess: false,
            isCompleted,
            isLocked: true,
            prerequisitesMet: false,
            message: language === 'fr'
              ? `Vous devez réussir le quiz du Jour ${prevTopic.dayIndex} avant de continuer.`
              : `You must pass the quiz for Day ${prevTopic.dayIndex} before continuing.`
          }
        }
      }
    }

    return {
      canAccess: true,
      isCompleted,
      isLocked: false,
      prerequisitesMet: true
    }
  } catch (error) {
    console.error('Error checking topic access:', error)
    return {
      canAccess: false,
      isCompleted: false,
      isLocked: true,
      prerequisitesMet: false,
      message: language === 'fr' ? 'Erreur lors de la vérification' : 'Error checking access'
    }
  }
}

// Mark topic as started
export async function startTopic(userId: string, topicId: string) {
  try {
    // Check if user can access this topic
    const accessStatus = await checkTopicAccess(userId, topicId)
    if (!accessStatus.canAccess) {
      throw new Error('Access denied to this topic')
    }

    // Create or update progress
    const progress = await db.learningProgress.upsert({
      where: {
        userId_topicId: {
          userId,
          topicId
        }
      },
      update: {
        status: 'in_progress',
        updatedAt: new Date()
      },
      create: {
        userId,
        topicId,
        learningPlanId: (await db.topic.findUnique({
          where: { id: topicId },
          select: { learningPlanId: true }
        }))!.learningPlanId,
        status: 'in_progress'
      }
    })

    return progress
  } catch (error) {
    console.error('Error starting topic:', error)
    throw error
  }
}

// Mark topic as completed
export async function completeTopic(userId: string, topicId: string) {
  try {
    const progress = await db.learningProgress.upsert({
      where: {
        userId_topicId: {
          userId,
          topicId
        }
      },
      update: {
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date()
      },
      create: {
        userId,
        topicId,
        learningPlanId: (await db.topic.findUnique({
          where: { id: topicId },
          select: { learningPlanId: true }
        }))!.learningPlanId,
        status: 'completed',
        completedAt: new Date()
      }
    })

    return progress
  } catch (error) {
    console.error('Error completing topic:', error)
    throw error
  }
}

// Get user's overall progress for a learning plan
export async function getUserProgress(userId: string, learningPlanId: string) {
  try {
    const topics = await db.topic.findMany({
      where: { learningPlanId },
      include: {
        progress: {
          where: { userId }
        },
        quizzes: {
          include: {
            quizResults: {
              where: { userId },
              orderBy: { completedAt: 'desc' }
            }
          }
        }
      },
      orderBy: { dayIndex: 'asc' }
    })

    const totalTopics = topics.length
    const completedTopics = topics.filter(topic => 
      topic.progress[0]?.status === 'completed'
    ).length

    const totalQuizzes = topics.reduce((sum, topic) => sum + topic.quizzes.length, 0)
    const passedQuizzes = topics.reduce((sum, topic) => {
      return sum + topic.quizzes.filter(quiz =>
        quiz.quizResults.some(result => result.passed)
      ).length
    }, 0)

    const averageScore = totalQuizzes > 0 ? 
      topics.reduce((sum, topic) => {
        const topicScores = topic.quizzes.flatMap(quiz =>
          quiz.quizResults.filter(result => result.passed).map(result => result.score)
        )
        return sum + (topicScores.length > 0 ? 
          topicScores.reduce((a, b) => a + b, 0) / topicScores.length : 0)
      }, 0) / totalTopics : 0

    const totalTimeSpent = topics.reduce((sum, topic) => 
      sum + (topic.progress[0]?.timeSpent || 0), 0
    )

    return {
      totalTopics,
      completedTopics,
      progressPercentage: Math.round((completedTopics / totalTopics) * 100),
      totalQuizzes,
      passedQuizzes,
      averageScore: Math.round(averageScore),
      totalTimeSpent, // in minutes
      topics: topics.map(topic => ({
        id: topic.id,
        title: topic.title,
        dayIndex: topic.dayIndex,
        status: topic.progress[0]?.status || 'not_started',
        completedAt: topic.progress[0]?.completedAt,
        timeSpent: topic.progress[0]?.timeSpent || 0,
        quizPassed: topic.quizzes.some(quiz =>
          quiz.quizResults.some(result => result.passed)
        )
      }))
    }
  } catch (error) {
    console.error('Error getting user progress:', error)
    throw error
  }
}

// Update time spent on a topic
export async function updateTimeSpent(
  userId: string, 
  topicId: string, 
  additionalMinutes: number
) {
  try {
    const progress = await db.learningProgress.upsert({
      where: {
        userId_topicId: {
          userId,
          topicId
        }
      },
      update: {
        timeSpent: {
          increment: additionalMinutes
        },
        updatedAt: new Date()
      },
      create: {
        userId,
        topicId,
        learningPlanId: (await db.topic.findUnique({
          where: { id: topicId },
          select: { learningPlanId: true }
        }))!.learningPlanId,
        status: 'in_progress',
        timeSpent: additionalMinutes
      }
    })

    return progress
  } catch (error) {
    console.error('Error updating time spent:', error)
    throw error
  }
}

// Check if user can take a quiz
export async function canTakeQuiz(userId: string, quizId: string): Promise<boolean> {
  try {
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        topic: {
          include: {
            progress: {
              where: { userId }
            }
          }
        }
      }
    })

    if (!quiz) return false

    // Topic must be at least started
    const topicProgress = quiz.topic.progress[0]
    return topicProgress?.status === 'in_progress' || topicProgress?.status === 'completed'
  } catch (error) {
    console.error('Error checking quiz access:', error)
    return false
  }
}
