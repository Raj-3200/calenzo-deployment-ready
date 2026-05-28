import { redirect } from 'next/navigation'

export default function AdminLoginPage() {
  // Admin login now unified with main Clerk sign-in at /sign-in
  // After sign-in, Clerk redirects to /patient/dashboard
  // Admins are redirected to /admin by the patient dashboard redirect logic
  redirect('/sign-in')
}
