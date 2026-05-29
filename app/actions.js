'use server'

import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { z } from 'zod'
import { getSession, isAdminRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyQueueRefresh, publishQueueRefresh } from '@/lib/queue-events'
import {
  ACTIVE_APPOINTMENT_STATUSES,
  ACTIVE_QUEUE_STATUSES,
  appointmentDuration,
  generateAvailableSlots,
  getClinic,
  getPatientForUser,
  getPatientByPhone,
} from '@/lib/data'
import {
  addDaysInput,
  calculateArrivalWindow,
  dateFromInput,
  timeFromInput,
  timeToMinutes,
  todayInput,
} from '@/lib/time'
import { isDatabaseUuid } from '@/lib/validation'
import {
  confirmationContentVariables,
  confirmationMessage,
  delayMessage,
  notificationSentAtFromDelivery,
  notificationStatusFromDelivery,
  sendWhatsAppMessage,
} from '@/lib/whatsapp'

const TRANSACTION_OPTIONS = {
  maxWait: 10000,
  timeout: 15000,
}

const SERIALIZABLE_TRANSACTION_OPTIONS = {
  ...TRANSACTION_OPTIONS,
  isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
}

const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter the patient name.'),
  age: z.coerce.number().int().min(1, 'Please enter a valid age.').max(120),
  gender: z.string().trim().min(1, 'Please select gender.'),
  phone: z.string().trim().min(8, 'Please enter a valid phone number.'),
  address: z.string().trim().optional(),
  emergencyContact: z.string().trim().optional(),
  securityQuestion: z.string().trim().optional(),
  securityAnswer: z.string().trim().optional(),
})

const bookingSchema = z.object({
  appointmentType: z.enum(['new', 'follow_up']),
  serviceId: z.string().trim().min(1, 'Please choose a doctor/service.').pipe(z.guid({ message: 'Please choose a valid doctor/service.' })),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  message: z.string().optional(),
  patient: z.object({
    fullName: z.string().min(2),
    age: z.coerce.number().int().min(1).max(120),
    gender: z.string().optional(),
    phone: z.string().min(8),
    email: z.string().email().optional().or(z.literal('')),
  }).optional(),
})

function safeRedirectPath(value, fallback = '/patient/dashboard') {
  const path = String(value || '').trim()
  if (!path.startsWith('/') || path.startsWith('//')) return fallback
  return path
}

async function requireAdmin() {
  const session = await getSession()
  if (!session?.user || !isAdminRole(session.user.role)) {
    throw new Error('Admin access required.')
  }
  return session
}

async function audit(tx, { clinicId, action, entityType, entityId = null, details = {}, userId = null }) {
  return tx.auditLog.create({
    data: {
      clinicId,
      userId,
      action,
      entityType,
      entityId,
      details,
    },
  })
}

async function repositionQueue(tx, clinicId, queueDate) {
  const active = await tx.queueItem.findMany({
    where: { clinicId, queueDate, status: { in: ACTIVE_QUEUE_STATUSES } },
    orderBy: [{ tokenNumber: 'asc' }],
  })

  await Promise.all(active.map((item, index) => tx.queueItem.update({
    where: { id: item.id },
    data: {
      position: index + 1,
      estimatedWaitTime: Math.max(0, index * 8 + (item.delayMinutes || 0)),
    },
  })))
}

function appointmentErrorMessage(error) {
  const message = String(error?.message || '')

  if (error?.code === 'P2028' || message.includes('Transaction already closed')) {
    return 'Booking took too long to confirm. Please try the slot again.'
  }

  if (error?.code === 'P2002') {
    const target = JSON.stringify(error?.meta?.target || '')
    if (target.includes('patients')) {
      return 'This phone number is already registered to another patient.'
    }

    return 'This slot is no longer available. Please choose another time.'
  }

  if (error?.code === 'P2034') {
    return 'This slot is no longer available. Please choose another time.'
  }

  return message || 'Could not create appointment.'
}

async function createAndSendWhatsAppNotification(data) {
  const { contentVariables, ...notificationData } = data
  const notification = await prisma.notification.create({
    data: {
      ...notificationData,
      status: 'pending',
    },
  })

  const delivery = await sendWhatsAppMessage({
    to: data.recipient,
    message: data.message,
    contentVariables,
  })

  try {
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: notificationStatusFromDelivery(delivery),
        sentAt: notificationSentAtFromDelivery(delivery),
      },
    })
  } catch (error) {
    console.error('Could not update WhatsApp notification delivery status:', error)
  }

  return { notification, delivery }
}

