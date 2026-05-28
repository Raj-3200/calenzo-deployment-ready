import { getClinicId, getSql, methodNotAllowed, publicError, readJson, sendJson } from '../src/server/neon.js'

export default async function handler(req, res) {
  if (req.method === 'GET') return listAppointments(req, res)
  if (req.method === 'POST') return createAppointment(req, res)
  return methodNotAllowed(res, ['GET', 'POST'])
}

async function listAppointments(req, res) {
  try {
    const sql = getSql()
    const clinicId = getClinicId(req)
    const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`)
    const date = url.searchParams.get('date')
    const status = url.searchParams.get('status')

    const rows = await sql`
      select
        a.*,
        json_build_object(
          'id', p.id,
          'full_name', p.full_name,
          'age', p.age,
          'phone', p.phone,
          'email', p.email,
          'total_visits', p.total_visits,
          'last_visit', p.last_visit,
          'no_show_count', p.no_show_count,
          'notes', p.notes
        ) as patient,
        json_build_object(
          'id', s.id,
          'title', s.title,
          'description', s.description,
          'duration', s.duration,
          'price', s.price,
          'status', s.status
        ) as service
      from appointments a
      join patients p on p.id = a.patient_id
      left join services s on s.id = a.service_id
      where a.clinic_id = ${clinicId}::uuid
        and (${date}::date is null or a.appointment_date = ${date}::date)
        and (${status}::text is null or a.status = ${status}::text)
      order by a.appointment_date desc, a.appointment_time asc
      limit 200
    `

    return sendJson(res, 200, { ok: true, appointments: rows })
  } catch (error) {
    return sendJson(res, 500, { ok: false, error: publicError(error) })
  }
}

async function createAppointment(req, res) {
  try {
    const sql = getSql()
    const clinicId = getClinicId(req)
    const body = await readJson(req)

    validateAppointment(body)

    const appointmentType = body.appointment_type === 'follow_up' ? 'follow_up' : 'new'
    const source = body.source || 'online'
    const result = await sql.transaction((tx) => [
      tx`
        insert into patients (clinic_id, full_name, age, phone, email, notes)
        values (
          ${clinicId}::uuid,
          ${body.patient.full_name},
          ${Number(body.patient.age) || null},
          ${body.patient.phone},
          ${body.patient.email || null},
          ${body.patient.notes || null}
        )
        on conflict (clinic_id, phone)
        do update set
          full_name = excluded.full_name,
          age = coalesce(excluded.age, patients.age),
          email = coalesce(excluded.email, patients.email),
          updated_at = now()
        returning *
      `,
      tx`
        select coalesce(max(token_number), 0) + 1 as token_number
        from appointments
        where clinic_id = ${clinicId}::uuid
          and appointment_date = ${body.appointment_date}::date
      `,
    ], { isolationLevel: 'Serializable' })

    const patient = result[0][0]
    const tokenNumber = result[1][0].token_number

    const [appointment] = await sql`
      insert into appointments (
        clinic_id,
        patient_id,
        service_id,
        appointment_type,
        token_number,
        appointment_date,
        appointment_time,
        arrival_window_start,
        arrival_window_end,
        status,
        source,
        message,
        internal_notes
      )
      values (
        ${clinicId}::uuid,
        ${patient.id}::uuid,
        ${body.service_id}::uuid,
        ${appointmentType},
        ${tokenNumber},
        ${body.appointment_date}::date,
        ${body.appointment_time}::time,
        ${body.arrival_window_start || null}::time,
        ${body.arrival_window_end || null}::time,
        'confirmed',
        ${source},
        ${body.message || null},
        ${body.internal_notes || null}
      )
      returning *
    `

    await sql`
      insert into queue (
        clinic_id,
        appointment_id,
        patient_id,
        token_number,
        queue_date,
        current_status,
        estimated_wait_time,
        delay_minutes,
        position
      )
      values (
        ${clinicId}::uuid,
        ${appointment.id}::uuid,
        ${patient.id}::uuid,
        ${appointment.token_number},
        ${appointment.appointment_date}::date,
        'waiting',
        0,
        0,
        ${appointment.token_number}
      )
    `

    return sendJson(res, 201, { ok: true, appointment: { ...appointment, patient } })
  } catch (error) {
    return sendJson(res, 400, { ok: false, error: publicError(error) })
  }
}

function validateAppointment(body) {
  if (!body?.patient?.full_name) throw new Error('Patient name is required')
  if (!body?.patient?.phone) throw new Error('Patient phone is required')
  if (!body?.service_id) throw new Error('Service is required')
  if (!body?.appointment_date) throw new Error('Appointment date is required')
  if (!body?.appointment_time) throw new Error('Appointment time is required')
}
