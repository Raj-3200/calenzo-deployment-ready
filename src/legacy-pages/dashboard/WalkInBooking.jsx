import { useMemo, useState } from 'react'
import { CheckCircle2, UserRoundPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge, Button, Card, Input, PageHeader, Select, Textarea, TicketCard } from '../../components/common/UI'
import { APPOINTMENT_TYPE_META, DEFAULT_CLINIC_ID } from '../../data/constants'
import { demoAppointments, demoClinic, demoServices } from '../../data/demoData'
import { allocateNearestSlot, calculateArrivalWindow, generateSlots } from '../../utils/slotGenerator'
import { generateTokenNumber } from '../../utils/tokenGenerator'
import { formatDate } from '../../utils/formatDate'

export default function WalkInBooking() {
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    full_name: '',
    age: '',
    phone: '',
    appointment_type: 'new',
    service_id: demoServices[0].id,
    notes: '',
  })
  const [ticket, setTicket] = useState(null)

  const service = demoServices.find((item) => item.id === form.service_id)
  const slots = useMemo(() => generateSlots({
    date: today,
    openingTime: demoClinic.opening_time,
    closingTime: demoClinic.closing_time,
    lunchStart: demoClinic.lunch_start,
    lunchEnd: demoClinic.lunch_end,
    appointmentDuration: APPOINTMENT_TYPE_META[form.appointment_type].duration,
    existingAppointments: demoAppointments,
  }), [form.appointment_type, today])

  function addWalkIn(event) {
    event.preventDefault()
    if (!form.full_name || !form.phone || !form.age) {
      toast.error('Please complete walk-in patient details')
      return
    }
    const slot = allocateNearestSlot({ slots })
    if (!slot) {
      toast.error('No slot available today')
      return
    }
    const tokenNumber = generateTokenNumber(demoAppointments, DEFAULT_CLINIC_ID, today)
    const window = calculateArrivalWindow(slot.time)
    const patient = {
      id: `pat-${Date.now()}`,
      full_name: form.full_name,
      age: Number(form.age),
      phone: form.phone,
      email: '',
    }
    const appointment = {
      id: `apt-${Date.now()}`,
      clinic_id: DEFAULT_CLINIC_ID,
      patient_id: patient.id,
      service_id: service.id,
      appointment_type: form.appointment_type,
      token_number: tokenNumber,
      appointment_date: today,
      appointment_time: slot.time,
      arrival_window_start: window.start,
      arrival_window_end: window.end,
      status: 'confirmed',
      source: 'walk_in',
      internal_notes: form.notes,
      patient,
      service,
    }
    setTicket(appointment)
    toast.success(`Walk-in token ${String(tokenNumber).padStart(3, '0')} generated`)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Reception"
        title="Walk-In Booking"
        description="Add walk-in patients without breaking scheduling logic. Calenzo allocates the nearest available slot and generates a token."
      />
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="p-5">
          <form onSubmit={addWalkIn} className="space-y-4">
            <Input label="Full name" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} />
            <Input label="Age" type="number" value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} />
            <Input label="Phone number" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            <Select label="Appointment type" value={form.appointment_type} onChange={(event) => setForm({ ...form, appointment_type: event.target.value })} options={Object.entries(APPOINTMENT_TYPE_META).map(([value, meta]) => ({ value, label: meta.label }))} />
            <Select label="Service / Doctor" value={form.service_id} onChange={(event) => setForm({ ...form, service_id: event.target.value })} options={demoServices.map((item) => ({ value: item.id, label: item.title }))} />
            <Textarea label="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            <Button type="submit" className="w-full"><UserRoundPlus className="h-4 w-4" />Generate Walk-In Token</Button>
          </form>
        </Card>

        <div>
          {ticket ? (
            <div>
              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
                <CheckCircle2 className="h-5 w-5" />
                Walk-in added for {formatDate(today)}
              </div>
              <TicketCard appointment={ticket} patient={ticket.patient} clinic={demoClinic} />
            </div>
          ) : (
            <Card className="p-6">
              <Badge variant="cyan" className="mb-5">Next available slot</Badge>
              <p className="text-5xl font-black text-slate-950">{slots.find((slot) => slot.available)?.display || 'Full'}</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">The generated walk-in appointment will use this nearest available slot, add a queue record, and store an audit log in production.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
