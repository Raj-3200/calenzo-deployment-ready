export function generateTimeSlots(
  openingTime,
  closingTime,
  slotDuration,
  lunchStart,
  lunchEnd,
  bookedSlots = []
) {
  const slots = []
  const toMinutes = (value) => {
    const [hours, minutes] = String(value || '00:00').slice(0, 5).split(':').map(Number)
    return hours * 60 + minutes
  }
  const toTime = (minutes) =>
    `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

  let current = toMinutes(openingTime)
  const end = toMinutes(closingTime)
  const lunchS = lunchStart ? toMinutes(lunchStart) : null
  const lunchE = lunchEnd ? toMinutes(lunchEnd) : null

  while (current + slotDuration <= end) {
    if (lunchS !== null && lunchE !== null && current >= lunchS && current < lunchE) {
      current = lunchE
      continue
    }

    const slot = toTime(current)
    if (!bookedSlots.includes(slot)) slots.push(slot)
    current += slotDuration
  }

  return slots
}
