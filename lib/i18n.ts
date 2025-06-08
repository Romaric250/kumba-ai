// Internationalization support for French and English

export type Language = 'en' | 'fr'

export const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    learn: 'Learn',
    progress: 'Progress',
    profile: 'Profile',
    signOut: 'Sign Out',
    
    // Authentication
    signIn: 'Sign In',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Name',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    
    // Dashboard
    welcomeBack: 'Welcome back',
    uploadMaterials: 'Upload Learning Materials',
    myLearningPlans: 'My Learning Plans',
    recentProgress: 'Recent Progress',
    
    // Upload
    uploadTitle: 'Upload Your Study Materials',
    uploadDescription: 'Upload PDFs, images, or scanned notes. Kumba.AI will analyze them and create your personalized learning roadmap.',
    dragAndDrop: 'Drag and drop files here, or click to select',
    supportedFormats: 'Supported formats: PDF, JPG, PNG, GIF, WEBP (max 10MB)',
    processing: 'Processing...',
    
    // Learning
    learningPlan: 'Learning Plan',
    day: 'Day',
    topic: 'Topic',
    goals: 'Learning Goals',
    timeEstimate: 'Estimated Time',
    minutes: 'minutes',
    startLearning: 'Start Learning',
    continueReading: 'Continue Reading',
    takeQuiz: 'Take Quiz',
    locked: 'Locked',
    unlocked: 'Unlocked',
    completed: 'Completed',
    
    // Quiz
    quiz: 'Quiz',
    question: 'Question',
    of: 'of',
    nextQuestion: 'Next Question',
    submitQuiz: 'Submit Quiz',
    score: 'Score',
    passed: 'Passed!',
    failed: 'Not Passed',
    retakeQuiz: 'Retake Quiz',
    explanation: 'Explanation',
    
    // Progress
    overallProgress: 'Overall Progress',
    topicsCompleted: 'Topics Completed',
    averageScore: 'Average Quiz Score',
    timeSpent: 'Time Spent Learning',
    hours: 'hours',
    
    // Mentor Messages
    mentorWelcome: 'Welcome to Kumba.AI! I am your strict but caring mentor. We will learn together, step by step, with no shortcuts.',
    mentorLocked: 'You must complete the previous topic before accessing this one. Discipline is key to mastery.',
    mentorEncouragement: 'Excellent work! You are making steady progress. Keep up the dedication.',
    mentorQuizFailed: 'You need to study more before retaking this quiz. Review the material carefully.',
    
    // Errors
    errorGeneric: 'Something went wrong. Please try again.',
    errorUpload: 'Failed to upload file. Please check the file format and size.',
    errorProcessing: 'Failed to process the file. Please ensure it contains readable text.',
    errorAuth: 'Authentication failed. Please check your credentials.',
    
    // Success Messages
    successUpload: 'File uploaded successfully!',
    successQuiz: 'Quiz completed successfully!',
    successProgress: 'Progress saved!',
    
    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
  },
  
  fr: {
    // Navigation
    dashboard: 'Tableau de bord',
    learn: 'Apprendre',
    progress: 'Progrès',
    profile: 'Profil',
    signOut: 'Se déconnecter',
    
    // Authentication
    signIn: 'Se connecter',
    signUp: "S'inscrire",
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    name: 'Nom',
    createAccount: 'Créer un compte',
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    dontHaveAccount: "Vous n'avez pas de compte ?",
    
    // Dashboard
    welcomeBack: 'Bon retour',
    uploadMaterials: "Télécharger du matériel d'apprentissage",
    myLearningPlans: "Mes plans d'apprentissage",
    recentProgress: 'Progrès récents',
    
    // Upload
    uploadTitle: "Téléchargez vos supports d'étude",
    uploadDescription: "Téléchargez des PDF, images ou notes scannées. Kumba.AI les analysera et créera votre feuille de route d'apprentissage personnalisée.",
    dragAndDrop: 'Glissez-déposez les fichiers ici, ou cliquez pour sélectionner',
    supportedFormats: 'Formats supportés : PDF, JPG, PNG, GIF, WEBP (max 10MB)',
    processing: 'Traitement en cours...',
    
    // Learning
    learningPlan: "Plan d'apprentissage",
    day: 'Jour',
    topic: 'Sujet',
    goals: "Objectifs d'apprentissage",
    timeEstimate: 'Temps estimé',
    minutes: 'minutes',
    startLearning: "Commencer l'apprentissage",
    continueReading: 'Continuer la lecture',
    takeQuiz: 'Passer le quiz',
    locked: 'Verrouillé',
    unlocked: 'Déverrouillé',
    completed: 'Terminé',
    
    // Quiz
    quiz: 'Quiz',
    question: 'Question',
    of: 'sur',
    nextQuestion: 'Question suivante',
    submitQuiz: 'Soumettre le quiz',
    score: 'Score',
    passed: 'Réussi !',
    failed: 'Non réussi',
    retakeQuiz: 'Reprendre le quiz',
    explanation: 'Explication',
    
    // Progress
    overallProgress: 'Progrès global',
    topicsCompleted: 'Sujets terminés',
    averageScore: 'Score moyen aux quiz',
    timeSpent: "Temps passé à apprendre",
    hours: 'heures',
    
    // Mentor Messages
    mentorWelcome: 'Bienvenue à Kumba.AI ! Je suis votre mentor strict mais bienveillant. Nous apprendrons ensemble, étape par étape, sans raccourcis.',
    mentorLocked: 'Vous devez terminer le sujet précédent avant d\'accéder à celui-ci. La discipline est la clé de la maîtrise.',
    mentorEncouragement: 'Excellent travail ! Vous progressez régulièrement. Continuez votre dévouement.',
    mentorQuizFailed: 'Vous devez étudier davantage avant de reprendre ce quiz. Révisez attentivement le matériel.',
    
    // Errors
    errorGeneric: "Quelque chose s'est mal passé. Veuillez réessayer.",
    errorUpload: 'Échec du téléchargement du fichier. Veuillez vérifier le format et la taille du fichier.',
    errorProcessing: 'Échec du traitement du fichier. Assurez-vous qu\'il contient du texte lisible.',
    errorAuth: "Échec de l'authentification. Veuillez vérifier vos identifiants.",
    
    // Success Messages
    successUpload: 'Fichier téléchargé avec succès !',
    successQuiz: 'Quiz terminé avec succès !',
    successProgress: 'Progrès sauvegardé !',
    
    // Common
    loading: 'Chargement...',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    close: 'Fermer',
    yes: 'Oui',
    no: 'Non',
  }
}

export function t(key: string, language: Language = 'en'): string {
  const keys = key.split('.')
  let value: any = translations[language]
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  return value || key
}

// Hook for using translations in components
export function useTranslations(language: Language = 'en') {
  return {
    t: (key: string) => t(key, language),
    language,
  }
}
