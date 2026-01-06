import type { BraceletRecord } from "./types";

export function isActiveInterval(record: BraceletRecord): boolean {
  let conditions = 0;

  if (record.heartRate >= 85) conditions++;
  if ((record.steps ?? 0) > 0) conditions++;
  if ((record.skinTemp ?? 0) > 33) conditions++;

  return conditions >= 2;
}
