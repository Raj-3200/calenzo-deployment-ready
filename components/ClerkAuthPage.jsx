import Link from "next/link";

export const clerkAppearance = {
  variables: {
    colorPrimary: "#38BDF8",
    colorBackground: "#FFFFFF",
    colorText: "#0F172A",
    colorTextSecondary: "#475569",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#0F172A",
    colorNeutral: "#64748B",
    colorDanger: "#EF4444",
    borderRadius: "1rem",
    fontFamily: '"DM Sans", Aptos, "Segoe UI", sans-serif',
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "border border-slate-200 bg-white shadow-2xl shadow-slate-950/30",
    headerTitle: "text-slate-950",
    headerSubtitle: "text-slate-500",
    socialButtonsBlockButton:
      "border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
    formButtonPrimary: "bg-sky-400 text-slate-950 hover:bg-sky-300",
    footerActionText: "text-slate-500",
    footerActionLink: "text-sky-600 hover:text-sky-700",
    formFieldInput:
      "border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 focus:border-sky-400",
    formFieldLabel: "text-slate-700",
    formFieldErrorText: "text-red-600",
    dividerLine: "bg-slate-200",
    dividerText: "text-slate-400",
    identityPreviewText: "text-slate-700",
    identityPreviewEditButton: "text-sky-600 hover:text-sky-700",
  },
};

export function ClerkAuthPage({ title, subtitle, portal, children }) {
  return (
    <main className="surface-grid flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-3">
        <Link
          href="/"
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-300 text-xl font-black text-slate-950 shadow-lg shadow-sky-400/25"
        >
          C
        </Link>
        <div className="text-center">
          {portal ? (
            <p className="mb-2 text-xs font-semibold uppercase text-sky-200">
              {portal}
            </p>
          ) : null}
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
