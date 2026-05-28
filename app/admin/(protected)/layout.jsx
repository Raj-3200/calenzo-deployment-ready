import { redirect } from "next/navigation";
import { getSession, isAdminRole } from "@/lib/auth";
import { AdminFrame } from "@/components/AdminFrame";

export default async function ProtectedAdminLayout({ children }) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/admin/login");
  }

  if (!isAdminRole(session.user.role)) {
    redirect("/access-denied");
  }

  return <AdminFrame user={session.user}>{children}</AdminFrame>;
}
