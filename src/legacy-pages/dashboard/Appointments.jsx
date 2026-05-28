import { useMemo, useState } from 'react'
import { CheckCircle2, Clock3, Download, MessageCircle, Phone, Plus, StickyNote, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  Button,
  DataTable,
  Drawer,
  FilterDropdown,
  Input,
  Modal,
  PageHeader,
  SearchInput,
  StatusBadge,
  Textarea,
  WhatsAppButton,
} from '../../components/common/UI'
import { APPOINTMENT_STATUS_OPTIONS, CANCELLATION_REASONS } from '../../data/constants'
import { demoClinic, hydratedAppointments } from '../../data/demoData'
import { formatDate, formatTime } from '../../utils/formatDate'
import { buildAppointmentTemplate } from '../../utils/whatsappTemplates'
import { downloadCsv } from '../../utils/csvExport'

export default function Appointments() {
  const [appointments, setAppointments] = useState(hydratedAppointments)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [date, setDate] = useState('')
  const [selected, setSelected] = useState(null)
  const [noteTarget, setNoteTarget] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [note, setNote] = useState('')
  const [cancelReason, setCancelReason] = useState(CANCELLATION_REASONS[0])

  const filtered = useMemo(() => appointments.filter((appointment) => {
    const term = search.toLowerCase()
    const matchesSearch = !term ||
      appointment.patient.full_name.toLowerCase().includes(term) ||
      appointment.patient.phone.includes(search) ||
      String(appointment.token_number).padStart(3, '0').includes(search)
    return matchesSearch &&
      (status === 'all' || appointment.status === status) &&
      (type === 'all' || appointment.appointment_type === type) &&
      (!date || appointment.appointment_date === date)
  }), [appointments, search, status, type, date])

  function updateStatus(id, nextStatus) {
    setAppointments((current) => current.map((appointment) => (
      appointment.id === id ? { ...appointment, status: nextStatus } : appointment
    )))
    toast.success(`Appointment marked ${nextStatus.replace('_', ' ')}`)
  }

  function saveNote() {
    setAppointments((current) => current.map((appointment) => (
      appointment.id === noteTarget.id ? { ...appointment, internal_notes: note } : appointment
    )))
    setNoteTarget(null)
    toast.success('Internal note saved')
  }

  function cancelAppointment() {
    setAppointments((current) => current.map((appointment) => (
      appointment.id === cancelTarget.id ? { ...appointment, status: 'cancelled', cancellation_reason: cancelReason } : appointment
    )))
    setCancelTarget(null)
    toast.success('Appointment cancelled')
  }

  function exportRows() {
    downloadCsv('calenzo-appointments.csv', filtered, [
      { header: 'Token', key: 'token_number' },
      { header: 'Patient', key: 'patient.full_name' },
      { header: 'Phone', key: 'patient.phone' },
      { header: 'Date', key: 'appointment_date' },
      { header: 'Time', key: 'appointment_time' },
      { header: 'Status', key: 'status' },
      { header: 'Source', key: 'source' },
    ])
  }

  const columns = [
    {
      key: 'patient',
      header: 'Patient',
      render: (appointment) => (
        <button onClick={() => setSelected(appointment)} className="text-left">
          <p className="font-black text-slate-950">{appointment.patient.full_name}</p>
          <p className="mt-1 text-xs text-slate-500">{appointment.patient.phone}</p>
        </button>
      ),
    },
    {
      key: 'token',
      header: 'Token',
      render: (appointment) => <span className="font-black text-cyan-800">{String(appointment.token_number).padStart(3, '0')}</span>,
    },
    { key: 'service', header: 'Service', render: (appointment) => appointment.service.title },
    {
      key: 'time',
      header: 'Date and time',
      render: (appointment) => (
        <div>
          <p className="font-bold text-slate-900">{formatDate(appointment.appointment_date)}</p>
          <p className="text-xs text-slate-500">{formatTime(appointment.appointment_time)}</p>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (appointment) => <StatusBadge status={appointment.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (appointment) => (
        <div className="flex items-center gap-1">
          <IconLink href={`tel:${appointment.patient.phone}`} title="Call"><Phone className="h-4 w-4" /></IconLink>
          <IconLink href={`https://wa.me/${appointment.patient.phone.replace(/\D/g, '')}`} title="WhatsApp"><MessageCircle className="h-4 w-4" /></IconLink>
          <IconButton title="Arrived" onClick={() => updateStatus(appointment.id, 'arrived')}><Clock3 className="h-4 w-4" /></IconButton>
          <IconButton title="Complete" onClick={() => updateStatus(appointment.id, 'completed')}><CheckCircle2 className="h-4 w-4" /></IconButton>
          <IconButton title="Cancel" onClick={() => setCancelTarget(appointment)}><XCircle className="h-4 w-4" /></IconButton>
          <IconButton title="Note" onClick={() => { setNoteTarget(appointment); setNote(appointment.internal_notes || '') }}><StickyNote className="h-4 w-4" /></IconButton>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Appointments"
        description="Search, filter, reschedule, cancel, mark arrived, complete, no-show, and message patients from one surface."
        action={
          <>
            <Button variant="secondary" onClick={exportRows}><Download className="h-4 w-4" />CSV</Button>
            <Button><Plus className="h-4 w-4" />Add Appointment</Button>
          </>
        }
      />

      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, phone, or token..." />
        <FilterDropdown value={status} onChange={setStatus} options={[{ label: 'All statuses', value: 'all' }, ...APPOINTMENT_STATUS_OPTIONS.map((item) => ({ label: item.replace('_', ' '), value: item }))]} />
        <FilterDropdown value={type} onChange={setType} options={[{ label: 'All types', value: 'all' }, { label: 'New', value: 'new' }, { label: 'Follow-up', value: 'follow_up' }]} />
        <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </div>

      <DataTable columns={columns} rows={filtered} emptyTitle="No appointments match these filters" />

      <Drawer isOpen={!!selected} onClose={() => setSelected(null)} title="Appointment details">
        {selected && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-2xl font-black text-slate-950">{selected.patient.full_name}</p>
              <p className="mt-1 text-sm text-slate-500">{selected.patient.phone}</p>
              <div className="mt-3"><StatusBadge status={selected.status} /></div>
            </div>
            <Detail label="Service" value={selected.service.title} />
            <Detail label="Date" value={formatDate(selected.appointment_date)} />
            <Detail label="Time" value={formatTime(selected.appointment_time)} />
            <Detail label="Arrival window" value={`${formatTime(selected.arrival_window_start)} - ${formatTime(selected.arrival_window_end)}`} />
            <Detail label="Source" value={selected.source.replace('_', ' ')} />
            <Detail label="Internal notes" value={selected.internal_notes || 'No notes yet'} />
            <WhatsAppButton phone={selected.patient.phone} message={buildAppointmentTemplate('confirmation', { appointment: selected, patient: selected.patient, clinic: demoClinic, service: selected.service })}>
              Send Confirmation
            </WhatsAppButton>
          </div>
        )}
      </Drawer>

      <Modal isOpen={!!noteTarget} onClose={() => setNoteTarget(null)} title="Internal note" size="sm">
        <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Doctor or reception note" />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setNoteTarget(null)}>Cancel</Button>
          <Button onClick={saveNote}>Save Note</Button>
        </div>
      </Modal>

      <Modal isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel appointment" size="sm">
        <p className="mb-3 text-sm text-slate-600">Store the cancellation reason for audit logs and WhatsApp messaging.</p>
        <select value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm">
          {CANCELLATION_REASONS.map((reason) => <option key={reason}>{reason}</option>)}
        </select>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setCancelTarget(null)}>Back</Button>
          <Button variant="danger" onClick={cancelAppointment}>Cancel Appointment</Button>
        </div>
      </Modal>
    </div>
  )
}

function IconButton({ children, title, onClick }) {
  return <button title={title} onClick={onClick} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">{children}</button>
}

function IconLink({ children, href, title }) {
  return <a href={href} title={title} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">{children}</a>
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold capitalize text-slate-950">{value}</p>
    </div>
  )
}
