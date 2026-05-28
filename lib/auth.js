import crypto from "node:crypto";
import { cookies } from "next/headers";
import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const ADMIN_ROLES = [
  "ADMIN",
  "OWNER",
  "DOCTOR",
  "RECEPTIONIST",
  "STAFF",
];
const LOCAL_SESSION_COOKIE = "calenzo_admin_session";
const LOCAL_SESSION_MAX_AGE = 60 * 60 * 24;
const ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.SESSION_SECRET ||
  "calenzo-dev-secret-change-me";

function constantTimeCompare(a, b) {
  const bufferA = Buffer.from(String(a), "utf8");
  const bufferB = Buffer.from(String(b), "utf8");
  if (bufferA.length !== bufferB.length) return false;
  return crypto.timingSafeEqual(bufferA, bufferB);
}

function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== "string") return false;
  const [saltBase64, keyBase64] = storedHash.split(".");
  if (!saltBase64 || !keyBase64) return false;
  const salt = Buffer.from(saltBase64, "base64");
  const expected = Buffer.from(keyBase64, "base64");
  const derived = crypto.scryptSync(password, salt, expected.length);
  return constantTimeCompare(derived, expected);
}

export function createAdminSessionCookieValue(userId) {
  const payload = {
    userId,
    expires: Date.now() + LOCAL_SESSION_MAX_AGE * 1000,
  };
  const payloadJson = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadJson, "utf8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", ADMIN_SESSION_SECRET)
    .update(payloadBase64)
    .digest("base64url");
  return `${payloadBase64}.${signature}`;
}

function parseAdminSessionCookie(cookieValue) {
  if (!cookieValue || typeof cookieValue !== "string") return null;
  const [payloadBase64, signature] = cookieValue.split(".");
  if (!payloadBase64 || !signature) return null;
  const expected = crypto
    .createHmac("sha256", ADMIN_SESSION_SECRET)
    .update(payloadBase64)
    .digest("base64url");
  if (!constantTimeCompare(signature, expected)) return null;

  let payload;
  try {
    payload = JSON.parse(
      Buffer.from(payloadBase64, "base64url").toString("utf8"),
    );
  } catch {
    return null;
  }

  if (!payload || typeof payload !== "object") return null;
  if (!payload.userId || typeof payload.expires !== "number") return null;
  if (Date.now() > payload.expires) return null;
  return payload;
}

function primaryEmailFor(clerkUser) {
  return (
    clerkUser?.primaryEmailAddress?.emailAddress ||
    clerkUser?.emailAddresses?.[0]?.emailAddress ||
    null
  );
}

function displayNameFor(clerkUser, email) {
  const fullName =
    `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim();
  return clerkUser?.fullName || fullName || email || "Calenzo user";
}

function roleFromMetadata(clerkUser) {
  const role = String(clerkUser?.publicMetadata?.role || "").toUpperCase();
  return ADMIN_ROLES.includes(role) ? role : "PATIENT";
}

async function findOrCreateLocalUser(clerkUserId) {
  const clerkUser = await currentUser();
  const email =
    primaryEmailFor(clerkUser)?.toLowerCase() || `${clerkUserId}@clerk.local`;
  const name = displayNameFor(clerkUser, email);
  const image = clerkUser?.imageUrl || null;

  const byClerkId = await prisma.user.findUnique({
    where: { clerkUserId: clerkUserId },
  });
  if (byClerkId) {
    return prisma.user.update({
      where: { id: byClerkId.id },
      data: {
        email,
        name: byClerkId.name || name,
        image,
      },
    });
  }

  const byEmail = await prisma.user.findUnique({ where: { email } });
  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: {
        clerkUserId,
        name: byEmail.name || name,
        image,
      },
    });
  }

  return prisma.user.create({
    data: {
      clerkUserId,
      email,
      name,
      image,
      role: roleFromMetadata(clerkUser),
      status: "active",
    },
  });
}

async function getLocalSession() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCAL_SESSION_COOKIE)?.value;
  const payload = parseAdminSessionCookie(cookieValue);
  if (!payload) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.status !== "active" || !isAdminRole(user.role)) return null;

  return {
    session: {
      id: `local-${user.id}`,
      userId: user.id,
    },
    user: {
      id: user.id,
      clerkId: user.clerkUserId,
      clerkUserId: user.clerkUserId,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      clinicId: user.clinicId,
      status: user.status,
    },
  };
}

export async function verifyAdminCredentials(email, password) {
  if (!email || !password) return null;
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (!user || user.status !== "active" || !isAdminRole(user.role)) {
    return null;
  }

  return user.passwordHash && verifyPassword(password, user.passwordHash)
    ? user
    : null;
}

export async function getSession() {
  const localSession = await getLocalSession();
  if (localSession) return localSession;

  const { userId, sessionId } = await clerkAuth();
  if (!userId) return null;

  const user = await findOrCreateLocalUser(userId);
  if (user.status !== "active") return null;

  return {
    session: {
      id: sessionId,
      userId,
    },
    user: {
      id: user.id,
      clerkId: user.clerkUserId,
      clerkUserId: user.clerkUserId,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      clinicId: user.clinicId,
      status: user.status,
    },
  };
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.user) throw new Error("Sign in required.");
  return session;
}

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(String(role || "").toUpperCase());
}

export async function getCurrentUserWithRole() {
  const session = await getSession();
  return session?.user || null;
}

export async function requireRole(allowedRoles = []) {
  const user = await getCurrentUserWithRole();
  const allowed = allowedRoles.map((role) => String(role).toUpperCase());

  if (!user || !allowed.includes(String(user.role || "").toUpperCase())) {
    throw new Error("Forbidden");
  }

  return user;
}
