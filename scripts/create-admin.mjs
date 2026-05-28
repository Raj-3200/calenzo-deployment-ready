import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { loadLocalEnv } from "./load-local-env.mjs";

const DEFAULT_ADMIN_EMAIL = "admin@calenzo.health";
const DEFAULT_ADMIN_PASSWORD = "Admin1234!";
const DEFAULT_CLINIC_ID = "00000000-0000-0000-0000-000000000001";
const ADMIN_ROLES = new Set([
  "ADMIN",
  "OWNER",
  "DOCTOR",
  "RECEPTIONIST",
  "STAFF",
]);

function parseArgs(argv) {
  const result = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;

    const [rawKey, rawValue] = arg.slice(2).split("=");
    const key = rawKey.replace(/-([a-z])/g, (_, letter) =>
      letter.toUpperCase(),
    );
    const value = rawValue ?? argv[index + 1];

    if (rawValue === undefined) index += 1;
    result[key] = value;
  }

  return result;
}

function normalizeRole(value) {
  const role = String(value || "OWNER").toUpperCase();
  if (!ADMIN_ROLES.has(role)) {
    throw new Error(
      `Unsupported admin role "${value}". Use one of: ${Array.from(ADMIN_ROLES).join(", ")}`,
    );
  }
  return role;
}

function displayName(name, email) {
  return (
    String(name || "")
      .trim()
      || email
        .split("@")[0]
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
      || "Calenzo Admin"
  );
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64);
  return `${salt.toString("base64")}.${derived.toString("base64")}`;
}

function usage() {
  return [
    "Usage:",
    '  npm run admin:create -- --email admin@calenzo.health --password "Admin1234!" --role OWNER --name "Calenzo Admin"',
    "",
    "Options:",
    "  --email      Admin email. Defaults to ADMIN_EMAIL or admin@calenzo.health.",
    "  --password   Admin password. Defaults to ADMIN_PASSWORD or Admin1234!.",
    "  --name       Display name. Defaults to a name from the email.",
    "  --role       OWNER, ADMIN, DOCTOR, RECEPTIONIST, or STAFF. Defaults to OWNER.",
  ].join("\n");
}

async function main() {
  await loadLocalEnv();

  const args = parseArgs(process.argv.slice(2));
  const email = String(
    args.email || process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL,
  )
    .trim()
    .toLowerCase();
  const password =
    args.password || process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  const role = normalizeRole(args.role || process.env.ADMIN_ROLE || "OWNER");
  const name = displayName(args.name || process.env.ADMIN_NAME, email);

  if (!email || !password) {
    console.error(usage());
    throw new Error("Missing admin email or password.");
  }

  const prisma = new PrismaClient();

  try {
    const requestedClinicId =
      process.env.DEFAULT_CLINIC_ID || DEFAULT_CLINIC_ID;
    const clinic =
      (await prisma.clinic.findUnique({ where: { id: requestedClinicId } })) ||
      (await prisma.clinic.findFirst({ orderBy: { createdAt: "asc" } }));

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        role,
        status: "active",
        clinicId: clinic?.id || null,
        passwordHash: hashPassword(password),
      },
      create: {
        email,
        name,
        role,
        status: "active",
        clinicId: clinic?.id || null,
        passwordHash: hashPassword(password),
      },
    });

    console.log(
      JSON.stringify(
        {
          ok: true,
          email,
          role,
          localUserId: user.id,
          clinicId: user.clinicId,
          message: "Local admin is ready. Sign in through /admin/login.",
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
