'use client'

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui'

const tooltipStyle = {
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: 16,
  color: '#f8fafc',
}

export function AppointmentTrendChart({ data }) {
  return (
    <Card className="h-80 p-5">
      <h2 className="mb-5 text-lg font-bold text-white">Appointment trend</h2>
      {data?.length ? (
        <ResponsiveContainer width="100%" height="82%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="calenzoTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e293b" vertical={false} />
            <XAxis dataKey="date" stroke="#64748b" tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="appointments" stroke="#38bdf8" strokeWidth={3} fill="url(#calenzoTrend)" />
            <Area type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} fill="transparent" />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-56 items-center justify-center text-sm text-slate-500">No data available yet.</div>
      )}
    </Card>
  )
}

export function SourceBreakdownChart({ data }) {
  return (
    <Card className="h-80 p-5">
      <h2 className="mb-5 text-lg font-bold text-white">Source breakdown</h2>
      {data?.some((item) => item.count > 0) ? (
        <ResponsiveContainer width="100%" height="82%">
          <BarChart data={data}>
            <CartesianGrid stroke="#1e293b" vertical={false} />
            <XAxis dataKey="source" stroke="#64748b" tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" fill="#8b5cf6" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-56 items-center justify-center text-sm text-slate-500">No data available yet.</div>
      )}
    </Card>
  )
}
