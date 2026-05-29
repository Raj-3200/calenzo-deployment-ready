'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Clock, Languages, Stethoscope, UserRound } from 'lucide-react'
import { createBookingAction, getAvailableSlotsAction } from '@/app/actions'
import { useLanguage } from '@/components/LanguageProvider'
import { BOOKING_COPY, LANGUAGE_OPTIONS, sectionCopy, serviceDisplay } from '@/lib/i18n'
import { Badge, Button, Card, Input, Label, Select, Textarea, cn } from '@/components/ui'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function BookingFlow({ patient, services }) {
  const router = useRouter()
  const { language, setLanguage } = useLanguage()
  const copy = sectionCopy(BOOKING_COPY, language)
  const steps = copy.steps
  const [step, setStep] = useState(0)
  const [appointmentType, setAppointmentType] = useState('new')
  const [serviceId, setServiceId] = useState(services[0]?.id || '')
  const [date, setDate] = useState(today())
  const [time, setTime] = useState('')
  const [slots, setSlots] = useState([])
  const [closedMessage, setClosedMessage] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const [patientForm, setPatientForm] = useState({
    fullName: patient?.fullName || '',
    age: patient?.age || '',
    gender: patient?.gender || '',
    phone: patient?.phone || '',
    email: patient?.email || '',
  })

  const selectedService = useMemo(() => services.find((service) => service.id === serviceId), [services, serviceId])
  const selectedServiceDisplay = serviceDisplay(selectedService, language)
  const appointmentTypeLabel = appointmentType === 'follow_up' ? copy.followUpAppointment : copy.newAppointment
  const appointmentTypeSummary = appointmentType === 'follow_up' ? copy.followUpAppointment.replace(' Appointment', '') : copy.newAppointment.replace(' Appointment', '')

  function chooseSlot(nextTime) {
    setTime(nextTime)
    if (time === nextTime) setStep(5)
  }

  function chooseSlotAndContinue(nextTime) {
    setTime(nextTime)
    setStep(5)
  }

  useEffect(() => {
    let mounted = true
    startTransition(async () => {
      const result = await getAvailableSlotsAction({ date, appointmentType, serviceId })
      if (!mounted) return
      setSlots(result.slots || [])
      if (result.closed) {
        setClosedMessage(copy.closedMessage(result.nextAvailableDate))
      } else if (!result.slots?.length) {
        setClosedMessage(copy.noSlotsDateMessage(result.nextAvailableDate))
      } else {
        setClosedMessage('')
      }
    })
    return () => {
      mounted = false
    }
  }, [appointmentType, copy, date, serviceId])

  function updatePatientField(field, value) {
    setPatientForm((current) => ({ ...current, [field]: value }))
  }

  function submit() {
    setError('')
    startTransition(async () => {
      const result = await createBookingAction({
        appointmentType,
        serviceId,
        date,
        time,
        message,
        patient: patientForm,
      })

      if (result.ok) {
        router.push(`/ticket/${result.appointmentId}`)
      } else {
        setError(result.error || 'Could not create appointment.')
      }
    })
  }

  const canContinue = [
    Boolean(language),
    Boolean(appointmentType),
    Boolean(serviceId),
    Boolean(date),
    Boolean(time),
    Boolean(patientForm.fullName && patientForm.age && patientForm.phone),
    true,
  ][step]

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="p-4 md:p-6">
        <div className="mb-6 grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {steps.map((label, index) => (
            <div key={label} className="min-w-0">
              <div className={cn('h-1.5 rounded-full', index <= step ? 'bg-sky-300' : 'bg-slate-800')} />
              <p className={cn('mt-2 truncate text-xs', index === step ? 'text-sky-200' : 'text-slate-500')}>{label}</p>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 ? (
              <div>
                <h2 className="text-2xl font-bold text-white">{copy.languageTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{copy.languageDescription}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {LANGUAGE_OPTIONS.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        setLanguage(item.code)
                        setStep(1)
                      }}
                      className={cn('rounded-2xl border p-5 text-left transition hover:-translate-y-0.5', language === item.code ? 'border-sky-300 bg-sky-300/10' : 'border-slate-700 bg-slate-950/40 hover:border-slate-500')}
                    >
                      <Languages className="mb-4 h-6 w-6 text-sky-200" />
                      <p className="font-semibold text-white">{item.nativeLabel}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.helper}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div>
                <h2 className="text-2xl font-bold text-white">{copy.typeTitle}</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    { value: 'new', title: copy.newAppointment, subtitle: copy.newSubtitle, icon: Stethoscope },
                    { value: 'follow_up', title: copy.followUpAppointment, subtitle: copy.followUpSubtitle, icon: Clock },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setAppointmentType(item.value)
                        setTime('')
                        setStep(2)
                      }}
                      className={cn('rounded-2xl border p-5 text-left transition hover:-translate-y-0.5', appointmentType === item.value ? 'border-sky-300 bg-sky-300/10' : 'border-slate-700 bg-slate-950/40 hover:border-slate-500')}
                    >
                      <item.icon className="mb-4 h-6 w-6 text-sky-200" />
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.subtitle}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div>
                <h2 className="text-2xl font-bold text-white">{copy.serviceTitle}</h2>
                <div className="mt-5 grid gap-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => {
                        setServiceId(service.id)
                        setTime('')
                        setStep(3)
                      }}
                      className={cn('rounded-2xl border p-4 text-left transition hover:-translate-y-0.5', serviceId === service.id ? 'border-sky-300 bg-sky-300/10' : 'border-slate-700 bg-slate-950/40 hover:border-slate-500')}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{serviceDisplay(service, language).title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-400">{serviceDisplay(service, language).description}</p>
                        </div>
                        <Badge tone="sky">{service.duration} {copy.duration}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div>
                <h2 className="text-2xl font-bold text-white">{copy.dateTitle}</h2>
                <div className="mt-5 max-w-sm">
                  <Label>{copy.dateLabel}</Label>
                  <Input type="date" min={today()} value={date} onChange={(event) => {
                    setDate(event.target.value)
                    setTime('')
                  }} />
                  {closedMessage ? <p className="mt-3 text-sm text-amber-200">{closedMessage}</p> : null}
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div>
                <h2 className="text-2xl font-bold text-white">{copy.timeTitle}</h2>
                {slots.length ? (
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => chooseSlot(slot.time)}
                        onDoubleClick={() => chooseSlotAndContinue(slot.time)}
                        className={cn('h-12 rounded-2xl border text-sm font-semibold transition', time === slot.time ? 'border-sky-300 bg-sky-300 text-slate-950' : 'border-slate-700 bg-slate-950/40 text-slate-200 hover:border-sky-400')}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
                    {isPending ? copy.checkingSlots : copy.noSlots}
                  </div>
                )}
              </div>
            ) : null}

            {step === 5 ? (
              <div>
                <h2 className="text-2xl font-bold text-white">{copy.detailsTitle}</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>{copy.fullName}</Label>
                    <Input value={patientForm.fullName} onChange={(event) => updatePatientField('fullName', event.target.value)} />
                  </div>
                  <div>
                    <Label>{copy.age}</Label>
                    <Input type="number" value={patientForm.age} onChange={(event) => updatePatientField('age', event.target.value)} />
                  </div>
                  <div>
                    <Label>{copy.phone}</Label>
                    <Input value={patientForm.phone} onChange={(event) => updatePatientField('phone', event.target.value)} />
                  </div>
                  <div>
                    <Label>{copy.gender}</Label>
                    <Select value={patientForm.gender || ''} onChange={(event) => updatePatientField('gender', event.target.value)}>
                      <option value="">{copy.genderSelect}</option>
                      <option value="Female">{copy.genderFemale}</option>
                      <option value="Male">{copy.genderMale}</option>
                      <option value="Other">{copy.genderOther}</option>
                      <option value="Prefer not to say">{copy.genderPrivate}</option>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>{copy.messageForClinic}</Label>
                    <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder={copy.optional} />
                  </div>
                </div>
              </div>
            ) : null}

            {step === 6 ? (
              <div>
                <h2 className="text-2xl font-bold text-white">{copy.confirmTitle}</h2>
                <div className="mt-5 grid gap-3">
                  {[
                    [copy.patient, patientForm.fullName],
                    [copy.type, appointmentTypeLabel],
                    [copy.service, selectedServiceDisplay.title],
                    [copy.date, date],
                    [copy.time, time],
                    [copy.phone, patientForm.phone],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                      <span className="text-sm text-slate-400">{label}</span>
                      <span className="text-sm font-semibold text-white">{value}</span>
                    </div>
                  ))}
                  {error ? <p className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p> : null}
                </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button variant="secondary" type="button" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>
            {copy.back}
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" disabled={!canContinue || isPending} onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}>
              {copy.continue}
            </Button>
          ) : (
            <Button type="button" disabled={isPending} onClick={submit}>
              {isPending ? copy.confirming : copy.confirmAppointment}
            </Button>
          )}
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-200">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-white">{patientForm.fullName || copy.patient}</p>
              <p className="text-sm text-slate-400">{patientForm.phone || copy.savedPhone}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-sky-200" />
            <p className="font-semibold text-white">{copy.summaryTitle}</p>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-3 text-slate-400"><span>{copy.type}</span><span className="text-white">{appointmentTypeSummary}</span></div>
            <div className="flex justify-between gap-3 text-slate-400"><span>{copy.service}</span><span className="text-right text-white">{selectedServiceDisplay.title || copy.selectService}</span></div>
            <div className="flex justify-between gap-3 text-slate-400"><span>{copy.date}</span><span className="text-white">{date}</span></div>
            <div className="flex justify-between gap-3 text-slate-400"><span>{copy.time}</span><span className="text-white">{time || copy.selectSlot}</span></div>
          </div>
          <div className="mt-5 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-3 text-sm leading-6 text-sky-100">
            {copy.tokenNote}
          </div>
        </Card>
      </div>
    </div>
  )
}
