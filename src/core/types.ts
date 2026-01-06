export interface BraceletRecord {
  timestamp: string;
  heartRate: number;
  steps?: number;
  spo2?: number;
  systolic?: number;
  diastolic?: number;
  skinTemp?: number;
}

export interface ShiftConfig {
  intervalMinutes: number;
  shiftHours: number;
}

export interface BraceletEfficiency {
  activeTimeMinutes: number;
  loadCoefficient: number;
  intensityCoefficient: number;
  stabilityCoefficient: number;
  braceletEfficiency: number;
}
