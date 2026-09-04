import type { Role } from "./user.js";

/** User info safe to send to the client — never includes passwordHash. */
export interface PublicUser {
  id: string;
  username: string;
  role: Role;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: PublicUser;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: Role;
}
