import { prisma } from '@/lib/prisma'
import {
  DEFAULT_CLINIC_ID,
  addDaysInput,
  dateFromInput,
  dateToInput,
  formatTime,
  minutesToTime,
  plain,
  timeFromInput,
  timeToMinutes,
  todayInput,
  weekdayFromDate,
} from '@/lib/time'
import { isDatabaseUuid } from '@/lib/validation'

export const ACTIVE_APPOINTMENT_STATUSES = ['pending', 'confirmed', 'arrived', 'in_progress']
export const ACTIVE_QUEUE_STATUSES = ['waiting', 'arrived', 'in_progress']
export const ADMIN_ROLES = ['OWNER', 'DOCTOR', 'RECEPTIONIST', 'STAFF']

export async function getClinic() {
  const clinic = await prisma.clinic.findUnique({ where: { id: DEFAULT_CLINIC_ID } })
  if (clinic) return clinic

  return prisma.clinic.create({
    data: {
      id: DEFAULT_CLINIC_ID,
      name: 'Calenzo Care Clinic',
      doctorName: 'Dr. Aarav Mehta',
      specialization: 'Family Medicine and Preventive Care',
      phone: '+91 88001 23456',
      whatsappNumber: '+91 88001 23456',
      email: 'care@calenzo.health',
      address: '2nd Floor, Serenity Medical Plaza, Andheri West, Mumbai 400053',
    },
  })
}

export async function getServices() {
  const clinic = await getClinic()
  return prisma.service.findMany({
    where: { clinicId: clinic.id, status: 'active' },
    orderBy: { title: 'asc' },
  })
}

export async function getPatientForUser(userId) {
  if (!userId) return null
  return prisma.patient.findUnique({ where: { userId } })
}

export async function getPatientByPhone(phone) {
  const clinic = await getClinic()
  const clean = String(phone || '').trim()
  if (!clean) return null
  return prisma.patient.findFirst({
    where: { clinicId: clinic.id, phone: clean },
    include: { appointments: { orderBy: { createdAt: 'desc' }, take: 3 } },
  })
}

export function appointmentDuration({ appointmentType, clinic, service }) {
  if (appointmentType === 'follow_up') return clinic.followupDuration || 5
  return service?.duration || clinic.newAppointmentDuration || 10
}

async function getAvailabilityForDate(clinicId, date) {
  const dayOfWeek = weekdayFromDate(date)
  return prisma.availability.findFirst({
    where: { clinicId, dayOfWeek },
  })
}

export async function generateAvailableSlots({ date, appointmentType = 'new', serviceId = null }) {
  const clinic = await getClinic()
  const cleanServiceId = String(serviceId || '').trim()
  const service = isDatabaseUuid(cleanServiceId) ? await prisma.service.findFirst({ where: { id: cleanServiceId, clinicId: clinic.id } }) : null
  const availability = await getAvailabilityForDate(clinic.id, date)
  const selectedDay = weekdayFromDate(date)

  if (date < todayInput()) {
    return { slots: [], closed: true, nextAvailableDate: todayInput(), duration: appointmentDuration({ appointmentType, clinic, service }) }
  }

  if (availability && !availability.isAvailable) {
    return {
      slots: [],
      closed: true,
      nextAvailableDate: await findNextAvailableDate(date),
      duration: appointmentDuration({ appointmentType, clinic, service }),
    }
  }

  if (!availability && selectedDay === 'sunday') {
    return {
      slots: [],
      closed: true,
      nextAvailableDate: await findNextAvailableDate(date),
      duration: appointmentDuration({ appointmentType, clinic, service }),
    }
  }

  const duration = appointmentDuration({ appointmentType, clinic, service })
  const dayStart = timeToMinutes(availability?.startTime || clinic.openingTime)
  const dayEnd = timeToMinutes(availability?.endTime || clinic.closingTime)
  const lunchStart = timeToMinutes(availability?.breakStart || clinic.lunchStart)
  const lunchEnd = timeToMinutes(availability?.breakEnd || clinic.lunchEnd)

  const appointments = await prisma.appointment.findMany({
    where: {
      clinicId: clinic.id,
      appointmentDate: dateFromInput(date),
      status: { in: ACTIVE_APPOINTMENT_STATUSES },
    },
    include: { service: true },
  })

  const bookedRanges = appointments.map((appointment) => {
    const start = timeToMinutes(appointment.appointmentTime)
    const bookedDuration = appointmentDuration({
      appointmentType: appointment.appointmentType,
      clinic,
      service: appointment.service,
    })
    return { start, end: start + bookedDuration }
  })

  const slots = []
  const step = Math.max(duration, clinic.slotDuration || 5)

  for (let cursor = dayStart; cursor + duration <= dayEnd; cursor += step) {
    const end = cursor + duration
    const overlapsLunch = cursor < lunchEnd && end > lunchStart
    const overlapsBooked = bookedRanges.some((range) => cursor < range.end && end > range.start)

    if (!overlapsLunch && !overlapsBooked) {
      const time = minutesToTime(cursor)
      slots.push({
        time,
        label: formatTime(timeFromInput(time)),
        duration,
      })
    }
  }

  return {
    slots,
    closed: false,
    nextAvailableDate: slots.length ? null : await findNextAvailableDate(date),
    duration,
  }
}

