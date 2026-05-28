import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { handleAiChat } from '@/lib/ai-assistant'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ERROR_REPLY = {
  en: 'I could not complete that booking. Please choose another slot or try again.',
  hi: 'मैं यह बुकिंग पूरी नहीं कर सका। कृपया दूसरा स्लॉट चुनें या फिर से कोशिश करें।',
  mr: 'मी ही बुकिंग पूर्ण करू शकलो नाही. कृपया दुसरा स्लॉट निवडा किंवा पुन्हा प्रयत्न करा.',
}

export async function POST(req) {
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { reply: 'Please send a valid message.', nextStep: 'ASK_LANGUAGE', action: 'ASK_LANGUAGE' },
      { status: 400 },
    )
  }

  try {
    const session = await getSession()
    const result = await handleAiChat({ input: body, session })
    return NextResponse.json(result)
  } catch (error) {
    console.error('AI assistant failed:', error)
    const language = ['en', 'hi', 'mr'].includes(body?.selectedLanguage)
      ? body.selectedLanguage
      : 'en'

    return NextResponse.json({
      reply: ERROR_REPLY[language],
      selectedLanguage: language,
      nextStep: body?.currentStep || 'ASK_LANGUAGE',
      action: 'ERROR',
      structuredData: body?.structuredData || {},
    }, { status: 200 })
  }
}
