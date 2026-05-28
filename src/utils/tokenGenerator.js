export function generateTokenNumber(appointments = [], clinicId, date) {
  const dailyTokens = appointments
    .filter((appointment) => appointment.clinic_id === clinicId && appointment.appointment_date === date)
    .map((appointment) => Number(appointment.token_number || 0))

  return dailyTokens.length ? Math.max(...dailyTokens) + 1 : 1
}

export function getFormattedToken(tokenNumber, clinicCode = '') {
  const padded = String(tokenNumber || 0).padStart(3, '0')
  return clinicCode ? `${clinicCode}-${padded}` : padded
}

export function calculateQueuePosition(queueItems, appointmentId) {
  const activeStatuses = ['waiting', 'arrived', 'in_progress']
  const activeItems = queueItems
    .filter((item) => activeStatuses.includes(item.current_status))
    .sort((a, b) => a.position - b.position)

  const index = activeItems.findIndex((item) => item.appointment_id === appointmentId)
  return index >= 0 ? index + 1 : null
}

export function calculateEstimatedWaitTime(positionInQueue, appointmentDurationMinutes = 10, delayMinutes = 0) {
  if (!positionInQueue || positionInQueue <= 1) return Math.max(0, delayMinutes)
  return (positionInQueue - 1) * appointmentDurationMinutes + delayMinutes
}

export function getPatientsAhead(positionInQueue) {
  return Math.max(0, (positionInQueue || 1) - 1)
}

export function getEstimatedArrivalTime(waitTimeMinutes) {
  return new Date(Date.now() + Math.max(0, waitTimeMinutes || 0) * 60 * 1000)
}

export function getQueueStatusMessage({ positionInQueue, estimatedWaitTime, delayMinutes = 0, status }) {
  const patientsAhead = getPatientsAhead(positionInQueue)

  if (status === 'completed') return 'Your appointment is complete. Thank you for visiting.'
  if (status === 'cancelled') return 'Your appointment has been cancelled.'
  if (status === 'skipped') return 'Your token was skipped. Please contact reception when you arrive.'
  if (positionInQueue === 1) return delayMinutes > 0 ? `Doctor is running ${delayMinutes} minutes late. Your turn is next.` : 'Your turn is next.'
  if (patientsAhead === 1) return `You are 1 patient away. Expected wait is about ${estimatedWaitTime} minutes.`
  return `You are ${patientsAhead} patients away. Expected wait is about ${estimatedWaitTime} minutes.`
}

export function suggestArrivalTime(appointmentDate, appointmentTime, estimatedWaitTime = 0) {
  const [hour, minute] = appointmentTime.split(':').map(Number)
  const date = new Date(appointmentDate)
  date.setHours(hour, minute, 0, 0)
  const suggested = new Date(date.getTime() - 7 * 60 * 1000 + Math.max(0, estimatedWaitTime - 20) * 60 * 1000)
  return suggested.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}
