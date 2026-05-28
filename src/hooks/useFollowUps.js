import { useMemo, useState } from 'react'
import { hydratedFollowUps } from '../data/demoData'

export function useFollowUps(initial = hydratedFollowUps) {
  const [followUps, setFollowUps] = useState(initial)

  const pending = useMemo(() => followUps.filter((item) => !['completed', 'converted', 'lost'].includes(item.status)), [followUps])

  function updateFollowUp(id, patch) {
    setFollowUps((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item))
  }

  return { followUps, pending, setFollowUps, updateFollowUp }
}
