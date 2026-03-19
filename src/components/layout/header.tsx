'use client'

import { signOut, useSession } from 'next-auth/react'
import { LogOut, User } from 'lucide-react'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Test Coverage &amp; Quality</span>
      </div>

      <div className="flex items-center gap-4">
        {session?.user && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4 text-gray-400" />
            <span>{session.user.name ?? session.user.email}</span>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </header>
  )
}
