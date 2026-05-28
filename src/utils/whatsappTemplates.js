import { formatDate, formatTime } from './formatDate'
import { getFormattedToken } from './tokenGenerator'

export function appointmentConfirmationTemplate({
  patientName,
  appointmentDate,
  appointmentTime,
  appointmentType,
  tokenNumber,
  arrivalWindow,
  clinicName,
  clinicPhone,
  doctorName,
}) {
  return [
    `Hi ${patientName}, your appointment is confirmed.`,
    '',
    `Clinic: ${clinicName}`,
    `Doctor: ${doctorName}`,
    `Date: ${appointmentDate}`,
    `Time: ${appointmentTime}`,
    `Token: ${getFormattedToken(tokenNumber)}`,
    `Type: ${appointmentType}`,
    arrivalWindow ? `Arrival window: ${arrivalWindow}` : '',
    '',
    'Please save this token number. You can check the live queue before leaving home.',
    `Contact: ${clinicPhone}`,
  ].filter(Boolean).join('\n')
}

export function delayAlertTemplate({ patientName, tokenNumber, delayMinutes, estimatedWaitTime, clinicName }) {
  return [
    `Hi ${patientName}, ${clinicName} is running about ${delayMinutes} minutes late today.`,
    `Your token: ${getFormattedToken(tokenNumber)}`,
    `Estimated wait: ${estimatedWaitTime} minutes`,
    'Please check the live queue before leaving home.',
  ].join('\n')
}

export function cancellationTemplate({ patientName, appointmentDate, appointmentTime, tokenNumber, cancellationReason, clinicName, clinicPhone }) {
  return [
    `Hi ${patientName}, your appointment has been cancelled.`,
    `Token: ${getFormattedToken(tokenNumber)}`,
    `Date: ${appointmentDate}`,
    `Time: ${appointmentTime}`,
    cancellationReason ? `Reason: ${cancellationReason}` : '',
    `Please contact ${clinicName} to reschedule: ${clinicPhone}`,
  ].filter(Boolean).join('\n')
}

export function rescheduleTemplate({ patientName, oldDate, oldTime, newDate, newTime, newTokenNumber, clinicName }) {
  return [
    `Hi ${patientName}, your appointment has been rescheduled by ${clinicName}.`,
    `Old: ${oldDate} at ${oldTime}`,
    `New: ${newDate} at ${newTime}`,
    `New token: ${getFormattedToken(newTokenNumber)}`,
  ].join('\n')
}

export function followupReminderTemplate({ patientName, clinicName, doctorName, followupInstructions, clinicPhone }) {
  return [
    `Hi ${patientName}, this is a follow-up from ${clinicName}.`,
    `Doctor: ${doctorName}`,
    followupInstructions || 'Please let us know how you are feeling and whether you need a follow-up appointment.',
    `Contact: ${clinicPhone}`,
  ].join('\n')
}

export function thankYouTemplate({ patientName, appointmentDate, clinicName, doctorName, nextSteps, clinicPhone }) {
  return [
    `Hi ${patientName}, thank you for visiting ${clinicName} on ${appointmentDate}.`,
    `Doctor: ${doctorName}`,
    nextSteps ? `Next steps: ${nextSteps}` : 'Please follow the advice shared during consultation.',
    `Contact: ${clinicPhone}`,
  ].join('\n')
}

export function noShowTemplate({ patientName, missedDate, missedTime, clinicName, clinicPhone }) {
  return [
    `Hi ${patientName}, we noticed you could not make it to your appointment on ${missedDate} at ${missedTime}.`,
    'Would you like us to help you reschedule?',
    `${clinicName}: ${clinicPhone}`,
  ].join('\n')
}

export function queueUpdateTemplate({ patientName, tokenNumber, positionInQueue, estimatedWaitTime, clinicName }) {
  if (positionInQueue <= 1) {
    return `Hi ${patientName}, your token ${getFormattedToken(tokenNumber)} is next at ${clinicName}.`
  }

  return [
    `Hi ${patientName}, your token is ${getFormattedToken(tokenNumber)}.`,
    `You are ${positionInQueue - 1} patients away.`,
    `Estimated wait: ${estimatedWaitTime} minutes.`,
    `Clinic: ${clinicName}`,
  ].join('\n')
}

export function buildAppointmentTemplate(type, { appointment, patient, clinic, service, delayMinutes = 0, estimatedWaitTime = 0, reason = '' }) {
  const base = {
    patientName: patient.full_name,
    appointmentDate: formatDate(appointment.appointment_date),
    appointmentTime: formatTime(appointment.appointment_time),
    appointmentType: appointment.appointment_type === 'follow_up' ? 'Follow-Up Appointment' : 'New Appointment',
    tokenNumber: appointment.token_number,
    arrivalWindow: `${formatTime(appointment.arrival_window_start)} - ${formatTime(appointment.arrival_window_end)}`,
    clinicName: clinic.clinic_name,
    clinicPhone: clinic.phone,
    doctorName: clinic.doctor_name,
    followupInstructions: service?.title ? `Please book your next ${service.title} when convenient.` : '',
  }

  const templates = {
    confirmation: appointmentConfirmationTemplate(base),
    delay_alert: delayAlertTemplate({ ...base, delayMinutes, estimatedWaitTime }),
    cancellation: cancellationTemplate({ ...base, cancellationReason: reason }),
    reschedule: rescheduleTemplate({
      patientName: patient.full_name,
      oldDate: formatDate(appointment.appointment_date),
      oldTime: formatTime(appointment.appointment_time),
      newDate: formatDate(appointment.appointment_date),
      newTime: formatTime(appointment.appointment_time),
      newTokenNumber: appointment.token_number,
      clinicName: clinic.clinic_name,
    }),
    follow_up: followupReminderTemplate(base),
    thank_you: thankYouTemplate(base),
    no_show: noShowTemplate({
      patientName: patient.full_name,
      missedDate: formatDate(appointment.appointment_date),
      missedTime: formatTime(appointment.appointment_time),
      clinicName: clinic.clinic_name,
      clinicPhone: clinic.phone,
    }),
    queue_update: queueUpdateTemplate({
      patientName: patient.full_name,
      tokenNumber: appointment.token_number,
      positionInQueue: appointment.position || 2,
      estimatedWaitTime,
      clinicName: clinic.clinic_name,
    }),
  }

  return templates[type] || templates.confirmation
}

export function getWhatsAppLink(phoneNumber, message = '') {
  const digits = String(phoneNumber || '').replace(/[^0-9]/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
