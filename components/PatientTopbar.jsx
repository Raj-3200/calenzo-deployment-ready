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
    <header className="mx-auto mb-5 flex max-w-7xl flex-wrap items-center justify-between gap-3 sm:mb-6">
      <Link href="/" className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-300 text-sm font-black text-slate-950">
          C
        </div>
        <div className="min-w-0">
          <p className="truncate font-bold text-white">Calenzo</p>
          <p className="truncate text-xs text-slate-500">{copy.patientPortal}</p>
        </div>
      </Link>

      <div className="flex flex-1 items-center justify-end gap-1.5 sm:flex-none sm:gap-2">
        <Button href="/" variant="ghost" size="sm" title={copy.home} aria-label={copy.home}>
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">{copy.home}</span>
        </Button>
        {isLoaded && isSignedIn ? (
          <>
            <Button href="/patient/dashboard" variant="ghost" size="sm" title={copy.dashboard} aria-label={copy.dashboard}>
              <CalendarCheck2 className="h-4 w-4" />
              <span className="hidden sm:inline">{copy.dashboard}</span>
            </Button>
            <SignOutButton label={copy.logoutHome} />
          </>
        ) : null}
        {isLoaded && !isSignedIn ? (
          <Button href="/patient/login" variant="secondary" size="sm" title={copy.signIn} aria-label={copy.signIn}>
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">{copy.signIn}</span>
          </Button>
        ) : null}
      </div>
    </header>
  )
}
