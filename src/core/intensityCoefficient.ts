import type { BraceletRecord } from "./types";
import { isActiveInterval } from "./activity";

export function calculateIntensityCoefficient(
  records: BraceletRecord[]
): number {
  const activeRecords = records.filter(isActiveInterval);
  if (activeRecords.length === 0) return 0.7;

  const avgHeartRate =
    activeRecords.reduce((sum, r) => sum + r.heartRate, 0) /
    activeRecords.length;

  if (avgHeartRate < 85) return 0.8;
  if (avgHeartRate <= 110) return 1.0;
  if (avgHeartRate <= 125) return 0.9;
  return 0.7;
}
