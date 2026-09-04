import { useState } from "react";
import type { PublicUser } from "@field-monitoring/shared";
import { login } from "./authStore";

interface LoginFormProps {
  onLogin: (user: PublicUser) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(username, password);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאת התחברות");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main dir="rtl" className="login-screen">
      <h1>אפליקציית ניטור שטח</h1>
      <form onSubmit={handleSubmit} className="inline-form stacked login-form">
        <label>
          שם משתמש
          <input value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
        </label>
        <label>
          סיסמה
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="field-error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "מתחבר..." : "התחבר"}
        </button>
      </form>
    </main>
  );
}
