'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

type Language = 'en' | 'fr'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.learn': 'Learn',
    'nav.progress': 'Progress',
    'nav.profile': 'Profile',
    'nav.signOut': 'Sign Out',
    
    // Dashboard
    'dashboard.title': 'Learning Dashboard',
    'dashboard.welcome': 'Welcome back',
    'dashboard.overview': 'Overview',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.upcomingTopics': 'Upcoming Topics',
    'dashboard.learningStreak': 'Learning Streak',
    'dashboard.totalTopics': 'Total Topics',
    'dashboard.completedTopics': 'Completed Topics',
    'dashboard.averageScore': 'Average Quiz Score',
    'dashboard.totalStudyTime': 'Total Study Time',
    'dashboard.activePlans': 'Active Plans',
    'dashboard.noData': 'No data available yet. Upload your first learning material to get started!',
    'dashboard.uploadFirst': 'Upload Learning Material',
    
    // Progress
    'progress.completed': 'Completed',
    'progress.inProgress': 'In Progress',
    'progress.locked': 'Locked',
    'progress.day': 'Day',
    'progress.minutes': 'minutes',
    'progress.score': 'Score',
    'progress.passed': 'Passed',
    'progress.failed': 'Failed',
    
    // Learning
    'learn.startTopic': 'Start Topic',
    'learn.continueTopic': 'Continue Topic',
    'learn.takeQuiz': 'Take Quiz',
    'learn.retakeQuiz': 'Retake Quiz',
    'learn.topicCompleted': 'Topic Completed',
    'learn.unlockNext': 'Complete this topic to unlock the next one',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.days': 'days',
    'common.hours': 'hours',
    'common.minutes': 'minutes',
    
    // Achievements
    'achievement.weekWarrior': 'Week Warrior',
    'achievement.monthlyMaster': 'Monthly Master',
    'achievement.perfectScholar': 'Perfect Scholar',
    'achievement.streakDescription': 'day learning streak!',
    
    // AI Mentor
    'mentor.chat': 'Chat with AI Mentor',
    'mentor.askQuestion': 'Ask a question...',
    'mentor.send': 'Send',
    'mentor.thinking': 'AI Mentor is thinking...',
  },
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.learn': 'Apprendre',
    'nav.progress': 'Progrès',
    'nav.profile': 'Profil',
    'nav.signOut': 'Se déconnecter',
    
    // Dashboard
    'dashboard.title': 'Tableau de bord d\'apprentissage',
    'dashboard.welcome': 'Bon retour',
    'dashboard.overview': 'Aperçu',
    'dashboard.recentActivity': 'Activité récente',
    'dashboard.upcomingTopics': 'Sujets à venir',
    'dashboard.learningStreak': 'Série d\'apprentissage',
    'dashboard.totalTopics': 'Total des sujets',
    'dashboard.completedTopics': 'Sujets complétés',
    'dashboard.averageScore': 'Score moyen aux quiz',
    'dashboard.totalStudyTime': 'Temps d\'étude total',
    'dashboard.activePlans': 'Plans actifs',
    'dashboard.noData': 'Aucune donnée disponible. Téléchargez votre premier matériel d\'apprentissage pour commencer!',
    'dashboard.uploadFirst': 'Télécharger du matériel d\'apprentissage',
    
    // Progress
    'progress.completed': 'Complété',
    'progress.inProgress': 'En cours',
    'progress.locked': 'Verrouillé',
    'progress.day': 'Jour',
    'progress.minutes': 'minutes',
    'progress.score': 'Score',
    'progress.passed': 'Réussi',
    'progress.failed': 'Échoué',
    
    // Learning
    'learn.startTopic': 'Commencer le sujet',
    'learn.continueTopic': 'Continuer le sujet',
    'learn.takeQuiz': 'Passer le quiz',
    'learn.retakeQuiz': 'Reprendre le quiz',
    'learn.topicCompleted': 'Sujet complété',
    'learn.unlockNext': 'Complétez ce sujet pour débloquer le suivant',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.save': 'Sauvegarder',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.view': 'Voir',
    'common.days': 'jours',
    'common.hours': 'heures',
    'common.minutes': 'minutes',
    
    // Achievements
    'achievement.weekWarrior': 'Guerrier de la semaine',
    'achievement.monthlyMaster': 'Maître mensuel',
    'achievement.perfectScholar': 'Érudit parfait',
    'achievement.streakDescription': 'jours de série d\'apprentissage!',
    
    // AI Mentor
    'mentor.chat': 'Discuter avec le mentor IA',
    'mentor.askQuestion': 'Posez une question...',
    'mentor.send': 'Envoyer',
    'mentor.thinking': 'Le mentor IA réfléchit...',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { data: session, update } = useSession()
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    if (session?.user?.language) {
      setLanguageState(session.user.language as Language)
    }
  }, [session])

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang)
    
    // Update user language in database
    try {
      const response = await fetch('/api/user/language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language: lang }),
      })
      
      if (response.ok) {
        // Update session
        await update({ language: lang })
      }
    } catch (error) {
      console.error('Failed to update language:', error)
    }
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
