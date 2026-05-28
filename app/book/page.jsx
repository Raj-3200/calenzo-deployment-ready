import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getPatientForUser, getServices } from '@/lib/data'
import { plain } from '@/lib/time'
import { BookingFlow } from '@/components/BookingFlow'
import { PatientTopbar } from '@/components/PatientTopbar'
import { PageHeader } from '@/components/ui'

export default async function BookingPage() {
  const session = await getSession()
  if (!session?.user?.id) redirect('/patient/login')

  const patient = await getPatientForUser(session.user)
  if (!patient) redirect('/patient/profile')

  const services = await getServices()

  return (
    <main className="min-h-screen px-4 py-8">
      <PatientTopbar />
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Book appointment"
          title="Choose a slot in under a minute"
          description="Calenzo checks clinic hours, lunch break, active bookings, and queue capacity before confirming your token."
        />
        <BookingFlow patient={plain(patient)} services={plain(services)} />
      </div>
    </main>
  )
}
