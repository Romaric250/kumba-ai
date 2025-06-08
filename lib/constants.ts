// Application constants for Kumba.AI

export const APP_CONFIG = {
  name: 'Kumba.AI',
  description: 'AI-powered learning mentor for African students',
  version: '1.0.0',
  supportedLanguages: ['en', 'fr'] as const,
  defaultLanguage: 'en' as const,
}

export const LEARNING_CONFIG = {
  defaultPlanDuration: 10, // days
  minimumQuizScore: 70, // percentage
  defaultReadingSpeed: 200, // words per minute
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFileTypes: [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ],
}

export const QUIZ_CONFIG = {
  questionsPerQuiz: 5,
  timePerQuestion: 60, // seconds
  maxRetakes: 3,
  passingScore: 70, // percentage
}

export const PROGRESS_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  LOCKED: 'locked',
} as const

export const TOPIC_STATUS = {
  LOCKED: 'locked',
  UNLOCKED: 'unlocked',
  COMPLETED: 'completed',
} as const

export const MATERIAL_STATUS = {
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  FILL_IN_BLANK: 'fill_in_blank',
  SHORT_ANSWER: 'short_answer',
} as const

// African-inspired motivational quotes for the mentor
export const MENTOR_QUOTES = {
  en: [
    "The expert in anything was once a beginner. Keep learning, step by step.",
    "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
    "If you want to go fast, go alone. If you want to go far, go together. - African Proverb",
    "However far the stream flows, it never forgets its source. - African Proverb",
    "Wisdom is like a baobab tree; no one individual can embrace it. - African Proverb",
    "The best time to plant a tree was 20 years ago. The second best time is now. - African Proverb",
    "Smooth seas do not make skillful sailors. - African Proverb",
    "When the roots of a tree begin to decay, it spreads death to the branches. - African Proverb",
  ],
  fr: [
    "L'expert en quoi que ce soit était autrefois un débutant. Continuez à apprendre, étape par étape.",
    "L'éducation est l'arme la plus puissante que vous puissiez utiliser pour changer le monde. - Nelson Mandela",
    "Si tu veux aller vite, va seul. Si tu veux aller loin, allons ensemble. - Proverbe africain",
    "Aussi loin que coule le ruisseau, il n'oublie jamais sa source. - Proverbe africain",
    "La sagesse est comme un baobab ; aucun individu ne peut l'embrasser. - Proverbe africain",
    "Le meilleur moment pour planter un arbre était il y a 20 ans. Le deuxième meilleur moment est maintenant. - Proverbe africain",
    "Les mers calmes ne font pas de marins habiles. - Proverbe africain",
    "Quand les racines d'un arbre commencent à pourrir, cela répand la mort aux branches. - Proverbe africain",
  ]
}

// Navigation routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LEARN: '/learn',
  PROGRESS: '/progress',
  PROFILE: '/profile',
  UPLOAD: '/upload',
  AUTH: {
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
  },
  API: {
    AUTH: '/api/auth',
    UPLOAD: '/api/upload',
    ANALYZE: '/api/analyze',
    ROADMAP: '/api/roadmap',
    QUIZ: '/api/quiz',
    PROGRESS: '/api/progress',
  }
} as const

// Error messages
export const ERROR_MESSAGES = {
  en: {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.',
    INVALID_FILE_TYPE: 'Invalid file type. Please upload PDF or image files.',
    PROCESSING_FAILED: 'Failed to process the file. Please ensure it contains readable text.',
    QUIZ_ACCESS_DENIED: 'You must complete the previous topics before taking this quiz.',
    TOPIC_LOCKED: 'This topic is locked. Complete previous topics first.',
  },
  fr: {
    GENERIC: "Quelque chose s'est mal passé. Veuillez réessayer.",
    NETWORK: 'Erreur réseau. Veuillez vérifier votre connexion.',
    UNAUTHORIZED: "Vous n'êtes pas autorisé à effectuer cette action.",
    FILE_TOO_LARGE: 'Le fichier est trop volumineux. La taille maximale est de 10 Mo.',
    INVALID_FILE_TYPE: 'Type de fichier invalide. Veuillez télécharger des fichiers PDF ou image.',
    PROCESSING_FAILED: 'Échec du traitement du fichier. Assurez-vous qu\'il contient du texte lisible.',
    QUIZ_ACCESS_DENIED: 'Vous devez terminer les sujets précédents avant de passer ce quiz.',
    TOPIC_LOCKED: 'Ce sujet est verrouillé. Terminez d\'abord les sujets précédents.',
  }
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  en: {
    FILE_UPLOADED: 'File uploaded successfully!',
    ROADMAP_GENERATED: 'Learning roadmap generated successfully!',
    QUIZ_COMPLETED: 'Quiz completed successfully!',
    PROGRESS_SAVED: 'Progress saved successfully!',
    TOPIC_COMPLETED: 'Topic completed! You can now proceed to the next one.',
  },
  fr: {
    FILE_UPLOADED: 'Fichier téléchargé avec succès !',
    ROADMAP_GENERATED: "Feuille de route d'apprentissage générée avec succès !",
    QUIZ_COMPLETED: 'Quiz terminé avec succès !',
    PROGRESS_SAVED: 'Progrès sauvegardé avec succès !',
    TOPIC_COMPLETED: 'Sujet terminé ! Vous pouvez maintenant passer au suivant.',
  }
} as const

// API response codes
export const API_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const

// Local storage keys
export const STORAGE_KEYS = {
  LANGUAGE: 'kumba_language',
  THEME: 'kumba_theme',
  USER_PREFERENCES: 'kumba_user_preferences',
  DRAFT_ANSWERS: 'kumba_draft_answers',
} as const
