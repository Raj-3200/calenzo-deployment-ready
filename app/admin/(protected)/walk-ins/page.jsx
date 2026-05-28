import { UserPlus } from 'lucide-react'
import { walkInAction } from '@/app/actions'
import { getServices } from '@/lib/data'
import { Button, Card, Input, Label, PageHeader, Select, Textarea } from '@/components/ui'

export default async function WalkInsPage() {
  const services = await getServices()

  return (
    <>
      <PageHeader
        eyebrow="Walk-in booking"
        title="Add a patient without breaking the queue"
        description="Calenzo creates or reuses the patient, allocates the nearest valid slot, generates a token, and inserts the patient into today's live queue."
      />
      <Card className="max-w-3xl p-6">
        <form action={walkInAction} className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Patient name</Label>
            <Input name="fullName" required placeholder="Full name" />
          </div>
          <div>
            <Label>Age</Label>
            <Input name="age" type="number" min="1" required placeholder="42" />
          </div>
          <div>
            <Label>Phone number</Label>
            <Input name="phone" required placeholder="+91 90000 00000" />
          </div>
          <div>
            <Label>Gender</Label>
            <Select name="gender" defaultValue="Female">
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
              <option>Prefer not to say</option>
            </Select>
          </div>
          <div>
            <Label>Appointment type</Label>
            <Select name="appointmentType" defaultValue="new">
              <option value="new">New Appointment</option>
              <option value="follow_up">Follow-Up Appointment</option>
            </Select>
          </div>
          <div>
            <Label>Doctor/service</Label>
            <Select name="serviceId" required defaultValue={services[0]?.id}>
              {services.map((service) => <option key={service.id} value={service.id}>{service.title}</option>)}
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Textarea name="notes" placeholder="Internal note for doctor or receptionist" />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" size="lg"><UserPlus className="h-4 w-4" /> Generate walk-in token</Button>
          </div>
        </form>
      </Card>
    </>
  )
}
