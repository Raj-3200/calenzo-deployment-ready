import { SignIn } from '@clerk/nextjs'
import { ClerkAuthPage, clerkAppearance } from '@/components/ClerkAuthPage'

export default function SignInPage() {
  return (
    <ClerkAuthPage
      portal="Patient portal"
      title="Patient sign in"
      subtitle="Access your appointments, queue tickets, and visit history."
    >
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/patient/register"
        forceRedirectUrl="/patient/dashboard"
        fallbackRedirectUrl="/patient/dashboard"
        oidcPrompt="select_account"
        appearance={clerkAppearance}
      />
    </ClerkAuthPage>
  )
}