async function createAppointmentSideEffects({
  clinic,
  patient,
  appointment,
  service,
  appointmentType,
  date,
  time,
  source,
  actorUserId,
  tokenNumber,
}) {
  const notificationMessage = confirmationMessage({ clinic, patient, appointment, service })
  const contentVariables = confirmationContentVariables({ clinic, patient, appointment, service })
  const tasks = [
    createAndSendWhatsAppNotification({
      clinicId: clinic.id,
      patientId: patient.id,
      appointmentId: appointment.id,
      type: 'confirmation',
      channel: 'whatsapp',
      recipient: patient.phone,
      message: notificationMessage,
      contentVariables,
    }),
    audit(prisma, {
      clinicId: clinic.id,
      action: source === 'walk_in' ? 'walk_in_created' : 'appointment_created',
      entityType: 'appointment',
      entityId: appointment.id,
      userId: actorUserId,
      details: { tokenNumber, source, date, time },
    }),
  ]

  if (appointmentType === 'new') {
    tasks.push(prisma.followUp.create({
      data: {
        clinicId: clinic.id,
        patientId: patient.id,
        appointmentId: appointment.id,
        priority: 'warm',
        status: 'new',
        nextFollowupDate: dateFromInput(addDaysInput(date, 7)),
        notes: 'Automatic follow-up reminder created after first appointment booking.',
      },
    }))
  }

  const results = await Promise.allSettled(tasks)
  results.forEach((result) => {
    if (result.status === 'rejected') {
      console.error('Appointment side effect failed:', result.reason)
    }
  })
}

function scheduleAppointmentSideEffects(payload) {
  const task = () => {
    void createAppointmentSideEffects(payload).catch((error) => {
      console.error('Appointment side effects failed:', error)
    })
  }

  try {
    after(task)
  } catch {
    setTimeout(task, 0)
  }
}

