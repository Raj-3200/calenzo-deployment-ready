import { patientNoteAction } from '@/app/actions'
import { getClinic } from '@/lib/data'
import { prisma } from '@/lib/prisma'
import { formatDate, formatTime } from '@/lib/time'
import { Button, Card, EmptyState, Label, PageHeader, SearchBox, StatusBadge, Textarea } from '@/components/ui'

export default async function PatientsPage({ searchParams }) {
  const params = await searchParams
  const clinic = await getClinic()
  const q = String(params?.q || '')

  const patients = await prisma.patient.findMany({
    where: {
      clinicId: clinic.id,
      ...(q ? {
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q } },
        ],
      } : {}),
    },
    include: {
      appointments: { include: { service: true }, orderBy: { createdAt: 'desc' }, take: 4 },
      followUps: { orderBy: { createdAt: 'desc' }, take: 2 },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <PageHeader eyebrow="Patients" title="Patient database" description="Search patients, review appointment history, no-shows, total visits, private notes, and follow-up state." />
      <Card className="mb-5 p-4">
        <form className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1"><SearchBox defaultValue={q} placeholder="Search by patient name or phone" /></div>
          <Button type="submit" variant="secondary" className="w-full sm:w-auto">Search</Button>
        </form>
      </Card>

      {patients.length ? (
        <div className="grid gap-4">
          {patients.map((patient) => (
            <Card key={patient.id} className="p-5">
              <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)_280px]">
                <div>
                  <p className="text-xl font-bold text-white">{patient.fullName}</p>
                  <p className="mt-1 text-sm text-slate-400">{patient.phone} - {patient.email || 'No email'}</p>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <Metric label="Visits" value={patient.totalVisits} />
                    <Metric label="No-show" value={patient.noShowCount} />
                    <Metric label="Age" value={patient.age} />
                  </div>
                  <p className="mt-4 text-sm text-slate-500">Last visit: {patient.lastVisit ? formatDate(patient.lastVisit) : 'Not visited yet'}</p>
                </div>

                <div>
                  <p className="mb-3 font-semibold text-white">Appointment history</p>
                  {patient.appointments.length ? (
                    <div className="space-y-2">
                      {patient.appointments.map((appointment) => (
                        <div key={appointment.id} className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white">#{appointment.tokenNumber} {appointment.service?.title || 'Consultation'}</p>
                            <p className="text-xs text-slate-500">{formatDate(appointment.appointmentDate)} at {formatTime(appointment.appointmentTime)}</p>
                          </div>
                          <StatusBadge status={appointment.status} />
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-slate-500">No appointment history.</p>}
                </div>

                <form action={patientNoteAction}>
                  <input type="hidden" name="patientId" value={patient.id} />
                  <Label>Private notes</Label>
                  <Textarea name="notes" defaultValue={patient.notes || ''} placeholder="Internal notes" />
                  <Button type="submit" variant="secondary" size="sm" className="mt-3">Save notes</Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No patients found." description="Patients appear here after registration, booking, or walk-in creation." />
      )}
    </>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-3">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}
