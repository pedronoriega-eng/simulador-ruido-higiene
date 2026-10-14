export type NoiseType = 'continuo' | 'intermitente' | 'impacto';

export interface NoiseGeneratorPoint {
  id: string;
  name: string;
  type: string;
  relativeX: number; // 0-100%
  relativeY: number; // 0-100%
  splContribution: number; // dB
  freqRange: string;
  mechanism: string;
}

export interface SoundSource {
  id: string;
  name: string;
  category: NoiseType;
  baseSPL: number; // nominal dBA at 1 meter
  description: string;
  spectralPeak: string;
  active: boolean;
  operationMode?: string;
  noiseGenerators: NoiseGeneratorPoint[];
  dutyCycle?: {
    activeSeconds: number;
    restSeconds: number;
  };
  impactRateHz?: number; // for impact noise repetition rate
}

export type FrequencyWeighting = 'A' | 'C' | 'Z';
export type TimeWeighting = 'FAST' | 'SLOW' | 'PEAK';

export interface AcousticMeasurement {
  instantSPL: number;
  splA: number;
  splC: number;
  leq: number;
  lmax: number;
  lmin: number;
  lpeak: number;
  runTimeSeconds: number;
  isCalibrating: boolean;
}

export interface DosimetryResult {
  tPermittedHours: number;
  tPermittedFormatted: string;
  dailyDosePercent: number;
  riskLevel: 'seguro' | 'accion' | 'critico' | 'peligro_pico';
  riskLabel: string;
  normativeReference: string;
  eppRecommendation: string;
  nrrRequired: number;
}

export interface LabPractice {
  id: number;
  title: string;
  objective: string;
  procedure: string[];
  recommendedSource: string;
  expectedObservation: string;
}
