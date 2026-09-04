export type Role = "admin" | "technician";

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: Role;
}
