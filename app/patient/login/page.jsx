import { redirect } from 'next/navigation'

export default function PatientLoginPage() {
  // Redirect to Clerk's unified sign-in
  // After sign-in, user is redirected to /patient/dashboard per NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
  redirect('/sign-in')
}
