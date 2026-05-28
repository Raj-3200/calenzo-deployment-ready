import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth'
import { ACTIVE_QUEUE_STATUSES } from '@/lib/data'
import { prisma } from '@/lib/prisma'
import { notifyQueueRefresh, publishQueueRefresh } from '@/lib/queue-events'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const QueueStatusSchema = z.object({
  status: z.enum([
    'WAITING',
    'ARRIVED',
    'IN_PROGRESS',
    'COMPLETED',
    'SKIPPED',
    'CANCELLED',
    'waiting',
    'arrived',
    'in_progress',
    'completed',
    'skipped',
    'cancelled',
  ]),
  delayMinutes: z.coerce.number().int().min(0).optional(),
})

const appointmentStatusForQueue = {
  waiting: 'confirmed',
  arrived: 'arrived',
  in_progress: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
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

export async function PATCH(req, context) {
  try {
    await requireRole(['ADMIN', 'OWNER', 'DOCTOR', 'RECEPTIONIST', 'STAFF'])
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await context.params

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = QueueStatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
  }

  const status = parsed.data.status.toLowerCase()

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const item = await tx.queueItem.findUnique({
        where: { id },
        include: { appointment: true },
      })
      if (!item) throw new Error('Queue item not found')

      const queueItem = await tx.queueItem.update({
        where: { id },
        data: {
          status,
          ...(parsed.data.delayMinutes !== undefined ? { delayMinutes: parsed.data.delayMinutes } : {}),
        },
      })

      const appointmentStatus = appointmentStatusForQueue[status]
      if (appointmentStatus) {
        await tx.appointment.update({
          where: { id: item.appointmentId },
          data: { status: appointmentStatus },
        })
      }

      await repositionQueue(tx, item.clinicId, item.queueDate)
      await notifyQueueRefresh(tx, item.clinicId)

      return queueItem
    })

    publishQueueRefresh()

    return NextResponse.json(updated)
  } catch (error) {
    const statusCode = error?.message === 'Queue item not found' ? 404 : 500
    return NextResponse.json({ error: error?.message || 'Failed to update queue item' }, { status: statusCode })
  }
}
