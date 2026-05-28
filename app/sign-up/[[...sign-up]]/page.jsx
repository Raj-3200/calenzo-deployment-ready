import { SignUp } from '@clerk/nextjs'
import { ClerkAuthPage, clerkAppearance } from '@/components/ClerkAuthPage'

export default function SignUpPage() {
  return (
    <ClerkAuthPage
      portal="Patient portal"
      title="Create patient account"
      subtitle="Create your Calenzo account before booking a visit."
    >
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/patient/login"
        forceRedirectUrl="/patient/profile"
        fallbackRedirectUrl="/patient/profile"
        oidcPrompt="select_account"
        appearance={clerkAppearance}
      />
    </ClerkAuthPage>
  )
}
