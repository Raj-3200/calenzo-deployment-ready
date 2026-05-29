import { redirect } from 'next/navigation'
import { CalendarCheck2, Clock, Ticket } from 'lucide-react'
import { getSession } from '@/lib/auth'
import { getPatientForUser } from '@/lib/data'
import { prisma } from '@/lib/prisma'
import { formatDate, formatTime } from '@/lib/time'
import { AIAssistant } from '@/components/AIAssistant'
import { PatientTopbar } from '@/components/PatientTopbar'
import { Button, Card, EmptyState, PageHeader, StatusBadge } from '@/components/ui'

export default async function PatientDashboardPage() {
  const session = await getSession()
  if (!session?.user?.id) redirect('/patient/login')

  const linkedPatient = await getPatientForUser(session.user)
  if (!linkedPatient) redirect('/patient/profile')

  const patient = await prisma.patient.findUnique({
    where: { id: linkedPatient.id },
    include: {
      appointments: {
        include: { service: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
      },
    },
  })

  if (!patient) redirect('/patient/profile')

  return (
    <main className="min-h-screen px-3 py-5 sm:px-4 sm:py-8">
      <PatientTopbar />
      <div className="mx-auto max-w-6xl">
        <PageHeader
          eyebrow="Patient dashboard"
          title={`Hello, ${patient.fullName}`}
          description="Your saved details, appointment history, tickets, and live queue links stay together here."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button href="/book">Book appointment</Button>
              <AIAssistant />
            </div>
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CalendarCheck2 className="mb-4 h-5 w-5 text-sky-200" /><p className="text-sm text-slate-400">Total visits</p><p className="mt-1 text-3xl font-bold text-white">{patient.totalVisits}</p></Card>
          <Card><Clock className="mb-4 h-5 w-5 text-sky-200" /><p className="text-sm text-slate-400">Last visit</p><p className="mt-1 text-lg font-bold text-white">{patient.lastVisit ? formatDate(patient.lastVisit) : 'Not visited yet'}</p></Card>
          <Card><Ticket className="mb-4 h-5 w-5 text-sky-200" /><p className="text-sm text-slate-400">No-shows</p><p className="mt-1 text-3xl font-bold text-white">{patient.noShowCount}</p></Card>
        </div>
        <Card className="mt-5 p-5">
          <h2 className="mb-4 text-xl font-bold text-white">My appointments</h2>
          {patient.appointments.length ? (
            <div className="grid gap-3">
              {patient.appointments.map((appointment) => (
                <div key={appointment.id} className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-white">#{appointment.tokenNumber} - {appointment.service?.title || 'Consultation'}</p>
                    <p className="mt-1 text-sm text-slate-400">{formatDate(appointment.appointmentDate)} at {formatTime(appointment.appointmentTime)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={appointment.status} />
                    <Button href={`/ticket/${appointment.id}`} variant="secondary" size="sm" className="flex-1 sm:flex-none">Ticket</Button>
                    <Button href={`/queue/${appointment.id}`} variant="secondary" size="sm" className="flex-1 sm:flex-none">Live queue</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No appointments yet." description="Your bookings will appear here after confirmation." action={<Button href="/book">Book now</Button>} />
          )}
        </Card>
      </div>
    </main>
  )
}
