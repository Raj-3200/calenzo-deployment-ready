import { BarChart3, CalendarDays, Clock, Repeat, Users } from 'lucide-react'
import { getClinic, getDashboardData } from '@/lib/data'
import { prisma } from '@/lib/prisma'
import { dateToInput, timeToInput } from '@/lib/time'
import { AppointmentTrendChart, SourceBreakdownChart } from '@/components/Charts'
import { Card, EmptyState, PageHeader, StatCard } from '@/components/ui'

export default async function AnalyticsPage() {
  const clinic = await getClinic()
  const dashboard = await getDashboardData()
  const appointments = await prisma.appointment.findMany({
    where: { clinicId: clinic.id },
    include: { patient: true, service: true },
  })
  const patients = await prisma.patient.findMany({ where: { clinicId: clinic.id } })
  const followUps = await prisma.followUp.findMany({ where: { clinicId: clinic.id } })

  const completed = appointments.filter((item) => item.status === 'completed').length
  const cancelled = appointments.filter((item) => item.status === 'cancelled').length
  const noShows = appointments.filter((item) => item.status === 'no_show').length
  const retention = patients.length ? Math.round((patients.filter((patient) => patient.totalVisits > 1).length / patients.length) * 100) : 0
  const peakHours = Object.entries(appointments.reduce((acc, item) => {
    const hour = timeToInput(item.appointmentTime).slice(0, 2)
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const activeDays = Object.entries(appointments.reduce((acc, item) => {
    const date = dateToInput(item.appointmentDate)
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <>
      <PageHeader eyebrow="Analytics" title="Clinic performance" description="Every metric is calculated from appointment, queue, patient, and follow-up records in PostgreSQL." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total appointments" value={appointments.length} icon={CalendarDays} />
        <StatCard label="Completed" value={completed} icon={Users} tone="green" />
        <StatCard label="Cancelled" value={cancelled} icon={BarChart3} tone="red" />
        <StatCard label="No-shows" value={noShows} icon={Clock} tone="amber" />
        <StatCard label="Pending follow-ups" value={followUps.filter((item) => ['new', 'contacted', 'follow_up_needed'].includes(item.status)).length} icon={Repeat} tone="violet" />
        <StatCard label="Patient retention" value={`${retention}%`} icon={Users} tone="green" />
        <StatCard label="New appointments" value={appointments.filter((item) => item.appointmentType === 'new').length} icon={CalendarDays} />
        <StatCard label="Follow-up appointments" value={appointments.filter((item) => item.appointmentType === 'follow_up').length} icon={Repeat} tone="violet" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <AppointmentTrendChart data={dashboard.trend} />
        <SourceBreakdownChart data={dashboard.sourceBreakdown} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold text-white">Peak booking hours</h2>
          {peakHours.length ? peakHours.map(([hour, count]) => (
            <div key={hour} className="mb-2 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
              <span className="text-slate-300">{hour}:00</span>
              <span className="font-bold text-white">{count}</span>
            </div>
          )) : <EmptyState title="No data available yet." />}
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold text-white">Most active days</h2>
          {activeDays.length ? activeDays.map(([date, count]) => (
            <div key={date} className="mb-2 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
              <span className="text-slate-300">{date}</span>
              <span className="font-bold text-white">{count}</span>
            </div>
          )) : <EmptyState title="No data available yet." />}
        </Card>
      </div>
    </>
  )
}
