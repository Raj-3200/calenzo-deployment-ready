import { SignUp } from "@clerk/nextjs";
import { ClerkAuthPage, clerkAppearance } from "@/components/ClerkAuthPage";

export const metadata = { title: "Patient Registration - Calenzo" };

export default function PatientRegisterPage() {
  return (
    <ClerkAuthPage
      portal="Patient portal"
      title="Create patient account"
      subtitle="Create your Calenzo account before booking a visit."
    >
      <SignUp
        routing="path"
        path="/patient/register"
        signInUrl="/patient/login"
        forceRedirectUrl="/patient/profile"
        fallbackRedirectUrl="/patient/profile"
        oidcPrompt="select_account"
        appearance={clerkAppearance}
      />
    </ClerkAuthPage>
  );
}
