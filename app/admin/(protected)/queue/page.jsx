import { getQueueSnapshot } from '@/lib/data'
import { AdminQueueLive } from '@/components/AdminQueueLive'
import { PageHeader } from '@/components/ui'

export default async function LiveQueueAdminPage() {
  const snapshot = await getQueueSnapshot()

  return (
    <>
      <PageHeader
        eyebrow="Live queue"
        title="Real-time queue control"
        description="Move patients from waiting to arrived, consultation, completed, skipped, recalled, cancelled, or delayed. Patient queue pages update through the live stream."
      />
      <AdminQueueLive initialSnapshot={snapshot} />
    </>
  )
}
