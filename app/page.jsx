import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getClinic } from "@/lib/data";
import { getQueueSnapshot } from "@/lib/data";
import { AuthControls } from "@/components/AuthControls";
import { AIAssistant } from "@/components/AIAssistant";
import { Button, Card } from "@/components/ui";
import { MotionShell, MotionItem, MotionList } from "@/components/MotionShell";
import { ArrowRight, CalendarCheck2, Radio, ShieldCheck } from "lucide-react";

export default async function WelcomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  const clinic = await getClinic();
  const queueSnapshot = await getQueueSnapshot();

  const currentToken = queueSnapshot?.currentToken;
  const waitingCount =
    (queueSnapshot?.groups?.waiting?.length || 0) +
    (queueSnapshot?.groups?.arrived?.length || 0);
  const delayMinutes = queueSnapshot?.delayMinutes || 0;

  return (
    <main className="min-h-screen surface-grid px-3 py-5 sm:px-4 sm:py-6">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-300 text-slate-950 font-black">
            C
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-white">Calenzo</p>
            <p className="truncate text-xs text-slate-500">{clinic.name}</p>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-end gap-1.5 sm:flex-none sm:gap-2">
          <Button href="/services" variant="ghost" size="sm">
            Services
          </Button>
          <Button href="/admin/login" variant="ghost" size="sm">
            Admin
          </Button>
          <AuthControls />
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl items-center gap-8 py-8 sm:min-h-[calc(100vh-96px)] sm:py-10 lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-10">
        <MotionShell>
          <p className="mb-4 text-sm font-semibold text-sky-300">
            Welcome to Calenzo
          </p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl md:text-7xl">
            Book clinic appointments without waiting room chaos.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
            Book your clinic appointment, track your live queue, and manage your
            visit without waiting room confusion.
          </p>

          <Card className="mt-8 max-w-xl p-4 sm:p-5">
            <p className="text-lg font-bold text-white">
              Are you a new patient?
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Button href="/patient/register" size="lg" className="w-full">
                Yes, Create Account
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/patient/login" variant="secondary" size="lg" className="w-full">
                No, I&apos;m an Existing Patient
              </Button>
            </div>
            <div className="mt-3">
              <AIAssistant />
            </div>
          </Card>
        </MotionShell>

        <MotionList className="space-y-4">
          <MotionItem>
            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">
                    Today at {clinic.name}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {currentToken ? `Token #${currentToken}` : "Queue open"}
                  </p>
                </div>
                <CalendarCheck2 className="h-6 w-6 text-sky-200" />
              </div>
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-sm font-semibold text-white">
                  Dr. {clinic.doctorName.replace(/^Dr\.\s*/i, "")}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {clinic.specialization || "General Consultation"}
                </p>
              </div>
            </Card>
          </MotionItem>
          <MotionItem>
            <Card className="p-5 sm:ml-6">
              <div className="mb-4 flex items-center gap-2 text-sky-200">
                <Radio className="h-5 w-5" />
                <span className="text-sm font-semibold">Live Queue Status</span>
              </div>
              <p className="text-3xl font-bold text-white sm:text-4xl">
                {waitingCount > 0
                  ? `${waitingCount} patients waiting`
                  : "No queue yet"}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {delayMinutes > 0
                  ? `Doctor is running ${delayMinutes} minutes late.`
                  : "Doctor is on time. Book your slot now."}
              </p>
            </Card>
          </MotionItem>
          <MotionItem>
            <Card className="p-5 sm:mr-10">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                <p className="font-semibold text-white">
                  Instant WhatsApp updates
                </p>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                After booking, get your confirmation token and live queue link
                sent directly to your WhatsApp — no app needed.
              </p>
            </Card>
          </MotionItem>
        </MotionList>
      </section>
    </main>
  );
}
