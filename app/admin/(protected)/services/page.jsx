import { getServices } from '@/lib/data'
import { Badge, Card, PageHeader } from '@/components/ui'

export default async function AdminServicesPage() {
  const services = await getServices()

  return (
    <>
      <PageHeader eyebrow="Services" title="Clinic service catalog" description="Services drive booking choices, durations, pricing, and slot generation." />
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <Card key={service.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">{service.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{service.description}</p>
              </div>
              <Badge tone={service.status === 'active' ? 'green' : 'slate'}>{service.status}</Badge>
            </div>
            <p className="mt-5 text-sm text-slate-400">Duration: <span className="font-semibold text-white">{service.duration} minutes</span></p>
          </Card>
        ))}
      </div>
    </>
  )
}
