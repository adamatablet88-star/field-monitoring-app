import { useEffect, useState } from "react";
import { liveQuery, type EntityTable } from "dexie";
import type { SyncEntityType } from "@field-monitoring/shared";
import { enqueueChange } from "../sync";

/**
 * Reactive CRUD over one local Dexie table, routed through the outbox
 * (src/sync.ts) so every Admin edit is offline-first like everything
 * else in the app — see docs/architecture.md.
 */
export function useLocalCollection<T extends { id: string }>(
  table: EntityTable<T, "id">,
  entityType: SyncEntityType,
) {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    const subscription = liveQuery(() => table.toArray()).subscribe({
      next: setItems,
      error: (err) => console.error(`liveQuery failed for ${entityType}`, err),
    });
    return () => subscription.unsubscribe();
  }, [table, entityType]);

  async function save(entity: T) {
    // Queried directly against the table (not React state) so this is
    // correct even the instant after mount, before this hook's own
    // liveQuery has emitted its first value — e.g. opening a single-entity
    // edit form and saving it right away.
    const exists = (await table.where(":id").equals(entity.id).count()) > 0;
    await enqueueChange(entityType, exists ? "update" : "create", entity);
  }

  async function remove(entity: T) {
    await enqueueChange(entityType, "delete", entity);
  }

  return { items, save, remove };
}

export function newId(): string {
  return crypto.randomUUID();
}
