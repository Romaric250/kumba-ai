// Type definitions for Kumba.AI

export type Language = 'en' | 'fr'

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'
export type TopicStatus = 'locked' | 'unlocked' | 'completed'
export type MaterialStatus = 'processing' | 'completed' | 'failed'
export type QuestionType = 'multiple_choice' | 'fill_in_blank' | 'short_answer'

// User types
export interface User {
  id: string
  email: string
  name?: string
  language: Language
  createdAt: Date
  updatedAt: Date
}

export interface UserSession {
  user: {
    id: string
    email: string
    name?: string
    language: Language
  }
}

// Learning Material types
export interface LearningMaterial {
  id: string
  title: string
  description?: string
  fileUrl: string
  fileType: string
  extractedText?: string
  status: MaterialStatus
  createdAt: Date
  updatedAt: Date
  userId: string
}

// Learning Plan types
export interface LearningPlan {
  id: string
  title: string
  description?: string
  totalDays: number
  status: string
  createdAt: Date
  updatedAt: Date
  userId: string
  learningMaterialId: string
  topics: Topic[]
}

// Topic types
export interface Topic {
  id: string
  title: string
  description?: string
  content: string
  dayIndex: number
  goals: string[]
  timeEstimate?: number
  status: TopicStatus
  createdAt: Date
  updatedAt: Date
  learningPlanId: string
  quizzes: Quiz[]
}

// Quiz types
export interface Quiz {
  id: string
  title: string
  description?: string
  questions: QuizQuestion[]
  passingScore: number
  createdAt: Date
  updatedAt: Date
  topicId: string
}

export interface QuizQuestion {
  id: number
  type: QuestionType
  question: string
  options?: string[]
  correctAnswer: number | string
  explanation: string
  points: number
}

export interface QuizResult {
  id: string
  score: number
  answers: QuizAnswer[]
  passed: boolean
  timeSpent: number
  completedAt: Date
  userId: string
  quizId: string
}

export interface QuizAnswer {
  questionId: number
  answer: number | string
  isCorrect: boolean
  timeSpent: number
}

// Progress types
export interface LearningProgress {
  id: string
  status: ProgressStatus
  completedAt?: Date
  timeSpent: number
  masteryScore?: number
  createdAt: Date
  updatedAt: Date
  userId: string
  learningPlanId: string
  topicId: string
}

export interface UserProgressSummary {
  totalTopics: number
  completedTopics: number
  progressPercentage: number
  totalQuizzes: number
  passedQuizzes: number
  averageScore: number
  totalTimeSpent: number
  topics: TopicProgress[]
}

export interface TopicProgress {
  id: string
  title: string
  dayIndex: number
  status: ProgressStatus
  completedAt?: Date
  timeSpent: number
  quizPassed: boolean
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface UploadResponse {
  fileUrl: string
  fileType: string
  materialId: string
}

export interface RoadmapResponse {
  roadmap: RoadmapTopic[]
  planId: string
}

export interface RoadmapTopic {
  dayIndex: number
  title: string
  description: string
  goals: string[]
  timeEstimate: number
  prerequisites: string[]
  keyPoints: string[]
}

// Form types
export interface SignInForm {
  email: string
  password: string
}

export interface SignUpForm {
  email: string
  password: string
  confirmPassword: string
  name?: string
  language: Language
}

export interface UploadForm {
  title: string
  description?: string
  file: File
}

// Component Props types
export interface LanguageSwitcherProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
}

export interface ProgressBarProps {
  value: number
  max: number
  className?: string
  showLabel?: boolean
}

export interface TopicCardProps {
  topic: Topic
  progress?: LearningProgress
  canAccess: boolean
  language: Language
}

export interface QuizComponentProps {
  quiz: Quiz
  onComplete: (result: QuizResult) => void
  language: Language
}

// State types for Zustand stores
export interface AuthState {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data: SignUpForm) => Promise<void>
  signOut: () => void
  updateLanguage: (language: Language) => void
}

export interface LearningState {
  currentPlan: LearningPlan | null
  currentTopic: Topic | null
  progress: UserProgressSummary | null
  isLoading: boolean
  loadPlan: (planId: string) => Promise<void>
  startTopic: (topicId: string) => Promise<void>
  completeTopic: (topicId: string) => Promise<void>
  updateProgress: (topicId: string, timeSpent: number) => Promise<void>
}

export interface UploadState {
  isUploading: boolean
  uploadProgress: number
  uploadFile: (file: File, title: string, description?: string) => Promise<string>
  generateRoadmap: (materialId: string) => Promise<string>
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
}

export interface ValidationError {
  field: string
  message: string
}

// Configuration types
export interface AppConfig {
  name: string
  description: string
  version: string
  supportedLanguages: readonly Language[]
  defaultLanguage: Language
}

export interface LearningConfig {
  defaultPlanDuration: number
  minimumQuizScore: number
  defaultReadingSpeed: number
  maxFileSize: number
  supportedFileTypes: string[]
}

// Event types
export interface LearningEvent {
  type: 'topic_started' | 'topic_completed' | 'quiz_taken' | 'quiz_passed' | 'quiz_failed'
  userId: string
  topicId?: string
  quizId?: string
  data?: any
  timestamp: Date
}

// Mentor types
export interface MentorResponse {
  message: string
  type: 'encouragement' | 'warning' | 'instruction' | 'celebration'
  canProceed: boolean
  nextAction?: string
}

export interface MentorContext {
  userId: string
  currentTopic?: Topic
  progress: UserProgressSummary
  recentActivity: LearningEvent[]
  language: Language
}
