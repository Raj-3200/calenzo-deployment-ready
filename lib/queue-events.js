export const QUEUE_REFRESH_CHANNEL = 'calenzo_queue_refresh'

const globalForQueueEvents = globalThis

const state = globalForQueueEvents.queueRefreshState || {
  subscribers: new Set(),
}

globalForQueueEvents.queueRefreshState = state

export function subscribeQueueRefresh(listener) {
  state.subscribers.add(listener)

  return () => {
    state.subscribers.delete(listener)
  }
}

export function publishQueueRefresh(payload = null) {
  for (const listener of state.subscribers) {
    listener(payload)
  }
}

export async function notifyQueueRefresh() {
  return null
}

export function queueRealtimeStatus() {
  return {
    mode: 'sse-polling',
    listenerConnected: state.subscribers.size > 0,
    subscribers: state.subscribers.size,
  }
}
