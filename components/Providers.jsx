'use client'

import { useEffect } from 'react'
import { useAuth, useClerk } from '@clerk/nextjs'

export function Providers({ children }) {
  const { isSignedIn, isLoaded } = useAuth()
  const { signOut } = useClerk()

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    const hasRememberMe = localStorage.getItem('calenzo_rmb')
    const hasSession = sessionStorage.getItem('calenzo_sess')

    // If user is signed in but neither flag exists → browser was closed without "remember me"
    if (!hasRememberMe && !hasSession) {
      signOut({ redirectUrl: '/sign-in' })
    }
  }, [isLoaded, isSignedIn, signOut])

  return children
}
