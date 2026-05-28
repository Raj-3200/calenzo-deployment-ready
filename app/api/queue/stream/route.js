import { getQueueSnapshot } from '@/lib/data'
import { getSession, isAdminRole } from '@/lib/auth'
import { subscribeQueueRefresh } from '@/lib/queue-events'
import { isDatabaseUuid } from '@/lib/validation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const appointmentId = searchParams.get('appointmentId')
  const sendInitialSnapshot = searchParams.get('initial') !== '0'

  if (appointmentId && !isDatabaseUuid(appointmentId)) {
    return new Response('Invalid appointment id.', { status: 400 })
  }

  if (!appointmentId) {
    const session = await getSession()
    if (!session?.user || !isAdminRole(session.user.role)) {
      return new Response('Admin access required.', { status: 401 })
    }
  }

  const encoder = new TextEncoder()
  let active = true
  let cleanup = () => {}

  const stream = new ReadableStream({
    async start(controller) {
      let lastPayload = ''
      let sending = false
      let pending = false

      async function push() {
        if (!active) return

        if (sending) {
          pending = true
          return
        }

        sending = true
        try {
          do {
            pending = false
            const snapshot = await getQueueSnapshot({ appointmentId })
            const payload = JSON.stringify(snapshot)
            if (active && payload !== lastPayload) {
              controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
              lastPayload = payload
            }
          } while (active && pending)
        } finally {
          sending = false
        }
      }

      if (sendInitialSnapshot) {
        await push()
      }
      const unsubscribe = subscribeQueueRefresh(() => {
        void push()
      })
      const timer = setInterval(() => {
        void push()
      }, 30000)

      cleanup = () => {
        active = false
        clearInterval(timer)
        unsubscribe()
      }

      request.signal.addEventListener('abort', () => {
        cleanup()
        controller.close()
      })
    },
    cancel() {
      cleanup()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
