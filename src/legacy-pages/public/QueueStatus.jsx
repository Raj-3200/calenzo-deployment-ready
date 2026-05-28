import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Clock3, LocateFixed, RefreshCcw, Search, TimerReset } from 'lucide-react'
import { Badge, Button, Card, Input, StatusBadge } from '../../components/common/UI'
import { demoClinic, hydratedQueue } from '../../data/demoData'
import { formatLastUpdated, formatTime } from '../../utils/formatDate'
import { getPatientQueueSnapshot } from '../../utils/queueCalculator'
import { getQueueStatusMessage, getFormattedToken, suggestArrivalTime } from '../../utils/tokenGenerator'

export default function QueueStatus() {
  const [token, setToken] = useState('005')
  const [refreshing, setRefreshing] = useState(false)

  const queueItem = useMemo(() => {
    const numeric = Number(String(token).replace(/\D/g, '')) || 5
    return hydratedQueue.find((item) => item.token_number === numeric) || hydratedQueue[4] || hydratedQueue[0]
  }, [token])

  const snapshot = getPatientQueueSnapshot(hydratedQueue, queueItem?.appointment_id)
  const message = getQueueStatusMessage({
    positionInQueue: snapshot.item?.position,
    estimatedWaitTime: snapshot.estimatedWait,
    delayMinutes: snapshot.delayMinutes,
    status: snapshot.item?.current_status,
  })

  function refresh() {
    setRefreshing(true)
    window.setTimeout(() => setRefreshing(false), 700)
  }

  return (
    <div className="bg-slate-50 py-10 lg:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <Badge variant="cyan" className="mb-4">Virtual window</Badge>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Check live queue before leaving home</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Enter your token number to see current active token, patients before you, delay status, and suggested arrival time.
          </p>
        </div>

        <div className="mx-auto mb-6 max-w-xl">
          <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex-1">
              <Input aria-label="Token number" icon={Search} value={token} onChange={(event) => setToken(event.target.value)} placeholder="Enter token number" className="border-0 focus:ring-0" />
            </div>
            <Button onClick={refresh} className="self-end">
              <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card className="overflow-hidden">
            <div className="bg-slate-950 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">Your token</p>
                  <p className="mt-3 text-7xl font-black tracking-tight">{getFormattedToken(queueItem.token_number)}</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3 text-right">
                  <p className="text-xs font-bold uppercase text-cyan-100">Current token</p>
                  <p className="text-3xl font-black text-white">{getFormattedToken(snapshot.currentToken)}</p>
                </div>
              </div>
              <div className="mt-8 rounded-3xl bg-white p-6 text-slate-950">
                <motion.div animate={{ scale: refreshing ? 0.98 : 1 }} className="text-center">
                  <p className="text-sm font-bold text-slate-500">You are</p>
                  <p className="text-7xl font-black text-cyan-800">{snapshot.patientsBefore}</p>
                  <p className="text-lg font-black">patients away</p>
                </motion.div>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <StatusBadge type="queue" status={queueItem.current_status} />
                <p className="text-xs font-semibold text-slate-500">Last updated {formatLastUpdated(snapshot.lastUpdated)}</p>
              </div>
              <p className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm font-bold leading-6 text-cyan-900">{message}</p>
              {snapshot.delayMinutes > 0 && (
                <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-800">
                  Doctor is running {snapshot.delayMinutes} minutes late.
                </p>
              )}
            </div>
          </Card>

          <div className="space-y-4">
            <InfoCard icon={Clock3} label="Estimated waiting time" value={`${snapshot.estimatedWait} minutes`} />
            <InfoCard icon={LocateFixed} label="Suggested arrival time" value={suggestArrivalTime(queueItem.appointment.appointment_date, queueItem.appointment.appointment_time, snapshot.estimatedWait)} />
            <InfoCard icon={TimerReset} label="Appointment time" value={formatTime(queueItem.appointment.appointment_time)} />
            <Card className="p-5">
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-cyan-700" />
                <div>
                  <h3 className="font-black text-slate-950">{demoClinic.clinic_name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{demoClinic.address}</p>
                  <p className="mt-2 text-sm font-bold text-slate-700">{demoClinic.phone}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
          <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
        </div>
      </div>
    </Card>
  )
}