async function createAppointmentInternal({
  patientData,
  appointmentType,
  serviceId,
  date,
  time,
  message = '',
  source = 'online',
  userId = null,
  existingPatientId = null,
  actorUserId = null,
}) {
  const clinic = await getClinic()
  if (!isDatabaseUuid(serviceId)) return { ok: false, error: 'Please choose a valid doctor/service.' }

  const service = await prisma.service.findFirst({ where: { id: serviceId, clinicId: clinic.id } })
  if (!service) return { ok: false, error: 'Please select a valid doctor/service.' }

  const duration = appointmentDuration({ appointmentType, clinic, service })
  const slotStart = timeToMinutes(time)
  const appointmentDate = dateFromInput(date)
  const appointmentTime = timeFromInput(time)
  const arrivalWindow = calculateArrivalWindow(time)

  const available = await generateAvailableSlots({ date, appointmentType, serviceId })
  if (!available.slots.some((slot) => slot.time === time)) {
    return { ok: false, error: 'This slot is no longer available.' }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingAppointments = await tx.appointment.findMany({
        where: {
          clinicId: clinic.id,
          appointmentDate,
          status: { in: ACTIVE_APPOINTMENT_STATUSES },
        },
        include: { service: true },
      })

      const clashes = existingAppointments.some((appointment) => {
        const start = timeToMinutes(appointment.appointmentTime)
        const bookedDuration = appointmentDuration({
          appointmentType: appointment.appointmentType,
          clinic,
          service: appointment.service,
        })
        return slotStart < start + bookedDuration && slotStart + duration > start
      })

      if (clashes) {
        throw new Error('This slot is no longer available.')
      }

      const patient = await upsertPatient(tx, clinic.id, patientData, userId, existingPatientId)
      const maxToken = await tx.appointment.aggregate({
        where: { clinicId: clinic.id, appointmentDate },
        _max: { tokenNumber: true },
      })
      const tokenNumber = (maxToken._max.tokenNumber || 0) + 1

      const appointment = await tx.appointment.create({
        data: {
          clinicId: clinic.id,
          patientId: patient.id,
          serviceId: service.id,
          appointmentType,
          tokenNumber,
          appointmentDate,
          appointmentTime,
          arrivalWindowStart: timeFromInput(arrivalWindow.start),
          arrivalWindowEnd: timeFromInput(arrivalWindow.end),
          status: 'confirmed',
          source,
          message,
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

      await notifyQueueRefresh(tx, clinic.id)

      return { appointment, patient, tokenNumber }
    }, SERIALIZABLE_TRANSACTION_OPTIONS)

    publishQueueRefresh()
    scheduleAppointmentSideEffects({
      clinic,
      patient: result.patient,
      appointment: result.appointment,
      service,
      appointmentType,
      date,
      time,
      source,
      actorUserId,
      tokenNumber: result.tokenNumber,
    })

    return { ok: true, appointmentId: result.appointment.id }
  } catch (error) {
    return { ok: false, error: appointmentErrorMessage(error) }
  }
}

async function upsertPatient(tx, clinicId, patientData, userId = null, existingPatientId = null) {
  const cleanPhone = String(patientData.phone || '').trim()
  const baseData = {
    fullName: patientData.fullName,
    age: Number(patientData.age),
    gender: patientData.gender || null,
    phone: cleanPhone,
    email: patientData.email || null,
    userId: userId || null,
  }

  if (existingPatientId) {
    return tx.patient.update({ where: { id: existingPatientId }, data: baseData })
  }

  const existing = await tx.patient.findFirst({
    where: {
      clinicId,
      OR: [
        ...(userId ? [{ userId }] : []),
        { phone: cleanPhone },
      ],
    },
  })

  const data = {
    ...baseData,
    gender: baseData.gender || existing?.gender || null,
    email: baseData.email || existing?.email || null,
    userId: userId || existing?.userId || null,
  }

  if (existing) {
    return tx.patient.update({ where: { id: existing.id }, data })
  }

  return tx.patient.create({
    data: {
      clinicId,
      ...data,
    },
  })
}

export async function savePatientProfileAction(formData) {
  'use server'
  const session = await getSession()
  if (!session?.user?.id) redirect('/patient/login')

  const raw = Object.fromEntries(formData)
  const redirectTo = safeRedirectPath(raw.redirectTo)
  const parsed = profileSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = encodeURIComponent(parsed.error.issues[0]?.message || 'Please check your details.')
    redirect(`/patient/profile?error=${msg}`)
  }

  const values = parsed.data
  try {
    const clinic = await getClinic()

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          name: values.fullName,
          role: session.user.role && session.user.role !== 'PATIENT' ? session.user.role : 'PATIENT',
          clinicId: clinic.id,
        },
      })

      const email = String(session.user.email || '').trim().toLowerCase()
      const existing = await tx.patient.findFirst({
        where: {
          clinicId: clinic.id,
          OR: [
            { userId: session.user.id },
            { phone: values.phone },
            ...(email ? [{ email: { equals: email, mode: 'insensitive' } }] : []),
          ],
        },
      })

      const data = {
        clinicId: clinic.id,
        userId: session.user.id,
        fullName: values.fullName,
        age: values.age,
        gender: values.gender,
        phone: values.phone,
        email,
        address: values.address || null,
        emergencyContact: values.emergencyContact || null,
        securityQuestion: null,
        securityAnswerHash: null,
      }

      if (existing) {
        await tx.patient.update({ where: { id: existing.id }, data })
      } else {
        await tx.patient.create({ data })
      }
    }, TRANSACTION_OPTIONS)
  } catch {
    const msg = encodeURIComponent('Failed to save profile. Please try again.')
    redirect(`/patient/profile?error=${msg}`)
  }

  revalidatePath('/patient/dashboard')
  revalidatePath('/patient/profile')
  redirect(redirectTo)
}

export async function lookupPatientAction(phone) {
  const patient = await getPatientByPhone(phone)
  if (!patient) return { ok: false, error: 'Patient not found. Please register first.' }
  return {
    ok: true,
    patient: {
      id: patient.id,
      fullName: patient.fullName,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      totalVisits: patient.totalVisits,
    },
  }
}

export async function getAvailableSlotsAction(payload) {
  return generateAvailableSlots(payload)
}

export async function createBookingAction(payload) {
  const session = await getSession()
  if (!session?.user?.id) return { ok: false, error: 'Please sign in before booking.' }
  const parsed = bookingSchema.safeParse(payload)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message || 'Please check booking details.' }

  const existingPatient = await getPatientForUser(session.user)
  const patientData = parsed.data.patient || existingPatient

  if (!patientData) {
    return { ok: false, error: 'Please complete your patient profile first.' }
  }

  return createAppointmentInternal({
    ...parsed.data,
    patientData,
    userId: session.user.id,
    existingPatientId: existingPatient?.id,
    source: 'online',
  })
}

