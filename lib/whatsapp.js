import { formatDate, formatTime } from '@/lib/time'

function appBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL
  if (configured) return configured.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export function absoluteAppUrl(path = '/') {
  const normalizedPath = String(path || '/').startsWith('/') ? path : `/${path}`
  return `${appBaseUrl()}${normalizedPath}`
}

function phoneDigits(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.length === 10) return `91${digits}`
  return digits
}

export function whatsappLink(phone, message) {
  const digits = phoneDigits(phone)
  return `https://wa.me/${digits}?text=${encodeURIComponent(message || '')}`
}

export function whatsappRecipient(phone) {
  const raw = String(phone || '').trim()
  if (!raw) return ''
  if (raw.startsWith('whatsapp:')) return raw

  const digits = phoneDigits(raw)
  if (!digits) return ''
  return `whatsapp:+${digits}`
}

function whatsappSender(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (raw.startsWith('whatsapp:')) return raw

  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return `whatsapp:+${digits}`
}

export function confirmationMessage({ clinic, patient, appointment, service }) {
  const ticketLink = appointment?.id ? absoluteAppUrl(`/ticket/${appointment.id}`) : null
  const queueLink = appointment?.id ? absoluteAppUrl(`/queue/${appointment.id}`) : null

  return [
    `Hello ${patient.fullName}, your appointment at ${clinic.name} is confirmed.`,
    `Doctor: ${clinic.doctorName}`,
    `Service: ${service?.title || 'Consultation'}`,
    `Date: ${formatDate(appointment.appointmentDate)}`,
    `Time: ${formatTime(appointment.appointmentTime)}`,
    `Token: #${appointment.tokenNumber}`,
    `Arrival window: ${formatTime(appointment.arrivalWindowStart)} - ${formatTime(appointment.arrivalWindowEnd)}`,
    ticketLink ? `Ticket: ${ticketLink}` : null,
    queueLink ? `Live queue: ${queueLink}` : null,
    'Please keep this ticket ready at reception and check the live queue before leaving home.',
  ].filter(Boolean).join('\n')
}

export async function sendWhatsAppMessage({ to, message }) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = whatsappSender(process.env.TWILIO_WHATSAPP_FROM)
  const recipient = whatsappRecipient(to)

  if (!sid || !token || !from || !recipient) {
    return {
      ok: false,
      skipped: true,
      status: 'not_configured',
      error: !recipient ? 'Missing recipient WhatsApp number.' : 'Twilio WhatsApp environment variables are not configured.',
    }
  }

  const body = new URLSearchParams({
    From: from,
    To: recipient,
    Body: message,
  })

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })

    let payload = null
    try {
      payload = await response.json()
    } catch {
      payload = { message: response.statusText }
    }

    if (!response.ok) {
      console.error('Twilio WhatsApp send failed:', payload)
      return {
        ok: false,
        skipped: false,
        status: 'failed',
        error: payload?.message || 'Twilio rejected the WhatsApp message.',
      }
    }

    return {
      ok: true,
      skipped: false,
      status: payload?.status || 'sent',
      sid: payload?.sid || null,
    }
  } catch (error) {
    console.error('Twilio WhatsApp send failed:', error)
    return {
      ok: false,
      skipped: false,
      status: 'failed',
      error: error?.message || 'Could not send WhatsApp message.',
    }
  }
}

export function notificationStatusFromDelivery(delivery) {
  if (delivery?.ok) return 'sent'
  if (delivery?.skipped) return 'ready'
  return 'failed'
}

export function notificationSentAtFromDelivery(delivery) {
  return delivery?.ok ? new Date() : null
}

export function whatsappDeliveryDetails(delivery) {
  if (!delivery) return null
  return {
    provider: 'twilio',
    providerMessageId: delivery.sid || null,
    status: delivery.status || null,
    skipped: Boolean(delivery.skipped),
    error: delivery.error || null,
  }
}

export function delayMessage({ clinic, patient, appointment, delayMinutes, estimatedWaitTime }) {
  const queueLink = appointment?.id ? absoluteAppUrl(`/queue/${appointment.id}`) : null

  return [
    `Hello ${patient.fullName}, ${clinic.name} is running ${delayMinutes} minutes late today.`,
    `Your token is #${appointment.tokenNumber}.`,
    `Estimated wait: ${estimatedWaitTime} minutes.`,
    queueLink ? `Live queue: ${queueLink}` : null,
    'Please check the live queue before arriving.',
  ].filter(Boolean).join('\n')
}

export function followUpMessage({ clinic, patient }) {
  return [
    `Hello ${patient.fullName}, this is a follow-up from ${clinic.name}.`,
    `Please reply here or call ${clinic.phone} if you need help booking your next visit.`,
  ].join('\n')
}
