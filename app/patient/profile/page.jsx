import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getPatientForUser } from '@/lib/data'
import { PatientProfileForm } from '@/components/PatientProfileForm'
import { PatientTopbar } from '@/components/PatientTopbar'
import { savePatientProfileAction } from '@/app/actions'

export const metadata = { title: 'My Profile — Calenzo' }

export default async function PatientProfilePage({ searchParams }) {
  const session = await getSession()
  if (!session?.user?.id) redirect('/patient/login')

  const params = await searchParams

  // Fetch existing patient — if found we are in edit mode
  const patient = await getPatientForUser(session.user)
  const isEdit = Boolean(patient)

  // Error from redirect (URL param)
  const error = params?.error || ''

  return (
    <main className="min-h-screen px-3 py-5 sm:px-4 sm:py-10">
      <PatientTopbar />
      <div className="mx-auto max-w-2xl">
        <PatientProfileForm
          action={savePatientProfileAction}
          email={session.user.email}
          defaultValues={patient}
          error={error}
          isEdit={isEdit}
        />
      </div>
    </main>
  )
}
