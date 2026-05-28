import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function primaryEmail(data) {
  return data.email_addresses?.[0]?.email_address?.toLowerCase() || `${data.id}@clerk.local`
}

function displayName(data, email) {
  return `${data.first_name || ''} ${data.last_name || ''}`.trim() || email
}

function roleFromMetadata(data) {
  const role = String(data.public_metadata?.role || '').toUpperCase()
  return ['ADMIN', 'OWNER', 'DOCTOR', 'RECEPTIONIST', 'STAFF'].includes(role) ? role : 'PATIENT'
}

export async function POST(req) {
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET || process.env.CLERK_WEBHOOK_SECRET
  if (!signingSecret) {
    return new Response('Missing Clerk webhook signing secret', { status: 500 })
  }

  let event
  try {
    event = await verifyWebhook(req, { signingSecret })
  } catch (error) {
    console.error('Clerk webhook verification failed:', error)
    return new Response('Invalid webhook', { status: 400 })
  }

  if (event.type === 'user.created' || event.type === 'user.updated') {
    const email = primaryEmail(event.data)
    const name = displayName(event.data, email)

    await prisma.user.upsert({
      where: { clerkUserId: event.data.id },
      update: {
        email,
        name,
        image: event.data.image_url || null,
        role: roleFromMetadata(event.data),
        status: 'active',
      },
      create: {
        clerkUserId: event.data.id,
        email,
        name,
        image: event.data.image_url || null,
        role: roleFromMetadata(event.data),
        status: 'active',
      },
    })
  }

  if (event.type === 'user.deleted' && event.data.id) {
    await prisma.user.updateMany({
      where: { clerkUserId: event.data.id },
      data: { status: 'inactive' },
    })
  }

  return new Response('OK', { status: 200 })
}
