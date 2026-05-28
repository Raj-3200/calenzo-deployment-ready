import { Link } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { AppointmentCard, Button, EmptyState, PageHeader } from '../../components/common/UI'
import { hydratedAppointments } from '../../data/demoData'

export default function MyAppointments() {
  const appointments = hydratedAppointments.filter((appointment) => ['pat-anjali', 'pat-neha'].includes(appointment.patient_id))

  return (
    <div className="bg-slate-50 py-10 lg:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Patient"
          title="My Appointments"
          description="Past and upcoming appointment history linked by your patient profile."
          action={<Link to="/book"><Button>Book Again</Button></Link>}
        />
        {appointments.length ? (
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} actions={
                <Link to="/patient/ticket"><Button size="sm" variant="secondary">Ticket</Button></Link>
              } />
            ))}
          </div>
        ) : (
          <EmptyState icon={CalendarDays} title="No appointments yet" description="Your appointments will appear here after booking." />
        )}
      </div>
    </div>
  )
}
