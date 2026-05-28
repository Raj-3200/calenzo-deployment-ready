import { useMemo } from 'react'
import { hydratedAppointments, hydratedFollowUps, sourceData, serviceDemandData, peakHourData, retentionData, weeklyAppointments } from '../data/demoData'

export function useAnalytics() {
  return useMemo(() => {
    const total = hydratedAppointments.length
    const completed = hydratedAppointments.filter((item) => item.status === 'completed').length
    const cancelled = hydratedAppointments.filter((item) => item.status === 'cancelled').length
    const noShows = hydratedAppointments.filter((item) => item.status === 'no_show').length
    const today = new Date().toISOString().slice(0, 10)
    const todayCount = hydratedAppointments.filter((item) => item.appointment_date === today).length
    const followUpsPending = hydratedFollowUps.filter((item) => !['completed', 'converted', 'lost'].includes(item.status)).length

    return {
      stats: {
        total,
        todayCount,
        completed,
        cancelled,
        noShows,
        followUpsPending,
        averageWait: 18,
        delayFrequency: '22%',
        retention: '68%',
      },
      charts: { sourceData, serviceDemandData, peakHourData, retentionData, weeklyAppointments },
    }
  }, [])
}
