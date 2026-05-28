import { useMemo, useState } from 'react'
import { demoServices } from '../data/demoData'

export function useServices(initial = demoServices) {
  const [services, setServices] = useState(initial)
  const activeServices = useMemo(() => services.filter((service) => service.status === 'active'), [services])

  function upsertService(service) {
    setServices((current) => {
      if (!service.id) return [{ ...service, id: `srv-${Date.now()}` }, ...current]
      return current.map((entry) => entry.id === service.id ? { ...entry, ...service } : entry)
    })
  }

  return { services, activeServices, setServices, upsertService }
}
