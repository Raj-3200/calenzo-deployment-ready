import { prisma } from '@/lib/prisma'
import { queueRealtimeStatus } from '@/lib/queue-events'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const checks = {
    app: true,
    database: false,
    clerkSecret: Boolean(process.env.CLERK_SECRET_KEY),
    clerkPublishableKey: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
    realtime: queueRealtimeStatus(),
  }

  try {
    await prisma.$queryRaw`select 1`
    checks.database = true
  } catch (error) {
    checks.databaseError = error.message
  }

  const productionReady = checks.database
    && checks.clerkSecret
    && checks.clerkPublishableKey

  const ok = checks.database && (process.env.NODE_ENV !== 'production' || productionReady)

  return Response.json({
    ok,
    productionReady,
    environment: process.env.NODE_ENV,
    checks,
  }, { status: ok ? 200 : 503 })
}
