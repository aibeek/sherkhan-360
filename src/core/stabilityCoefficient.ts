import type { BraceletRecord } from "./types";

export function calculateStabilityCoefficient(
  records: BraceletRecord[]
): number {
  if (records.length === 0) return 1;

  const riskIntervals = records.filter((r) => {
    if ((r.spo2 ?? 100) < 94) return true;
    if (r.heartRate > 130) return true;
    if ((r.systolic ?? 120) > 150) return true;
    return false;
  }).length;

  const riskRatio = riskIntervals / records.length;
  return Number((1 - riskRatio).toFixed(2));
}
