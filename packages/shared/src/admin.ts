export type FrequencyScope = { siteId: string } | { systemId: string };

export interface FrequencySetting {
  id: string;
  scope: FrequencyScope;
  /** Annual by default per the client contract; editable mid-year. */
  defaultFrequency: string;
  currentFrequency: string;
  history: Array<{
    changedBy: string;
    changedAt: string;
    reason: string;
    previousValue: string;
  }>;
}

export interface ActiveStatus {
  id: string;
  scope: FrequencyScope;
  active: boolean;
  source: "technician" | "admin";
  reason: string;
}

export type RegulatoryReportType = "fuel_lens" | "treatment_systems";
export type RegulatoryReportStatus = "not_started" | "in_progress" | "submitted";

export interface RegulatoryReport {
  id: string;
  siteId: string;
  /** fuel_lens: quarterly. treatment_systems: semi-annual. */
  type: RegulatoryReportType;
  period: string;
  status: RegulatoryReportStatus;
}

export type SpecialTestType = "TO-15" | "annual_oxygen_consumption";
export type SpecialTestFrequency = "quarterly" | "semiannual" | "annual";

export interface ScheduledSpecialTest {
  id: string;
  scope: { systemId: string };
  testType: SpecialTestType;
  /** TO-15: quarterly for SVE, annual for Bio-venting. Oxygen test: annual, Bio-venting only. */
  frequency: SpecialTestFrequency;
}
