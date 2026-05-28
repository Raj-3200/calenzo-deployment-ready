import { Save, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge, Button, Card, Input, PageHeader, Select, Textarea } from '../../components/common/UI'
import { DAYS_OF_WEEK, WHATSAPP_TEMPLATES } from '../../data/constants'
import { useSettings } from '../../hooks/useSettings'

export default function Settings() {
  const { settings, updateSettings } = useSettings()

  function save() {
    toast.success('Settings saved locally. Neon API persistence is ready for production wiring.')
  }

  return (
    <div>
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Manage clinic identity, schedule, booking rules, notification preferences, staff roles, and WhatsApp templates."
        action={<Button onClick={save}><Save className="h-4 w-4" />Save Settings</Button>}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card className="p-5">
          <h2 className="text-lg font-black text-slate-950">Clinic profile</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input label="Clinic name" value={settings.clinic_name} onChange={(event) => updateSettings({ clinic_name: event.target.value })} />
            <Input label="Brand color" type="color" value={settings.brand_color} onChange={(event) => updateSettings({ brand_color: event.target.value })} />
            <Input label="Doctor name" value={settings.doctor_name} onChange={(event) => updateSettings({ doctor_name: event.target.value })} />
            <Input label="Specialization" value={settings.specialization} onChange={(event) => updateSettings({ specialization: event.target.value })} />
            <Input label="Phone" value={settings.phone} onChange={(event) => updateSettings({ phone: event.target.value })} />
            <Input label="WhatsApp number" value={settings.whatsapp_number} onChange={(event) => updateSettings({ whatsapp_number: event.target.value })} />
            <Input label="Email" value={settings.email} onChange={(event) => updateSettings({ email: event.target.value })} />
            <Input label="Website URL" value={settings.website_url} onChange={(event) => updateSettings({ website_url: event.target.value })} />
            <div className="sm:col-span-2">
              <Textarea label="Address" value={settings.address} onChange={(event) => updateSettings({ address: event.target.value })} />
            </div>
            <Button variant="secondary"><Upload className="h-4 w-4" />Upload Logo</Button>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-black text-slate-950">Booking rules</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input label="Opening time" type="time" value={settings.opening_time} onChange={(event) => updateSettings({ opening_time: event.target.value })} />
            <Input label="Closing time" type="time" value={settings.closing_time} onChange={(event) => updateSettings({ closing_time: event.target.value })} />
            <Input label="Lunch start" type="time" value={settings.lunch_start} onChange={(event) => updateSettings({ lunch_start: event.target.value })} />
            <Input label="Lunch end" type="time" value={settings.lunch_end} onChange={(event) => updateSettings({ lunch_end: event.target.value })} />
            <Input label="New appointment duration" type="number" value={settings.new_appointment_duration} onChange={(event) => updateSettings({ new_appointment_duration: Number(event.target.value) })} />
            <Input label="Follow-up duration" type="number" value={settings.followup_duration} onChange={(event) => updateSettings({ followup_duration: Number(event.target.value) })} />
            <Input label="Slot duration" type="number" value={settings.slot_duration} onChange={(event) => updateSettings({ slot_duration: Number(event.target.value) })} />
            <Select label="Booking visibility" value="14" options={[{ label: '14 days ahead', value: '14' }, { label: '30 days ahead', value: '30' }]} />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="p-5">
          <h2 className="font-black text-slate-950">Working days</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <Badge key={day} variant={day === 'sunday' ? 'slate' : 'cyan'}>{day}</Badge>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-black text-slate-950">Staff roles</h2>
          <div className="mt-4 space-y-2 text-sm font-bold text-slate-600">
            <p>Owner: full access</p>
            <p>Doctor: schedule and patient flow</p>
            <p>Receptionist: appointments and queue</p>
            <p>Staff: limited operational access</p>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-black text-slate-950">WhatsApp templates</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {WHATSAPP_TEMPLATES.map((template) => <Badge key={template} variant="green">{template.replace('_', ' ')}</Badge>)}
          </div>
        </Card>
      </div>
    </div>
  )
}
