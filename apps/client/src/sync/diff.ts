export interface DiffRow {
  key: string;
  local: string;
  server: string;
  changed: boolean;
}

const EM_DASH = "—";

function formatValue(value: unknown): string {
  if (value === undefined) return EM_DASH;
  if (value === null) return "ריק";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

/**
 * Shallow, generic top-level field comparison between a local and a
 * server payload of the same entity. Deliberately entity-agnostic (works
 * for any of the twelve SyncEntityType shapes) rather than a bespoke diff
 * per type, since the conflict-resolution UI only needs to show the user
 * what differs, not fully understand the domain shape.
 */
export function diffPayloads(local: unknown, server: unknown): DiffRow[] {
  const l = (local && typeof local === "object" ? local : {}) as Record<string, unknown>;
  const s = (server && typeof server === "object" ? server : {}) as Record<string, unknown>;
  const keys = Array.from(new Set([...Object.keys(l), ...Object.keys(s)])).sort();

  return keys.map((key) => ({
    key,
    local: formatValue(l[key]),
    server: formatValue(s[key]),
    changed: JSON.stringify(l[key]) !== JSON.stringify(s[key]),
  }));
}
