import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const clinicId = process.env.DEFAULT_CLINIC_ID || '00000000-0000-0000-0000-000000000001'

function time(value) {
  return new Date(`1970-01-01T${value}:00.000Z`)
}

async function main() {
  await prisma.$executeRawUnsafe(`
    create unique index if not exists appointments_unique_active_slot
    on appointments (clinic_id, appointment_date, appointment_time)
    where status not in ('cancelled', 'no_show', 'rescheduled')
  `)

  const clinic = await prisma.clinic.upsert({
    where: { id: clinicId },
    update: {
      name: 'Calenzo Care Clinic',
      brandColor: '#38BDF8',
      doctorName: 'Dr. Aarav Mehta',
      specialization: 'Family Medicine and Preventive Care',
      phone: '+91 88001 23456',
      whatsappNumber: '+91 88001 23456',
      email: 'care@calenzo.health',
      address: '2nd Floor, Serenity Medical Plaza, Andheri West, Mumbai 400053',
      openingTime: time('09:00'),
      closingTime: time('18:30'),
      lunchStart: time('13:20'),
      lunchEnd: time('14:00'),
      newAppointmentDuration: 10,
      followupDuration: 5,
      slotDuration: 5,
    },
    create: {
      id: clinicId,
      name: 'Calenzo Care Clinic',
      brandColor: '#38BDF8',
      doctorName: 'Dr. Aarav Mehta',
      specialization: 'Family Medicine and Preventive Care',
      phone: '+91 88001 23456',
      whatsappNumber: '+91 88001 23456',
      email: 'care@calenzo.health',
      address: '2nd Floor, Serenity Medical Plaza, Andheri West, Mumbai 400053',
      openingTime: time('09:00'),
      closingTime: time('18:30'),
      lunchStart: time('13:20'),
      lunchEnd: time('14:00'),
      newAppointmentDuration: 10,
      followupDuration: 5,
      slotDuration: 5,
    },
  })

  const services = [
    ['10000000-0000-0000-0000-000000000001', 'General Consultation', 'New symptoms, routine concerns, preventive advice, and first-time doctor consultation.', 10, 600],
    ['10000000-0000-0000-0000-000000000002', 'Follow-Up Consultation', 'Quick review of reports, medicines, recovery progress, or ongoing treatment plan.', 5, 350],
    ['10000000-0000-0000-0000-000000000003', 'Diabetes Review', 'Blood sugar review, lifestyle check-in, medication tuning, and next follow-up planning.', 10, 700],
    ['10000000-0000-0000-0000-000000000004', 'Preventive Health Check', 'Vitals, risk review, screening guidance, and a practical preventive care plan.', 10, 900],
    ['10000000-0000-0000-0000-000000000005', 'Vaccination Visit', 'Vaccination counselling, dose administration window, and post-visit instructions.', 5, 250],
  ]

  for (const [id, title, description, duration, price] of services) {
    await prisma.service.upsert({
      where: { id },
      update: { title, description, duration, price, status: 'active' },
      create: { id, clinicId: clinic.id, title, description, duration, price, status: 'active' },
    })
  }

  await prisma.user.upsert({
    where: { email: 'admin@calenzo.health' },
    update: { name: 'Sana Kapoor', role: 'OWNER', status: 'active', clinicId: clinic.id },
    create: { email: 'admin@calenzo.health', name: 'Sana Kapoor', role: 'OWNER', status: 'active', clinicId: clinic.id },
  })

  await prisma.user.upsert({
    where: { email: 'doctor@calenzo.health' },
    update: { name: clinic.doctorName, role: 'DOCTOR', status: 'active', clinicId: clinic.id },
    create: { email: 'doctor@calenzo.health', name: clinic.doctorName, role: 'DOCTOR', status: 'active', clinicId: clinic.id },
  })

  const availabilityCount = await prisma.availability.count({ where: { clinicId: clinic.id } })
  if (!availabilityCount) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    await prisma.availability.createMany({
      data: [
        ...days.map((dayOfWeek) => ({
          clinicId: clinic.id,
          dayOfWeek,
          startTime: time('09:00'),
          endTime: time('18:30'),
          breakStart: time('13:20'),
          breakEnd: time('14:00'),
          isAvailable: true,
        })),
        {
          clinicId: clinic.id,
          dayOfWeek: 'sunday',
          startTime: time('09:00'),
          endTime: time('18:30'),
          breakStart: time('13:20'),
          breakEnd: time('14:00'),
          isAvailable: false,
        },
      ],
    })
  }

  console.log(`Calenzo seed complete for ${clinic.name}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
