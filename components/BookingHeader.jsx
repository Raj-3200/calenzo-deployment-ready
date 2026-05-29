'use client'

import { AIAssistant } from '@/components/AIAssistant'
import { useLanguage } from '@/components/LanguageProvider'
import { BOOKING_COPY, sectionCopy } from '@/lib/i18n'
import { PageHeader } from '@/components/ui'

export function BookingHeader() {
  const { language } = useLanguage()
  const copy = sectionCopy(BOOKING_COPY, language)

  return (
    <PageHeader
      eyebrow={copy.pageEyebrow}
      title={copy.pageTitle}
      description={copy.pageDescription}
      action={<AIAssistant />}
    />
  )
}
