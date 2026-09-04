/**
 * Canonical set of monitoring frequencies, used both for the default/
 * current frequency on a FrequencySetting (admin.ts) and for a scheduled
 * special test's cadence. A closed set (rather than free text) so the
 * "what's due this month" screen can compute a due date instead of
 * parsing a Hebrew string.
 */
export type FrequencyValue = "monthly" | "quarterly" | "semiannual" | "annual";

export const FREQUENCY_DAYS: Record<FrequencyValue, number> = {
  monthly: 30,
  quarterly: 91,
  semiannual: 182,
  annual: 365,
};

export const FREQUENCY_LABELS: Record<FrequencyValue, string> = {
  monthly: "חודשי",
  quarterly: "רבעוני",
  semiannual: "חצי שנתי",
  annual: "שנתי",
};
