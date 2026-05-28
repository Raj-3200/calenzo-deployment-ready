import { Link } from 'react-router-dom'
import { Bot, CalendarCheck2, Clock3, Ticket, TimerReset } from 'lucide-react'
import { AppointmentCard, Badge, Button, Card, PageHeader, StatCard } from '../../components/common/UI'
import { demoClinic, hydratedAppointments, hydratedQueue } from '../../data/demoData'
import { getPatientQueueSnapshot } from '../../utils/queueCalculator'

export default function PatientDashboard() {
  const patientAppointments = hydratedAppointments.filter((appointment) => appointment.patient_id === 'pat-anjali' || appointment.patient_id === 'pat-neha')
  const nextAppointment = patientAppointments.find((appointment) => ['confirmed', 'arrived', 'in_progress'].includes(appointment.status)) || hydratedAppointments[4]
  const queueItem = hydratedQueue.find((item) => item.appointment_id === nextAppointment.id) || hydratedQueue[4]
  const snapshot = getPatientQueueSnapshot(hydratedQueue, queueItem.appointment_id)

  return (
    <div className="bg-slate-50 py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Patient dashboard"
          title="Your clinic visit, clearly organized."
          description={`Track appointments, queue status, tickets, and support from ${demoClinic.clinic_name}.`}
          action={<Link to="/book"><Button>Book Appointment</Button></Link>}
        />

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Upcoming" value={patientAppointments.filter((item) => item.status === 'confirmed').length} icon={CalendarCheck2} />
          <StatCard label="Patients before you" value={snapshot.patientsBefore} icon={TimerReset} tone="amber" />
          <StatCard label="Estimated wait" value={`${snapshot.estimatedWait}m`} icon={Clock3} tone="cyan" />
          <StatCard label="Tickets" value={patientAppointments.length} icon={Ticket} tone="green" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-950">Next appointment</h2>
              <Badge variant="green">Confirmed</Badge>
            </div>
            <AppointmentCard appointment={nextAppointment} actions={
              <>
                <Link to="/queue"><Button size="sm" variant="secondary">Live Queue</Button></Link>
                <Link to="/patient/ticket"><Button size="sm">View Ticket</Button></Link>
              </>
            } />
          </Card>

          <Card className="p-5">
            <Bot className="h-9 w-9 text-cyan-700" />
            <h2 className="mt-4 text-lg font-black text-slate-950">AI clinic assistant</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Ask about timing, fees, slots, follow-up instructions, or queue status in English, Hindi, or Marathi.
            </p>
            <Link to="/patient/chat" className="mt-5 block">
              <Button className="w-full">Open Assistant</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
