import { notFound } from 'next/navigation'
import { getQueueSnapshot } from '@/lib/data'
import { prisma } from '@/lib/prisma'
import { isDatabaseUuid } from '@/lib/validation'
import { PatientTopbar } from '@/components/PatientTopbar'
import { QueueLive } from '@/components/QueueLive'

export default async function QueueStatusPage({ params }) {
  const { appointmentId } = await params
  if (!isDatabaseUuid(appointmentId)) notFound()

  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } })
  if (!appointment) notFound()

  const snapshot = await getQueueSnapshot({ appointmentId, clinicId: appointment.clinicId })

  return (
    <main className="min-h-screen px-3 py-5 sm:px-4 sm:py-8">
      <PatientTopbar />
      <div className="mx-auto max-w-7xl">
        <QueueLive initialSnapshot={snapshot} appointmentId={appointmentId} />
      </div>
    </main>
  )
}
