import { SignIn } from "@clerk/nextjs";
import { ClerkAuthPage, clerkAppearance } from "@/components/ClerkAuthPage";

export const metadata = { title: "Patient Sign In - Calenzo" };

export default function PatientLoginPage() {
  return (
    <ClerkAuthPage
      portal="Patient portal"
      title="Patient sign in"
      subtitle="Access your appointments, queue tickets, and visit history."
    >
      <SignIn
        routing="path"
        path="/patient/login"
        signUpUrl="/patient/register"
        forceRedirectUrl="/patient/dashboard"
        fallbackRedirectUrl="/patient/dashboard"
        oidcPrompt="select_account"
        appearance={clerkAppearance}
      />
    </ClerkAuthPage>
  );
}
