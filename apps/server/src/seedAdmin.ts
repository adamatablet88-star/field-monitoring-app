import { prisma } from "./prisma.js";
import { hashPassword } from "./auth/password.js";

/**
 * Creates the first admin user from SEED_ADMIN_USERNAME/PASSWORD if set and
 * no such user exists yet. Silently does nothing if the env vars are
 * absent — called unconditionally on server boot (see index.ts) so a
 * from-scratch deploy (e.g. Render) gets a working admin login without a
 * separate manual step; local dev without those vars is unaffected.
 */
export async function seedAdminIfConfigured(): Promise<void> {
  const username = process.env.SEED_ADMIN_USERNAME;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!username || !password) return;

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return;

  const passwordHash = await hashPassword(password);
  await prisma.user.create({ data: { username, passwordHash, role: "admin" } });
  console.log(`seeded admin user "${username}"`);
}
