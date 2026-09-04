import type { LoginResponse, PublicUser } from "@field-monitoring/shared";
import { API_BASE } from "../apiBase";

const TOKEN_KEY = "fieldMonitoring:authToken";
const USER_KEY = "fieldMonitoring:authUser";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): PublicUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PublicUser;
  } catch {
    return null;
  }
}

function storeAuth(token: string, user: PublicUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Requires connectivity (this is the one part of the app that can't work
 * offline — see docs/architecture.md). The token is cached locally after
 * login and reused for every later sync round, online or not, until it
 * expires (30 days — see apps/server/src/auth/jwt.ts).
 */
export async function login(username: string, password: string): Promise<PublicUser> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { error?: string });
    throw new Error(body.error ?? `ההתחברות נכשלה: HTTP ${res.status}`);
  }
  const { token, user } = (await res.json()) as LoginResponse;
  storeAuth(token, user);
  return user;
}
