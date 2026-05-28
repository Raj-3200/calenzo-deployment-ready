'use client'

import { useEffect, useState } from 'react'
import { Clock, Radio, RefreshCcw } from 'lucide-react'
import { Badge, Card, StatusBadge } from '@/components/ui'

function formatClinicTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  const totalMinutes = (date.getUTCHours() * 60) + date.getUTCMinutes() + 330
  const minutesInDay = ((totalMinutes % 1440) + 1440) % 1440
  const hours = Math.floor(minutesInDay / 60)
  const minutes = minutesInDay % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function QueueLive({ initialSnapshot, appointmentId }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const eventSource = new EventSource(`/api/queue/stream?appointmentId=${appointmentId}&initial=0`)
    eventSource.onopen = () => setConnected(true)
    eventSource.onerror = () => setConnected(false)
    eventSource.onmessage = (event) => {
      setSnapshot(JSON.parse(event.data))
    }
    return () => eventSource.close()
  }, [appointmentId])

  const appointment = snapshot?.appointment
  const status = appointment?.status || 'confirmed'

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-sm text-sky-100">
              <Radio className="h-4 w-4" />
              {connected ? 'Live queue connected' : 'Reconnecting queue'}
            </div>
            <h1 className="text-3xl font-bold text-white">Your live queue status</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Check this before leaving home. The clinic queue updates when reception moves patients through the day.</p>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
            <p className="text-sm text-slate-400">Current active token</p>
            <p className="mt-3 text-5xl font-bold text-white">{snapshot?.currentToken ? `#${snapshot.currentToken}` : '-'}</p>
          </div>
          <div className="rounded-2xl border border-sky-400/30 bg-sky-400/10 p-5 queue-pulse">
            <p className="text-sm text-sky-100">Your token number</p>
            <p className="mt-3 text-5xl font-bold text-white">#{snapshot?.patientToken || '-'}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
            <p className="text-sm text-slate-400">Patients before you</p>
            <p className="mt-3 text-5xl font-bold text-white">{snapshot?.patientsBefore ?? 0}</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/45 p-5">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 text-sky-200" />
            <div>
              <p className="font-semibold text-white">
                {snapshot?.patientsBefore > 0 ? `You are ${snapshot.patientsBefore} patients away.` : 'You are close in the queue.'}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Estimated waiting time is {snapshot?.estimatedWaitTime || 0} minutes.
                {snapshot?.delayMinutes ? ` Doctor is running ${snapshot.delayMinutes} minutes late.` : ' No delay has been added right now.'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-semibold text-sky-300">Appointment</p>
        <div className="mt-4 space-y-3 text-sm">
          <Info label="Patient" value={appointment?.patient?.fullName} />
          <Info label="Service" value={appointment?.service?.title} />
          <Info label="Token" value={appointment?.tokenNumber ? `#${appointment.tokenNumber}` : '-'} />
          <Info label="Last updated" value={formatClinicTime(snapshot?.lastUpdated)} />
        </div>
        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/45 p-3 text-sm text-slate-400">
          <RefreshCcw className="h-4 w-4 text-sky-200" />
          Updates automatically every few seconds.
        </div>
      </Card>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-white">{value || '-'}</span>
    </div>
  )
}

export function MiniQueueStatus({ snapshot }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Current token</p>
          <p className="mt-1 text-3xl font-bold text-white">{snapshot?.currentToken ? `#${snapshot.currentToken}` : '-'}</p>
        </div>
        <Badge tone={snapshot?.delayMinutes ? 'amber' : 'green'}>
          {snapshot?.delayMinutes ? `${snapshot.delayMinutes} min delay` : 'On time'}
        </Badge>
      </div>
    </Card>
  )
}
