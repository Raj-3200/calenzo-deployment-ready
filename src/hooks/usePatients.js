import { useMemo, useState } from 'react'
import { demoPatients } from '../data/demoData'

export function usePatients(initial = demoPatients) {
  const [patients, setPatients] = useState(initial)

  const repeatPatients = useMemo(() => patients.filter((patient) => patient.total_visits > 1), [patients])

  function upsertPatient(patient) {
    setPatients((current) => {
      const match = current.find((entry) => normalize(entry.phone) === normalize(patient.phone))
      if (!match) return [{ ...patient, id: patient.id || `pat-${Date.now()}` }, ...current]
      return current.map((entry) => entry.id === match.id ? { ...entry, ...patient } : entry)
    })
  }

  return { patients, repeatPatients, setPatients, upsertPatient }
}

function normalize(phone) {
  return String(phone || '').replace(/\D/g, '')
}
