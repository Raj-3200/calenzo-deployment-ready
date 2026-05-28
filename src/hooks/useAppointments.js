import { useMemo, useState } from 'react'
import { hydratedAppointments } from '../data/demoData'

export function useAppointments(initial = hydratedAppointments) {
  const [appointments, setAppointments] = useState(initial)

  const todayAppointments = useMemo(() => appointments.filter((appointment) => {
    const today = new Date().toISOString().slice(0, 10)
    return appointment.appointment_date === today
  }), [appointments])

  function updateAppointment(id, patch) {
    setAppointments((current) => current.map((appointment) => (
      appointment.id === id ? { ...appointment, ...patch } : appointment
    )))
  }

  function addAppointment(appointment) {
    setAppointments((current) => [{ ...appointment, id: appointment.id || `apt-${Date.now()}` }, ...current])
  }

  return { appointments, todayAppointments, setAppointments, updateAppointment, addAppointment }
}
