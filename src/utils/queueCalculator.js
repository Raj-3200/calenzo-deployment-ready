import { timeToMinutes } from './slotGenerator'

export function sortQueue(queueItems = []) {
  return [...queueItems].sort((a, b) => {
    const timeA = a.appointment?.appointment_time ? timeToMinutes(a.appointment.appointment_time) : a.position
    const timeB = b.appointment?.appointment_time ? timeToMinutes(b.appointment.appointment_time) : b.position
    return timeA - timeB
  })
}

export function getCurrentQueueItem(queueItems = []) {
  return sortQueue(queueItems).find((item) => item.current_status === 'in_progress') ||
    sortQueue(queueItems).find((item) => item.current_status === 'arrived') ||
    sortQueue(queueItems).find((item) => item.current_status === 'waiting')
}

export function getNextQueueItem(queueItems = []) {
  return sortQueue(queueItems).find((item) => item.current_status === 'waiting')
}

export function recalculateQueue(queueItems = [], delayMinutes = 0, averageConsultation = 8) {
  let activePosition = 0
  return sortQueue(queueItems).map((item) => {
    if (['completed', 'cancelled', 'skipped'].includes(item.current_status)) {
      return { ...item, position: null, estimated_wait_time: 0, delay_minutes: delayMinutes }
    }

    activePosition += 1
    return {
      ...item,
      position: activePosition,
      delay_minutes: delayMinutes,
      estimated_wait_time: Math.max(0, (activePosition - 1) * averageConsultation + delayMinutes),
    }
  })
}

export function getDelayImpact(queueItems = [], addedDelay = 0) {
  return sortQueue(queueItems)
    .filter((item) => ['waiting', 'arrived'].includes(item.current_status))
    .map((item, index) => ({
      ...item,
      added_delay: addedDelay,
      new_wait_time: item.estimated_wait_time + addedDelay + index * 2,
    }))
}

export function getPatientQueueSnapshot(queueItems = [], appointmentId) {
  const recalculated = recalculateQueue(queueItems, queueItems[0]?.delay_minutes || 0)
  const item = recalculated.find((entry) => entry.appointment_id === appointmentId) || recalculated[0]
  const current = getCurrentQueueItem(recalculated)
  const patientsBefore = Math.max(0, (item?.position || 1) - 1)

  return {
    item,
    currentToken: current?.token_number || null,
    patientsBefore,
    estimatedWait: item?.estimated_wait_time || 0,
    delayMinutes: item?.delay_minutes || 0,
    lastUpdated: item?.updated_at || new Date().toISOString(),
  }
}
