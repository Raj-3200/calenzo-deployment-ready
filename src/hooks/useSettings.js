import { useState } from 'react'
import { CLINIC_PROFILE } from '../data/constants'

export function useSettings(initial = CLINIC_PROFILE) {
  const [settings, setSettings] = useState(initial)

  function updateSettings(patch) {
    setSettings((current) => ({ ...current, ...patch }))
  }

  return { settings, updateSettings, setSettings }
}