export async function findNextAvailableDate(date) {
  for (let offset = 1; offset < 21; offset += 1) {
    const next = addDaysInput(date, offset)
    const availability = await getAvailabilityForDate(DEFAULT_CLINIC_ID, next)
    if (availability?.isAvailable) return next
    if (!availability && weekdayFromDate(next) !== 'sunday') return next
  }
  return addDaysInput(date, 1)
}

const queuePatientSelect = {
  id: true,
  fullName: true,
}

const queueServiceSelect = {
  id: true,
  title: true,
  duration: true,
}

const queueAppointmentSelect = {
  id: true,
  status: true,
  appointmentType: true,
  tokenNumber: true,
  appointmentDate: true,
  appointmentTime: true,
  service: { select: queueServiceSelect },
}

export async function getQueueSnapshot({ appointmentId = null, clinicId = DEFAULT_CLINIC_ID, includeItems = !appointmentId } = {}) {
  const cleanAppointmentId = String(appointmentId || '').trim()
  let targetAppointment = null
  let targetDate = dateFromInput(todayInput())

  if (isDatabaseUuid(cleanAppointmentId)) {
    targetAppointment = await prisma.appointment.findUnique({
      where: { id: cleanAppointmentId },
      select: {
        ...queueAppointmentSelect,
        clinicId: true,
        patient: { select: queuePatientSelect },
      },
    })
    if (targetAppointment) targetDate = targetAppointment.appointmentDate
  }

  if (cleanAppointmentId && !targetAppointment) {
    return plain({
      clinicId,
      queueDate: todayInput(),
      currentToken: null,
      nextToken: null,
      patientToken: null,
      patientsBefore: 0,
      estimatedWaitTime: 0,
      delayMinutes: 0,
      lastUpdated: new Date().toISOString(),
      appointment: null,
      items: [],
      groups: {},
    })
  }

  const items = await prisma.queueItem.findMany({
    where: { clinicId, queueDate: targetDate },
    ...(includeItems ? {
      include: {
        patient: { select: queuePatientSelect },
        appointment: { select: queueAppointmentSelect },
      },
    } : {}),
    orderBy: [{ tokenNumber: 'asc' }],
  })

  const activeItems = items.filter((item) => ACTIVE_QUEUE_STATUSES.includes(item.status))
  const inProgress = activeItems.find((item) => item.status === 'in_progress')
  const current = inProgress || activeItems[0] || null
  const patientQueueItem = targetAppointment ? items.find((item) => item.appointmentId === targetAppointment.id) : null
  const patientIndex = patientQueueItem ? activeItems.findIndex((item) => item.id === patientQueueItem.id) : -1
  const patientsBefore = patientIndex >= 0 ? patientIndex : 0
  const delayMinutes = Math.max(0, ...items.map((item) => item.delayMinutes || 0))
  const estimatedWaitTime = patientQueueItem
    ? Math.max(0, (patientQueueItem.estimatedWaitTime || patientsBefore * 8) + delayMinutes)
    : Math.max(0, delayMinutes)

  return plain({
    clinicId,
    queueDate: dateToInput(targetDate),
    currentToken: current?.tokenNumber || null,
    nextToken: activeItems.find((item) => item.id !== current?.id)?.tokenNumber || null,
    patientToken: patientQueueItem?.tokenNumber || targetAppointment?.tokenNumber || null,
    patientsBefore,
    estimatedWaitTime,
    delayMinutes,
    lastUpdated: new Date().toISOString(),
    appointment: targetAppointment,
    items: includeItems ? items : [],
    groups: includeItems ? {
      waiting: items.filter((item) => item.status === 'waiting'),
      arrived: items.filter((item) => item.status === 'arrived'),
      inProgress: items.filter((item) => item.status === 'in_progress'),
      completed: items.filter((item) => item.status === 'completed'),
      skipped: items.filter((item) => item.status === 'skipped'),
      cancelled: items.filter((item) => item.status === 'cancelled'),
    } : {},
  })
}

