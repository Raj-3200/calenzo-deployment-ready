import { formatDate, formatTime } from '@/lib/time'

export function whatsappLink(phone, message) {
  const digits = String(phone || '').replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message || '')}`
}

export function confirmationMessage({ clinic, patient, appointment, service }) {
  return [
    `Hello ${patient.fullName}, your appointment at ${clinic.name} is confirmed.`,
    `Doctor: ${clinic.doctorName}`,
    `Service: ${service?.title || 'Consultation'}`,
    `Date: ${formatDate(appointment.appointmentDate)}`,
    `Time: ${formatTime(appointment.appointmentTime)}`,
    `Token: #${appointment.tokenNumber}`,
    `Arrival window: ${formatTime(appointment.arrivalWindowStart)} - ${formatTime(appointment.arrivalWindowEnd)}`,
    'You can check the live queue before leaving home.',
  ].join('\n')
}

export function delayMessage({ clinic, patient, appointment, delayMinutes, estimatedWaitTime }) {
  return [
    `Hello ${patient.fullName}, ${clinic.name} is running ${delayMinutes} minutes late today.`,
    `Your token is #${appointment.tokenNumber}.`,
    `Estimated wait: ${estimatedWaitTime} minutes.`,
    'Please check the live queue before arriving.',
  ].join('\n')
}

export function followUpMessage({ clinic, patient }) {
  return [
    `Hello ${patient.fullName}, this is a follow-up from ${clinic.name}.`,
    `Please reply here or call ${clinic.phone} if you need help booking your next visit.`,
  ].join('\n')
}
