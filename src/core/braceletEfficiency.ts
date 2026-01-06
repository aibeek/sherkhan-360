import type { BraceletRecord, ShiftConfig, BraceletEfficiency } from "./types";
import { calculateLoadCoefficient } from "./loadCoefficient";
import { calculateIntensityCoefficient } from "./intensityCoefficient";
import { calculateStabilityCoefficient } from "./stabilityCoefficient";

export function calculateBraceletEfficiency(
  records: BraceletRecord[],
  config: ShiftConfig
): BraceletEfficiency {
  const { activeMinutes, coefficient: loadCoefficient } =
    calculateLoadCoefficient(records, config);

  const intensityCoefficient = calculateIntensityCoefficient(records);
  const stabilityCoefficient = calculateStabilityCoefficient(records);

  const braceletEfficiency = Number(
    (loadCoefficient * intensityCoefficient * stabilityCoefficient).toFixed(2)
  );

  return {
    activeTimeMinutes: activeMinutes,
    loadCoefficient,
    intensityCoefficient,
    stabilityCoefficient,
    braceletEfficiency,
  };
}
