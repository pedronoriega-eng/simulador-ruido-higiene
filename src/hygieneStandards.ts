/**
 * Módulo de Evaluación de Riesgo e Higiene Industrial
 * Normativas: Resolución 1792 de 1990 (Colombia), ACGIH, NIOSH, GATISO-HNIR
 */

import { DosimetryResult } from './types';

export type ExchangeRateType = 5 | 3; // 5 dB (Res. 1792 Col / OSHA) | 3 dB (ACGIH / NIOSH / ISO 9612)

export function calculateDosimetry(
  leq: number,
  lpeak: number,
  shiftHours: number = 8,
  exchangeRate: ExchangeRateType = 5
): DosimetryResult {
  // Cálculo de tiempo máximo permisible T_perm
  // Fórmula general: T = 8 / (2 ^ ((Leq - 85) / q))
  let tPermHours = 8 / Math.pow(2, (leq - 85) / exchangeRate);

  if (leq <= 80) {
    tPermHours = 24; // Sin restricción crítica de jornada estándar
  } else if (leq >= 120) {
    tPermHours = 0.01; // ~36 segundos
  }

  // Dosis diaria D% = (C / T) * 100
  const dailyDose = (shiftHours / tPermHours) * 100;

  // Formateo de tiempo legible
  let formattedTime = '';
  if (tPermHours >= 8) {
    formattedTime = '≥ 8 horas (Jornada Completa)';
  } else if (tPermHours >= 1) {
    const hours = Math.floor(tPermHours);
    const minutes = Math.round((tPermHours - hours) * 60);
    formattedTime = minutes > 0 ? `${hours}h ${minutes}m` : `${hours} horas`;
  } else {
    const minutes = Math.floor(tPermHours * 60);
    const seconds = Math.round((tPermHours * 60 - minutes) * 60);
    formattedTime = `${minutes}m ${seconds}s`;
  }

  // Evaluación de Niveles de Riesgo y Semáforo Normativo
  let riskLevel: DosimetryResult['riskLevel'] = 'seguro';
  let riskLabel = 'Nivel Seguro (< 80 dBA)';
  let normativeReference = 'Cumple Resolución 1792 de 1990 y Valores ACGIH.';

  if (lpeak >= 140.0) {
    riskLevel = 'peligro_pico';
    riskLabel = '¡PELIGRO! Pico Excede Límite de 140 dBC';
    normativeReference = 'Infracción Crítica: Res. 1792/1990 Art. 1 prohíbe exposición a picos > 140 dBC.';
  } else if (leq >= 85.0 || dailyDose >= 100) {
    riskLevel = 'critico';
    riskLabel = 'Nivel Crítico (Excede TLV 85 dBA)';
    normativeReference = `Supera el límite para ${shiftHours}h de exposición. Riesgo inminente de Hipoacusia Neurosensorial.`;
  } else if (leq >= 80.0 || dailyDose >= 50) {
    riskLevel = 'accion';
    riskLabel = 'Nivel de Acción (80 - 84.9 dBA)';
    normativeReference = 'GATISO-HNIR: Obliga a ingresar a Programa de Conservación Auditiva y monitoreo periódico.';
  }

  // Recomendación de Elementos de Protección Personal (EPP) y cálculo de NRR
  let eppRecommendation = '';
  let nrrRequired = 0;

  if (riskLevel === 'peligro_pico' || leq > 100) {
    nrrRequired = 33;
    eppRecommendation = 'Doble Protección Auditiva Obligatoria: Tapones de inserción de silicona/espuma (NRR ≥ 28) MÁS Orejeras de copa de alta atenuación (NRR ≥ 30). Reducir tiempo de exposición inmediatamente.';
  } else if (leq >= 90) {
    nrrRequired = 27;
    eppRecommendation = 'Protector tipo Copa / Orejera industrial de alta fidelidad atenuante (NRR 26 a 31 dB). Rotación de puestos y pausas en cabina silenciada.';
  } else if (leq >= 85) {
    nrrRequired = 18;
    eppRecommendation = 'Protector auditivo de inserción premoldeado o de espuma expandible (NRR mínimo 22 dB, atenuación efectiva ≥ 8 dB). Capacitación en ajuste.';
  } else if (leq >= 80) {
    nrrRequired = 10;
    eppRecommendation = 'Uso recomendado de tapones de baja o media atenuación para operarios sensibles. Señalización obligatoria de área ruidosa.';
  } else {
    nrrRequired = 0;
    eppRecommendation = 'Condición acústica confortable. No requiere EPP auditivo obligatorio según normatividad vigente.';
  }

  return {
    tPermittedHours: tPermHours,
    tPermittedFormatted: formattedTime,
    dailyDosePercent: Math.round(dailyDose * 10) / 10,
    riskLevel,
    riskLabel,
    normativeReference,
    eppRecommendation,
    nrrRequired
  };
}

