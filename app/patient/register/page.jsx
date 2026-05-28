import { redirect } from 'next/navigation'

export default function PatientRegisterPage() {
  // Redirect to Clerk's built-in sign-up which handles all auth methods
  // After sign-up, user is redirected to /patient/profile per NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
  redirect('/sign-up')
}
