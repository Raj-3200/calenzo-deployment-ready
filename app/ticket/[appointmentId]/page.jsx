import { notFound } from 'next/navigation'
import { Calendar, Clock, MapPin, Phone, TicketCheck } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatDate, formatTime } from '@/lib/time'
import { isDatabaseUuid } from '@/lib/validation'
import { confirmationMessage, whatsappLink } from '@/lib/whatsapp'
import { PatientTopbar } from '@/components/PatientTopbar'
import { Button, Card, PageHeader, StatusBadge } from '@/components/ui'
import { PrintButton } from '@/components/PrintButton'

export default async function TicketPage({ params }) {
  const { appointmentId } = await params
  if (!isDatabaseUuid(appointmentId)) notFound()

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { clinic: true, patient: true, service: true },
  })
  if (!appointment) notFound()

  const message = confirmationMessage({
    clinic: appointment.clinic,
    patient: appointment.patient,
    appointment,
    service: appointment.service,
  })

  return (
    <main className="min-h-screen px-3 py-5 sm:px-4 sm:py-8">
      <PatientTopbar />
      <div className="mx-auto max-w-5xl">
        <PageHeader
          eyebrow="Appointment confirmed"
          title="Your appointment is confirmed"
          description="Save this token number. You can check the live queue before leaving home."
          action={<StatusBadge status={appointment.status} />}
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="ticket-print p-4 text-slate-950 sm:p-6">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-500">{appointment.clinic.name}</p>
                <h2 className="mt-2 text-2xl font-black sm:text-3xl">Appointment Ticket</h2>
              </div>
              <div className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-center text-white sm:w-auto">
                <p className="text-xs text-slate-300">Token</p>
                <p className="text-3xl font-black">#{appointment.tokenNumber}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <TicketInfo icon={TicketCheck} label="Patient" value={appointment.patient.fullName} />
              <TicketInfo icon={Calendar} label="Date" value={formatDate(appointment.appointmentDate)} />
              <TicketInfo icon={Clock} label="Appointment time" value={formatTime(appointment.appointmentTime)} />
              <TicketInfo icon={Clock} label="Arrival window" value={`${formatTime(appointment.arrivalWindowStart)} - ${formatTime(appointment.arrivalWindowEnd)}`} />
              <TicketInfo icon={TicketCheck} label="Appointment type" value={appointment.appointmentType === 'follow_up' ? 'Follow-Up Appointment' : 'New Appointment'} />
              <TicketInfo icon={TicketCheck} label="Service" value={appointment.service?.title || 'Consultation'} />
              <TicketInfo icon={MapPin} label="Clinic address" value={appointment.clinic.address} />
              <TicketInfo icon={Phone} label="Contact" value={appointment.clinic.phone} />
            </div>
            <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-sm leading-6 text-slate-600">
              Please arrive inside the arrival window and keep this token ready at reception. Check the live queue before leaving home.
            </div>
          </Card>

          <div className="space-y-3 no-print">
            <Button href={`/queue/${appointment.id}`} className="w-full">Check live queue</Button>
            <PrintButton />
            <Button href={whatsappLink(appointment.clinic.whatsappNumber || appointment.clinic.phone, message)} variant="secondary" className="w-full" target="_blank">WhatsApp clinic</Button>
            <Button href="/patient/dashboard" variant="ghost" className="w-full">Patient dashboard</Button>
          </div>
        </div>
      </div>
    </main>
  )
}

function TicketInfo({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <p className="font-bold text-slate-950">{value || '-'}</p>
    </div>
  )
}
