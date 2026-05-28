import { CalendarPlus, Phone } from 'lucide-react'
import { appointmentStatusAction } from '@/app/actions'
import { getClinic } from '@/lib/data'
import { prisma } from '@/lib/prisma'
import { dateFromInput, formatDate, formatTime, todayInput } from '@/lib/time'
import { confirmationMessage, whatsappLink } from '@/lib/whatsapp'
import { Badge, Button, Card, EmptyState, Input, PageHeader, SearchBox, Select, StatusBadge } from '@/components/ui'

export default async function AppointmentsPage({ searchParams }) {
  const params = await searchParams
  const clinic = await getClinic()
  const q = String(params?.q || '')
  const status = String(params?.status || '')
  const type = String(params?.type || '')
  const date = String(params?.date || todayInput())

  const where = {
    clinicId: clinic.id,
    ...(date ? { appointmentDate: dateFromInput(date) } : {}),
    ...(status ? { status } : {}),
    ...(type ? { appointmentType: type } : {}),
    ...(q ? {
      OR: [
        { patient: { fullName: { contains: q, mode: 'insensitive' } } },
        { patient: { phone: { contains: q } } },
        ...(Number.isFinite(Number(q)) ? [{ tokenNumber: Number(q) }] : []),
      ],
    } : {}),
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: { patient: true, service: true, clinic: true },
    orderBy: [{ appointmentTime: 'asc' }],
  })

  return (
    <>
      <PageHeader
        eyebrow="Appointments"
        title="Appointment control"
        description="Search, filter, update status, and trigger call or WhatsApp actions from one operational table."
        action={<Button href="/admin/walk-ins"><CalendarPlus className="h-4 w-4" /> Add walk-in</Button>}
      />

      <Card className="mb-5 p-4">
        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_160px_160px_auto]">
          <SearchBox defaultValue={q} placeholder="Search name, phone, token" />
          <Input type="date" name="date" defaultValue={date} />
          <Select name="status" defaultValue={status}>
            <option value="">All statuses</option>
            {['pending', 'confirmed', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'].map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
          <Select name="type" defaultValue={type}>
            <option value="">All types</option>
            <option value="new">New</option>
            <option value="follow_up">Follow-up</option>
          </Select>
          <Button type="submit" variant="secondary">Filter</Button>
        </form>
      </Card>

      <Card className="p-0">
        {appointments.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-slate-800 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Token</th>
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => {
                  const message = confirmationMessage({ clinic: appointment.clinic, patient: appointment.patient, appointment, service: appointment.service })
                  return (
                    <tr key={appointment.id} className="border-b border-slate-900/80">
                      <td className="px-4 py-4 font-bold text-white">#{appointment.tokenNumber}</td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-white">{appointment.patient.fullName}</p>
                        <p className="text-xs text-slate-500">{appointment.patient.phone}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-300">{formatDate(appointment.appointmentDate)}<br />{formatTime(appointment.appointmentTime)}</td>
                      <td className="px-4 py-4 text-slate-300">{appointment.service?.title || 'Consultation'}</td>
                      <td className="px-4 py-4"><StatusBadge status={appointment.status} /></td>
                      <td className="px-4 py-4"><Badge>{appointment.source}</Badge></td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button href={`tel:${appointment.patient.phone}`} variant="ghost" size="sm"><Phone className="h-4 w-4" /> Call</Button>
                          <Button href={whatsappLink(appointment.patient.phone, message)} target="_blank" variant="ghost" size="sm">WhatsApp</Button>
                          {['arrived', 'in_progress', 'completed', 'no_show', 'cancelled'].map((nextStatus) => (
                            <form key={nextStatus} action={appointmentStatusAction}>
                              <input type="hidden" name="appointmentId" value={appointment.id} />
                              <input type="hidden" name="status" value={nextStatus} />
                              <button className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-sky-400" type="submit">
                                {nextStatus.replaceAll('_', ' ')}
                              </button>
                            </form>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState title="No appointments found." description="Change filters or add a walk-in appointment." />
          </div>
        )}
      </Card>
    </>
  )
}
