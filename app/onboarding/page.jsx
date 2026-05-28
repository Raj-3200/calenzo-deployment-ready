import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getPatientForUser } from '@/lib/data'
import { savePatientProfileAction } from '@/app/actions'
import { PatientTopbar } from '@/components/PatientTopbar'
import { PatientProfileForm } from '@/components/PatientProfileForm'

export const metadata = { title: 'Onboarding - Calenzo' }

export default async function OnboardingPage({ searchParams }) {
  const session = await getSession()
  if (!session?.user?.id) redirect('/patient/login')

  const params = await searchParams
  const patient = await getPatientForUser(session.user)
  if (patient) redirect('/book')

  return (
    <main className="min-h-screen px-4 py-10">
      <PatientTopbar />
      <PatientProfileForm
        action={savePatientProfileAction}
        email={session.user.email}
        defaultValues={patient}
        error={params?.error || ''}
        isEdit={Boolean(patient)}
        redirectTo="/book"
      />
    </main>
  )
}
