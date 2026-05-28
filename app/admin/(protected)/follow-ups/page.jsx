import { followUpStatusAction } from '@/app/actions'
import { getClinic } from '@/lib/data'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/time'
import { followUpMessage, whatsappLink } from '@/lib/whatsapp'
import { Badge, Button, Card, EmptyState, Label, PageHeader, Select, Textarea } from '@/components/ui'

export default async function FollowUpsPage() {
  const clinic = await getClinic()
  const followUps = await prisma.followUp.findMany({
    where: { clinicId: clinic.id },
    include: { patient: true, appointment: { include: { service: true } } },
    orderBy: [{ createdAt: 'desc' }],
  })

  return (
    <>
      <PageHeader eyebrow="Follow-ups" title="Follow-up recovery" description="Keep patient recovery, WhatsApp nudges, lead priority, and follow-up status from falling through the cracks." />
      {followUps.length ? (
        <div className="grid gap-4">
          {followUps.map((followUp) => (
            <Card key={followUp.id} className="p-5">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold text-white">{followUp.patient.fullName}</h2>
                    <Badge tone={followUp.priority === 'hot' ? 'red' : followUp.priority === 'warm' ? 'amber' : 'slate'}>{followUp.priority}</Badge>
                    <Badge tone="sky">{followUp.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">Next follow-up: {followUp.nextFollowupDate ? formatDate(followUp.nextFollowupDate) : 'Not scheduled'}</p>
                  <p className="mt-1 text-sm text-slate-500">Last contacted: {followUp.lastContactedAt ? formatDate(followUp.lastContactedAt) : 'Not contacted yet'}</p>
                  <Button href={whatsappLink(followUp.patient.phone, followUpMessage({ clinic, patient: followUp.patient }))} target="_blank" variant="secondary" size="sm" className="mt-4">WhatsApp follow-up</Button>
                </div>

                <form action={followUpStatusAction} className="grid gap-3">
                  <input type="hidden" name="followUpId" value={followUp.id} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Status</Label>
                      <Select name="status" defaultValue={followUp.status}>
                        {['new', 'contacted', 'follow_up_needed', 'appointment_booked', 'completed', 'lost'].map((status) => <option key={status} value={status}>{status}</option>)}
                      </Select>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Select name="priority" defaultValue={followUp.priority}>
                        <option value="hot">Hot</option>
                        <option value="warm">Warm</option>
                        <option value="cold">Cold</option>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea name="notes" defaultValue={followUp.notes || ''} />
                  </div>
                  <Button type="submit" variant="secondary">Update follow-up</Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No follow-ups pending." description="New appointment bookings and manual follow-up records will appear here." />
      )}
    </>
  )
}
