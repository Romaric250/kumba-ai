import { Upload, BarChart3, Brain, FileText, Users, Zap } from 'lucide-react'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: 'upload' | 'chart' | 'brain' | 'file' | 'users' | 'zap'
  color: 'primary' | 'secondary' | 'accent' | 'success'
  action: () => void
}

const iconMap = {
  upload: Upload,
  chart: BarChart3,
  brain: Brain,
  file: FileText,
  users: Users,
  zap: Zap,
}

const colorMap = {
  primary: 'bg-primary-100 text-primary-600',
  secondary: 'bg-secondary-100 text-secondary-600',
  accent: 'bg-accent-100 text-accent-600',
  success: 'bg-success-100 text-success-600',
}

interface QuickActionsProps {
  actions: QuickAction[]
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {actions.map((action) => {
        const Icon = iconMap[action.icon]
        const colorClass = colorMap[action.color]
        
        return (
          <button
            key={action.id}
            onClick={action.action}
            className="card hover:shadow-lg transition-all duration-200 text-left group"
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${colorClass} group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {action.description}
                </p>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
