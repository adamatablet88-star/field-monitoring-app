import type { ParameterConfig, ParameterReading } from "@field-monitoring/shared";
import { db } from "../db";
import { useLocalCollection } from "../admin/useLocalCollection";
import { isCriticalTriggered } from "./criticalThreshold";
import { CriticalBanner } from "./CriticalBanner";

interface ExtraParametersFieldsProps {
  systemId: string;
  readings: ParameterReading[];
  onChange: (readings: ParameterReading[]) => void;
}

/**
 * Renders every admin-configured ParameterConfig for this system beyond
 * the visit form's fixed fields — the "add a gauge with no code change"
 * extensibility hatch (docs/data-model.md section 8), soft-warning range
 * hint included, critical-threshold banner included.
 */
export function ExtraParametersFields({ systemId, readings, onChange }: ExtraParametersFieldsProps) {
  const { items: allParameters } = useLocalCollection<ParameterConfig>(db.parameterConfigs, "parameterConfig");
  const parameters = allParameters.filter((p) => p.systemId === systemId).sort((a, b) => a.order - b.order);

  if (parameters.length === 0) return null;

  function valueFor(parameterId: string): string {
    const reading = readings.find((r) => r.parameterId === parameterId);
    return reading ? String(reading.value) : "";
  }

  function setValue(parameterId: string, raw: string) {
    const rest = readings.filter((r) => r.parameterId !== parameterId);
    onChange(raw.trim() ? [...rest, { parameterId, value: Number(raw) }] : rest);
  }

  return (
    <fieldset>
      <legend>פרמטרים נוספים</legend>
      {parameters.map((param) => {
        const raw = valueFor(param.id);
        const numValue = raw.trim() ? Number(raw) : null;
        const outOfRange =
          numValue !== null &&
          ((param.minValue !== null && numValue < param.minValue) || (param.maxValue !== null && numValue > param.maxValue));
        const critical = isCriticalTriggered(numValue, param);
        return (
          <div key={param.id} className="parameter-reading-row">
            <label>
              {param.label} {param.unit && `(${param.unit})`}
              <input type="number" step="any" value={raw} onChange={(e) => setValue(param.id, e.target.value)} />
            </label>
            {(param.minValue !== null || param.maxValue !== null) && (
              <span className="hint">
                טווח תקין: {param.minValue ?? "—"}–{param.maxValue ?? "—"}
                {outOfRange ? " (חריגה מהטווח)" : ""}
              </span>
            )}
            {critical && <CriticalBanner message={param.criticalMessage} />}
          </div>
        );
      })}
    </fieldset>
  );
}
