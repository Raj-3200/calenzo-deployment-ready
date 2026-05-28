import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession, isAdminRole } from '@/lib/auth'
import { ACTIVE_APPOINTMENT_STATUSES, ACTIVE_QUEUE_STATUSES, appointmentDuration, generateAvailableSlots } from '@/lib/data'
import { prisma } from '@/lib/prisma'
import { notifyQueueRefresh, publishQueueRefresh } from '@/lib/queue-events'
import { calculateArrivalWindow, dateFromInput, timeFromInput, timeToMinutes } from '@/lib/time'
import { confirmationMessage } from '@/lib/whatsapp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BookingSchema = z.object({
  clinicId: z.string().uuid(),
  patientId: z.string().uuid(),
  serviceId: z.string().uuid().optional(),
  appointmentType: z.enum(['NEW', 'FOLLOW_UP', 'new', 'follow_up']),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/),
  message: z.string().trim().max(1000).optional(),
})

const TRANSACTION_OPTIONS = {
  maxWait: 10000,
  timeout: 15000,
  isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
}

function normalizeAppointmentType(value) {
  return String(value).toLowerCase() === 'follow_up' ? 'follow_up' : 'new'
}

function appointmentError(error) {
  if (error?.code === 'P2002' || error?.code === 'P2034' || String(error?.message || '').includes('Slot already booked')) {
    return { message: 'Slot already booked', status: 409 }
  }
  return { message: error?.message || 'Could not book appointment', status: 500 }
}

export async function POST(req) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = BookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
  }

  const data = parsed.data
  const appointmentType = normalizeAppointmentType(data.appointmentType)
  const appointmentDate = dateFromInput(data.appointmentDate)
  const appointmentTime = timeFromInput(data.appointmentTime)

  const [clinic, patient, service] = await Promise.all([
    prisma.clinic.findUnique({ where: { id: data.clinicId } }),
    prisma.patient.findUnique({ where: { id: data.patientId } }),
    data.serviceId ? prisma.service.findFirst({ where: { id: data.serviceId, clinicId: data.clinicId } }) : null,
  ])

  if (!clinic || !patient || patient.clinicId !== clinic.id) {
    return NextResponse.json({ error: 'Clinic or patient not found' }, { status: 404 })
  }

  if (patient.userId !== session.user.id && !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (data.serviceId && !service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  const available = await generateAvailableSlots({
    date: data.appointmentDate,
    appointmentType,
    serviceId: data.serviceId || null,
  })

  if (!available.slots.some((slot) => slot.time === data.appointmentTime)) {
    return NextResponse.json({ error: 'Slot already booked' }, { status: 409 })
  }

  const duration = appointmentDuration({ appointmentType, clinic, service })
  const slotStart = timeToMinutes(data.appointmentTime)
  const arrivalWindow = calculateArrivalWindow(data.appointmentTime, 5)

  try {
    const result = await prisma.$transaction(async (tx) => {
      const activeAppointments = await tx.appointment.findMany({
        where: {
          clinicId: clinic.id,
          appointmentDate,
          status: { in: ACTIVE_APPOINTMENT_STATUSES },
        },
        include: { service: true },
      })

      const clashes = activeAppointments.some((appointment) => {
        const start = timeToMinutes(appointment.appointmentTime)
        const bookedDuration = appointmentDuration({
          appointmentType: appointment.appointmentType,
          clinic,
          service: appointment.service,
        })
        return slotStart < start + bookedDuration && slotStart + duration > start
      })

      if (clashes) throw new Error('Slot already booked')

      const maxToken = await tx.appointment.aggregate({
        where: { clinicId: clinic.id, appointmentDate },
        _max: { tokenNumber: true },
      })
      const tokenNumber = (maxToken._max.tokenNumber || 0) + 1

      const appointment = await tx.appointment.create({
        data: {
          clinicId: clinic.id,
          patientId: patient.id,
          serviceId: service?.id || null,
          appointmentType,
          tokenNumber,
          appointmentDate,
          appointmentTime,
          arrivalWindowStart: timeFromInput(arrivalWindow.start),
          arrivalWindowEnd: timeFromInput(arrivalWindow.end),
          status: 'confirmed',
          source: isAdminRole(session.user.role) ? 'manual' : 'online',
          message: data.message || null,
        },
      })

      const queueCount = await tx.queueItem.count({
        where: { clinicId: clinic.id, queueDate: appointmentDate, status: { in: ACTIVE_QUEUE_STATUSES } },
      })

      await tx.queueItem.create({
        data: {
          clinicId: clinic.id,
          appointmentId: appointment.id,
          patientId: patient.id,
          tokenNumber,
          queueDate: appointmentDate,
          status: 'waiting',
          position: queueCount + 1,
          estimatedWaitTime: queueCount * duration,
        },
      })

      await tx.notification.create({
        data: {
          clinicId: clinic.id,
          patientId: patient.id,
          appointmentId: appointment.id,
          type: 'confirmation',
          channel: 'whatsapp',
          recipient: patient.phone,
          message: confirmationMessage({ clinic, patient, appointment, service }),
          status: 'ready',
        },
      })

      await notifyQueueRefresh(tx, clinic.id)

      return { appointment, tokenNumber }
    }, TRANSACTION_OPTIONS)

    publishQueueRefresh()

    return NextResponse.json({
      appointment: result.appointment,
      tokenNumber: result.tokenNumber,
      arrivalWindowStart: arrivalWindow.start,
      arrivalWindowEnd: arrivalWindow.end,
    }, { status: 201 })
  } catch (error) {
    const response = appointmentError(error)
    return NextResponse.json({ error: response.message }, { status: response.status })
  }
}
