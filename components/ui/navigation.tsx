'use client'

import { useSession, signOut } from 'next-auth/react'
import { useLanguage } from '@/lib/language-context'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { 
  LayoutDashboard, 
  BookOpen, 
  BarChart3, 
  Upload, 
  User, 
  LogOut,
  Brain
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const pathname = usePathname()

  const navItems = [
    {
      href: '/dashboard/enhanced',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
      active: pathname.startsWith('/dashboard')
    },
    {
      href: '/upload',
      label: 'Upload',
      icon: Upload,
      active: pathname === '/upload'
    },
    {
      href: '/learn',
      label: t('nav.learn'),
      icon: BookOpen,
      active: pathname.startsWith('/learn')
    },
    {
      href: '/analytics',
      label: 'Analytics',
      icon: BarChart3,
      active: pathname.startsWith('/analytics')
    }
  ]

  if (!session) {
    return null
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard/enhanced" className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">Kumba.AI</span>
        </Link>

        {/* Navigation Items */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={item.active ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
              <p className="text-xs text-gray-500">{session.user.email}</p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.signOut')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden mt-3 flex gap-1 overflow-x-auto">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={item.active ? "default" : "ghost"}
              size="sm"
              className="gap-2 whitespace-nowrap"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  )
}
