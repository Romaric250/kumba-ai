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

// Calculate learning streak for a user
export async function calculateLearningStreak(userId: string): Promise<number> {
  try {
    const recentProgress = await db.learningProgress.findMany({
      where: {
        userId,
        completedAt: {
          not: null,
          gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // Last 60 days
        }
      },
      orderBy: { completedAt: 'desc' }
    })

    if (recentProgress.length === 0) return 0

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    // Get unique days with activity
    const uniqueDays = new Set<number>()
    recentProgress.forEach(progress => {
      if (progress.completedAt) {
        const date = new Date(progress.completedAt)
        date.setHours(0, 0, 0, 0)
        uniqueDays.add(date.getTime())
      }
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
  } catch (error) {
    console.error('Error calculating learning streak:', error)
    return 0
  }
}

// Get personalized learning recommendations
export async function getLearningRecommendations(
  userId: string,
  learningPlanId?: string,
  language: 'en' | 'fr' = 'en'
): Promise<string[]> {
  try {
    const recommendations: string[] = []

    // Get user's progress data
    const whereClause: any = { userId }
    if (learningPlanId) whereClause.learningPlanId = learningPlanId

    const progressData = await db.learningProgress.findMany({
      where: whereClause,
      include: {
        topic: {
          include: {
            quizzes: {
              include: {
                quizResults: {
                  where: { userId },
                  orderBy: { completedAt: 'desc' }
                }
              }
            }
          }
        }
      }
    })

    // Calculate metrics
    const completedTopics = progressData.filter(p => p.status === 'completed').length
    const totalTopics = progressData.length
    const progressPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0

    // Get quiz performance
    const allQuizResults = progressData
      .flatMap(p => p.topic.quizzes)
      .flatMap(q => q.quizResults)

    const averageQuizScore = allQuizResults.length > 0
      ? allQuizResults.reduce((sum, r) => sum + r.score, 0) / allQuizResults.length
      : 0

    // Calculate learning streak
    const streak = await calculateLearningStreak(userId)

    // Generate recommendations based on performance
    if (language === 'fr') {
      if (streak === 0) {
        recommendations.push("🚀 Commencez votre série d'apprentissage aujourd'hui - même 15 minutes comptent!")
      } else if (streak >= 7) {
        recommendations.push(`🔥 Incroyable! Vous avez une série de ${streak} jours d'apprentissage!`)
      }

      if (averageQuizScore < 70) {
        recommendations.push("📚 Considérez réviser plus attentivement avant de passer les quiz")
      } else if (averageQuizScore >= 90) {
        recommendations.push("🌟 Performance excellente aux quiz! Vous maîtrisez bien le matériel.")
      }

      if (progressPercentage < 20) {
        recommendations.push("🎯 Concentrez-vous sur la completion d'un sujet à la fois")
      } else if (progressPercentage >= 80) {
        recommendations.push("🏁 Vous y êtes presque! Continuez jusqu'à la ligne d'arrivée")
      }
    } else {
      if (streak === 0) {
        recommendations.push("🚀 Start your learning streak today - even 15 minutes counts!")
      } else if (streak >= 7) {
        recommendations.push(`🔥 Amazing! You have a ${streak}-day learning streak!`)
      }

      if (averageQuizScore < 70) {
        recommendations.push("📚 Consider reviewing more thoroughly before taking quizzes")
      } else if (averageQuizScore >= 90) {
        recommendations.push("🌟 Excellent quiz performance! You're mastering the material.")
      }

      if (progressPercentage < 20) {
        recommendations.push("🎯 Focus on completing one topic at a time")
      } else if (progressPercentage >= 80) {
        recommendations.push("🏁 You're almost there! Push through to the finish line")
      }
    }

    return recommendations.slice(0, 3) // Limit to 3 recommendations
  } catch (error) {
    console.error('Error getting learning recommendations:', error)
    return []
  }
}

// Advanced progress analytics
export interface ProgressAnalytics {
  learningVelocity: number // topics per week
  timeEfficiency: number // score per minute
  consistencyScore: number // percentage
  masteryTrend: 'improving' | 'stable' | 'declining'
  strongAreas: string[]
  weakAreas: string[]
  nextMilestone: {
    type: 'completion' | 'streak' | 'mastery'
    target: number
    current: number
    description: string
  }
}

export async function getProgressAnalytics(
  userId: string,
  learningPlanId?: string
): Promise<ProgressAnalytics> {
  try {
    const whereClause: any = { userId }
    if (learningPlanId) whereClause.learningPlanId = learningPlanId

    // Get recent progress (last 30 days)
    const recentProgress = await db.learningProgress.findMany({
      where: {
        ...whereClause,
        completedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        topic: {
          include: {
            quizzes: {
              include: {
                quizResults: {
                  where: { userId },
                  orderBy: { completedAt: 'desc' }
                }
              }
            }
          }
        }
      },
      orderBy: { completedAt: 'asc' }
    })

    // Calculate learning velocity (topics per week)
    const weeksInPeriod = 4 // 30 days ≈ 4 weeks
    const learningVelocity = recentProgress.length / weeksInPeriod

    // Calculate time efficiency (average score per minute)
    const totalTime = recentProgress.reduce((sum, p) => sum + p.timeSpent, 0)
    const totalScore = recentProgress.reduce((sum, p) => sum + (p.masteryScore || 0), 0)
    const timeEfficiency = totalTime > 0 ? totalScore / totalTime : 0

    // Calculate consistency score
    const uniqueDays = new Set()
    recentProgress.forEach(p => {
      if (p.completedAt) {
        const date = new Date(p.completedAt)
        date.setHours(0, 0, 0, 0)
        uniqueDays.add(date.getTime())
      }
    })
    const consistencyScore = (uniqueDays.size / 30) * 100 // percentage of days active

    // Determine mastery trend
    const scores = recentProgress
      .filter(p => p.masteryScore)
      .map(p => p.masteryScore!)

    let masteryTrend: 'improving' | 'stable' | 'declining' = 'stable'
    if (scores.length >= 3) {
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2))
      const secondHalf = scores.slice(Math.floor(scores.length / 2))
      const firstAvg = firstHalf.reduce((sum, s) => sum + s, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((sum, s) => sum + s, 0) / secondHalf.length

      if (secondAvg > firstAvg + 5) masteryTrend = 'improving'
      else if (secondAvg < firstAvg - 5) masteryTrend = 'declining'
    }

    // Identify strong and weak areas (simplified)
    const strongAreas = ['Pattern Recognition', 'Problem Solving'] // Placeholder
    const weakAreas = ['Time Management'] // Placeholder

    // Calculate next milestone
    const currentStreak = await calculateLearningStreak(userId)
    const nextMilestone = {
      type: 'streak' as const,
      target: Math.ceil((currentStreak + 1) / 5) * 5, // Next multiple of 5
      current: currentStreak,
      description: `Reach ${Math.ceil((currentStreak + 1) / 5) * 5}-day learning streak`
    }

    return {
      learningVelocity: Math.round(learningVelocity * 10) / 10,
      timeEfficiency: Math.round(timeEfficiency * 10) / 10,
      consistencyScore: Math.round(consistencyScore),
      masteryTrend,
      strongAreas,
      weakAreas,
      nextMilestone
    }
  } catch (error) {
    console.error('Error getting progress analytics:', error)
    return {
      learningVelocity: 0,
      timeEfficiency: 0,
      consistencyScore: 0,
      masteryTrend: 'stable',
      strongAreas: [],
      weakAreas: [],
      nextMilestone: {
        type: 'completion',
        target: 1,
        current: 0,
        description: 'Complete your first topic'
      }
    }
  }
}
