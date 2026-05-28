export async function loginAdmin(email, password) {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Invalid admin credentials.");
  }

  window.location.assign("/admin");
}

export async function getAdminSession() {
  const response = await fetch("/api/admin/session", { cache: "no-store" });
  if (!response.ok) return { ok: false, user: null, expires_at: null };
  return await response.json();
}

export async function logoutAdmin() {
  await fetch("/api/admin/logout", { method: "POST" });
  if (typeof window !== "undefined") {
    window.location.assign("/");
  }
}
