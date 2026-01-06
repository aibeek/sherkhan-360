import type { BraceletRecord, ShiftConfig } from "./types";
import { isActiveInterval } from "./activity";

export function calculateLoadCoefficient(
  records: BraceletRecord[],
  config: ShiftConfig
): { activeMinutes: number; coefficient: number } {
  const activeIntervals = records.filter(isActiveInterval).length;
  const activeMinutes = activeIntervals * config.intervalMinutes;
  const shiftMinutes = config.shiftHours * 60;

  return {
    activeMinutes,
    coefficient: Number((activeMinutes / shiftMinutes).toFixed(2)),
  };
}
