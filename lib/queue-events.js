import { Client, neonConfig } from '@neondatabase/serverless'

export const QUEUE_REFRESH_CHANNEL = 'calenzo_queue_refresh'

const globalForQueueEvents = globalThis

const state = globalForQueueEvents.queueRefreshState || {
  subscribers: new Set(),
  listenerClient: null,
  listenerStarting: null,
  reconnectTimer: null,
}

globalForQueueEvents.queueRefreshState = state

function realtimeDatabaseUrl() {
  return process.env.REALTIME_DATABASE_URL
    || process.env.DATABASE_URL_UNPOOLED
    || process.env.POSTGRES_URL_NON_POOLING
    || process.env.POSTGRES_URL
    || null
}

function publishLocalQueueRefresh(payload = null) {
  for (const listener of state.subscribers) {
    listener(payload)
  }
}

function scheduleReconnect() {
  if (state.reconnectTimer || !state.subscribers.size) return

  state.reconnectTimer = setTimeout(() => {
    state.reconnectTimer = null
    void ensurePostgresQueueListener()
  }, 3000)
}

async function ensurePostgresQueueListener() {
  if (state.listenerClient || state.listenerStarting || !state.subscribers.size) return state.listenerStarting

  const databaseUrl = realtimeDatabaseUrl()
  if (!databaseUrl) return null

  if (!globalThis.WebSocket) {
    console.warn('Queue realtime LISTEN skipped: WebSocket is not available in this Node runtime.')
    return null
  }

  neonConfig.webSocketConstructor = globalThis.WebSocket

  state.listenerStarting = (async () => {
    const client = new Client(databaseUrl)

    client.on('notification', (message) => {
      if (message.channel === QUEUE_REFRESH_CHANNEL) {
        publishLocalQueueRefresh(message.payload || null)
      }
    })

    client.on('error', (error) => {
      console.error('Queue realtime listener error:', error)
      state.listenerClient = null
      scheduleReconnect()
    })

    client.on('end', () => {
      state.listenerClient = null
      scheduleReconnect()
    })

    await client.connect()
    await client.query(`listen ${QUEUE_REFRESH_CHANNEL}`)
    state.listenerClient = client
    return client
  })()

  try {
    return await state.listenerStarting
  } catch (error) {
    console.error('Queue realtime listener failed to start:', error)
    scheduleReconnect()
    return null
  } finally {
    state.listenerStarting = null
  }
}

export function subscribeQueueRefresh(listener) {
  state.subscribers.add(listener)
  void ensurePostgresQueueListener()

  return () => {
    state.subscribers.delete(listener)
    if (!state.subscribers.size) {
      if (state.reconnectTimer) {
        clearTimeout(state.reconnectTimer)
        state.reconnectTimer = null
      }

      if (state.listenerClient) {
        const client = state.listenerClient
        state.listenerClient = null
        void client.end().catch((error) => {
          console.error('Queue realtime listener failed to close:', error)
        })
      }
    }
  }
}

export function publishQueueRefresh(payload = null) {
  publishLocalQueueRefresh(payload)
}

export async function notifyQueueRefresh(db, clinicId) {
  await db.$executeRaw`
    select pg_notify(${QUEUE_REFRESH_CHANNEL}, ${String(clinicId || '')})
  `
}

export function queueRealtimeStatus() {
  return {
    mode: realtimeDatabaseUrl() ? 'postgres-listen-notify' : 'in-process',
    hasRealtimeDatabaseUrl: Boolean(realtimeDatabaseUrl()),
    listenerConnected: Boolean(state.listenerClient),
    subscribers: state.subscribers.size,
  }
}
