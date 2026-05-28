import { getClinic } from '@/lib/data'
import { prisma } from '@/lib/prisma'
import { formatTime } from '@/lib/time'
import { Badge, Card, EmptyState, PageHeader } from '@/components/ui'

export default async function DoctorSchedulePage() {
  const clinic = await getClinic()
  const availability = await prisma.availability.findMany({
    where: { clinicId: clinic.id },
    orderBy: { dayOfWeek: 'asc' },
  })

  return (
    <>
      <PageHeader eyebrow="Doctor schedule" title="Working days and breaks" description="Availability controls whether patients can book a selected day and which windows are offered." />
      {availability.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {availability.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold capitalize text-white">{item.dayOfWeek}</h2>
                <Badge tone={item.isAvailable ? 'green' : 'red'}>{item.isAvailable ? 'Open' : 'Closed'}</Badge>
              </div>
              <p className="mt-4 text-sm text-slate-400">Hours: <span className="font-semibold text-white">{formatTime(item.startTime)} - {formatTime(item.endTime)}</span></p>
              <p className="mt-2 text-sm text-slate-400">Break: <span className="font-semibold text-white">{item.breakStart ? formatTime(item.breakStart) : '-'} - {item.breakEnd ? formatTime(item.breakEnd) : '-'}</span></p>
            </Card>
          ))}
        </div>
      ) : <EmptyState title="No schedule configured." description="Default clinic hours are used until availability rows are added." />}
    </>
  )
}
