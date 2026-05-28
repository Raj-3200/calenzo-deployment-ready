'use client'

import { useAuth, UserButton } from '@clerk/nextjs'
import { CalendarCheck2, LogIn, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui'

export function AuthControls() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-20 animate-pulse rounded-2xl bg-slate-800" />
        <div className="h-9 w-20 animate-pulse rounded-2xl bg-slate-800" />
      </div>
    )
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <Button href="/patient/dashboard" variant="secondary" size="sm">
          <CalendarCheck2 className="h-4 w-4" />
          My visits
        </Button>
        <UserButton afterSignOutUrl="/" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button href="/sign-in" variant="secondary" size="sm">
        <LogIn className="h-4 w-4" />
        Sign in
      </Button>
      <Button href="/sign-up" size="sm">
        <UserPlus className="h-4 w-4" />
        Sign up
      </Button>
    </div>
  )
}
