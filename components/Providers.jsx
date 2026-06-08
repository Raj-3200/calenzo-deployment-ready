'use client'

import { LanguageProvider } from '@/components/LanguageProvider'
import { ToastProvider } from '@/components/ToastProvider'

export function Providers({ children }) {
  return (
    <LanguageProvider>
      <ToastProvider>{children}</ToastProvider>
    </LanguageProvider>
  )
}
