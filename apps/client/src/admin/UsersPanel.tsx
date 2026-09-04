import { useEffect, useState } from "react";
import type { CreateUserRequest, PublicUser, Role } from "@field-monitoring/shared";
import { API_BASE } from "../apiBase";
import { getStoredToken } from "../auth/authStore";

const ROLE_LABELS: Record<Role, string> = {
  admin: "מנהל",
  technician: "טכנאי שטח",
};

/** User management is a direct REST call, not the outbox/sync pipeline — creating a
 * user needs server-side password hashing and requires connectivity either way
 * (an admin provisioning accounts is not a field/offline scenario). */
export function UsersPanel() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("technician");
  const [error, setError] = useState<string | null>(null);

  async function loadUsers() {
    const res = await fetch(`${API_BASE}/auth/users`, {
      headers: { Authorization: `Bearer ${getStoredToken()}` },
    });
    if (res.ok) setUsers(await res.json());
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: CreateUserRequest = { username: username.trim(), password, role };
    const res = await fetch(`${API_BASE}/auth/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getStoredToken()}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}) as { error?: string });
      setError(body.error ?? "שגיאה ביצירת המשתמש");
      return;
    }
    setUsername("");
    setPassword("");
    setRole("technician");
    await loadUsers();
  }

  return (
    <section className="panel">
      <h2>משתמשים</h2>
      <ul className="entity-list">
        {users.map((u) => (
          <li key={u.id}>
            <span className="entity-row static">
              {u.username} — {ROLE_LABELS[u.role]}
            </span>
          </li>
        ))}
        {users.length === 0 && <li className="empty-hint">אין עדיין משתמשים.</li>}
      </ul>

      <form onSubmit={handleSubmit} className="inline-form stacked">
        <label>
          שם משתמש
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          סיסמה
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </label>
        <label>
          תפקיד
          <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="technician">{ROLE_LABELS.technician}</option>
            <option value="admin">{ROLE_LABELS.admin}</option>
          </select>
        </label>
        {error && <p className="field-error">{error}</p>}
        <button type="submit">צור משתמש</button>
      </form>
    </section>
  );
}
