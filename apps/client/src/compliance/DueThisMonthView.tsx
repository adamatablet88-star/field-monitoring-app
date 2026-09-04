import type {
  ActiveStatus,
  BioVentingSystemVisit,
  FrequencySetting,
  FrequencyValue,
  FuelLensVisit,
  Site,
  SveSystemVisit,
  TreatmentSystem,
  Well,
} from "@field-monitoring/shared";
import { FREQUENCY_LABELS } from "@field-monitoring/shared";
import { db } from "../db";
import { useLocalCollection } from "../admin/useLocalCollection";
import { scopeEquals, siteScope, systemScope } from "../admin/scope";
import { computeDueStatus, DUE_STATUS_LABELS, type DueStatus } from "./dueStatus";
import "./compliance.css";

const DEFAULT_FREQUENCY: FrequencyValue = "annual";

function latestVisitDate(dates: string[]): string | null {
  if (dates.length === 0) return null;
  return dates.reduce((latest, d) => (d > latest ? d : latest));
}

interface Row {
  key: string;
  label: string;
  frequency: FrequencyValue;
  lastVisitDate: string | null;
  active: boolean;
  status: DueStatus;
}

export function DueThisMonthView() {
  const { items: sites } = useLocalCollection<Site>(db.sites, "site");
  const { items: wells } = useLocalCollection<Well>(db.wells, "well");
  const { items: treatmentSystems } = useLocalCollection<TreatmentSystem>(db.treatmentSystems, "treatmentSystem");
  const { items: fuelLensVisits } = useLocalCollection<FuelLensVisit>(db.fuelLensVisits, "fuelLensVisit");
  const { items: sveVisits } = useLocalCollection<SveSystemVisit>(db.sveSystemVisits, "sveSystemVisit");
  const { items: bioVentingVisits } = useLocalCollection<BioVentingSystemVisit>(
    db.bioVentingSystemVisits,
    "bioVentingSystemVisit",
  );
  const { items: frequencySettings } = useLocalCollection<FrequencySetting>(db.frequencySettings, "frequencySetting");
  const { items: activeStatuses } = useLocalCollection<ActiveStatus>(db.activeStatuses, "activeStatus");

  function rowFor(scope: ReturnType<typeof siteScope>, label: string, lastVisitDate: string | null): Row {
    const setting = frequencySettings.find((s) => scopeEquals(s.scope, scope));
    const frequency = setting?.currentFrequency ?? DEFAULT_FREQUENCY;
    const statusRecord = activeStatuses.find((s) => scopeEquals(s.scope, scope));
    const active = statusRecord?.active ?? true;
    const status = computeDueStatus(lastVisitDate, frequency);
    return { key: JSON.stringify(scope), label, frequency, lastVisitDate, active, status };
  }

  const siteRows: Row[] = sites
    .filter((site) => site.protocolTypes.includes("fuelLens"))
    .map((site) => {
      const siteWellIds = new Set(wells.filter((w) => w.siteId === site.id).map((w) => w.id));
      const dates = fuelLensVisits.filter((v) => siteWellIds.has(v.wellId)).map((v) => v.visitDate);
      return rowFor(siteScope(site.id), `${site.name} — עדשת דלק`, latestVisitDate(dates));
    });

  const systemRows: Row[] = treatmentSystems.map((system) => {
    const dates =
      system.systemType === "SVE"
        ? sveVisits.filter((v) => v.systemId === system.id).map((v) => v.visitDate)
        : bioVentingVisits.filter((v) => v.systemId === system.id).map((v) => v.visitDate);
    const site = sites.find((s) => s.id === system.siteId);
    return rowFor(
      systemScope(system.id),
      `${site?.name ?? "?"} — [${system.systemType}] ${system.systemLabel}`,
      latestVisitDate(dates),
    );
  });

  const allRows = [...siteRows, ...systemRows].sort((a, b) => {
    const order: Record<DueStatus, number> = { overdue: 0, near: 1, never: 2, ok: 3 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="field-app">
      <h1>מה נדרש החודש</h1>
      <p className="hint">
        תצוגה בלבד — האפליקציה אינה בונה סידור עבודה אוטומטי, רק מציגה מה "מבשיל" לפי התדירות שהוגדרה לכל אתר/מערכת.
      </p>
      {allRows.length === 0 && <p className="empty-hint">אין עדיין אתרים עם פרוטוקול עדשת דלק או מערכות טיפול.</p>}
      {allRows.length > 0 && (
        <table className="due-table">
          <thead>
            <tr>
              <th>אתר / מערכת</th>
              <th>תדירות נדרשת</th>
              <th>ביקור אחרון</th>
              <th>סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {allRows.map((row) => (
              <tr key={row.key} className={row.active ? undefined : "inactive-row"}>
                <td>{row.label}</td>
                <td>{FREQUENCY_LABELS[row.frequency]}</td>
                <td>{row.lastVisitDate ?? "—"}</td>
                <td>
                  {row.active ? (
                    <span className={`due-badge due-${row.status}`}>{DUE_STATUS_LABELS[row.status]}</span>
                  ) : (
                    <span className="due-badge due-inactive">לא פעיל</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
