import { redirect } from 'next/navigation'
import { getSession, isAdminRole } from '@/lib/auth'
import { getPatientForUser } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function DashboardRedirectPage() {
  const session = await getSession()
  if (!session?.user?.id) redirect('/patient/login')

  if (isAdminRole(session.user.role)) {
    redirect('/admin')
  }

  const patient = await getPatientForUser(session.user)

  if (!patient) redirect('/patient/profile')

  redirect('/book')
}
