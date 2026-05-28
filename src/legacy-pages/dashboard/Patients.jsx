import { useMemo, useState } from 'react'
import { Download, Phone, Search, StickyNote } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Drawer, PageHeader, PatientCard, SearchInput, StatusBadge, Textarea, WhatsAppButton } from '../../components/common/UI'
import { demoClinic, demoPatients, hydratedAppointments, hydratedFollowUps } from '../../data/demoData'
import { formatDate, formatTime } from '../../utils/formatDate'
import { downloadCsv } from '../../utils/csvExport'

export default function Patients() {
  const [patients, setPatients] = useState(demoPatients)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [note, setNote] = useState('')

  const filtered = useMemo(() => patients.filter((patient) => {
    const term = search.toLowerCase()
    return !term || patient.full_name.toLowerCase().includes(term) || patient.phone.includes(search)
  }), [patients, search])

  function open(patient) {
    setSelected(patient)
    setNote(patient.notes || '')
  }

  function saveNote() {
    setPatients((current) => current.map((patient) => patient.id === selected.id ? { ...patient, notes: note } : patient))
    setSelected((current) => ({ ...current, notes: note }))
    toast.success('Patient note updated')
  }

  function exportPatients() {
    downloadCsv('calenzo-patients.csv', filtered, [
      { header: 'Name', key: 'full_name' },
      { header: 'Age', key: 'age' },
      { header: 'Phone', key: 'phone' },
      { header: 'Email', key: 'email' },
      { header: 'Total visits', key: 'total_visits' },
      { header: 'No-shows', key: 'no_show_count' },
    ])
  }

  return (
    <div>
      <PageHeader
        eyebrow="Patient database"
        title="Patients"
        description="Repeat patient detection, appointment history, no-show count, notes, and follow-up status in one profile."
        action={<Button variant="secondary" onClick={exportPatients}><Download className="h-4 w-4" />CSV</Button>}
      />
      <div className="mb-5 max-w-xl"><SearchInput value={search} onChange={setSearch} placeholder="Search by name or phone..." /></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((patient) => (
          <PatientCard key={patient.id} patient={patient} action={<Button variant="secondary" size="sm" className="w-full" onClick={() => open(patient)}><Search className="h-4 w-4" />Open Profile</Button>} />
        ))}
      </div>

      <Drawer isOpen={!!selected} onClose={() => setSelected(null)} title="Patient profile">
        {selected && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-cyan-50 text-xl font-black text-cyan-800">{selected.full_name.charAt(0)}</div>
                <div>
                  <h2 className="text-2xl font-black text-slate-950">{selected.full_name}</h2>
                  <p className="text-sm text-slate-500">{selected.age} years - {selected.phone}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Metric label="Visits" value={selected.total_visits} />
                <Metric label="No-shows" value={selected.no_show_count} />
                <Metric label="Last visit" value={selected.last_visit ? formatDate(selected.last_visit, 'MMM dd') : 'New'} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a href={`tel:${selected.phone}`}><Button variant="secondary" className="w-full"><Phone className="h-4 w-4" />Call</Button></a>
              <WhatsAppButton phone={selected.phone} message={`Hi ${selected.full_name}, this is ${demoClinic.clinic_name}.`}>WhatsApp</WhatsAppButton>
            </div>

            <div>
              <h3 className="mb-3 font-black text-slate-950">Appointment history</h3>
              <div className="space-y-2">
                {hydratedAppointments.filter((appointment) => appointment.patient_id === selected.id).map((appointment) => (
                  <div key={appointment.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-slate-950">{appointment.service.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}</p>
                      </div>
                      <StatusBadge status={appointment.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 flex items-center gap-2 font-black text-slate-950"><StickyNote className="h-4 w-4" />Notes</h3>
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} />
              <Button className="mt-3" onClick={saveNote}>Save Notes</Button>
            </div>

            <div>
              <h3 className="mb-3 font-black text-slate-950">Follow-up status</h3>
              {hydratedFollowUps.filter((item) => item.patient_id === selected.id).map((item) => (
                <div key={item.id} className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-800">
                  {item.notes}
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-3">
      <p className="text-lg font-black text-slate-950">{value}</p>
      <p className="text-xs font-bold text-slate-400">{label}</p>
    </div>
  )
}
