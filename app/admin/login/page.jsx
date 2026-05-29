"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_ADMIN_EMAIL = "admin@calenzo.health";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        setError(result.error || `Login failed (${response.status}).`);
        return;
      }

      router.replace("/admin/analytics");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-3 py-5 text-slate-100 sm:px-4 sm:py-10">
      <div className="w-full max-w-md rounded-[28px] border border-slate-800/90 bg-slate-900/95 p-5 shadow-2xl shadow-slate-950/40 sm:rounded-[32px] sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-500/15 text-3xl font-semibold text-sky-300">
            C
          </div>
          <h1 className="text-3xl font-semibold">Admin sign in</h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in with the admin account seeded in Prisma.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-300"
            >
              Admin email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none ring-1 ring-transparent transition focus:ring-sky-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none ring-1 ring-transparent transition focus:ring-sky-500"
              required
            />
          </div>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            className="flex min-h-12 w-full items-center justify-center rounded-3xl border border-sky-200 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: loading ? "#64748B" : "#38BDF8" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Open admin dashboard"}
          </button>
        </form>

        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-500">
          <p>
            Seeded admin:{" "}
            <span className="text-slate-200">{DEFAULT_ADMIN_EMAIL}</span>
          </p>
          <p className="mt-1">
            Default password:{" "}
            <span className="text-slate-200">Admin1234!</span>
          </p>
        </div>
      </div>
    </main>
  );
}
