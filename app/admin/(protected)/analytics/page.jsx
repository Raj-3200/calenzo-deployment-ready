import { BarChart3, CalendarDays, Clock, Repeat, Users } from 'lucide-react'
import { getAnalyticsData } from '@/lib/data'
import { AppointmentTrendChart, SourceBreakdownChart } from '@/components/Charts'
import { Card, EmptyState, PageHeader, StatCard } from '@/components/ui'

export default async function AnalyticsPage() {
  const analytics = await getAnalyticsData()
  const { stats, trend, sourceBreakdown, peakHours, activeDays } = analytics

  return (
    <>
      <PageHeader eyebrow="Analytics" title="Clinic performance" description="Every metric is calculated from appointment, queue, patient, and follow-up records in PostgreSQL." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total appointments" value={stats.totalAppointments} icon={CalendarDays} />
        <StatCard label="Completed" value={stats.completed} icon={Users} tone="green" />
        <StatCard label="Cancelled" value={stats.cancelled} icon={BarChart3} tone="red" />
        <StatCard label="No-shows" value={stats.noShows} icon={Clock} tone="amber" />
        <StatCard label="Pending follow-ups" value={stats.pendingFollowUps} icon={Repeat} tone="violet" />
        <StatCard label="Patient retention" value={`${stats.retention}%`} icon={Users} tone="green" />
        <StatCard label="New appointments" value={stats.newAppointments} icon={CalendarDays} />
        <StatCard label="Follow-up appointments" value={stats.followUpAppointments} icon={Repeat} tone="violet" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <AppointmentTrendChart data={trend} />
        <SourceBreakdownChart data={sourceBreakdown} />
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
