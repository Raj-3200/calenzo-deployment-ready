import { neon } from '@neondatabase/serverless'
import { loadLocalEnv } from './load-local-env.mjs'

await loadLocalEnv()

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!databaseUrl) {
  console.error('DATABASE_URL is not configured.')
  process.exit(1)
}

const sql = neon(databaseUrl)
const [row] = await sql`
  select
    now() as now,
    current_database() as database_name,
    current_user as database_user
`

console.log(JSON.stringify({
  ok: true,
  provider: 'neon',
  database: row.database_name,
  user: row.database_user,
  now: row.now,
}, null, 2))
