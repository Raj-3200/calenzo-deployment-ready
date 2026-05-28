import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { addDays, format, startOfToday } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Mail, Phone, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  APPOINTMENT_TYPE_META,
  CLINIC_PROFILE,
  DEFAULT_CLINIC_ID,
} from '../../data/constants'
import { demoAppointments, demoClinic, demoPatients, demoServices, hydrateAppointment } from '../../data/demoData'
import { Badge, Button, Card, Input, Stepper, Textarea, TimeSlotSelector, TicketCard, WhatsAppButton } from '../../components/common/UI'
import { calculateArrivalWindow, generateSlots, getNextAvailableDay, isClosedDay, isDuplicateSlot } from '../../utils/slotGenerator'
import { formatDate, formatTime } from '../../utils/formatDate'
import { generateTokenNumber } from '../../utils/tokenGenerator'
import { buildAppointmentTemplate } from '../../utils/whatsappTemplates'

const steps = ['Type', 'Doctor', 'Date', 'Slot', 'Details', 'Confirm']

export default function Booking() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const serviceId = searchParams.get('service')
  const [step, setStep] = useState(0)
  const [appointmentType, setAppointmentType] = useState('new')
  const [selectedServiceId, setSelectedServiceId] = useState(serviceId || demoServices[0].id)
  const [selectedDate, setSelectedDate] = useState(format(startOfToday(), 'yyyy-MM-dd'))
  const [selectedTime, setSelectedTime] = useState('')
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({ full_name: '', age: '', phone: '', email: '', message: '' })
  const [confirmed, setConfirmed] = useState(null)

  const selectedService = demoServices.find((service) => service.id === selectedServiceId)
  const duration = APPOINTMENT_TYPE_META[appointmentType].duration

  const dateOptions = useMemo(() => Array.from({ length: 14 }, (_, index) => {
    const date = addDays(startOfToday(), index)
    const value = format(date, 'yyyy-MM-dd')
    return {
      value,
      label: index === 0 ? 'Today' : format(date, 'EEE, MMM d'),
      closed: isClosedDay(value),
    }
  }), [])

  const slots = useMemo(() => generateSlots({
    date: selectedDate,
    openingTime: CLINIC_PROFILE.opening_time,
    closingTime: CLINIC_PROFILE.closing_time,
    lunchStart: CLINIC_PROFILE.lunch_start,
    lunchEnd: CLINIC_PROFILE.lunch_end,
    appointmentDuration: duration,
    existingAppointments: demoAppointments.map(hydrateAppointment),
  }), [selectedDate, duration])

  function next() {
    const error = validateStep(step)
    if (error) {
      toast.error(error)
      return
    }
    setStep((current) => Math.min(current + 1, steps.length - 1))
  }

  function back() {
    setStep((current) => Math.max(current - 1, 0))
  }

  function validateStep(currentStep) {
    if (currentStep === 2 && !selectedDate) return 'Please select a date'
    if (currentStep === 2 && isClosedDay(selectedDate)) return `Clinic is closed on this day. Next available day is ${formatDate(getNextAvailableDay(selectedDate))}.`
    if (currentStep === 3 && !selectedTime) return 'Please select a time slot'
    if (currentStep === 3 && isDuplicateSlot({ appointments: demoAppointments, clinicId: DEFAULT_CLINIC_ID, date: selectedDate, time: selectedTime })) return 'This slot is no longer available'
    if (currentStep === 4) {
      const nextErrors = {}
      if (!form.full_name.trim()) nextErrors.full_name = 'Please enter patient name'
      if (!String(form.age).trim() || Number(form.age) < 1) nextErrors.age = 'Please enter age'
      if (!/^[0-9+\-\s()]{8,18}$/.test(form.phone.trim())) nextErrors.phone = 'Please enter a valid phone number'
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Please enter a valid email'
      setErrors(nextErrors)
      if (Object.keys(nextErrors).length) return Object.values(nextErrors)[0]
    }
    return ''
  }

  function confirmBooking() {
    const duplicate = isDuplicateSlot({ appointments: demoAppointments, clinicId: DEFAULT_CLINIC_ID, date: selectedDate, time: selectedTime })
    if (duplicate) {
      toast.error('This slot is no longer available')
      return
    }

    const existingPatient = demoPatients.find((patient) => patient.phone.replace(/\D/g, '') === form.phone.replace(/\D/g, ''))
    const patient = existingPatient || {
      id: `pat-${Date.now()}`,
      clinic_id: DEFAULT_CLINIC_ID,
      full_name: form.full_name,
      age: Number(form.age),
      phone: form.phone,
      email: form.email,
      total_visits: 0,
      last_visit: '',
      no_show_count: 0,
      notes: 'Created from public booking.',
      created_at: new Date().toISOString(),
    }

    const tokenNumber = generateTokenNumber(demoAppointments, DEFAULT_CLINIC_ID, selectedDate)
    const window = calculateArrivalWindow(selectedTime)
    const appointment = {
      id: `apt-${Date.now()}`,
      clinic_id: DEFAULT_CLINIC_ID,
      patient_id: patient.id,
      service_id: selectedService.id,
      appointment_type: appointmentType,
      token_number: tokenNumber,
      appointment_date: selectedDate,
      appointment_time: selectedTime,
      arrival_window_start: window.start,
      arrival_window_end: window.end,
      status: 'confirmed',
      source: 'online',
      message: form.message,
      internal_notes: existingPatient ? 'Repeat patient detected by phone.' : 'New patient created.',
      cancellation_reason: '',
      created_at: new Date().toISOString(),
      patient,
      service: selectedService,
    }

    setConfirmed(appointment)
    toast.success('Your appointment is confirmed')
    navigate('/book?confirmed=true', { replace: true })
  }

  if (confirmed) return <BookingConfirmation appointment={confirmed} />

  return (
    <div className="bg-slate-50 py-10 lg:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <Badge variant="cyan" className="mb-4">Patient booking</Badge>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Book your clinic appointment</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Select a type, service, date, and available slot. Calenzo will generate your token and arrival window immediately.
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 bg-white p-4 sm:p-6">
            <Stepper steps={steps} current={step} />
          </div>

          <div className="p-5 sm:p-7">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <Step title="Select appointment type">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.entries(APPOINTMENT_TYPE_META).map(([key, meta]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setAppointmentType(key)
                          setSelectedTime('')
                        }}
                        className={`rounded-2xl border p-5 text-left transition ${appointmentType === key ? 'border-cyan-700 bg-cyan-50 ring-4 ring-cyan-700/10' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-black text-slate-950">{meta.label}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-500">{meta.description}</p>
                          </div>
                          <Badge variant={key === 'new' ? 'cyan' : 'green'}>{meta.duration} min</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </Step>
              )}

              {step === 1 && (
                <Step title="Select service or doctor">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {demoServices.filter((service) => service.status === 'active').map((service) => (
                      <button
                        key={service.id}
                        onClick={() => setSelectedServiceId(service.id)}
                        className={`rounded-2xl border p-5 text-left transition ${selectedServiceId === service.id ? 'border-cyan-700 bg-cyan-50 ring-4 ring-cyan-700/10' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-black text-slate-950">{service.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-500">{service.description}</p>
                          </div>
                          <p className="text-sm font-black text-cyan-800">Rs. {service.price}</p>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <Clock3 className="h-4 w-4 text-cyan-700" />
                          {CLINIC_PROFILE.doctor_name} - {CLINIC_PROFILE.specialization}
                        </div>
                      </button>
                    ))}
                  </div>
                </Step>
              )}

              {step === 2 && (
                <Step title="Select date">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                    {dateOptions.map((date) => (
                      <button
                        key={date.value}
                        onClick={() => {
                          setSelectedDate(date.value)
                          setSelectedTime('')
                        }}
                        className={`rounded-2xl border p-4 text-center transition ${selectedDate === date.value ? 'border-cyan-700 bg-cyan-50 ring-4 ring-cyan-700/10' : 'border-slate-200 bg-white hover:bg-slate-50'} ${date.closed ? 'opacity-50' : ''}`}
                      >
                        <p className="text-sm font-black text-slate-950">{date.label}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{date.closed ? 'Closed' : formatDate(date.value, 'EEEE')}</p>
                      </button>
                    ))}
                  </div>
                  {isClosedDay(selectedDate) && (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                      Clinic is closed on this day. Next available day is {formatDate(getNextAvailableDay(selectedDate))}.
                    </div>
                  )}
                </Step>
              )}

              {step === 3 && (
                <Step title="Select available time slot">
                  <TimeSlotSelector slots={slots} selected={selectedTime} onSelect={setSelectedTime} />
                  {!slots.some((slot) => slot.available) && (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                      No available slots for this date. Please choose another day.
                    </div>
                  )}
                </Step>
              )}

              {step === 4 && (
                <Step title="Enter patient details">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Full name" icon={UserRound} value={form.full_name} error={errors.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} placeholder="Patient full name" />
                    <Input label="Age" type="number" value={form.age} error={errors.age} onChange={(event) => setForm({ ...form, age: event.target.value })} placeholder="Age" />
                    <Input label="Phone number" icon={Phone} value={form.phone} error={errors.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+91 98765 43210" />
                    <Input label="Email optional" icon={Mail} value={form.email} error={errors.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="patient@example.com" />
                    <div className="sm:col-span-2">
                      <Textarea label="Message optional" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Brief note for the clinic" />
                    </div>
                  </div>
                </Step>
              )}

              {step === 5 && (
                <Step title="Confirm appointment">
                  <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <SummaryRow label="Appointment type" value={APPOINTMENT_TYPE_META[appointmentType].label} />
                      <SummaryRow label="Service" value={selectedService.title} />
                      <SummaryRow label="Doctor" value={demoClinic.doctor_name} />
                      <SummaryRow label="Date" value={formatDate(selectedDate)} />
                      <SummaryRow label="Time" value={formatTime(selectedTime)} />
                      <SummaryRow label="Arrival window" value={calculateArrivalWindow(selectedTime).display} />
                      <SummaryRow label="Patient" value={`${form.full_name}, ${form.age}`} />
                      <SummaryRow label="Phone" value={form.phone} />
                    </div>
                    <div className="rounded-2xl bg-cyan-950 p-5 text-white">
                      <CheckCircle2 className="h-9 w-9 text-cyan-300" />
                      <h3 className="mt-4 text-xl font-black">Your appointment is ready to confirm</h3>
                      <p className="mt-3 text-sm leading-6 text-cyan-50/75">
                        After confirmation, Calenzo creates your patient record, token number, arrival window, queue entry, and WhatsApp-ready message.
                      </p>
                    </div>
                  </div>
                </Step>
              )}
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
              <Button variant="secondary" onClick={back} disabled={step === 0}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              {step < steps.length - 1 ? (
                <Button onClick={next}>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={confirmBooking}>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm Appointment
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function Step({ title, children }) {
  return (
    <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.25 }}>
      <h2 className="mb-5 text-lg font-black text-slate-950">{title}</h2>
      {children}
    </motion.div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white py-3 last:border-0">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="max-w-[60%] text-right text-sm font-black text-slate-950">{value}</p>
    </div>
  )
}

function BookingConfirmation({ appointment }) {
  const message = buildAppointmentTemplate('confirmation', {
    appointment,
    patient: appointment.patient,
    clinic: demoClinic,
    service: appointment.service,
  })

  function downloadTicket() {
    window.print()
  }

  return (
    <div className="bg-slate-50 py-10 lg:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-950">Appointment Confirmed</h1>
          <p className="mt-3 text-slate-600">Save this token number. You can check the live queue before leaving home.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <TicketCard appointment={appointment} clinic={demoClinic} patient={appointment.patient} />
          <Card className="p-5">
            <h2 className="text-lg font-black text-slate-950">Next steps</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <SummaryRow label="Token number" value={String(appointment.token_number).padStart(3, '0')} />
              <SummaryRow label="Appointment date" value={formatDate(appointment.appointment_date)} />
              <SummaryRow label="Appointment time" value={formatTime(appointment.appointment_time)} />
              <SummaryRow label="Clinic address" value={demoClinic.address} />
              <SummaryRow label="Contact" value={demoClinic.phone} />
            </div>
            <div className="mt-5 grid gap-3">
              <WhatsAppButton phone={demoClinic.whatsapp_number} message={message}>WhatsApp Clinic</WhatsAppButton>
              <Button variant="secondary" onClick={downloadTicket}>Download Ticket</Button>
              <Link to="/queue">
                <Button variant="dark" className="w-full">Check Live Queue</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
