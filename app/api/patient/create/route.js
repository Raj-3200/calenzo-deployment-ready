import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { getClinic } from '@/lib/data'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PatientCreateSchema = z.object({
  fullName: z.string().trim().min(2),
  age: z.coerce.number().int().min(1).max(120),
  gender: z.string().trim().optional(),
  phone: z.string().trim().min(8),
  address: z.string().trim().optional(),
  emergencyContact: z.string().trim().optional(),
})

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

  const parsed = PatientCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
  }

  const clinic = await getClinic()
  const data = parsed.data

  const email = String(session.user.email || '').trim().toLowerCase()
  let patient
  try {
    const existing = await prisma.patient.findFirst({
      where: {
        clinicId: clinic.id,
        OR: [
          { userId: session.user.id },
          { phone: data.phone },
          ...(email ? [{ email: { equals: email, mode: 'insensitive' } }] : []),
        ],
      },
    })

    const patientData = {
      clinicId: clinic.id,
      userId: session.user.id,
      fullName: data.fullName,
      age: data.age,
      gender: data.gender || null,
      phone: data.phone,
      email,
      address: data.address || null,
      emergencyContact: data.emergencyContact || null,
    }

    patient = existing
      ? await prisma.patient.update({ where: { id: existing.id }, data: patientData })
      : await prisma.patient.create({ data: patientData })
  } catch (error) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'This phone number is already registered.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to save patient profile' }, { status: 500 })
  }

  return NextResponse.json({ patient }, { status: 201 })
}
