import { readFile } from 'node:fs/promises'
import { neon } from '@neondatabase/serverless'
import { loadLocalEnv } from './load-local-env.mjs'

await loadLocalEnv()

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!databaseUrl) {
  console.error('DATABASE_URL is not configured.')
  process.exit(1)
}

const schema = await readFile(new URL('../db/schema.sql', import.meta.url), 'utf8')
const statements = schema
  .split(/;\s*(?:\r?\n|$)/)
  .map((statement) => statement.trim())
  .filter(Boolean)

const sql = neon(databaseUrl)

for (const statement of statements) {
  await sql.query(statement)
}

console.log(JSON.stringify({
  ok: true,
  provider: 'neon',
  migratedStatements: statements.length,
}, null, 2))
