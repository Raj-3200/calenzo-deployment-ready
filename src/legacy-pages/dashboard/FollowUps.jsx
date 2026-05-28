import { useMemo, useState } from 'react'
import { CalendarClock, MessageCircle, StickyNote } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, DataTable, FilterDropdown, Modal, PageHeader, SearchInput, StatusBadge, Textarea, WhatsAppButton } from '../../components/common/UI'
import { FOLLOWUP_PRIORITY_OPTIONS, FOLLOWUP_STATUS_OPTIONS } from '../../data/constants'
import { demoClinic, hydratedFollowUps } from '../../data/demoData'
import { formatDate } from '../../utils/formatDate'
import { followupReminderTemplate } from '../../utils/whatsappTemplates'

export default function FollowUps() {
  const [followUps, setFollowUps] = useState(hydratedFollowUps)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')
  const [noteTarget, setNoteTarget] = useState(null)
  const [note, setNote] = useState('')

  const filtered = useMemo(() => followUps.filter((item) => {
    const term = search.toLowerCase()
    return (!term || item.patient.full_name.toLowerCase().includes(term) || item.patient.phone.includes(search)) &&
      (status === 'all' || item.status === status) &&
      (priority === 'all' || item.priority === priority)
  }), [followUps, search, status, priority])

  function update(id, patch) {
    setFollowUps((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item))
    toast.success('Follow-up updated')
  }

  function saveNote() {
    update(noteTarget.id, { notes: note })
    setNoteTarget(null)
  }

  const columns = [
    { key: 'patient', header: 'Patient', render: (item) => <div><p className="font-black text-slate-950">{item.patient.full_name}</p><p className="text-xs text-slate-500">{item.patient.phone}</p></div> },
    { key: 'date', header: 'Next follow-up', render: (item) => <span className="font-bold text-slate-950">{formatDate(item.next_followup_date)}</span> },
    { key: 'priority', header: 'Priority', render: (item) => <StatusBadge type="priority" status={item.priority} /> },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge type="follow_up" status={item.status} /> },
    { key: 'notes', header: 'Notes', render: (item) => <span className="line-clamp-2 text-sm text-slate-500">{item.notes}</span> },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-1">
          <WhatsAppButton
            phone={item.patient.phone}
            message={followupReminderTemplate({ patientName: item.patient.full_name, clinicName: demoClinic.clinic_name, doctorName: demoClinic.doctor_name, clinicPhone: demoClinic.phone, followupInstructions: item.notes })}
            className="w-auto"
          >
            <MessageCircle className="h-4 w-4" />
          </WhatsAppButton>
          <button onClick={() => { setNoteTarget(item); setNote(item.notes) }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><StickyNote className="h-4 w-4" /></button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Recovery"
        title="Follow-Ups"
        description="Prioritize hot, warm, and cold follow-ups so patients do not disappear after a visit or no-show."
      />
      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <SearchInput value={search} onChange={setSearch} placeholder="Search patient or phone..." />
        <FilterDropdown value={status} onChange={setStatus} options={[{ label: 'All statuses', value: 'all' }, ...FOLLOWUP_STATUS_OPTIONS.map((item) => ({ label: item.replace(/_/g, ' '), value: item }))]} />
        <FilterDropdown value={priority} onChange={setPriority} options={[{ label: 'All priority', value: 'all' }, ...FOLLOWUP_PRIORITY_OPTIONS.map((item) => ({ label: item, value: item }))]} />
      </div>
      <DataTable columns={columns} rows={filtered} emptyTitle="No follow-ups found" />

      <div className="mt-4 flex flex-wrap gap-2">
        {filtered.slice(0, 3).map((item) => (
          <Button key={item.id} size="sm" variant="secondary" onClick={() => update(item.id, { status: 'contacted', last_contacted_at: new Date().toISOString() })}>
            <CalendarClock className="h-4 w-4" />
            Mark {item.patient.full_name} contacted
          </Button>
        ))}
      </div>

      <Modal isOpen={!!noteTarget} onClose={() => setNoteTarget(null)} title="Follow-up notes" size="sm">
        <Textarea value={note} onChange={(event) => setNote(event.target.value)} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setNoteTarget(null)}>Cancel</Button>
          <Button onClick={saveNote}>Save</Button>
        </div>
      </Modal>
    </div>
  )
}
