import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { getClinic } from '@/lib/data'
import { prisma } from '@/lib/prisma'
import { dateFromInput, todayInput } from '@/lib/time'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireRole(['ADMIN', 'OWNER', 'DOCTOR', 'RECEPTIONIST', 'STAFF'])
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const clinic = await getClinic()
  const today = dateFromInput(todayInput())

  const [
    totalToday,
    waiting,
    completed,
    cancelled,
    noShows,
    newPatients,
    followUps,
    pendingFollowUps,
    currentQueue,
  ] = await Promise.all([
    prisma.appointment.count({ where: { clinicId: clinic.id, appointmentDate: today } }),
    prisma.queueItem.count({ where: { clinicId: clinic.id, queueDate: today, status: 'waiting' } }),
    prisma.appointment.count({ where: { clinicId: clinic.id, appointmentDate: today, status: 'completed' } }),
    prisma.appointment.count({ where: { clinicId: clinic.id, appointmentDate: today, status: 'cancelled' } }),
    prisma.appointment.count({ where: { clinicId: clinic.id, appointmentDate: today, status: 'no_show' } }),
    prisma.appointment.count({ where: { clinicId: clinic.id, appointmentDate: today, appointmentType: 'new' } }),
    prisma.appointment.count({ where: { clinicId: clinic.id, appointmentDate: today, appointmentType: 'follow_up' } }),
    prisma.followUp.count({ where: { clinicId: clinic.id, status: { in: ['new', 'contacted', 'follow_up_needed'] } } }),
    prisma.queueItem.findFirst({
      where: { clinicId: clinic.id, queueDate: today, status: 'in_progress' },
      include: { patient: true },
      orderBy: { tokenNumber: 'asc' },
    }),
  ])

  return NextResponse.json({
    totalToday,
    waiting,
    completed,
    cancelled,
    noShows,
    newPatients,
    followUps,
    pendingFollowUps,
    currentToken: currentQueue?.tokenNumber ?? null,
    currentPatient: currentQueue?.patient?.fullName ?? null,
  })
}
