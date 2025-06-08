import { Brain, Lightbulb, Target, Heart } from 'lucide-react'

interface MentorMessageProps {
  type: 'welcome' | 'encouragement' | 'challenge' | 'wisdom'
  message: string
  action?: {
    text: string
    onClick: () => void
  }
}

const messageConfig = {
  welcome: {
    icon: Brain,
    gradient: 'from-primary-500 to-accent-500',
    bgColor: 'from-primary-50 to-accent-50',
    borderColor: 'border-primary-200'
  },
  encouragement: {
    icon: Heart,
    gradient: 'from-success-500 to-accent-500',
    bgColor: 'from-success-50 to-accent-50',
    borderColor: 'border-success-200'
  },
  challenge: {
    icon: Target,
    gradient: 'from-secondary-500 to-primary-500',
    bgColor: 'from-secondary-50 to-primary-50',
    borderColor: 'border-secondary-200'
  },
  wisdom: {
    icon: Lightbulb,
    gradient: 'from-accent-500 to-primary-500',
    bgColor: 'from-accent-50 to-primary-50',
    borderColor: 'border-accent-200'
  }
}

export default function MentorMessage({ type, message, action }: MentorMessageProps) {
  const config = messageConfig[type]
  const Icon = config.icon

  return (
    <div className={`card bg-gradient-to-r ${config.bgColor} border ${config.borderColor}`}>
      <div className="flex items-start space-x-4">
        <div className={`p-3 bg-gradient-to-r ${config.gradient} rounded-lg flex-shrink-0`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">
            {type === 'welcome' && 'Welcome Message'}
            {type === 'encouragement' && 'Keep Going!'}
            {type === 'challenge' && 'Challenge Ahead'}
            {type === 'wisdom' && 'Words of Wisdom'}
          </h3>
          <p className="text-gray-700 leading-relaxed italic">
            "{message}"
          </p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-4 btn-primary text-sm"
            >
              {action.text}
            </button>
          )}
          <div className="mt-3 text-xs text-gray-500">
            - Kumba.AI Mentor
          </div>
        </div>
      </div>
    </div>
  )
}
