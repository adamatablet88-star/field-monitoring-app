import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/auth/password.js";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!username || !password) {
    throw new Error("SEED_ADMIN_USERNAME and SEED_ADMIN_PASSWORD must be set (see .env.example)");
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log(`user "${username}" already exists — skipping seed`);
    return;
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({ data: { username, passwordHash, role: "admin" } });
  console.log(`created admin user "${username}"`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
