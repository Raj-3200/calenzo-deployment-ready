import { redirect } from "next/navigation";
import { getSession, isAdminRole } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/admin/login");
  }

  if (!isAdminRole(session.user.role)) {
    redirect("/access-denied");
  }

  // Redirect to analytics dashboard
  redirect("/admin/analytics");
}
