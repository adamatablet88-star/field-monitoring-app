import { useState } from "react";
import type { Client, Site } from "@field-monitoring/shared";
import { db } from "../db";
import { useLocalCollection } from "../admin/useLocalCollection";
import { FuelLensWellList } from "./FuelLensWellList";
import "../admin/admin.css";
import "./field.css";

export function FieldApp() {
  const { items: sites } = useLocalCollection<Site>(db.sites, "site");
  const { items: clients } = useLocalCollection<Client>(db.clients, "client");
  const [siteId, setSiteId] = useState<string | null>(null);

  const selectedSite = sites.find((s) => s.id === siteId) ?? null;

  if (selectedSite) {
    return (
      <div className="field-app">
        <button type="button" className="back-link" onClick={() => setSiteId(null)}>
          ← חזרה לרשימת האתרים
        </button>
        <h1>{selectedSite.name}</h1>
        <FuelLensWellList siteId={selectedSite.id} />
      </div>
    );
  }

  return (
    <div className="field-app">
      <h1>טפסי שטח — בחירת אתר</h1>
      <ul className="entity-list">
        {sites.map((site) => (
          <li key={site.id}>
            <button type="button" className="entity-row" onClick={() => setSiteId(site.id)}>
              {site.name}{" "}
              <span className="tag-list">{clients.find((c) => c.id === site.clientId)?.name}</span>
            </button>
          </li>
        ))}
        {sites.length === 0 && <li className="empty-hint">אין עדיין אתרים — יש להקים אתר תחת "הקמת אתר".</li>}
      </ul>
    </div>
  );
}
