import { getClinic } from '@/lib/data'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/time'
import { whatsappLink } from '@/lib/whatsapp'
import { Badge, Button, Card, EmptyState, PageHeader } from '@/components/ui'

export default async function NotificationsPage() {
  const clinic = await getClinic()
  const notifications = await prisma.notification.findMany({
    where: { clinicId: clinic.id },
    include: { patient: true, appointment: true },
    orderBy: { createdAt: 'desc' },
    take: 80,
  })

  return (
    <>
      <PageHeader eyebrow="Notifications" title="WhatsApp-ready message history" description="Confirmation, delay, cancellation, follow-up, thank-you, and no-show templates are stored as notification records." />
      {notifications.length ? (
        <div className="grid gap-3">
          {notifications.map((notification) => (
            <Card key={notification.id} className="p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge tone="sky">{notification.type}</Badge>
                    <Badge>{notification.channel}</Badge>
                    <Badge tone={notification.status === 'sent' ? 'green' : 'amber'}>{notification.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-400">{formatDate(notification.createdAt)} - {notification.recipient}</p>
                  <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-6 text-slate-200">{notification.message}</p>
                </div>
                <Button href={whatsappLink(notification.recipient, notification.message)} target="_blank" variant="secondary" size="sm">Open WhatsApp</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : <EmptyState title="No notifications yet." description="Booking confirmations and delay alerts will appear here." />}
    </>
  )
}
