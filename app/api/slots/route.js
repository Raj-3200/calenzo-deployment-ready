import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { generateAvailableSlots } from '@/lib/data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SlotQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.string().optional(),
  serviceId: z.string().optional(),
})

function normalizeAppointmentType(value) {
  const type = String(value || 'new').toLowerCase()
  return type === 'follow_up' || type === 'follow-up' ? 'follow_up' : 'new'
}

export async function GET(req) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = Object.fromEntries(req.nextUrl.searchParams)
  const parsed = SlotQuerySchema.safeParse(params)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid query' }, { status: 400 })
  }

  const result = await generateAvailableSlots({
    date: parsed.data.date,
    appointmentType: normalizeAppointmentType(parsed.data.type),
    serviceId: parsed.data.serviceId || null,
  })

  return NextResponse.json(result)
}
