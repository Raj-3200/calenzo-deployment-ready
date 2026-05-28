import { Link } from 'react-router-dom'
import { Button, PageHeader, TicketCard, WhatsAppButton } from '../../components/common/UI'
import { demoClinic, hydratedAppointments } from '../../data/demoData'
import { buildAppointmentTemplate } from '../../utils/whatsappTemplates'

export default function AppointmentTicket() {
  const appointment = hydratedAppointments.find((item) => item.id === 'apt-105') || hydratedAppointments[0]
  const message = buildAppointmentTemplate('confirmation', {
    appointment,
    patient: appointment.patient,
    clinic: demoClinic,
    service: appointment.service,
  })

  return (
    <div className="bg-slate-50 py-10 lg:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Patient ticket"
          title="Appointment Ticket"
          description="Download, print, or share your confirmed appointment details."
          action={<Button onClick={() => window.print()}>Download Ticket</Button>}
        />
        <TicketCard appointment={appointment} patient={appointment.patient} clinic={demoClinic} />
        <div className="no-print mt-5 grid gap-3 sm:grid-cols-3">
          <WhatsAppButton phone={demoClinic.whatsapp_number} message={message}>WhatsApp Clinic</WhatsAppButton>
          <Link to="/queue"><Button variant="secondary" className="w-full">Check Live Queue</Button></Link>
          <Link to="/patient"><Button variant="dark" className="w-full">Patient Dashboard</Button></Link>
        </div>
      </div>
    </div>
  )
}