export async function queueCommandAction(formData) {
  const session = await requireAdmin()
  const queueItemId = String(formData.get('queueItemId') || '')
  const command = String(formData.get('command') || '')
  const note = String(formData.get('note') || '')

  await prisma.$transaction(async (tx) => {
    const item = await tx.queueItem.findUnique({
      where: { id: queueItemId },
      include: { appointment: true, patient: true },
    })
    if (!item) throw new Error('Queue item not found.')

    const dataByCommand = {
      arrived: { queue: 'arrived', appointment: 'arrived' },
      start: { queue: 'in_progress', appointment: 'in_progress' },
      complete: { queue: 'completed', appointment: 'completed' },
      skip: { queue: 'skipped', appointment: item.appointment.status },
      recall: { queue: 'waiting', appointment: 'confirmed' },
      cancel: { queue: 'cancelled', appointment: 'cancelled' },
      no_show: { queue: 'cancelled', appointment: 'no_show' },
    }[command]

    if (!dataByCommand) throw new Error('Unsupported queue command.')

    await tx.queueItem.update({ where: { id: item.id }, data: { status: dataByCommand.queue } })
    await tx.appointment.update({
      where: { id: item.appointmentId },
      data: {
        status: dataByCommand.appointment,
        internalNotes: note || item.appointment.internalNotes,
      },
    })

    if (command === 'complete') {
      await tx.patient.update({
        where: { id: item.patientId },
        data: { totalVisits: { increment: 1 }, lastVisit: new Date() },
      })
    }

    if (command === 'no_show') {
      await tx.patient.update({ where: { id: item.patientId }, data: { noShowCount: { increment: 1 } } })
    }

    await repositionQueue(tx, item.clinicId, item.queueDate)
    await audit(tx, {
      clinicId: item.clinicId,
      action: `queue_${command}`,
      entityType: 'queue',
      entityId: item.id,
      userId: session.user.id,
      details: { tokenNumber: item.tokenNumber },
    })

    await notifyQueueRefresh(tx, item.clinicId)
  }, TRANSACTION_OPTIONS)

  publishQueueRefresh()
  revalidatePath('/admin/queue')
  revalidatePath('/admin/appointments')
}

export async function addDelayAction(formData) {
  const session = await requireAdmin()
  const minutes = Math.max(0, Number(formData.get('minutes') || 0))
  if (!minutes) return
  const clinic = await getClinic()
  const today = dateFromInput(todayInput())

  await prisma.$transaction(async (tx) => {
    const items = await tx.queueItem.findMany({
      where: { clinicId: clinic.id, queueDate: today, status: { in: ACTIVE_QUEUE_STATUSES } },
      include: { patient: true, appointment: true },
    })

    await Promise.all(items.map((item) => tx.queueItem.update({
      where: { id: item.id },
      data: {
        delayMinutes: { increment: minutes },
        estimatedWaitTime: { increment: minutes },
      },
    })))

    await Promise.all(items.map((item) => tx.notification.create({
      data: {
        clinicId: clinic.id,
        patientId: item.patientId,
        appointmentId: item.appointmentId,
        type: 'delay_alert',
        channel: 'whatsapp',
        recipient: item.patient.phone,
        message: delayMessage({
          clinic,
          patient: item.patient,
          appointment: item.appointment,
          delayMinutes: minutes,
          estimatedWaitTime: (item.estimatedWaitTime || 0) + minutes,
        }),
        status: 'ready',
      },
    })))

    await audit(tx, {
      clinicId: clinic.id,
      action: 'delay_added',
      entityType: 'queue',
      userId: session.user.id,
      details: { minutes, affected: items.length },
    })

    await notifyQueueRefresh(tx, clinic.id)
  }, TRANSACTION_OPTIONS)

  publishQueueRefresh()
  revalidatePath('/admin/queue')
}

