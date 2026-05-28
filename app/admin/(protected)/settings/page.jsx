import { saveSettingsAction } from '@/app/actions'
import { getClinic } from '@/lib/data'
import { timeToInput } from '@/lib/time'
import { Button, Card, Input, Label, PageHeader, Textarea } from '@/components/ui'

export default async function SettingsPage() {
  const clinic = await getClinic()

  return (
    <>
      <PageHeader eyebrow="Settings" title="Clinic settings" description="Manage clinic identity, working hours, appointment durations, lunch break, and communication details." />
      <Card className="max-w-5xl p-6">
        <form action={saveSettingsAction} className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Clinic name</Label>
            <Input name="name" defaultValue={clinic.name} />
          </div>
          <div>
            <Label>Doctor name</Label>
            <Input name="doctorName" defaultValue={clinic.doctorName} />
          </div>
          <div>
            <Label>Specialization</Label>
            <Input name="specialization" defaultValue={clinic.specialization || ''} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input name="phone" defaultValue={clinic.phone} />
          </div>
          <div>
            <Label>WhatsApp number</Label>
            <Input name="whatsappNumber" defaultValue={clinic.whatsappNumber || ''} />
          </div>
          <div>
            <Label>Email</Label>
            <Input name="email" defaultValue={clinic.email || ''} />
          </div>
          <div className="md:col-span-2">
            <Label>Address</Label>
            <Textarea name="address" defaultValue={clinic.address || ''} />
          </div>
          <div>
            <Label>Opening time</Label>
            <Input name="openingTime" type="time" defaultValue={timeToInput(clinic.openingTime)} />
          </div>
          <div>
            <Label>Closing time</Label>
            <Input name="closingTime" type="time" defaultValue={timeToInput(clinic.closingTime)} />
          </div>
          <div>
            <Label>Lunch start</Label>
            <Input name="lunchStart" type="time" defaultValue={timeToInput(clinic.lunchStart)} />
          </div>
          <div>
            <Label>Lunch end</Label>
            <Input name="lunchEnd" type="time" defaultValue={timeToInput(clinic.lunchEnd)} />
          </div>
          <div>
            <Label>New appointment duration</Label>
            <Input name="newAppointmentDuration" type="number" min="5" defaultValue={clinic.newAppointmentDuration} />
          </div>
          <div>
            <Label>Follow-up duration</Label>
            <Input name="followupDuration" type="number" min="5" defaultValue={clinic.followupDuration} />
          </div>
          <div>
            <Label>Slot duration</Label>
            <Input name="slotDuration" type="number" min="5" defaultValue={clinic.slotDuration} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" size="lg">Save clinic settings</Button>
          </div>
        </form>
      </Card>
    </>
  )
}
