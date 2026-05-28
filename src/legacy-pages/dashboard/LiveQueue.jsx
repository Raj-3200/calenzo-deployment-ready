import { useState } from 'react'
import { AlertTriangle, Megaphone, RotateCcw, SkipForward, StepForward, TimerReset } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Card, PageHeader, QueueCard, StatusBadge } from '../../components/common/UI'
import { useQueue } from '../../hooks/useQueue'
import { getDelayImpact } from '../../utils/queueCalculator'
import { getFormattedToken } from '../../utils/tokenGenerator'

export default function LiveQueue() {
  const { queue, current, next, updateQueueItem, addDelay, moveNext } = useQueue()
  const [delay, setDelay] = useState(15)
  const impact = getDelayImpact(queue, Number(delay))

  function applyDelay() {
    addDelay(Number(delay))
    toast.success(`Delay updated by ${delay} minutes`)
  }

  function action(id, status, label) {
    updateQueueItem(id, { current_status: status })
    toast.success(label)
  }

  const groups = {
    Waiting: queue.filter((item) => item.current_status === 'waiting'),
    Arrived: queue.filter((item) => item.current_status === 'arrived'),
    Skipped: queue.filter((item) => item.current_status === 'skipped'),
    Completed: queue.filter((item) => item.current_status === 'completed'),
  }

  return (
    <div>
      <PageHeader
        eyebrow="Real-time operations"
        title="Live Queue"
        description="Move tokens, skip absent patients, recall skipped tokens, add delays, and preview how delay affects upcoming patients."
        action={<Button onClick={moveNext}><StepForward className="h-4 w-4" />Move Next</Button>}
      />

      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="overflow-hidden">
          <div className="bg-slate-950 p-6 text-white">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">Current token</p>
            <p className="mt-3 text-7xl font-black">{getFormattedToken(current?.token_number || 0)}</p>
            <p className="mt-2 text-slate-400">{current?.patient?.full_name || 'No patient in consultation'}</p>
          </div>
          <div className="p-5">
            <h2 className="text-lg font-black text-slate-950">Next patient</h2>
            {next ? (
              <div className="mt-4">
                <QueueCard item={next} actions={
                  <>
                    <Button size="sm" onClick={() => action(next.id, 'arrived', 'Patient marked arrived')}>Arrived</Button>
                    <Button size="sm" variant="secondary" onClick={() => action(next.id, 'skipped', 'Token skipped')}><SkipForward className="h-4 w-4" />Skip</Button>
                  </>
                } />
              </div>
            ) : <p className="mt-3 text-sm text-slate-500">No waiting patient.</p>}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">Delay control</h2>
              <p className="mt-1 text-sm text-slate-500">Preview affected patients before sending alerts.</p>
            </div>
            <div className="flex gap-2">
              <input value={delay} onChange={(event) => setDelay(event.target.value)} type="number" className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <Button onClick={applyDelay}><TimerReset className="h-4 w-4" />Apply</Button>
              <Button variant="secondary" onClick={() => toast.success('Delay alert template generated')}><Megaphone className="h-4 w-4" />Alert</Button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {impact.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-black text-slate-950">Token {getFormattedToken(item.token_number)}</p>
                  <StatusBadge type="queue" status={item.current_status} />
                </div>
                <p className="mt-2 text-sm text-slate-500">{item.patient.full_name}</p>
                <p className="mt-3 text-sm font-bold text-amber-700">New wait: {item.new_wait_time} minutes</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-4">
        {Object.entries(groups).map(([title, items]) => (
          <Card key={title} className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-black text-slate-950">{title}</h2>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-500">{items.length}</span>
            </div>
            <div className="space-y-3">
              {items.map((item) => (
                <QueueCard key={item.id} item={item} actions={
                  title === 'Skipped' ? (
                    <Button size="sm" variant="secondary" onClick={() => action(item.id, 'waiting', 'Skipped token recalled')}><RotateCcw className="h-4 w-4" />Recall</Button>
                  ) : title === 'Waiting' ? (
                    <Button size="sm" variant="secondary" onClick={() => action(item.id, 'skipped', 'Token skipped')}><SkipForward className="h-4 w-4" />Skip</Button>
                  ) : null
                } />
              ))}
              {!items.length && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                  <AlertTriangle className="mx-auto mb-2 h-5 w-5" />
                  Empty
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
