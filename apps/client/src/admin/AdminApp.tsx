import { useState } from "react";
import type { TreatmentSystem } from "@field-monitoring/shared";
import { db } from "../db";
import { useLocalCollection } from "./useLocalCollection";
import { ClientsPanel } from "./ClientsPanel";
import { SitesPanel } from "./SitesPanel";
import { WellsPanel } from "./WellsPanel";
import { TanksPanel } from "./TanksPanel";
import { TreatmentSystemsPanel } from "./TreatmentSystemsPanel";
import { TreatmentSystemDetail } from "./TreatmentSystemDetail";
import "./admin.css";

type Tab = "wells" | "tanks" | "systems";

export function AdminApp() {
  const [clientId, setClientId] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("wells");
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);

  const { items: treatmentSystems } = useLocalCollection<TreatmentSystem>(db.treatmentSystems, "treatmentSystem");
  const selectedSystem = treatmentSystems.find((s) => s.id === selectedSystemId) ?? null;

  function selectClient(id: string) {
    setClientId(id);
    setSiteId(null);
    setSelectedSystemId(null);
  }

  function selectSite(id: string) {
    setSiteId(id);
    setSelectedSystemId(null);
  }

  return (
    <div className="admin-app">
      <h1>הקמת אתר</h1>

      <ClientsPanel selectedClientId={clientId} onSelect={selectClient} />

      {clientId && <SitesPanel clientId={clientId} selectedSiteId={siteId} onSelect={selectSite} />}

      {clientId && siteId && (
        <>
          <nav className="tab-bar">
            <button type="button" className={activeTab === "wells" ? "active" : ""} onClick={() => setActiveTab("wells")}>
              קידוחי עדשת דלק
            </button>
            <button type="button" className={activeTab === "tanks" ? "active" : ""} onClick={() => setActiveTab("tanks")}>
              מיכלים
            </button>
            <button
              type="button"
              className={activeTab === "systems" ? "active" : ""}
              onClick={() => setActiveTab("systems")}
            >
              מערכות טיפול
            </button>
          </nav>

          {activeTab === "wells" && <WellsPanel siteId={siteId} />}
          {activeTab === "tanks" && <TanksPanel siteId={siteId} />}
          {activeTab === "systems" && (
            <>
              <TreatmentSystemsPanel siteId={siteId} selectedSystemId={selectedSystemId} onSelect={setSelectedSystemId} />
              {selectedSystem && <TreatmentSystemDetail system={selectedSystem} />}
            </>
          )}
        </>
      )}
    </div>
  );
}
