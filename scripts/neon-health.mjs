import { PrismaClient } from '@prisma/client'
import { loadLocalEnv } from './load-local-env.mjs'

await loadLocalEnv()

const prisma = new PrismaClient()

try {
  await prisma.$connect()
  console.log(JSON.stringify({
    ok: true,
    provider: 'prisma',
    databaseConfigured: Boolean(process.env.DATABASE_URL),
  }, null, 2))
} catch (error) {
  console.error(JSON.stringify({
    ok: false,
    provider: 'prisma',
    error: error?.message || 'Database connection failed',
  }, null, 2))
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
