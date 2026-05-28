import "dotenv/config";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== "string") return false;
  const [saltBase64, keyBase64] = storedHash.split(".");
  if (!saltBase64 || !keyBase64) return false;
  const salt = Buffer.from(saltBase64, "base64");
  const expected = Buffer.from(keyBase64, "base64");
  const derived = crypto.scryptSync(password, salt, expected.length);
  return crypto.timingSafeEqual(derived, expected);
}

const prisma = new PrismaClient();

const user = await prisma.user.findUnique({
  where: { email: "admin@calenzo.health" },
});
console.log(JSON.stringify(user, null, 2));
console.log(
  "verify Admin1234! =>",
  verifyPassword("Admin1234!", user.passwordHash),
);
console.log(
  "verify admin1234! =>",
  verifyPassword("admin1234!", user.passwordHash),
);
console.log(
  "verify Admin1234 =>",
  verifyPassword("Admin1234", user.passwordHash),
);
await prisma.$disconnect();
