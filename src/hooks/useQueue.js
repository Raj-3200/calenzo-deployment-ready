import { useMemo, useState } from 'react'
import { hydratedQueue } from '../data/demoData'
import { recalculateQueue } from '../utils/queueCalculator'

export function useQueue(initial = hydratedQueue) {
  const [queue, setQueue] = useState(initial)

  const current = useMemo(() => queue.find((item) => item.current_status === 'in_progress'), [queue])
  const next = useMemo(() => queue.find((item) => item.current_status === 'waiting'), [queue])

  function updateQueueItem(id, patch) {
    setQueue((currentQueue) => recalculateQueue(currentQueue.map((item) => (
      item.id === id ? { ...item, ...patch, updated_at: new Date().toISOString() } : item
    )), currentQueue[0]?.delay_minutes || 0))
  }

  function addDelay(minutes) {
    setQueue((currentQueue) => recalculateQueue(currentQueue, minutes))
  }

  function moveNext() {
    setQueue((currentQueue) => {
      let promoted = false
      return recalculateQueue(currentQueue.map((item) => {
        if (item.current_status === 'in_progress') return { ...item, current_status: 'completed' }
        if (!promoted && ['arrived', 'waiting'].includes(item.current_status)) {
          promoted = true
          return { ...item, current_status: 'in_progress' }
        }
        return item
      }), currentQueue[0]?.delay_minutes || 0)
    })
  }

  return { queue, setQueue, current, next, updateQueueItem, addDelay, moveNext }
}
