import { neon } from '@neondatabase/serverless'

let sql

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured')
  }

  if (!sql) {
    sql = neon(databaseUrl)
  }

  return sql
}

export function getClinicId(req) {
  return req.headers['x-clinic-id'] || process.env.DEFAULT_CLINIC_ID || '00000000-0000-0000-0000-000000000001'
}

export function sendJson(res, statusCode, body) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

export function methodNotAllowed(res, allowed = ['GET']) {
  res.setHeader('Allow', allowed.join(', '))
  sendJson(res, 405, { ok: false, error: 'Method not allowed' })
}

export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body

  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

export function publicError(error) {
  if (error?.code === '23505') {
    return 'This slot is no longer available'
  }

  return error?.message || 'Database request failed'
}
