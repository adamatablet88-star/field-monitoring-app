import { Router } from "express";
import type { CreateUserRequest, LoginRequest, LoginResponse, PublicUser } from "@field-monitoring/shared";
import { prisma } from "../prisma.js";
import { hashPassword, verifyPassword } from "./password.js";
import { signToken } from "./jwt.js";
import { requireAuth, requireAdmin } from "./middleware.js";

export const authRouter = Router();

authRouter.post("/auth/login", async (req, res) => {
  const { username, password } = (req.body ?? {}) as Partial<LoginRequest>;
  if (!username || !password) {
    res.status(400).json({ error: "username and password are required" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ error: "invalid username or password" });
    return;
  }

  const token = signToken({ sub: user.id, username: user.username, role: user.role });
  const response: LoginResponse = {
    token,
    user: { id: user.id, username: user.username, role: user.role },
  };
  res.json(response);
});

// Admin-only: bootstrapping the first admin account is done via prisma/seed.ts,
// not this endpoint — see docs/roadmap.md.
authRouter.post("/auth/users", requireAuth, requireAdmin, async (req, res) => {
  const { username, password, role } = (req.body ?? {}) as Partial<CreateUserRequest>;
  if (!username || !password || !role) {
    res.status(400).json({ error: "username, password and role are required" });
    return;
  }

  const passwordHash = await hashPassword(password);
  try {
    const user = await prisma.user.create({ data: { username, passwordHash, role } });
    const publicUser: PublicUser = { id: user.id, username: user.username, role: user.role };
    res.status(201).json(publicUser);
  } catch (err) {
    if (typeof err === "object" && err !== null && "code" in err && (err as { code: unknown }).code === "P2002") {
      res.status(409).json({ error: "username already exists" });
      return;
    }
    throw err;
  }
});

authRouter.get("/auth/users", requireAuth, requireAdmin, async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { username: "asc" } });
  const publicUsers: PublicUser[] = users.map((u) => ({ id: u.id, username: u.username, role: u.role }));
  res.json(publicUsers);
});
