import jwt from "jsonwebtoken";
import type { Role } from "@field-monitoring/shared";

export interface AuthTokenPayload {
  sub: string;
  username: string;
  role: Role;
}

const JWT_SECRET: string = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is required");
  return secret;
})();

// Long-lived on purpose: this is an offline-first field app (docs/architecture.md) —
// a technician logs in once with connectivity and the token is cached locally for
// every later sync round, online or not, until it expires.
const TOKEN_TTL = "30d";

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET) as unknown as AuthTokenPayload;
}
