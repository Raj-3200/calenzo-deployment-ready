import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react'
import { getClinic } from '@/lib/data'
import { Button, Card, PageHeader } from '@/components/ui'

export default async function ContactPage() {
  const clinic = await getClinic()

  return (
    <main className="min-h-screen px-3 py-5 sm:px-4 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <Button href="/" variant="ghost" className="mb-6"><ArrowLeft className="h-4 w-4" /> Back</Button>
        <PageHeader eyebrow="Contact" title={clinic.name} description="Reach the clinic for appointments, reschedules, and queue questions." />
        <div className="grid gap-4 md:grid-cols-3">
          <Card><Phone className="mb-4 h-5 w-5 text-sky-200" /><p className="font-semibold text-white">Phone</p><p className="mt-2 text-sm text-slate-400">{clinic.phone}</p></Card>
          <Card><Mail className="mb-4 h-5 w-5 text-sky-200" /><p className="font-semibold text-white">Email</p><p className="mt-2 text-sm text-slate-400">{clinic.email}</p></Card>
          <Card><MapPin className="mb-4 h-5 w-5 text-sky-200" /><p className="font-semibold text-white">Address</p><p className="mt-2 text-sm leading-6 text-slate-400">{clinic.address}</p></Card>
        </div>
      </div>
    </main>
  )
}
