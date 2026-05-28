'use client'

import { useEffect, useState } from 'react'
import { Check, Clock3, RotateCcw, SkipForward, UserCheck, X } from 'lucide-react'
import { addDelayAction, queueCommandAction } from '@/app/actions'
import { Badge, Button, Card, EmptyState, StatusBadge } from '@/components/ui'

const groups = [
  ['inProgress', 'In progress'],
  ['arrived', 'Arrived'],
  ['waiting', 'Waiting'],
  ['skipped', 'Skipped'],
  ['completed', 'Completed'],
  ['cancelled', 'Cancelled'],
]

export function AdminQueueLive({ initialSnapshot }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot)
  const items = snapshot?.items || []

  useEffect(() => {
    const eventSource = new EventSource('/api/queue/stream?initial=0', { withCredentials: true })
    eventSource.onmessage = (event) => setSnapshot(JSON.parse(event.data))
    return () => eventSource.close()
  }, [])

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="space-y-5">
        <Card className="p-5">
          <p className="text-sm text-slate-400">Current token</p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="text-6xl font-bold text-white">{snapshot?.currentToken ? `#${snapshot.currentToken}` : '-'}</p>
            <Badge tone={snapshot?.delayMinutes ? 'amber' : 'green'}>
              {snapshot?.delayMinutes ? `${snapshot.delayMinutes} min delay` : 'On time'}
            </Badge>
          </div>
          <p className="mt-3 text-sm text-slate-400">Next token: {snapshot?.nextToken ? `#${snapshot.nextToken}` : 'No waiting patient'}</p>
        </Card>

        <Card className="p-5">
          <p className="font-semibold text-white">Delay control</p>
          <form action={addDelayAction} className="mt-4 flex gap-2">
            <input name="minutes" type="number" min="1" defaultValue="15" className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950/50 px-3 text-sm text-white outline-none focus:border-sky-300" />
            <Button type="submit" variant="secondary">Add</Button>
          </form>
          <p className="mt-3 text-xs leading-5 text-slate-500">Delay alerts are stored as WhatsApp-ready notifications for every active queue item.</p>
        </Card>
      </div>

      <div className="space-y-5">
        {items.length ? groups.map(([key, label]) => {
          const groupItems = snapshot?.groups?.[key] || []
          if (!groupItems.length) return null
          return (
            <Card key={key} className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">{label}</h2>
                <Badge>{groupItems.length}</Badge>
              </div>
              <div className="grid gap-3">
                {groupItems.map((item) => (
                  <QueueRow key={item.id} item={item} />
                ))}
              </div>
            </Card>
          )
        }) : <EmptyState title="No patients waiting." description="Confirmed appointments and walk-ins appear here automatically." />}
      </div>
    </div>
  )
}

function QueueRow({ item }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/10 text-lg font-bold text-sky-100">
            #{item.tokenNumber}
          </div>
          <div>
            <p className="font-semibold text-white">{item.patient?.fullName}</p>
            <p className="text-sm text-slate-400">{item.appointment?.service?.title || 'Consultation'} - {item.estimatedWaitTime || 0} min wait</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={item.status} />
          <Command item={item} command="arrived" label="Arrived" icon={UserCheck} />
          <Command item={item} command="start" label="Start" icon={Clock3} />
          <Command item={item} command="complete" label="Complete" icon={Check} />
          <Command item={item} command="skip" label="Skip" icon={SkipForward} />
          <Command item={item} command="recall" label="Recall" icon={RotateCcw} />
          <Command item={item} command="cancel" label="Cancel" icon={X} danger />
        </div>
      </div>
    </div>
  )
}

function Command({ item, command, label, icon: Icon, danger = false }) {
  return (
    <form action={queueCommandAction}>
      <input type="hidden" name="queueItemId" value={item.id} />
      <input type="hidden" name="command" value={command} />
      <button
        type="submit"
        title={label}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl border transition active:scale-95 ${danger ? 'border-red-400/30 bg-red-400/10 text-red-200 hover:bg-red-400/20' : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-sky-400/60 hover:text-sky-100'}`}
      >
        <Icon className="h-4 w-4" />
      </button>
    </form>
  )
}
