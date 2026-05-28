'use client'

import { useClerk } from '@clerk/nextjs'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui'

export function SignOutButton() {
  const { signOut } = useClerk()

  const handleSignOut = () => {
    // Clear remember-me flags so user is fully signed out
    localStorage.removeItem('calenzo_rmb')
    sessionStorage.removeItem('calenzo_sess')
    signOut({ redirectUrl: '/' })
  }

  return (
    <Button as="button" variant="secondary" size="sm" onClick={handleSignOut}>
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  )
}
