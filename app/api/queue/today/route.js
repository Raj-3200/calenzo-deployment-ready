import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { DEFAULT_CLINIC_ID, dateFromInput, todayInput } from '@/lib/time'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clinicId = req.nextUrl.searchParams.get('clinicId') || DEFAULT_CLINIC_ID
  const today = dateFromInput(todayInput())

  const queue = await prisma.queueItem.findMany({
    where: {
      clinicId,
      queueDate: today,
      status: { notIn: ['completed', 'cancelled'] },
    },
    include: {
      patient: true,
      appointment: { include: { service: true } },
    },
    orderBy: [{ position: 'asc' }, { tokenNumber: 'asc' }],
  })

  return NextResponse.json(queue)
}
