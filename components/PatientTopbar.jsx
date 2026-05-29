'use client'

import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { CalendarCheck2, Home, LogIn } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'
import { NAV_COPY, sectionCopy } from '@/lib/i18n'
import { Button } from '@/components/ui'
import { SignOutButton } from '@/components/SignOutButton'

export function PatientTopbar() {
  const { isLoaded, isSignedIn } = useAuth()
  const { language } = useLanguage()
  const copy = sectionCopy(NAV_COPY, language)

  return (
    <header className="mx-auto mb-6 flex max-w-7xl items-center justify-between gap-3">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-300 text-sm font-black text-slate-950">
          C
        </div>
        <div>
          <p className="font-bold text-white">Calenzo</p>
          <p className="text-xs text-slate-500">{copy.patientPortal}</p>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <Button href="/" variant="ghost" size="sm">
          <Home className="h-4 w-4" />
          {copy.home}
        </Button>
        {isLoaded && isSignedIn ? (
          <>
            <Button href="/patient/dashboard" variant="ghost" size="sm">
              <CalendarCheck2 className="h-4 w-4" />
              {copy.dashboard}
            </Button>
            <SignOutButton label={copy.logoutHome} />
          </>
        ) : null}
        {isLoaded && !isSignedIn ? (
          <Button href="/patient/login" variant="secondary" size="sm">
            <LogIn className="h-4 w-4" />
            {copy.signIn}
          </Button>
        ) : null}
      </div>
    </header>
  )
}
