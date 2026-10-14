import React from 'react';
import { SoundSource } from '../types';
import { Activity, Volume2, ShieldCheck, Ruler, Wrench, Layers } from 'lucide-react';

interface MachineVisualizerProps {
  selectedSource: SoundSource | null;
  isActive: boolean;
  distance: number;
}

export const MachineVisualizer: React.FC<MachineVisualizerProps> = ({
  selectedSource,
  isActive,
  distance
}) => {
  if (!selectedSource) {
    return (
      <div className="cad-industrial-steel cad-bevel-panel rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-16 h-16 rounded-2xl cad-chassis-faceplate cad-bevel-panel-subtle flex items-center justify-center text-[#f97316] mb-3">
          <Activity className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-100 mb-1 font-mono">
          Ninguna Máquina Seleccionada
        </h3>
        <p className="text-xs text-slate-400 max-w-md">
          Seleccione una máquina en el banco de ensayos para inspeccionar su diseño cinemático CAD SolidWorks®, tolerancias dimensionales y espectro sonoro.
        </p>
      </div>
    );
  }

  // Renderizado vectorial de plano técnico SolidWorks (ISO 7200 / DIN A3) con cotas, cortes y tolerancias
  const renderTechnicalCADBlueprint = () => {
    switch (selectedSource.id) {
      case 'compresor':
        return (
          <svg viewBox="0 0 540 320" className="w-full h-full drop-shadow-md font-mono select-none">
            <defs>
              {/* Patrón de rayado técnico para corte seccional SolidWorks DIN 476 */}
              <pattern id="cadHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="8" stroke="#475569" strokeWidth="1" opacity="0.6" />
              </pattern>
              <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="screwMetal" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="50%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
            </defs>

            {/* Cuadrícula milimétrica de referencia CAD */}
            <g stroke="#334155" strokeWidth="0.5" opacity="0.25">
              {[0, 60, 120, 180, 240, 300, 360, 420, 480].map(x => (
                <line key={`gx-${x}`} x1={x} y1="0" x2={x} y2="320" />
              ))}
              {[0, 40, 80, 120, 160, 200, 240, 280].map(y => (
                <line key={`gy-${y}`} x1="0" y1={y} x2="540" y2={y} />
              ))}
            </g>

            {/* Marco del plano normalizado SolidWorks con coordenadas de zona */}
            <rect x="12" y="12" width="516" height="296" fill="none" stroke="#64748b" strokeWidth="1.5" />
            <rect x="16" y="16" width="508" height="288" fill="none" stroke="#475569" strokeWidth="0.75" />

            {/* 1. Bancada y Guías de Horquilla (Skid de Vigas UPN) */}
            <rect x="40" y="240" width="440" height="22" rx="3" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="70" y="245" width="45" height="12" rx="2" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
            <rect x="385" y="245" width="45" height="12" rx="2" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
            {/* Patines de amortiguación */}
            <rect x="65" y="262" width="55" height="10" rx="3" fill="#ea580c" opacity="0.9" />
            <rect x="380" y="262" width="55" height="10" rx="3" fill="#ea580c" opacity="0.9" />

            {/* 2. Cabina Acústica / Chasis Kaeser SIGMA con Sección Abierta (Cutaway) */}
            <rect x="55" y="60" width="410" height="180" rx="8" fill="url(#metalGrad)" stroke="#cbd5e1" strokeWidth="2" />
            
            {/* Rejilla de persianas acústicas estampadas (Louvers) */}
            <g stroke="#94a3b8" strokeWidth="1.5">
              {[80, 95, 110, 125, 140, 155].map(y => (
                <line key={`louver-${y}`} x1="70" y1={y} x2="125" y2={y} />
              ))}
            </g>
            <text x="98" y="172" fontSize="7" fill="#94a3b8" textAnchor="middle">LOUVERS ACÚSTICOS</text>

            {/* 3. Ventana de Inspección en Sección: Bloque Compresor de Doble Tornillo Helicoidal */}
            <rect x="150" y="85" width="175" height="100" rx="6" fill="#0b0f17" stroke="#ea580c" strokeWidth="2" />
            <rect x="154" y="89" width="167" height="92" rx="4" fill="url(#cadHatch)" opacity="0.4" />

            {/* Rotores Helicoidales Interconectados (Macho y Hembra) */}
            <g className={isActive ? 'animate-pulse' : ''}>
              {/* Rotor Macho (4 lóbulos) */}
              <path
                d="M 165 115 Q 185 102 205 115 T 245 115 T 285 115"
                fill="none"
                stroke="url(#screwMetal)"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Rotor Hembra (6 lóbulos conjugados) */}
              <path
                d="M 165 145 Q 185 158 205 145 T 245 145 T 285 145"
                fill="none"
                stroke="url(#screwMetal)"
                strokeWidth="16"
                strokeLinecap="round"
              />
            </g>

            {/* Rodamientos SKF en los extremos con tornillos Allen */}
            <rect x="155" y="100" width="10" height="65" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
            <rect x="300" y="100" width="10" height="65" fill="#475569" stroke="#94a3b8" strokeWidth="1" />

            {/* 4. Motor Eléctrico Trifásico IE3 de 110 kW (Acople Directo) */}
            <rect x="340" y="95" width="115" height="90" rx="6" fill="#1e2530" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Aletas de refrigeración estatóricas */}
            <g stroke="#64748b" strokeWidth="1.5">
              {[105, 115, 125, 135, 145, 155, 165, 175].map(y => (
                <line key={`fin-${y}`} x1="345" y1={y} x2="435" y2={y} />
              ))}
            </g>
            {/* Ventilador trasero de refrigeración */}
            <rect x="435" y="102" width="16" height="76" rx="3" fill="#ea580c" />

            {/* 5. Depósito Separador Ciclónico Vertical (11 bar) */}
            <rect x="480" y="80" width="40" height="140" rx="16" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
            {/* Brida superior con pernos */}
            <rect x="475" y="80" width="50" height="8" fill="#475569" stroke="#cbd5e1" strokeWidth="1" />
            {/* Mirilla de nivel de aceite de pyrex */}
            <rect x="495" y="130" width="10" height="40" rx="3" fill="#f59e0b" opacity="0.9" stroke="#cbd5e1" strokeWidth="1" />

            {/* Manómetro de Presión Neumática con aguja indicadora */}
            <circle cx="100" cy="205" r="20" fill="#f8fafc" stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="100" cy="205" r="16" fill="#e2e8f0" />
            <line
              x1="100"
              y1="205"
              x2="108"
              y2="194"
              stroke="#dc2626"
              strokeWidth="2.5"
              strokeLinecap="round"
              className={isActive ? 'origin-[100px_205px] animate-spin [animation-duration:2.5s]' : ''}
            />
            <circle cx="100" cy="205" r="3" fill="#0f172a" />
            <text x="100" y="218" fontSize="6" textAnchor="middle" fill="#0f172a" fontWeight="bold">10 BAR</text>

            {/* Líneas de Cota de Ingeniería SolidWorks (Cotación ISO) */}
            <g stroke="#38bdf8" strokeWidth="1" opacity="0.85">
              {/* Cota horizontal total L = 2400 mm */}
              <line x1="40" y1="285" x2="480" y2="285" />
              <line x1="40" y1="280" x2="40" y2="290" />
              <line x1="480" y1="280" x2="480" y2="290" />
              <polygon points="40,285 48,283 48,287" fill="#38bdf8" />
              <polygon points="480,285 472,283 472,287" fill="#38bdf8" />
              <text x="260" y="282" fontSize="9" textAnchor="middle" fill="#38bdf8" fontWeight="bold">
                L = 2400 mm ± 0.5
              </text>

              {/* Cota vertical H = 1800 mm */}
              <line x1="26" y1="60" x2="26" y2="262" />
              <line x1="22" y1="60" x2="30" y2="60" />
              <line x1="22" y1="262" x2="30" y2="262" />
              <polygon points="26,60 24,68 28,68" fill="#38bdf8" />
              <polygon points="26,262 24,254 28,254" fill="#38bdf8" />
              <text x="20" y="165" fontSize="8" textAnchor="middle" fill="#38bdf8" fontWeight="bold" transform="rotate(-90 20 165)">
                H = 1800 mm
              </text>
            </g>

            {/* Cajetín de Rotulación de Ingeniería SolidWorks ISO 7200 */}
            <g transform="translate(240, 205)">
              <rect x="0" y="0" width="190" height="42" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.2" />
              <line x1="0" y1="14" x2="190" y2="14" stroke="#475569" strokeWidth="1" />
              <line x1="0" y1="28" x2="190" y2="28" stroke="#475569" strokeWidth="1" />
              <line x1="95" y1="14" x2="95" y2="42" stroke="#475569" strokeWidth="1" />
              <text x="6" y="10" fontSize="8" fill="#ea580c" fontWeight="bold">SOLIDWORKS® CAD - ENSAMBLAJE CSDX 165</text>
              <text x="6" y="23" fontSize="7" fill="#94a3b8">ESCALA: 1:15</text>
              <text x="100" y="23" fontSize="7" fill="#94a3b8">MATERIAL: EN-GJS-500-7</text>
              <text x="6" y="37" fontSize="7" fill="#38bdf8">ISO 9612: LwA 93 dB(A)</text>
              <text x="100" y="37" fontSize="7" fill="#34d399">TOLERANCIA: ISO 2768-mK</text>
            </g>
          </svg>
        );

      case 'turbina':
        return (
          <svg viewBox="0 0 540 320" className="w-full h-full drop-shadow-md font-mono select-none">
            <rect x="12" y="12" width="516" height="296" fill="none" stroke="#64748b" strokeWidth="1.5" />
            <rect x="16" y="16" width="508" height="288" fill="none" stroke="#475569" strokeWidth="0.75" />

            {/* Bancada estructural UPN con pernos de anclaje */}
            <rect x="50" y="240" width="440" height="22" rx="3" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
            {[80, 200, 360, 460].map(x => (
              <circle key={`anchor-${x}`} cx={x} cy="251" r="5" fill="#ea580c" stroke="#cbd5e1" strokeWidth="1" />
            ))}

            {/* Voluta Espiral Aerodinámica Logarítmica */}
            <path
              d="M 230 45 C 330 45 390 100 390 160 C 390 220 310 235 230 235 C 150 235 110 190 110 140 C 110 80 170 45 230 45 Z"
              fill="#1e3a5f"
              stroke="#38bdf8"
              strokeWidth="3"
            />

            {/* Brida de aspiración axial circular con círculo de 8 pernos */}
            <circle cx="230" cy="140" r="62" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
            <circle cx="230" cy="140" r="48" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 2" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
              const rad = (deg * Math.PI) / 180;
              return (
                <circle
                  key={`bolt-${deg}`}
                  cx={230 + Math.cos(rad) * 55}
                  cy={140 + Math.sin(rad) * 55}
                  r="3.5"
                  fill="#f8fafc"
                  stroke="#0f172a"
                  strokeWidth="1"
                />
              );
            })}

            {/* Rodete centrífugo giratorio de 12 álabes de doble curvatura */}
            <g
              transform="translate(230, 140)"
              className={isActive ? 'animate-spin [animation-duration:0.5s]' : ''}
            >
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => (
                <path
                  key={`blade-${angle}`}
                  d="M 0 0 C 14 -12 28 -16 44 -6"
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth="5"
                  strokeLinecap="round"
                  transform={`rotate(${angle})`}
                />
              ))}
              <circle cx="0" cy="0" r="16" fill="#475569" stroke="#cbd5e1" strokeWidth="2" />
              <polygon points="0,-8 7,5 -7,5" fill="#f8fafc" />
            </g>

            {/* Tobera de impulsión tangencial con brida y fuelle elastomérico */}
            <path d="M 330 65 L 330 25 L 405 25 L 405 110" fill="#1e3a5f" stroke="#38bdf8" strokeWidth="3" />
            <rect x="325" y="22" width="85" height="8" fill="#ea580c" />

            {/* Soporte de rodamientos SKF SNL con engrasador de latón */}
            <rect x="65" y="115" width="45" height="60" rx="4" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
            <circle cx="87" cy="112" r="4" fill="#f59e0b" />
            <text x="87" y="185" fontSize="7" fill="#94a3b8" textAnchor="middle">SKF SNL 512</text>

            {/* Cotas técnicas */}
            <g stroke="#38bdf8" strokeWidth="1" opacity="0.85">
              <line x1="230" y1="275" x2="405" y2="275" />
              <polygon points="230,275 237,273 237,277" fill="#38bdf8" />
              <polygon points="405,275 398,273 398,277" fill="#38bdf8" />
              <text x="318" y="271" fontSize="9" textAnchor="middle" fill="#38bdf8" fontWeight="bold">
                DIÁMETRO VOLUTA Ø 720 mm
              </text>
            </g>

            {/* Cajetín SolidWorks */}
            <g transform="translate(300, 185)">
              <rect x="0" y="0" width="200" height="42" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.2" />
              <line x1="0" y1="14" x2="200" y2="14" stroke="#475569" strokeWidth="1" />
              <text x="6" y="10" fontSize="8" fill="#ea580c" fontWeight="bold">TURBINA CENTRÍFUGA ALTA PRESIÓN</text>
              <text x="6" y="25" fontSize="7" fill="#94a3b8">BPF = 600 Hz (12 ÁLABES @ 3000 RPM)</text>
              <text x="6" y="37" fontSize="7" fill="#34d399">CAUDAL: 12000 m3/h | PRES. 4500 Pa</text>
            </g>
          </svg>
        );

      case 'sierra':
        return (
          <svg viewBox="0 0 540 320" className="w-full h-full drop-shadow-md font-mono select-none">
            <rect x="12" y="12" width="516" height="296" fill="none" stroke="#64748b" strokeWidth="1.5" />
            <rect x="16" y="16" width="508" height="288" fill="none" stroke="#475569" strokeWidth="0.75" />

            {/* Mesa principal de fundición rectificada con ranuras en T */}
            <rect x="40" y="150" width="440" height="24" rx="3" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
            {/* Ranuras T mecanizadas */}
            <rect x="90" y="150" width="8" height="8" fill="#475569" />
            <rect x="390" y="150" width="8" height="8" fill="#475569" />

            {/* Mueble base de chapa plegada con puerta de acceso */}
            <rect x="70" y="174" width="380" height="85" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
            <rect x="160" y="185" width="200" height="65" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />

            {/* Volante de inclinación angular 0-45° con graduación */}
            <circle cx="120" cy="220" r="18" fill="#f8fafc" stroke="#475569" strokeWidth="2" />
            <circle cx="120" cy="220" r="14" fill="#cbd5e1" />
            <circle cx="120" cy="220" r="4" fill="#0f172a" />

            {/* Guía paralela de corte (Rip Fence) */}
            <rect x="330" y="115" width="22" height="35" rx="3" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
            <rect x="325" y="142" width="32" height="8" fill="#0f172a" />

            {/* Hoja de Sierra Circular TCT de 350 mm (60 Dientes de Widia) */}
            <g
              transform="translate(240, 135)"
              className={isActive ? 'animate-spin [animation-duration:0.2s]' : ''}
            >
              <circle cx="0" cy="0" r="62" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
              {/* Dientes de metal duro */}
              {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340].map(deg => (
                <path
                  key={`sawtooth-${deg}`}
                  d="M 58 0 L 67 -8 L 61 7 Z"
                  fill="#ea580c"
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle cx="0" cy="0" r="18" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="6" fill="#f8fafc" />
            </g>

            {/* Campana protectora superior transparente con toma de aspiración DN60 */}
            <path d="M 170 120 C 200 65 280 65 310 120" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
            <rect x="230" y="55" width="20" height="25" rx="3" fill="#475569" />

            {/* Partículas de corte durante operación */}
            {isActive && (
              <g fill="#ea580c" className="animate-pulse">
                <circle cx="260" cy="120" r="3" />
                <circle cx="275" cy="112" r="2.5" />
                <circle cx="290" cy="105" r="3.5" />
                <circle cx="305" cy="98" r="2" />
              </g>
            )}

            {/* Cajetín SolidWorks */}
            <g transform="translate(280, 205)">
              <rect x="0" y="0" width="220" height="42" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.2" />
              <text x="6" y="10" fontSize="8" fill="#ea580c" fontWeight="bold">SIERRA CIRCULAR INDUSTRIAL 350 mm</text>
              <text x="6" y="24" fontSize="7" fill="#94a3b8">HOJA TCT: 60 DIENTES | VEL. 4200 RPM</text>
              <text x="6" y="37" fontSize="7" fill="#38bdf8">EMISIÓN ACÚSTICA: ~98.7 dB(A) @ 1.0 m</text>
            </g>
          </svg>
        );

      case 'pulidora':
        return (
          <svg viewBox="0 0 540 320" className="w-full h-full drop-shadow-md font-mono select-none">
            <rect x="12" y="12" width="516" height="296" fill="none" stroke="#64748b" strokeWidth="1.5" />
            <rect x="16" y="16" width="508" height="288" fill="none" stroke="#475569" strokeWidth="0.75" />

            {/* Mesa de banco de ensayos de metalmecánica con mordaza */}
            <rect x="40" y="210" width="440" height="25" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            <rect x="100" y="165" width="55" height="45" rx="3" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Viga IPN sometida a desbaste */}
            <rect x="125" y="175" width="220" height="24" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1.5" />

            {/* Amoladora Angular de Gran Potencia (2400 W, Disco 230 mm) */}
            <g transform="translate(260, 100) rotate(-22)">
              {/* Carcasa motor y mango SoftGrip */}
              <rect x="0" y="18" width="165" height="40" rx="10" fill="#ea580c" stroke="#c2410c" strokeWidth="2" />
              <rect x="110" y="24" width="70" height="28" rx="6" fill="#0f172a" />
              <rect x="175" y="29" width="20" height="18" rx="3" fill="#334155" />
              {/* Empuñadura lateral auxiliar antivibratoria */}
              <rect x="45" y="-28" width="18" height="46" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />

              {/* Cabezal de engranajes angulares AlSi10Mg */}
              <path d="M 0 12 L 32 12 L 32 64 L 0 64 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
              {/* Botón rojo de bloqueo del husillo */}
              <circle cx="16" cy="18" r="4" fill="#dc2626" />

              {/* Guarda de protección metálica contra chispas */}
              <path d="M -18 38 C -18 5 -18 5 -18 -15" stroke="#0f172a" strokeWidth="8" strokeLinecap="round" />

              {/* Disco abrasivo giratorio 230 mm con centro embutido */}
              <ellipse
                cx="-14"
                cy="38"
                rx="8"
                ry="58"
                fill="#334155"
                stroke="#64748b"
                strokeWidth="2.5"
                className={isActive ? 'animate-spin [animation-duration:0.18s]' : ''}
              />
              <circle cx="-14" cy="38" r="6" fill="#f8fafc" />
            </g>

            {/* Torrente de Chispas Abrasivas Incandescentes */}
            {isActive && (
              <g className="text-amber-400">
                <line x1="280" y1="185" x2="360" y2="205" stroke="#fbbf24" strokeWidth="2" strokeDasharray="8 6" className="animate-pulse" />
                <line x1="280" y1="187" x2="380" y2="215" stroke="#f97316" strokeWidth="1.5" strokeDasharray="10 8" className="animate-pulse [animation-delay:0.1s]" />
                <line x1="280" y1="189" x2="350" y2="225" stroke="#facc15" strokeWidth="2.5" strokeDasharray="6 4" className="animate-pulse [animation-delay:0.2s]" />
              </g>
            )}

            {/* Cajetín SolidWorks */}
            <g transform="translate(270, 225)">
              <rect x="0" y="0" width="230" height="42" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.2" />
              <text x="6" y="10" fontSize="8" fill="#ea580c" fontWeight="bold">ESMERILADORA ANGULAR 2400 W (230 mm)</text>
              <text x="6" y="24" fontSize="7" fill="#94a3b8">VELOCIDAD: 6600 RPM | 80 m/s CORINDÓN</text>
              <text x="6" y="37" fontSize="7" fill="#ef4444">NIVEL SONORO: ~96.2 dB(A) RUIDO ALTA FREC.</text>
            </g>
          </svg>
        );

      case 'troqueladora':
        return (
          <svg viewBox="0 0 540 320" className="w-full h-full drop-shadow-md font-mono select-none">
            <rect x="12" y="12" width="516" height="296" fill="none" stroke="#64748b" strokeWidth="1.5" />
            <rect x="16" y="16" width="508" height="288" fill="none" stroke="#475569" strokeWidth="0.75" />

            {/* Bastidor en Cuello de Cisne (C-Frame 80T) */}
            <path
              d="M 120 250 L 320 250 L 320 205 L 210 205 L 210 95 L 340 95 L 340 45 L 120 45 Z"
              fill="#1e293b"
              stroke="#64748b"
              strokeWidth="2.5"
            />
            {/* Nervadura de refuerzo en la garganta del bastidor */}
            <path d="M 140 70 L 190 70 L 190 225 L 140 225 Z" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />

            {/* Mesa bolster rectificada */}
            <rect x="180" y="195" width="135" height="14" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />

            {/* Volante de inercia lateral con ranuras de polea */}
            <circle cx="160" cy="70" r="48" fill="#334155" stroke="#cbd5e1" strokeWidth="3" />
            <circle cx="160" cy="70" r="36" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            {/* Radios del volante */}
            {[0, 60, 120].map(deg => (
              <line
                key={`spoke-${deg}`}
                x1={160 + Math.cos((deg * Math.PI) / 180) * 44}
                y1={70 + Math.sin((deg * Math.PI) / 180) * 44}
                x2={160 - Math.cos((deg * Math.PI) / 180) * 44}
                y2={70 - Math.sin((deg * Math.PI) / 180) * 44}
                stroke="#cbd5e1"
                strokeWidth="4"
              />
            ))}

            {/* Corredera / Ram móvil alternativa de punzonado */}
            <g
              transform="translate(245, 95)"
              className={isActive ? 'animate-bounce [animation-duration:0.35s]' : ''}
            >
              <rect x="0" y="0" width="55" height="60" rx="3" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
              {/* Punzón de corte D2 */}
              <polygon points="18,60 37,60 32,80 23,80" fill="#ea580c" stroke="#b45309" strokeWidth="1.5" />
            </g>

            {/* Matriz inferior y chapa metálica de 4 mm */}
            <rect x="235" y="180" width="75" height="15" rx="2" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
            <rect x="215" y="176" width="115" height="5" fill="#38bdf8" />

            {/* Ondas de choque sonoro de impacto Peak */}
            {isActive && (
              <g stroke="#ef4444" strokeWidth="2.5" fill="none" className="animate-ping">
                <circle cx="272" cy="175" r="16" opacity="0.9" />
                <circle cx="272" cy="175" r="32" opacity="0.6" />
                <circle cx="272" cy="175" r="48" opacity="0.3" />
              </g>
            )}

            {/* Barreras ópticas fotoeléctricas de Categoría 4 */}
            <rect x="205" y="125" width="8" height="65" fill="#facc15" />
            <rect x="330" y="125" width="8" height="65" fill="#facc15" />

            {/* Cajetín SolidWorks */}
            <g transform="translate(270, 210)">
              <rect x="0" y="0" width="230" height="42" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.2" />
              <text x="6" y="10" fontSize="8" fill="#ea580c" fontWeight="bold">PRENSA EXCÉNTRICA 80T (C-FRAME)</text>
              <text x="6" y="24" fontSize="7" fill="#94a3b8">CARRERA: 120 mm | FUERZA NOMINAL: 800 kN</text>
              <text x="6" y="37" fontSize="7" fill="#ef4444">RUIDO DE IMPACTO: ~104.5 dB (PEAK &gt; 120 dB)</text>
            </g>
          </svg>
        );

      case 'martinete':
        return (
          <svg viewBox="0 0 540 320" className="w-full h-full drop-shadow-md font-mono select-none">
            <rect x="12" y="12" width="516" height="296" fill="none" stroke="#64748b" strokeWidth="1.5" />
            <rect x="16" y="16" width="508" height="288" fill="none" stroke="#475569" strokeWidth="0.75" />

            {/* Yunque de forja masivo de 12 Toneladas aislado */}
            <polygon points="170,250 370,250 350,175 190,175" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2.5" />
            <rect x="230" y="160" width="80" height="16" fill="#475569" stroke="#94a3b8" strokeWidth="2" />

            {/* Palanquilla de acero incandescente a 1150 °C */}
            <rect x="245" y="148" width="50" height="14" rx="2" fill="#ff4500" stroke="#ff8c00" strokeWidth="1.5" className="animate-pulse" />

            {/* Columnas verticales gemelas de guiado */}
            <rect x="150" y="45" width="35" height="160" fill="#334155" stroke="#64748b" strokeWidth="2" />
            <rect x="355" y="45" width="35" height="160" fill="#334155" stroke="#64748b" strokeWidth="2" />

            {/* Cilindro neumático superior de potencia */}
            <rect x="215" y="35" width="110" height="65" rx="6" fill="#1e2530" stroke="#cbd5e1" strokeWidth="2" />

            {/* Maza móvil / Pilón de impacto de 250 kg */}
            <g
              transform="translate(235, 80)"
              className={isActive ? 'animate-bounce [animation-duration:0.25s]' : ''}
            >
              <rect x="0" y="0" width="70" height="55" rx="3" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
              <rect x="10" y="55" width="50" height="14" fill="#ea580c" />
            </g>

            {/* Pedal perimetral de pie para mando de golpe */}
            <path d="M 150 258 Q 270 270 390 258" fill="none" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />

            {/* Ondas transitorias de choque de forja */}
            {isActive && (
              <g stroke="#ff4500" strokeWidth="3" fill="none" className="animate-ping">
                <circle cx="270" cy="155" r="18" opacity="0.9" />
                <circle cx="270" cy="155" r="36" opacity="0.6" />
                <circle cx="270" cy="155" r="54" opacity="0.3" />
              </g>
            )}

            {/* Cajetín SolidWorks */}
            <g transform="translate(270, 205)">
              <rect x="0" y="0" width="230" height="42" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.2" />
              <text x="6" y="10" fontSize="8" fill="#ea580c" fontWeight="bold">MARTINETE NEUMÁTICO PILÓN 250 kg</text>
              <text x="6" y="24" fontSize="7" fill="#94a3b8">ENERGÍA DE GOLPE: 4.8 kJ | YUNQUE 12 T</text>
              <text x="6" y="37" fontSize="7" fill="#ef4444">RUIDO DE IMPACTO: ~108.2 dB (PEAK &gt; 130 dB)</text>
            </g>
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div className="cad-industrial-steel cad-bevel-panel rounded-2xl p-4 relative overflow-hidden flex flex-col md:flex-row gap-5 items-stretch">
      {/* Tornillería Allen de fijación */}
      <div className="absolute top-2.5 left-2.5 cad-allen-bolt" />
      <div className="absolute top-2.5 right-2.5 cad-allen-bolt" />

      {/* Marco de Plano Técnico Normalizado */}
      <div className="relative md:w-7/12 cad-gunmetal cad-inset-well rounded-xl overflow-hidden flex flex-col items-center justify-center p-2 min-h-[250px]">
        {/* Banner de Estado de Funcionamiento */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${
            isActive ? 'bg-[#f97316] animate-ping' : 'bg-slate-600'
          }`}></span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#0a0d12]/90 border border-slate-700 text-slate-200">
            {isActive ? 'MÁQUINA EN EMISIÓN ACTIVA' : 'MÁQUINA EN ESPERA'}
          </span>
        </div>

        {/* Distancia acústica de captura */}
        <div className="absolute top-3 right-3 z-10 font-mono text-[10px] px-2 py-0.5 rounded bg-[#0a0d12]/90 border border-[#f97316]/50 text-[#f97316] font-bold">
          {distance.toFixed(1)} m de distancia
        </div>

        {/* Plano Vectorial Técnico SolidWorks */}
        <div className="w-full h-full max-h-[240px] flex items-center justify-center">
          {renderTechnicalCADBlueprint()}
        </div>

        {/* Indicador de audio activo */}
        {isActive && (
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-[#f97316] font-mono bg-[#0e1217]/90 px-2.5 py-1 rounded-lg border border-[#ea580c]/50">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#f97316] animate-pulse" />
              Generación acústica activa en tiempo real
            </span>
            <span className="text-amber-400 font-bold">
              ~{selectedSource.baseSPL} dB(A)
            </span>
          </div>
        )}
      </div>

      {/* Ficha Técnica y Especificaciones de Ingeniería Mecánica */}
      <div className="md:w-5/12 flex flex-col justify-between space-y-3 pt-1">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#f97316] font-mono">
              {selectedSource.category === 'continuo' ? 'Ruido Continuo' : selectedSource.category === 'intermitente' ? 'Ruido Intermitente' : 'Ruido de Impacto / Impulso'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              ISO 9612 / IEC 61672
            </span>
          </div>

          <h2 className="text-lg font-bold text-slate-100 font-mono">
            {selectedSource.name}
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed mt-1.5">
            {selectedSource.description}
          </p>
        </div>

        {/* Matriz de Parámetros de Metrología y Mecanismos de Ruido */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono cad-gunmetal cad-inset-well p-2.5 rounded-xl border border-slate-700/60">
          <div>
            <span className="text-slate-400 block text-[9px] uppercase">Nivel Base @ 1.0m</span>
            <span className="font-bold text-[#f97316] text-sm">~{selectedSource.baseSPL} dBA</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase">Pico Espectral</span>
            <span className="font-bold text-cyan-300 text-xs truncate block">{selectedSource.spectralPeak}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase">Focos 3D Evaluados</span>
            <span className="text-slate-200 font-bold">{selectedSource.noiseGenerators?.length || 0} Componentes</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase">Criterio Ocupacional</span>
            <span className={selectedSource.baseSPL >= 85 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {selectedSource.baseSPL >= 85 ? 'Excede 85 dBA (TLV)' : 'Nivel Seguro'}
            </span>
          </div>
        </div>

        {/* Lista de Focos Acústicos F1..Fn */}
        {selectedSource.noiseGenerators && selectedSource.noiseGenerators.length > 0 && (
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold text-slate-300 flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#f97316]" />
              <span>Desglose de Focos Acústicos Internos:</span>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-[11px] font-mono">
              {selectedSource.noiseGenerators.map((gen, idx) => (
                <div key={gen.id} className="p-1.5 rounded cad-gunmetal border border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-200 truncate pr-2">
                    F{idx + 1}: {gen.name}
                  </span>
                  <span className="text-[#f97316] font-bold shrink-0">
                    {gen.splContribution} dB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
