import { BellRing, Copy, MessageCircle, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Card, DataTable, PageHeader, StatusBadge } from '../../components/common/UI'
import { demoNotifications, demoPatients } from '../../data/demoData'
import { formatDate, formatTime } from '../../utils/formatDate'
import { getWhatsAppLink } from '../../utils/whatsappTemplates'

export default function Notifications() {
  const rows = demoNotifications.map((notification) => ({
    ...notification,
    patient: demoPatients.find((patient) => patient.id === notification.patient_id),
  }))

  const columns = [
    { key: 'type', header: 'Type', render: (row) => <span className="font-black capitalize text-slate-950">{row.type.replace('_', ' ')}</span> },
    { key: 'patient', header: 'Patient', render: (row) => <div><p className="font-bold text-slate-950">{row.patient?.full_name}</p><p className="text-xs text-slate-500">{row.recipient}</p></div> },
    { key: 'channel', header: 'Channel', render: (row) => <span className="capitalize">{row.channel}</span> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge type="notification" status={row.status} /> },
    { key: 'created', header: 'Created', render: (row) => <span>{formatDate(row.created_at)} {formatTime(row.created_at?.slice(11, 16))}</span> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-1">
          <a href={getWhatsAppLink(row.recipient, row.message)} target="_blank" rel="noreferrer"><Button size="xs"><Send className="h-3.5 w-3.5" />Send</Button></a>
          <Button size="xs" variant="secondary" onClick={() => { navigator.clipboard?.writeText(row.message); toast.success('Template copied') }}><Copy className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Communication"
        title="Notifications"
        description="WhatsApp, email, and SMS history with status tracking and reusable clinic templates."
      />
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        {['confirmation', 'delay_alert', 'follow_up'].map((type) => (
          <Card key={type} className="p-5">
            <BellRing className="h-7 w-7 text-cyan-700" />
            <p className="mt-4 text-lg font-black capitalize text-slate-950">{type.replace('_', ' ')}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">Template ready for one-click WhatsApp communication.</p>
          </Card>
        ))}
      </div>
      <DataTable columns={columns} rows={rows} />
      <Card className="mt-5 p-5">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-emerald-600" />
          <p className="text-sm font-bold text-slate-700">Production-ready structure supports notification history, channel, recipient, message body, status, sent_at, and created_at.</p>
        </div>
      </Card>
    </div>
  )
}
