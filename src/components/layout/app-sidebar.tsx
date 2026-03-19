'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShieldCheck,
  PlayCircle,
  Bot,
  Bug,
  AlertTriangle,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/coverage', label: 'Coverage', icon: ShieldCheck },
  { href: '/execution', label: 'Execution', icon: PlayCircle },
  { href: '/automation', label: 'Automation', icon: Bot },
  { href: '/defects', label: 'Defects', icon: Bug },
  { href: '/risk', label: 'Risk', icon: AlertTriangle },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-60 flex-col border-r border-gray-200 bg-white">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <span className="text-sm font-semibold text-gray-900 leading-tight">
          Test Quality
          <br />
          <span className="font-normal text-gray-500">Dashboard</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon
                className={cn('h-4 w-4 flex-shrink-0', active ? 'text-indigo-600' : 'text-gray-400')}
              />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