export async function walkInAction(formData) {
  const session = await requireAdmin()
  const clinic = await getClinic()
  const today = todayInput()
  const appointmentType = String(formData.get('appointmentType') || 'new')
  const serviceId = String(formData.get('serviceId') || '')
  const slots = await generateAvailableSlots({ date: today, appointmentType, serviceId })
  const nearest = slots.slots[0]
  if (!nearest) throw new Error('No walk-in slot is available today.')

  const result = await createAppointmentInternal({
    patientData: {
      fullName: String(formData.get('fullName') || ''),
      age: Number(formData.get('age') || 0),
      gender: String(formData.get('gender') || ''),
      phone: String(formData.get('phone') || ''),
      email: '',
    },
    appointmentType,
    serviceId,
    date: today,
    time: nearest.time,
    message: String(formData.get('notes') || ''),
    source: 'walk_in',
    actorUserId: session.user.id,
  })

  if (!result.ok) throw new Error(result.error)
  revalidatePath('/admin/walk-ins')
  redirect(`/admin/queue?walkin=${result.appointmentId}&clinic=${clinic.id}`)
}

export async function appointmentStatusAction(formData) {
  const session = await requireAdmin()
  const appointmentId = String(formData.get('appointmentId') || '')
  const status = String(formData.get('status') || '')
  const note = String(formData.get('note') || '')
  const cancellationReason = String(formData.get('cancellationReason') || '')

  const allowed = ['pending', 'confirmed', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled']
  if (!allowed.includes(status)) throw new Error('Invalid appointment status.')

  await prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        status,
        internalNotes: note || undefined,
        cancellationReason: cancellationReason || undefined,
      },
    })

    const queueStatus = {
      arrived: 'arrived',
      in_progress: 'in_progress',
      completed: 'completed',
      cancelled: 'cancelled',
      no_show: 'cancelled',
      confirmed: 'waiting',
      pending: 'waiting',
    }[status]

    if (queueStatus) {
      await tx.queueItem.updateMany({ where: { appointmentId }, data: { status: queueStatus } })
    }

    if (status === 'completed') {
      await tx.patient.update({ where: { id: appointment.patientId }, data: { totalVisits: { increment: 1 }, lastVisit: new Date() } })
    }
    if (status === 'no_show') {
      await tx.patient.update({ where: { id: appointment.patientId }, data: { noShowCount: { increment: 1 } } })
    }

    await audit(tx, {
      clinicId: appointment.clinicId,
      action: `appointment_${status}`,
      entityType: 'appointment',
      entityId: appointment.id,
      userId: session.user.id,
      details: { note, cancellationReason },
    })

    await notifyQueueRefresh(tx, appointment.clinicId)
  }, TRANSACTION_OPTIONS)

  publishQueueRefresh()
  revalidatePath('/admin/appointments')
  revalidatePath('/admin/queue')
}

export async function followUpStatusAction(formData) {
  await requireAdmin()
  const followUpId = String(formData.get('followUpId') || '')
  const status = String(formData.get('status') || 'contacted')
  const priority = String(formData.get('priority') || 'warm')
  const notes = String(formData.get('notes') || '')

  await prisma.followUp.update({
    where: { id: followUpId },
    data: {
      status,
      priority,
      notes: notes || undefined,
      lastContactedAt: status === 'contacted' ? new Date() : undefined,
    },
  })
  revalidatePath('/admin/follow-ups')
}

export async function saveSettingsAction(formData) {
  await requireAdmin()
  const clinic = await getClinic()
  await prisma.clinic.update({
    where: { id: clinic.id },
    data: {
      name: String(formData.get('name') || clinic.name),
      doctorName: String(formData.get('doctorName') || clinic.doctorName),
      specialization: String(formData.get('specialization') || ''),
      phone: String(formData.get('phone') || ''),
      whatsappNumber: String(formData.get('whatsappNumber') || ''),
      email: String(formData.get('email') || ''),
      address: String(formData.get('address') || ''),
      openingTime: timeFromInput(String(formData.get('openingTime') || '09:00')),
      closingTime: timeFromInput(String(formData.get('closingTime') || '18:30')),
      lunchStart: timeFromInput(String(formData.get('lunchStart') || '13:20')),
      lunchEnd: timeFromInput(String(formData.get('lunchEnd') || '14:00')),
      newAppointmentDuration: Number(formData.get('newAppointmentDuration') || 10),
      followupDuration: Number(formData.get('followupDuration') || 5),
      slotDuration: Number(formData.get('slotDuration') || 5),
    },
  })
  revalidatePath('/admin/settings')
  revalidatePath('/book')
}

export async function patientNoteAction(formData) {
  await requireAdmin()
  const patientId = String(formData.get('patientId') || '')
  const notes = String(formData.get('notes') || '')
  await prisma.patient.update({ where: { id: patientId }, data: { notes } })
  revalidatePath('/admin/patients')
}
