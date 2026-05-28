export async function checkDatabaseHealth() {
  return apiGet('/api/health')
}

export async function listServices() {
  return apiGet('/api/services')
}

export async function listAppointments(params = {}) {
  const query = new URLSearchParams(params)
  return apiGet(`/api/appointments?${query.toString()}`)
}

export async function createAppointment(payload) {
  const response = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }

  return response.json()
}

async function apiGet(path) {
  const response = await fetch(path, { headers: { Accept: 'application/json' } })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }
  return response.json()
}