export async function getDashboardData() {
  const clinic = await getClinic()
  const today = dateFromInput(todayInput())
  const start = new Date(`${todayInput()}T00:00:00.000Z`)
  const end = new Date(`${todayInput()}T23:59:59.999Z`)

  const [
    todayAppointments,
    waitingPatients,
    completedAppointments,
    cancelledAppointments,
    noShows,
    newPatients,
    pendingFollowUps,
    currentQueue,
    appointments,
    recentPatients,
    followUps,
  ] = await Promise.all([
    prisma.appointment.count({ where: { clinicId: clinic.id, appointmentDate: today } }),
    prisma.queueItem.count({ where: { clinicId: clinic.id, queueDate: today, status: { in: ['waiting', 'arrived'] } } }),
    prisma.appointment.count({ where: { clinicId: clinic.id, appointmentDate: today, status: 'completed' } }),
    prisma.appointment.count({ where: { clinicId: clinic.id, appointmentDate: today, status: 'cancelled' } }),
    prisma.appointment.count({ where: { clinicId: clinic.id, appointmentDate: today, status: 'no_show' } }),
    prisma.patient.count({ where: { clinicId: clinic.id, createdAt: { gte: start, lte: end } } }),
    prisma.followUp.count({ where: { clinicId: clinic.id, status: { in: ['new', 'contacted', 'follow_up_needed'] } } }),
    prisma.queueItem.findMany({
      where: { clinicId: clinic.id, queueDate: today },
      include: { patient: true, appointment: { include: { service: true } } },
      orderBy: [{ tokenNumber: 'asc' }],
    }),
    prisma.appointment.findMany({
      where: { clinicId: clinic.id, appointmentDate: today },
      include: { patient: true, service: true },
      orderBy: [{ appointmentTime: 'asc' }],
    }),
    prisma.patient.findMany({ where: { clinicId: clinic.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.followUp.findMany({
      where: { clinicId: clinic.id, status: { in: ['new', 'contacted', 'follow_up_needed'] } },
      include: { patient: true },
      orderBy: [{ createdAt: 'desc' }],
      take: 5,
    }),
  ])

  const averageWaitTime = currentQueue.length
    ? Math.round(currentQueue.reduce((sum, item) => sum + (item.estimatedWaitTime || 0), 0) / currentQueue.length)
    : 0

  const trendRows = await prisma.appointment.findMany({
    where: {
      clinicId: clinic.id,
      appointmentDate: { gte: dateFromInput(addDaysInput(todayInput(), -6)), lte: today },
    },
    select: { appointmentDate: true, status: true, appointmentType: true, source: true },
  })

  const trend = Array.from({ length: 7 }, (_, index) => {
    const date = addDaysInput(todayInput(), index - 6)
    const rows = trendRows.filter((row) => dateToInput(row.appointmentDate) === date)
    return {
      date: date.slice(5),
      appointments: rows.length,
      completed: rows.filter((row) => row.status === 'completed').length,
    }
  })

  const sourceBreakdown = ['online', 'walk_in', 'phone', 'whatsapp', 'manual'].map((source) => ({
    source,
    count: trendRows.filter((row) => row.source === source).length,
  }))

  return plain({
    clinic,
    stats: {
      todayAppointments,
      waitingPatients,
      completedAppointments,
      cancelledAppointments,
      noShows,
      newPatients,
      pendingFollowUps,
      followUpAppointments: appointments.filter((appointment) => appointment.appointmentType === 'follow_up').length,
      averageWaitTime,
      currentToken: currentQueue.find((item) => item.status === 'in_progress')?.tokenNumber || currentQueue.find((item) => ACTIVE_QUEUE_STATUSES.includes(item.status))?.tokenNumber || null,
      nextPatient: currentQueue.find((item) => ['waiting', 'arrived'].includes(item.status))?.patient?.fullName || 'No patient waiting',
    },
    appointments,
    queue: currentQueue,
    recentPatients,
    followUps,
    trend,
    sourceBreakdown,
  })
}
