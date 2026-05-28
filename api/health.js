import { getSql, methodNotAllowed, publicError, sendJson } from '../src/server/neon.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res)

  try {
    const sql = getSql()
    const [row] = await sql`
      select
        now() as now,
        current_database() as database_name,
        current_user as database_user,
        version() as version
    `

    return sendJson(res, 200, {
      ok: true,
      provider: 'neon',
      database: row.database_name,
      user: row.database_user,
      now: row.now,
      version: row.version,
    })
  } catch (error) {
    return sendJson(res, 500, { ok: false, provider: 'neon', error: publicError(error) })
  }
}
