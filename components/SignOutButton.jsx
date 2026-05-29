'use client'

import { useClerk } from '@clerk/nextjs'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui'

export function SignOutButton({ label = 'Sign out', className = '' }) {
  const { signOut } = useClerk()

  const handleSignOut = () => {
    signOut({ redirectUrl: '/' })
  }

  return (
    <Button as="button" variant="secondary" size="sm" onClick={handleSignOut} className={className} title={label} aria-label={label}>
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  )
}