export const LAB_PRACTICES = [
  {
    id: 1,
    title: 'Práctica 1: Diferenciación de Balística FAST vs SLOW en Ruidos Continuos e Intermitentes',
    objective: 'Demostrar experimentalmente cómo la constante de tiempo (tau = 125 ms en FAST vs tau = 1000 ms en SLOW) amortigua la fluctuación de aguja/display en ruidos estables y dinámicos según IEC 61672.',
    recommendedSource: 'sierra',
    procedure: [
      '1. Enciende el Sonómetro pulsando el botón POWER.',
      '2. Activa la fuente "Sierra Circular de Madera" (ruido intermitente con ciclos de corte).',
      '3. Coloca la ponderación temporal en modo FAST (tau = 125 ms). Observa la fluctuación rápida del SPL entre vacío (~82 dBA) y corte (~97 dBA).',
      '4. Cambia a modo SLOW (tau = 1000 ms). Comprueba cómo la inercia temporal suaviza la lectura promediando las variaciones abruptas.',
      '5. Conclusión: Para mediciones higiénicas de ruido continuo o con fluctuaciones moderadas se usa SLOW; para evaluar variabilidad rápida se usa FAST.'
    ],
    expectedObservation: 'En FAST el display oscila más de 12 dB entre cortes; en SLOW la lectura se estabiliza con variaciones menores a 3 dB.'
  },
  {
    id: 2,
    title: 'Práctica 2: Comparación de Curvas A y C en Ruido de Impacto e Impulso',
    objective: 'Comprobar por qué la Curva A (dB(A)) subestima la energía destructiva de baja frecuencia en impactos mecánicos rápidos, mientras la Curva C y el detector Peak registran la verdadera presión acústica instantánea.',
    recommendedSource: 'troqueladora',
    procedure: [
      '1. Selecciona la "Prensa Troqueladora Excéntrica" (ruido de impacto con golpe seco).',
      '2. Configura el sonómetro con filtro Curva A y observa el valor instantáneo y Lmax (~88-92 dBA).',
      '3. Conmuta el filtro a Curva C: el nivel sube drásticamente debido a la preservación de los componentes subsónicos del choque.',
      '4. Pulsa el botón PEAK para congelar la cresta acústica p(t): comprueba cómo el detector Peak supera los 130 dBC Peak.',
      '5. Revisa el semáforo de riesgo: la Resolución 1792/1990 establece 140 dBC Peak como límite absoluto intransgredible.'
    ],
    expectedObservation: 'La lectura en dBC es entre 8 y 15 dB mayor que en dBA para el impacto de la prensa, y el valor Peak excede ampliamente el Leq promediado.'
  },
  {
    id: 3,
    title: 'Práctica 3: Ley del Inverso al Cuadrado y Cálculo de Dosis Diaria de Exposición',
    objective: 'Verificar la atenuación geométrica del sonido en campo libre (-6 dB por duplicación de distancia) y calcular la Dosis de Ruido acumulada (Leq) frente a la jornada laboral de 8 horas.',
    recommendedSource: 'compresor',
    procedure: [
      '1. Enciende el "Compresor de Tornillo Industrial" a 1.0 metro de distancia.',
      '2. Inicia la integración acumulativa pulsando "START Leq". Espera 5 segundos y anota el Leq (~89 dBA).',
      '3. Desplaza el potenciómetro de distancia a 2.0 metros (duplicación): observa la caída teórica de ~6 dB (nivel resultante ~83 dBA).',
      '4. Desplaza a 4.0 metros: la atenuación acumulada alcanza ~12 dB.',
      '5. Analiza el panel de Higiene: a 1.0 m la dosis para 8 horas supera el 170% (infracción); a 2.0 m el nivel cae por debajo de 85 dBA, reduciendo la dosis por debajo del 100% admisible.'
    ],
    expectedObservation: 'Cada vez que se duplica la distancia (1m -> 2m -> 4m), el nivel sonoro disminuye aproximadamente 6 dB, permitiendo controlar el riesgo mediante alejamiento físico.'
  }
];
