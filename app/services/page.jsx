import { ArrowLeft, IndianRupee } from 'lucide-react'
import { getServices } from '@/lib/data'
import { Button, Card, PageHeader } from '@/components/ui'

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <main className="min-h-screen px-3 py-5 sm:px-4 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <Button href="/" variant="ghost" className="mb-6"><ArrowLeft className="h-4 w-4" /> Back</Button>
        <PageHeader
          eyebrow="Clinic services"
          title="Simple appointment choices"
          description="Patients choose a service, appointment type, date, and slot. Calenzo handles duration, lunch break, duplicate slot prevention, tokens, and live queue."
          action={<Button href="/patient/login">Book appointment</Button>}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <Card key={service.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{service.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{service.description}</p>
                </div>
                <div className="rounded-2xl bg-sky-400/10 px-3 py-2 text-sm font-semibold text-sky-200">{service.duration} min</div>
              </div>
              <p className="mt-5 flex items-center gap-1 text-sm text-slate-400"><IndianRupee className="h-4 w-4" /> {service.price?.toString() || 'Clinic pricing'}</p>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
