'use client'

import { useAuth, UserButton } from '@clerk/nextjs'
import { CalendarCheck2, LogIn, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui'

export function AuthControls() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-10 animate-pulse rounded-2xl bg-slate-800 sm:w-20" />
        <div className="h-9 w-10 animate-pulse rounded-2xl bg-slate-800 sm:w-20" />
      </div>
    )
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <Button href="/dashboard" variant="secondary" size="sm" title="My visits" aria-label="My visits">
          <CalendarCheck2 className="h-4 w-4" />
          <span className="hidden sm:inline">My visits</span>
        </Button>
        <UserButton afterSignOutUrl="/" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button href="/patient/login" variant="secondary" size="sm" title="Sign in" aria-label="Sign in">
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Sign in</span>
      </Button>
      <Button href="/patient/register" size="sm" title="Sign up" aria-label="Sign up">
        <UserPlus className="h-4 w-4" />
        <span className="hidden sm:inline">Sign up</span>
      </Button>
    </div>
  )
}
