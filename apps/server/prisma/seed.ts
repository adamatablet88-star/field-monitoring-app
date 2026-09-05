import { prisma } from "../src/prisma.js";
import { seedAdminIfConfigured } from "../src/seedAdmin.js";

async function main() {
  if (!process.env.SEED_ADMIN_USERNAME || !process.env.SEED_ADMIN_PASSWORD) {
    throw new Error("SEED_ADMIN_USERNAME and SEED_ADMIN_PASSWORD must be set (see .env.example)");
  }
  await seedAdminIfConfigured();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
