"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui";

export function AdminSignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <Button as="button" variant="secondary" size="sm" onClick={handleSignOut} title="Sign out" aria-label="Sign out">
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Sign out</span>
    </Button>
  );
}
