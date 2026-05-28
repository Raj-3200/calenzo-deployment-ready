import { ShieldX } from 'lucide-react'
import { Button } from '@/components/ui'

export const metadata = {
  title: 'Access Denied — Calenzo',
}

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-400/10 text-red-300">
          <ShieldX className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-white">Access Denied</h1>
        <p className="mx-auto mt-4 max-w-md text-slate-400">
          You do not have permission to access this page. If you believe this is an error, please contact the clinic administrator.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button href="/">Go to homepage</Button>
          <Button href="/patient/dashboard" variant="secondary">Patient dashboard</Button>
        </div>
      </div>
    </main>
  )
}
