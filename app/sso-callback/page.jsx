'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

export default function SSOCallbackPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-300 text-slate-950 font-black text-lg">C</div>
        <p className="text-sm text-slate-400">Completing sign in…</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </main>
  )
}
