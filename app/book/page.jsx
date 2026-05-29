import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getPatientForUser, getServices } from '@/lib/data'
import { plain } from '@/lib/time'
import { BookingHeader } from '@/components/BookingHeader'
import { BookingFlow } from '@/components/BookingFlow'
import { PatientTopbar } from '@/components/PatientTopbar'

export default async function BookingPage() {
  const session = await getSession()
  if (!session?.user?.id) redirect('/patient/login')

  const patient = await getPatientForUser(session.user)
  if (!patient) redirect('/patient/profile')

  const services = await getServices()

  return (
    <main className="min-h-screen px-3 py-5 sm:px-4 sm:py-8">
      <PatientTopbar />
      <div className="mx-auto max-w-7xl">
        <BookingHeader />
        <BookingFlow patient={plain(patient)} services={plain(services)} />
      </div>
    </main>
  )
}
