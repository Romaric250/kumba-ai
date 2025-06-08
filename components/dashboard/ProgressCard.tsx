import { Target, Clock, Trophy, Zap } from 'lucide-react'

interface ProgressCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: 'target' | 'clock' | 'trophy' | 'zap'
  color: 'primary' | 'secondary' | 'accent' | 'success'
  progress?: number
}

const iconMap = {
  target: Target,
  clock: Clock,
  trophy: Trophy,
  zap: Zap,
}

const colorMap = {
  primary: {
    bg: 'bg-primary-100',
    text: 'text-primary-600',
    progress: 'bg-primary-500'
  },
  secondary: {
    bg: 'bg-secondary-100',
    text: 'text-secondary-600',
    progress: 'bg-secondary-500'
  },
  accent: {
    bg: 'bg-accent-100',
    text: 'text-accent-600',
    progress: 'bg-accent-500'
  },
  success: {
    bg: 'bg-success-100',
    text: 'text-success-600',
    progress: 'bg-success-500'
  }
}

export default function ProgressCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color, 
  progress 
}: ProgressCardProps) {
  const Icon = iconMap[icon]
  const colors = colorMap[color]

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-3 ${colors.bg} rounded-lg`}>
            <Icon className={`h-6 w-6 ${colors.text}`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>
        {progress !== undefined && (
          <div className="w-16">
            <div className="text-right text-xs text-gray-500 mb-1">{progress}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${colors.progress}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
