import { auth as clerkAuth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const ADMIN_ROLES = ['ADMIN', 'OWNER', 'DOCTOR', 'RECEPTIONIST', 'STAFF']

function primaryEmailFor(clerkUser) {
  return clerkUser?.primaryEmailAddress?.emailAddress
    || clerkUser?.emailAddresses?.[0]?.emailAddress
    || null
}

function displayNameFor(clerkUser, email) {
  const fullName = `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`.trim()
  return clerkUser?.fullName || fullName || email || 'Calenzo user'
}

function roleFromMetadata(clerkUser) {
  const role = String(clerkUser?.publicMetadata?.role || '').toUpperCase()
  return ADMIN_ROLES.includes(role) ? role : 'PATIENT'
}

async function findOrCreateLocalUser(clerkUserId) {
  const clerkUser = await currentUser()
  const email = primaryEmailFor(clerkUser)?.toLowerCase() || `${clerkUserId}@clerk.local`
  const name = displayNameFor(clerkUser, email)
  const image = clerkUser?.imageUrl || null

  const byClerkId = await prisma.user.findUnique({ where: { clerkId: clerkUserId } })
  if (byClerkId) {
    return prisma.user.update({
      where: { id: byClerkId.id },
      data: {
        email,
        name: byClerkId.name || name,
        image,
      },
    })
  }

  const byEmail = await prisma.user.findUnique({ where: { email } })
  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: {
        clerkId: clerkUserId,
        name: byEmail.name || name,
        image,
      },
    })
  }

  return prisma.user.create({
    data: {
      clerkId: clerkUserId,
      email,
      name,
      image,
      role: roleFromMetadata(clerkUser),
      status: 'active',
    },
  })
}

export async function getSession() {
  const { userId, sessionId } = await clerkAuth()
  if (!userId) return null

  const user = await findOrCreateLocalUser(userId)
  if (user.status !== 'active') return null

  return {
    session: {
      id: sessionId,
      userId,
    },
    user: {
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      clinicId: user.clinicId,
      status: user.status,
    },
  }
}

export async function requireSession() {
  const session = await getSession()
  if (!session?.user) throw new Error('Sign in required.')
  return session
}

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(String(role || '').toUpperCase())
}
