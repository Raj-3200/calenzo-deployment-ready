import { getClinicId, getSql, methodNotAllowed, publicError, sendJson } from '../src/server/neon.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res)

  try {
    const sql = getSql()
    const clinicId = getClinicId(req)
    const rows = await sql`
      select id, clinic_id, title, description, duration, price, status, created_at
      from services
      where clinic_id = ${clinicId}::uuid
        and status = 'active'
      order by title asc
    `

    return sendJson(res, 200, { ok: true, services: rows })
  } catch (error) {
    return sendJson(res, 500, { ok: false, error: publicError(error) })
  }
}
