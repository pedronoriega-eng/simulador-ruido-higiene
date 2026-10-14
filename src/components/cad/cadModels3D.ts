import * as THREE from 'three';
import {
  CADMaterialSet,
  addCADEdges,
  createHexBoltMesh,
  createAllenBoltMesh,
  createBoltCircle,
  createFlangeWithBolts,
  createNameplateMesh,
  createAcousticLouverMesh,
} from './cadMaterials';

export interface CADPartInfo {
  id: string;
  name: string;
  category: string;
  materialName: string;
  massKg: number;
  acousticContributionDb: number;
  acousticMechanism: string;
  object: THREE.Object3D;
  explodeDirection: THREE.Vector3;
  originalPosition: THREE.Vector3;
}

export interface CADAssemblyResult {
  root: THREE.Group;
  parts: CADPartInfo[];
  noisePins: Array<{
    id: string;
    name: string;
    position: THREE.Vector3;
    freqRange: string;
    splContribution: number;
  }>;
  animate: (dt: number, time: number, isActive: boolean) => void;
  boundsRadius: number;
}

/* =========================================================================
   1. COMPRESOR DE TORNILLO KAESER CSDX 165 (SOLIDWORKS CAD ASSEMBLY EXPERT)
   ========================================================================= */
export function buildKaeserCompressorCAD(materials: CADMaterialSet): CADAssemblyResult {
  const root = new THREE.Group();
  root.name = 'ENSAMBLAJE_KAESER_CSDX165_SLDASM';
  const parts: CADPartInfo[] = [];

  // 1.1 Bancada Estructural Inferior (Skid de vigas UPN de acero estructural ASTM A36)
  const skidGroup = new THREE.Group();
  skidGroup.name = 'Bancada_Estructural_Skid';

  // Perfiles perimetrales longitudinales y transversales soldados
  const mainBeamGeom = new THREE.BoxGeometry(3.8, 0.18, 1.7);
  const skidMesh = new THREE.Mesh(mainBeamGeom, materials.kaeserAnthracite);
  skidMesh.position.set(0, 0.09, 0);
  skidMesh.castShadow = true;
  skidMesh.receiveShadow = true;
  addCADEdges(skidMesh, materials.edgeLineMaterial);
  skidGroup.add(skidMesh);

  // Huecos para horquillas de carretilla elevadora (Forklift pockets)
  [-0.9, 0.9].forEach((xPos) => {
    const forkPocketGeom = new THREE.BoxGeometry(0.24, 0.12, 1.72);
    const forkPocket = new THREE.Mesh(forkPocketGeom, materials.machinedSteel);
    forkPocket.position.set(xPos, 0.09, 0);
    addCADEdges(forkPocket, materials.edgeLineMaterial);
    skidGroup.add(forkPocket);
  });

  // 6 Patines de amortiguación elastomérica antivibración con perno roscado M24
  const footPositions = [
    [-1.7, 0.04, -0.75],
    [1.7, 0.04, -0.75],
    [-1.7, 0.04, 0.75],
    [1.7, 0.04, 0.75],
    [0, 0.04, -0.75],
    [0, 0.04, 0.75],
  ];
  footPositions.forEach(([x, y, z]) => {
    const rubberGeom = new THREE.CylinderGeometry(0.11, 0.14, 0.08, 16);
    const rubberFoot = new THREE.Mesh(rubberGeom, materials.darkRubber);
    rubberFoot.position.set(x, y, z);
    addCADEdges(rubberFoot, materials.edgeLineMaterial);
    skidGroup.add(rubberFoot);

    const studGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.14, 12);
    const stud = new THREE.Mesh(studGeom, materials.machinedSteel);
    stud.position.set(x, y + 0.07, z);
    skidGroup.add(stud);
  });

  // Borna de puesta a tierra de seguridad de latón M10
  const groundLug = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 12), materials.brass);
  groundLug.position.set(1.85, 0.12, 0.6);
  skidGroup.add(groundLug);

  root.add(skidGroup);

  parts.push({
    id: 'skid',
    name: 'Bancada_Estructural_Perfil_UPN.SLDPRT',
    category: 'Estructura Portante',
    materialName: 'Acero Estructural ASTM A36 con Imprimación Epoxi RAL 7024',
    massKg: 210,
    acousticContributionDb: 68.5,
    acousticMechanism: 'Transmisión elástica de vibraciones residuales al forjado de la nave',
    object: skidGroup,
    explodeDirection: new THREE.Vector3(0, -0.6, 0),
    originalPosition: skidGroup.position.clone(),
  });

  // 1.2 Motor Eléctrico Trifásico Siemens IE3 de Alta Eficiencia (110 kW, 50 Hz, 4 polos, 1485 RPM)
  const motorGroup = new THREE.Group();
  motorGroup.name = 'Motor_Electrico_Trifasico_IE3';
  motorGroup.position.set(0.72, 0.68, 0);

  // Carcasa estator cilíndrica con mecanizado de precisión
  const statorGeom = new THREE.CylinderGeometry(0.44, 0.44, 1.1, 28);
  const statorMesh = new THREE.Mesh(statorGeom, materials.brushedAluminum);
  statorMesh.rotation.z = Math.PI / 2;
  statorMesh.castShadow = true;
  addCADEdges(statorMesh, materials.edgeLineMaterial);
  motorGroup.add(statorMesh);

  // 24 Aletas longitudinales de refrigeración mecanizadas
  const finCount = 20;
  for (let i = 0; i < finCount; i++) {
    const angle = (i / finCount) * Math.PI * 2;
    const finGeom = new THREE.BoxGeometry(1.02, 0.02, 0.14);
    const finMesh = new THREE.Mesh(finGeom, materials.castIron);
    finMesh.position.set(0, Math.sin(angle) * 0.46, Math.cos(angle) * 0.46);
    finMesh.rotation.x = angle;
    motorGroup.add(finMesh);
  }

  // Patas de montaje B3 de fundición con pernos de fijación
  [-0.35, 0.35].forEach((xOffset) => {
    [-0.42, 0.42].forEach((zOffset) => {
      const motorFootGeom = new THREE.BoxGeometry(0.18, 0.12, 0.14);
      const motorFoot = new THREE.Mesh(motorFootGeom, materials.castIron);
      motorFoot.position.set(xOffset, -0.4, zOffset);
      addCADEdges(motorFoot, materials.edgeLineMaterial);
      motorGroup.add(motorFoot);

      const bolt = createAllenBoltMesh(0.022, 0.03, materials);
      bolt.position.set(xOffset, -0.34, zOffset);
      motorGroup.add(bolt);
    });
  });

  // Caja de bornes de conexión eléctrica IP55 con prensaestopas de latón
  const termBoxGeom = new THREE.BoxGeometry(0.32, 0.24, 0.3);
  const termBoxMesh = new THREE.Mesh(termBoxGeom, materials.kaeserAnthracite);
  termBoxMesh.position.set(0.1, 0.52, 0);
  addCADEdges(termBoxMesh, materials.edgeLineMaterial);
  motorGroup.add(termBoxMesh);

  // Prensaestopas M40 en latón niquelado
  const glandGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.08, 12);
  const gland = new THREE.Mesh(glandGeom, materials.brass);
  gland.rotation.z = Math.PI / 2;
  gland.position.set(0.28, 0.52, 0.05);
  motorGroup.add(gland);

  // Cubierta aerodinámica del ventilador trasero
  const cowlGeom = new THREE.CylinderGeometry(0.45, 0.45, 0.24, 28);
  const cowlMesh = new THREE.Mesh(cowlGeom, materials.kaeserAnthracite);
  cowlMesh.rotation.z = Math.PI / 2;
  cowlMesh.position.set(0.66, 0, 0);
  addCADEdges(cowlMesh, materials.edgeLineMaterial);
  motorGroup.add(cowlMesh);

  // Rejilla de protección trasera estirada
  const cowlGrillGeom = new THREE.CircleGeometry(0.42, 24);
  const cowlGrill = new THREE.Mesh(cowlGrillGeom, materials.machinedSteel);
  cowlGrill.rotation.y = Math.PI / 2;
  cowlGrill.position.set(0.785, 0, 0);
  motorGroup.add(cowlGrill);

  // Ventilador centrífugo trasero giratorio de 10 álabes
  const motorFanGroup = new THREE.Group();
  motorFanGroup.position.set(0.66, 0, 0);
  for (let i = 0; i < 10; i++) {
    const bladeGeom = new THREE.BoxGeometry(0.03, 0.34, 0.09);
    const blade = new THREE.Mesh(bladeGeom, materials.darkRubber);
    blade.rotation.x = (i / 10) * Math.PI * 2;
    motorFanGroup.add(blade);
  }
  motorGroup.add(motorFanGroup);
  root.add(motorGroup);

  parts.push({
    id: 'motor',
    name: 'Motor_Electrico_110kW_IE3.SLDPRT',
    category: 'Accionamiento Principal',
    materialName: 'Aluminio Fundido EN AC-46000 / Bobinado de Cobre Clase H',
    massKg: 460,
    acousticContributionDb: 82.3,
    acousticMechanism: 'Frecuencia de paso de ranura estatórica (1000 Hz) y zumbido electromagnético (100 Hz)',
    object: motorGroup,
    explodeDirection: new THREE.Vector3(0.85, 0, 0),
    originalPosition: motorGroup.position.clone(),
  });

  // 1.3 Campana de Acoplamiento Elástico Directo (Direct Drive)
  const couplingGroup = new THREE.Group();
  couplingGroup.name = 'Campana_Acoplamiento';
  couplingGroup.position.set(-0.02, 0.68, 0);

  const bellGeom = new THREE.CylinderGeometry(0.38, 0.4, 0.38, 28, 1, true);
  const bellMesh = new THREE.Mesh(bellGeom, materials.castIron);
  bellMesh.rotation.z = Math.PI / 2;
  addCADEdges(bellMesh, materials.edgeLineMaterial);
  couplingGroup.add(bellMesh);

  // Corona perimetral de tornillos Allen de fijación de brida SAE 3
  const bellBoltsLeft = createBoltCircle(0.35, 8, 0.018, materials, 'x');
  bellBoltsLeft.position.set(-0.18, 0, 0);
  couplingGroup.add(bellBoltsLeft);

  const bellBoltsRight = createBoltCircle(0.35, 8, 0.018, materials, 'x');
  bellBoltsRight.position.set(0.18, 0, 0);
  couplingGroup.add(bellBoltsRight);

  // Eje de acero rectificado templado por inducción
  const shaftGeom = new THREE.CylinderGeometry(0.11, 0.11, 0.48, 20);
  const shaftMesh = new THREE.Mesh(shaftGeom, materials.machinedSteel);
  shaftMesh.rotation.z = Math.PI / 2;
  couplingGroup.add(shaftMesh);

  // Cubo de acoplamiento flexible con estrella de elastómero amortiguador
  const elastomericHubGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.18, 12);
  const elastomericHub = new THREE.Mesh(elastomericHubGeom, materials.darkRubber);
  elastomericHub.rotation.z = Math.PI / 2;
  couplingGroup.add(elastomericHub);
  root.add(couplingGroup);

  parts.push({
    id: 'coupling',
    name: 'Campana_Acoplamiento_Directo.SLDPRT',
    category: 'Transmisión Mecánica',
    materialName: 'Fundición Gris EN-GJL-250 con Corona Elastomérica NBR 80 Sh',
    massKg: 42,
    acousticContributionDb: 79.1,
    acousticMechanism: 'Desalineación angular residual e impacto dinámico entre garras de transmisión',
    object: couplingGroup,
    explodeDirection: new THREE.Vector3(0, 0.55, 0),
    originalPosition: couplingGroup.position.clone(),
  });

  // 1.4 Bloque Compresor de Doble Tornillo Helicoidal (Air-End SIGMA Kaeser de 5/6 lóbulos)
  const airEndGroup = new THREE.Group();
  airEndGroup.name = 'Bloque_Compresor_AirEnd_SIGMA';
  airEndGroup.position.set(-0.74, 0.68, 0);

  // Carcasa maciza del bloque con aletas de refuerzo mecánico
  const housingGeom = new THREE.BoxGeometry(0.86, 0.68, 0.64);
  const housingMesh = new THREE.Mesh(housingGeom, materials.castIron);
  housingMesh.castShadow = true;
  addCADEdges(housingMesh, materials.edgeLineMaterial);
  airEndGroup.add(housingMesh);

  // Ventana de corte transversal CAD (SolidWorks Cutaway View) con marco cromado biselado
  const cutawayFrameGeom = new THREE.BoxGeometry(0.58, 0.46, 0.08);
  const cutawayFrame = new THREE.Mesh(cutawayFrameGeom, materials.brushedAluminum);
  cutawayFrame.position.set(0, 0, 0.31);
  addCADEdges(cutawayFrame, materials.edgeLineMaterial);
  airEndGroup.add(cutawayFrame);

  // Cristal de seguridad de la ventana de inspección
  const cutawayGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.4), materials.clearAcrylic);
  cutawayGlass.position.set(0, 0, 0.355);
  airEndGroup.add(cutawayGlass);

  // Placa frontal de rodamientos de rodillos cónicos SKF con tornillos Allen perimetrales
  const bearingFlange = createBoltCircle(0.24, 6, 0.016, materials, 'z');
  bearingFlange.position.set(0, 0.09, 0.33);
  airEndGroup.add(bearingFlange);

  // Rotor Macho Helicoidal (4 lóbulos asimétricos SIGMA Profile)
  const maleRotorGroup = new THREE.Group();
  maleRotorGroup.position.set(0, 0.09, 0.1);
  const maleShaftGeom = new THREE.CylinderGeometry(0.13, 0.13, 0.58, 20);
  const maleShaft = new THREE.Mesh(maleShaftGeom, materials.machinedSteel);
  maleShaft.rotation.z = Math.PI / 2;
  maleRotorGroup.add(maleShaft);

  // Lóbulos helicoidales torneados con acabado nitrurado pulido
  for (let f = 0; f < 4; f++) {
    const fluteGeom = new THREE.TorusGeometry(0.18, 0.05, 16, 28, Math.PI);
    const fluteMesh = new THREE.Mesh(fluteGeom, materials.cuttingToolSteel);
    fluteMesh.rotation.y = (f * Math.PI) / 2;
    maleRotorGroup.add(fluteMesh);
  }
  airEndGroup.add(maleRotorGroup);

  // Rotor Hembra Helicoidal (6 lóbulos conjugados)
  const femaleRotorGroup = new THREE.Group();
  femaleRotorGroup.position.set(0, -0.09, 0.1);
  const femaleShaftGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.58, 20);
  const femaleShaft = new THREE.Mesh(femaleShaftGeom, materials.machinedSteel);
  femaleShaft.rotation.z = Math.PI / 2;
  femaleRotorGroup.add(femaleShaft);

  for (let f = 0; f < 6; f++) {
    const fluteGeom = new THREE.TorusGeometry(0.16, 0.042, 16, 28, Math.PI);
    const fluteMesh = new THREE.Mesh(fluteGeom, materials.machinedSteel);
    fluteMesh.rotation.y = (f * Math.PI) / 3;
    femaleRotorGroup.add(fluteMesh);
  }
  airEndGroup.add(femaleRotorGroup);

  // Válvula termostática de inyección de aceite con cuerpo de fundición y pernos DIN 912
  const thermoValveGeom = new THREE.BoxGeometry(0.16, 0.22, 0.18);
  const thermoValve = new THREE.Mesh(thermoValveGeom, materials.machinedSteel);
  thermoValve.position.set(-0.35, -0.22, 0.22);
  addCADEdges(thermoValve, materials.edgeLineMaterial);
  airEndGroup.add(thermoValve);

  // Manómetro de aceite integrado con aguja indicadora
  const oilGaugeGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.03, 16);
  const oilGauge = new THREE.Mesh(oilGaugeGeom, materials.chrome);
  oilGauge.position.set(-0.35, -0.08, 0.32);
  oilGauge.rotation.x = Math.PI / 2;
  airEndGroup.add(oilGauge);

  root.add(airEndGroup);

  parts.push({
    id: 'airEnd',
    name: 'Bloque_Helicoidal_SIGMA_AirEnd.SLDPRT',
    category: 'Mecanismo de Compresión',
    materialName: 'Fundición Nodular EN-GJS-500-7 / Rotores de Acero C45 Nitrurado',
    massKg: 340,
    acousticContributionDb: 89.4,
    acousticMechanism: 'Frecuencia de engrane de los lóbulos helicoidales (f = RPM/60 * 4 = 200 Hz y armónicos de alta presión)',
    object: airEndGroup,
    explodeDirection: new THREE.Vector3(-0.7, 0.35, 0),
    originalPosition: airEndGroup.position.clone(),
  });

  // 1.5 Torre Silenciadora de Admisión con Filtro Microperforado
  const intakeGroup = new THREE.Group();
  intakeGroup.name = 'Torre_Admision_Silenciador';
  intakeGroup.position.set(-0.74, 1.55, -0.15);

  // Conducto vertical de brida de aspiración
  const intakePipeGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.45, 24);
  const intakePipe = new THREE.Mesh(intakePipeGeom, materials.kaeserAnthracite);
  addCADEdges(intakePipe, materials.edgeLineMaterial);
  intakeGroup.add(intakePipe);

  // Cartucho filtrante cilíndrico de alta eficiencia
  const canisterGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 28);
  const canister = new THREE.Mesh(canisterGeom, materials.kaeserYellow);
  canister.position.y = 0.48;
  addCADEdges(canister, materials.edgeLineMaterial);
  intakeGroup.add(canister);

  // Caperuza superior de admisión con laberinto acústico
  const capGeom = new THREE.CylinderGeometry(0.34, 0.3, 0.12, 28);
  const cap = new THREE.Mesh(capGeom, materials.kaeserAnthracite);
  cap.position.y = 0.84;
  addCADEdges(cap, materials.edgeLineMaterial);
  intakeGroup.add(cap);

  // Indicador de colmatación de filtro por vacío (Vacuum differential switch)
  const vacSwitchGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.08, 12);
  const vacSwitch = new THREE.Mesh(vacSwitchGeom, materials.warningOrange);
  vacSwitch.position.set(0.24, 0.48, 0.2);
  intakeGroup.add(vacSwitch);

  root.add(intakeGroup);

  parts.push({
    id: 'intake',
    name: 'Filtro_Admision_Silenciador_Laberinto.SLDPRT',
    category: 'Admisión y Filtrado',
    materialName: 'Papel Celulósico Plegado con Recubrimiento Nano-Fibras y Chapa Perforada',
    massKg: 28,
    acousticContributionDb: 84.7,
    acousticMechanism: 'Vórtices de flujo turbulento de aspiración a 18 m3/min y resonancia de Helmholtz',
    object: intakeGroup,
    explodeDirection: new THREE.Vector3(0, 0.8, 0),
    originalPosition: intakeGroup.position.clone(),
  });

  // 1.6 Tanque Separador Ciclónico de Aceite-Aire (Directiva 2014/68/UE Equipos a Presión)
  const separatorGroup = new THREE.Group();
  separatorGroup.name = 'Tanque_Separador_Ciclonico';
  separatorGroup.position.set(-1.48, 0.95, 0.1);

  // Cuerpo cilíndrico del depósito a presión
  const vesselGeom = new THREE.CylinderGeometry(0.38, 0.38, 1.35, 28);
  const vessel = new THREE.Mesh(vesselGeom, materials.kaeserAnthracite);
  vessel.castShadow = true;
  addCADEdges(vessel, materials.edgeLineMaterial);
  separatorGroup.add(vessel);

  // Brida superior circular ASME B16.5 con 8 tornillos hexagonales de fijación
  const topFlangeGroup = createFlangeWithBolts(0.42, 0.15, 0.06, 8, materials);
  topFlangeGroup.position.y = 0.7;
  separatorGroup.add(topFlangeGroup);

  // Fondo bombeado superior tórico-esférico Klopper
  const domeTopGeom = new THREE.SphereGeometry(0.38, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const domeTop = new THREE.Mesh(domeTopGeom, materials.kaeserAnthracite);
  domeTop.position.y = 0.73;
  addCADEdges(domeTop, materials.edgeLineMaterial);
  separatorGroup.add(domeTop);

  // Mirilla de nivel de aceite de pyrex con marcas graduadas láser MIN/MAX y fluido ámbar
  const sightGlassShield = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.32, 0.08),
    materials.machinedSteel
  );
  sightGlassShield.position.set(0.36, -0.1, 0.15);
  addCADEdges(sightGlassShield, materials.edgeLineMaterial);
  separatorGroup.add(sightGlassShield);

  const sightGlassTube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.26, 16),
    materials.oilLevelLiquid
  );
  sightGlassTube.position.set(0.36, -0.1, 0.15);
  separatorGroup.add(sightGlassTube);

  // Válvula de seguridad de resorte tarada a 11 bar con palanca de purga manual
  const reliefValveGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.22, 16);
  const reliefValve = new THREE.Mesh(reliefValveGeom, materials.brass);
  // Manómetro de presión del separador (0-16 bar) clase metrológica 1.6 con caja cromada y aguja
  const sepGaugeGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.035, 24);
  const sepGauge = new THREE.Mesh(sepGaugeGeom, materials.chrome);
  sepGauge.position.set(0.38, 0.45, 0.22);
  sepGauge.rotation.x = Math.PI / 2;
  addCADEdges(sepGauge, materials.edgeLineMaterial);
  separatorGroup.add(sepGauge);

  // Racor de conexión roscado G 1/4" en latón
  const gaugeFitting = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 12), materials.brass);
  gaugeFitting.position.set(0.38, 0.38, 0.18);
  separatorGroup.add(gaugeFitting);

  // Filtro de aceite roscado tipo Spin-On con hexágono de apriete
  const oilFilterGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.28, 20);
  const oilFilter = new THREE.Mesh(oilFilterGeom, materials.kaeserYellow);
  oilFilter.position.set(0, -0.45, 0.38);
  oilFilter.rotation.x = Math.PI / 2;
  addCADEdges(oilFilter, materials.edgeLineMaterial);
  separatorGroup.add(oilFilter);

  root.add(separatorGroup);

  parts.push({
    id: 'separator',
    name: 'Tanque_Separador_Ciclonico_11bar.SLDPRT',
    category: 'Separación y Presurización',
    materialName: 'Chapa de Calderería P265GH / Pintura Epoxi Interior Resistente al Aceite',
    massKg: 215,
    acousticContributionDb: 81.6,
    acousticMechanism: 'Vórtice centrífugo de separación bifásica aceite-aire y descompresión pulsante',
    object: separatorGroup,
    explodeDirection: new THREE.Vector3(-0.95, 0, 0),
    originalPosition: separatorGroup.position.clone(),
  });

  // 1.7 Radiador Enfriador Mixto Aire-Aceite de Chapa con Aletas de Aluminio
  const coolerGroup = new THREE.Group();
  coolerGroup.name = 'Radiador_Enfriador_Aire_Aceite';
  coolerGroup.position.set(0, 1.55, 0.3);

  const radiatorGeom = new THREE.BoxGeometry(1.6, 0.45, 0.22);
  const radiatorMesh = new THREE.Mesh(radiatorGeom, materials.brushedAluminum);
  addCADEdges(radiatorMesh, materials.edgeLineMaterial);
  coolerGroup.add(radiatorMesh);

  // Rejilla frontal de aletas de panal de abeja
  const finGridGeom = new THREE.BoxGeometry(1.48, 0.38, 0.04);
  const finGrid = new THREE.Mesh(finGridGeom, materials.machinedSteel);
  finGrid.position.set(0, 0, 0.11);
  coolerGroup.add(finGrid);
  root.add(coolerGroup);

  parts.push({
    id: 'cooler',
    name: 'Radiador_Enfriador_Aluminio.SLDPRT',
    category: 'Gestión Térmica',
    materialName: 'Aluminio Soldado al Vacío con Tubos de Flujo Turbulento',
    massKg: 55,
    acousticContributionDb: 74.0,
    acousticMechanism: 'Silbido de turbulencia térmica y disipación convectiva forzada',
    object: coolerGroup,
    explodeDirection: new THREE.Vector3(0, 0.7, 0.4),
    originalPosition: coolerGroup.position.clone(),
  });

  // 1.8 Gabinete Eléctrico y Módulo de Control Digital SIGMA CONTROL 2 Kaeser
  const cabinetGroup = new THREE.Group();
  cabinetGroup.name = 'Gabinete_Sigma_Control';
  cabinetGroup.position.set(1.52, 1.05, 0.25);

  const cabinetGeom = new THREE.BoxGeometry(0.52, 1.35, 0.78);
  const cabinetMesh = new THREE.Mesh(cabinetGeom, materials.kaeserYellow);
  cabinetMesh.castShadow = true;
  addCADEdges(cabinetMesh, materials.edgeLineMaterial);
  cabinetGroup.add(cabinetMesh);

  // Placa de control frontal en aluminio cepillado
  const hmiPanelGeom = new THREE.BoxGeometry(0.02, 0.65, 0.52);
  const hmiPanel = new THREE.Mesh(hmiPanelGeom, materials.kaeserAnthracite);
  hmiPanel.position.set(0.265, 0.22, 0);
  addCADEdges(hmiPanel, materials.edgeLineMaterial);
  cabinetGroup.add(hmiPanel);

  // Pantalla gráfica LCD iluminada verde/azul
  const lcdGeom = new THREE.BoxGeometry(0.015, 0.18, 0.28);
  const lcdMesh = new THREE.Mesh(lcdGeom, materials.anodizedBlue);
  lcdMesh.position.set(0.275, 0.32, 0);
  cabinetGroup.add(lcdMesh);

  // Pulsador de Parada de Emergencia tipo seta roja con aro de contraste amarillo
  const eStopBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.02, 20), materials.warningOrange);
  eStopBezel.rotation.z = Math.PI / 2;
  eStopBezel.position.set(0.27, -0.05, 0.16);
  cabinetGroup.add(eStopBezel);

  const eStopMushroom = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 20), materials.glowingSteel);
  eStopMushroom.rotation.z = Math.PI / 2;
  eStopMushroom.position.set(0.29, -0.05, 0.16);
  cabinetGroup.add(eStopMushroom);

  // Cáncamo de elevación superior DIN 580 M24
  const liftingEye = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.02, 12, 24), materials.machinedSteel);
  liftingEye.position.set(0, 0.72, 0);
  cabinetGroup.add(liftingEye);

  root.add(cabinetGroup);

  parts.push({
    id: 'cabinet',
    name: 'Gabinete_SigmaControl_IP54.SLDPRT',
    category: 'Automatización y Fuerza',
    materialName: 'Chapa de Acero Pintada Electrostáticamente en Polvo RAL 1021',
    massKg: 85,
    acousticContributionDb: 71.2,
    acousticMechanism: 'Conmutación de contactores de potencia y zumbido de transformador de mando',
    object: cabinetGroup,
    explodeDirection: new THREE.Vector3(0.95, 0, 0),
    originalPosition: cabinetGroup.position.clone(),
  });

  // Placa de Características Técnicas Metrológicas Kaeser
  const nameplate = createNameplateMesh(
    0.38,
    0.2,
    'KAESER KOMPRESSOREN',
    'CSDX 165 - SIGMA PROFILE',
    'Potencia: 110 kW | Presión: 10.0 bar | Caudal: 18.2 m3/min | Nivel Acústico LwA: 93 dB(A)',
    materials
  );
  nameplate.position.set(0.265, -0.32, 0);
  cabinetGroup.add(nameplate);

  // Mangueras hidráulicas de acero trenzado flexibles entre el bloque y el separador
  const hoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.74, 0.48, 0.22),
    new THREE.Vector3(-1.1, 0.38, 0.35),
    new THREE.Vector3(-1.48, 0.52, 0.25),
  ]);
  const hoseGeom = new THREE.TubeGeometry(hoseCurve, 24, 0.04, 12, false);
  const hoseMesh = new THREE.Mesh(hoseGeom, materials.braidedStainless);
  addCADEdges(hoseMesh, materials.edgeLineMaterial);
  root.add(hoseMesh);

  // Puntos de Foco Acústico 3D según ISO 9612
  const noisePins = [
    {
      id: 'f1',
      name: 'F1: Bloque Compresor (Air-End SIGMA)',
      position: new THREE.Vector3(-0.74, 0.68, 0.38),
      freqRange: '1000 - 4000 Hz',
      splContribution: 89.4,
    },
    {
      id: 'f2',
      name: 'F2: Motor Eléctrico Trifásico IE3',
      position: new THREE.Vector3(0.72, 0.68, 0.48),
      freqRange: '500 - 1000 Hz',
      splContribution: 82.3,
    },
    {
      id: 'f3',
      name: 'F3: Ventilador de Refrigeración Motor',
      position: new THREE.Vector3(1.38, 0.68, 0),
      freqRange: '250 - 500 Hz',
      splContribution: 79.8,
    },
    {
      id: 'f4',
      name: 'F4: Tanque Separador Ciclónico 11bar',
      position: new THREE.Vector3(-1.48, 0.95, 0.42),
      freqRange: '125 - 500 Hz',
      splContribution: 81.6,
    },
    {
      id: 'f5',
      name: 'F5: Admisión y Silenciador de Entrada',
      position: new THREE.Vector3(-0.74, 1.85, 0),
      freqRange: '2000 - 8000 Hz',
      splContribution: 84.7,
    },
  ];

  const animate = (dt: number, _time: number, isActive: boolean) => {
    const speed = isActive ? 1.0 : 0.05;
    const rotDelta = dt * 20 * speed;

    // Rotación sincrónica de los tornillos helicoidales Kaeser (relación 4:6)
    maleRotorGroup.rotation.x += rotDelta;
    femaleRotorGroup.rotation.x -= rotDelta * (4 / 6);
    motorFanGroup.rotation.x += rotDelta;
    shaftMesh.rotation.x += rotDelta;
    elastomericHub.rotation.x += rotDelta;
  };

  return {
    root,
    parts,
    noisePins,
    animate,
    boundsRadius: 2.3,
  };
}

/* =========================================================================
   2. TURBINA CENTRÍFUGA / SOPLADOR INDUSTRIAL DE ALTA PRESIÓN (SOLIDWORKS EXPERT)
   ========================================================================= */
export function buildCentrifugalTurbineCAD(materials: CADMaterialSet): CADAssemblyResult {
  const root = new THREE.Group();
  root.name = 'ENSAMBLAJE_TURBINA_CENTRIFUGA_SLDASM';
  const parts: CADPartInfo[] = [];

  // Bancada de perfiles estructurales UPN soldados con calzos mecanizados
  const skidGroup = new THREE.Group();
  skidGroup.position.set(0, 0.08, 0);

  const skidGeom = new THREE.BoxGeometry(3.0, 0.16, 1.5);
  const skid = new THREE.Mesh(skidGeom, materials.kaeserAnthracite);
  addCADEdges(skid, materials.edgeLineMaterial);
  skidGroup.add(skid);

  // Placas de asiento rectificadas con pernos de anclaje DIN 933
  [-1.2, 0, 1.2].forEach((xPos) => {
    [-0.6, 0.6].forEach((zPos) => {
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.18), materials.machinedSteel);
      pad.position.set(xPos, 0.09, zPos);
      skidGroup.add(pad);

      const bolt = createHexBoltMesh(0.024, 0.04, materials);
      bolt.position.set(xPos, 0.11, zPos);
      skidGroup.add(bolt);
    });
  });
  root.add(skidGroup);

  parts.push({
    id: 'skid',
    name: 'Bancada_Soldada_UPN160.SLDPRT',
    category: 'Chasis Estructural',
    materialName: 'Acero Estructural S275JR con Pintura Poliuretano Resistente a la Corrosión',
    massKg: 165,
    acousticContributionDb: 64.0,
    acousticMechanism: 'Vibración estructural transmitida por desbalance dinámico residual Grado ISO G 2.5',
    object: skidGroup,
    explodeDirection: new THREE.Vector3(0, -0.5, 0),
    originalPosition: skidGroup.position.clone(),
  });

  // Carcasa espiral en voluta logarítmica con brida de partición horizontal
  const voluteGroup = new THREE.Group();
  voluteGroup.position.set(-0.55, 0.88, 0);

  // Cuerpo voluta aerodinámico de fundición nodular
  const scrollGeom = new THREE.TorusGeometry(0.62, 0.32, 24, 42, Math.PI * 1.75);
  const scrollMesh = new THREE.Mesh(scrollGeom, materials.castIron);
  scrollMesh.rotation.y = Math.PI / 2;
  addCADEdges(scrollMesh, materials.edgeLineMaterial);
  voluteGroup.add(scrollMesh);

  // Nervaduras de refuerzo radiales en la voluta
  for (let r = 0; r < 5; r++) {
    const angle = 0.2 + (r / 5) * Math.PI * 1.4;
    const ribGeom = new THREE.BoxGeometry(0.03, 0.28, 0.12);
    const rib = new THREE.Mesh(ribGeom, materials.castIron);
    rib.position.set(0, Math.sin(angle) * 0.72, Math.cos(angle) * 0.72);
    rib.rotation.x = angle;
    voluteGroup.add(rib);
  }

  // Tobera de aspiración axial con brida DIN 2501 PN10 con círculo de 8 pernos
  const inletFlange = createFlangeWithBolts(0.44, 0.28, 0.05, 8, materials);
  inletFlange.rotation.x = Math.PI / 2;
  inletFlange.position.set(0, 0, 0.42);
  voluteGroup.add(inletFlange);

  // Rejilla de protección de aspiración en alambre electrosoldado
  const suctionScreen = new THREE.Mesh(new THREE.CircleGeometry(0.32, 24), materials.machinedSteel);
  suctionScreen.position.set(0, 0, 0.46);
  voluteGroup.add(suctionScreen);

  // Tobera de impulsión tangencial vertical con brida cuadrada y junta de estanqueidad
  const outletGeom = new THREE.BoxGeometry(0.44, 0.62, 0.44);
  const outlet = new THREE.Mesh(outletGeom, materials.castIron);
  outlet.position.set(0.62, 0.48, 0);
  addCADEdges(outlet, materials.edgeLineMaterial);
  voluteGroup.add(outlet);

  // Fuelle de compensación elástica antivibratorio en la descarga
  const bellowsGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.16, 24);
  const bellows = new THREE.Mesh(bellowsGeom, materials.darkRubber);
  bellows.position.set(0.62, 0.84, 0);
  voluteGroup.add(bellows);

  // Rodete centrífugo de 12 álabes curvados hacia atrás en acero inoxidable 316L
  const impellerGroup = new THREE.Group();
  impellerGroup.position.set(0, 0, 0.08);

  const hubGeom = new THREE.CylinderGeometry(0.14, 0.18, 0.16, 20);
  const hub = new THREE.Mesh(hubGeom, materials.machinedSteel);
  hub.rotation.x = Math.PI / 2;
  impellerGroup.add(hub);

  // Cono de fijación aerodinámico central (Spinner cone)
  const spinnerCone = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.18, 20), materials.chrome);
  spinnerCone.rotation.x = Math.PI / 2;
  spinnerCone.position.set(0, 0, 0.14);
  impellerGroup.add(spinnerCone);

  // 12 Álabes curvados de alta eficiencia
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const bladeGeom = new THREE.BoxGeometry(0.035, 0.4, 0.16);
    const blade = new THREE.Mesh(bladeGeom, materials.cuttingToolSteel);
    blade.position.set(Math.cos(angle) * 0.38, Math.sin(angle) * 0.38, 0);
    blade.rotation.z = angle + 0.52;
    impellerGroup.add(blade);
  }
  voluteGroup.add(impellerGroup);
  root.add(voluteGroup);

  parts.push({
    id: 'volute',
    name: 'Carcasa_Voluta_Impulsor_12Alabes.SLDPRT',
    category: 'Aerodinámica y Presión',
    materialName: 'Fundición Gris EN-GJL-250 con Rodete Mecanizado en AISI 316L',
    massKg: 220,
    acousticContributionDb: 93.8,
    acousticMechanism: 'Frecuencia de paso de álabes (BPF = 3000 RPM / 60 * 12 = 600 Hz) y desprendimiento turbulento de Von Kármán',
    object: voluteGroup,
    explodeDirection: new THREE.Vector3(-0.85, 0.25, 0),
    originalPosition: voluteGroup.position.clone(),
  });

  // Soporte de rodamientos de apoyo partido tipo chumacera SKF SNL
  const bearingGroup = new THREE.Group();
  bearingGroup.position.set(0.24, 0.68, 0);

  const bearingHousingGeom = new THREE.BoxGeometry(0.42, 0.44, 0.42);
  const bearingHousing = new THREE.Mesh(bearingHousingGeom, materials.castIron);
  addCADEdges(bearingHousing, materials.edgeLineMaterial);
  bearingGroup.add(bearingHousing);

  // Tapa superior de la chumacera fijada con 4 tornillos Allen
  const bearingBolts = [
    [-0.14, 0.23, -0.14],
    [0.14, 0.23, -0.14],
    [-0.14, 0.23, 0.14],
    [0.14, 0.23, 0.14],
  ];
  bearingBolts.forEach(([bx, by, bz]) => {
    const bolt = createAllenBoltMesh(0.018, 0.025, materials);
    bolt.position.set(bx, by, bz);
    bearingGroup.add(bolt);
  });

  // Engrasador hidráulico recto DIN 71412 en latón
  const greaseNipple = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 12), materials.brass);
  greaseNipple.position.set(0, 0.25, 0);
  bearingGroup.add(greaseNipple);

  // Sensor de vibración acelerométrico piezoeléctrico IEPE con cable coaxial
  const vibSensor = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 12), materials.chrome);
  vibSensor.position.set(0.15, 0.15, 0.22);
  bearingGroup.add(vibSensor);

  // Eje de transmisión rectificado y endurecido
  const shaftGeom = new THREE.CylinderGeometry(0.075, 0.075, 1.1, 20);
  const shaft = new THREE.Mesh(shaftGeom, materials.machinedSteel);
  shaft.rotation.z = Math.PI / 2;
  bearingGroup.add(shaft);
  root.add(bearingGroup);

  parts.push({
    id: 'bearing',
    name: 'Soporte_Rodamientos_SKF_SNL512.SLDPRT',
    category: 'Elementos Rodantes',
    materialName: 'Fundición EN-GJL-200 con Rodamientos de Rodillos a Rótula de Doble Hilera',
    massKg: 52,
    acousticContributionDb: 84.5,
    acousticMechanism: 'Impactos dinámicos en pista exterior de rodadura (BPFO = 285 Hz) y juego radial',
    object: bearingGroup,
    explodeDirection: new THREE.Vector3(0, 0.45, 0),
    originalPosition: bearingGroup.position.clone(),
  });

  // Motor eléctrico de accionamiento 55 kW
  const motorGroup = new THREE.Group();
  motorGroup.position.set(1.05, 0.68, 0);

  const motorGeom = new THREE.CylinderGeometry(0.36, 0.36, 0.82, 28);
  const motorMesh = new THREE.Mesh(motorGeom, materials.brushedAluminum);
  motorMesh.rotation.z = Math.PI / 2;
  addCADEdges(motorMesh, materials.edgeLineMaterial);
  motorGroup.add(motorMesh);

  // Aletas de refrigeración del motor
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.015, 0.12), materials.castIron);
    fin.position.set(0, Math.sin(angle) * 0.38, Math.cos(angle) * 0.38);
    fin.rotation.x = angle;
    motorGroup.add(fin);
  }

  // Caja de bornes con cableado trifásico
  const termBox = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.22), materials.kaeserAnthracite);
  termBox.position.set(0, 0.42, 0);
  addCADEdges(termBox, materials.edgeLineMaterial);
  motorGroup.add(termBox);
  root.add(motorGroup);

  parts.push({
    id: 'motor',
    name: 'Motor_Electrico_55kW_400V.SLDPRT',
    category: 'Accionamiento',
    materialName: 'Carcasa de Fundición con Aletas y Rotor de Jaula de Ardilla de Cobre',
    massKg: 295,
    acousticContributionDb: 83.0,
    acousticMechanism: 'Zumbido de inducción electromagnética a 100 Hz y ruido de ventilador posterior',
    object: motorGroup,
    explodeDirection: new THREE.Vector3(0.85, 0, 0),
    originalPosition: motorGroup.position.clone(),
  });

  // Transmisión por poleas y correas trapezoidales estrechas DIN 7753 SPB con cárter de protección
  const beltGuardGroup = new THREE.Group();
  beltGuardGroup.position.set(0.65, 0.68, -0.38);

  // Cárter de protección envolvente de chapa perforada de seguridad
  const guardHousingGeom = new THREE.BoxGeometry(0.95, 0.52, 0.18);
  const guardHousing = new THREE.Mesh(guardHousingGeom, materials.warningOrange);
  addCADEdges(guardHousing, materials.edgeLineMaterial);
  beltGuardGroup.add(guardHousing);

  // Polea de accionamiento del motor (Ø 220 mm con 3 gargantas trapezoidales)
  const motorPulleyGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.09, 24);
  const motorPulley = new THREE.Mesh(motorPulleyGeom, materials.castIron);
  motorPulley.position.set(0.38, 0, 0);
  motorPulley.rotation.x = Math.PI / 2;
  addCADEdges(motorPulley, materials.edgeLineMaterial);
  beltGuardGroup.add(motorPulley);

  // Polea conducida del eje del ventilador (Ø 280 mm)
  const fanPulleyGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.09, 24);
  const fanPulley = new THREE.Mesh(fanPulleyGeom, materials.castIron);
  fanPulley.position.set(-0.38, 0, 0);
  fanPulley.rotation.x = Math.PI / 2;
  addCADEdges(fanPulley, materials.edgeLineMaterial);
  beltGuardGroup.add(fanPulley);

  // Correas trapezoidales de goma sintética con cordón de tracción de poliéster
  const beltGeom = new THREE.BoxGeometry(0.76, 0.02, 0.06);
  const beltTop = new THREE.Mesh(beltGeom, materials.darkRubber);
  beltTop.position.set(0, 0.14, 0);
  beltGuardGroup.add(beltTop);

  const beltBottom = new THREE.Mesh(beltGeom, materials.darkRubber);
  beltBottom.position.set(0, -0.14, 0);
  beltGuardGroup.add(beltBottom);
  root.add(beltGuardGroup);

  parts.push({
    id: 'beltTransmission',
    name: 'Transmision_Correas_SPB_Carter.SLDASM',
    category: 'Transmisión Cinemática',
    materialName: 'Chapa de Acero S235JR Pintada Epoxi RAL 2004 con Correas Trapezoidales Antiestáticas ISO 1813',
    massKg: 38,
    acousticContributionDb: 81.2,
    acousticMechanism: 'Fricción y deslizamiento elástico en gargantas de polea y batimiento aerodinámico de correas',
    object: beltGuardGroup,
    explodeDirection: new THREE.Vector3(0, 0, -0.65),
    originalPosition: beltGuardGroup.position.clone(),
  });

  const noisePins = [
    {
      id: 'f1',
      name: 'F1: Rodete Centrífugo e Impulsor',
      position: new THREE.Vector3(-0.55, 0.88, 0.48),
      freqRange: '500 - 1000 Hz (BPF)',
      splContribution: 93.8,
    },
    {
      id: 'f2',
      name: 'F2: Descarga y Difusor Voluta',
      position: new THREE.Vector3(0.07, 1.35, 0),
      freqRange: '1000 - 4000 Hz',
      splContribution: 88.5,
    },
    {
      id: 'f3',
      name: 'F3: Pedestal de Rodamientos SKF',
      position: new THREE.Vector3(0.24, 0.68, 0.25),
      freqRange: '2000 - 8000 Hz',
      splContribution: 84.5,
    },
    {
      id: 'f4',
      name: 'F4: Aspiración Axial Venturi',
      position: new THREE.Vector3(-0.55, 0.88, 0.68),
      freqRange: '250 - 500 Hz',
      splContribution: 86.2,
    },
  ];

  const animate = (dt: number, _time: number, isActive: boolean) => {
    const speed = isActive ? 1.0 : 0.05;
    impellerGroup.rotation.z += dt * 38 * speed;
    shaft.rotation.x += dt * 38 * speed;
  };

  return {
    root,
    parts,
    noisePins,
    animate,
    boundsRadius: 1.9,
  };
}

/* =========================================================================
   3. SIERRA CIRCULAR DE MESA INDUSTRIAL / ESCUADRADORA (SOLIDWORKS EXPERT)
   ========================================================================= */
export function buildTableSawCAD(materials: CADMaterialSet): CADAssemblyResult {
  const root = new THREE.Group();
  root.name = 'ENSAMBLAJE_SIERRA_CIRCULAR_MESA_SLDASM';
  const parts: CADPartInfo[] = [];

  // Mueble soporte en chapa de acero de 3 mm plegada y soldada
  const cabinetGroup = new THREE.Group();
  cabinetGroup.position.set(0, 0.44, 0);

  const cabinetGeom = new THREE.BoxGeometry(1.5, 0.88, 1.3);
  const cabinet = new THREE.Mesh(cabinetGeom, materials.kaeserAnthracite);
  addCADEdges(cabinet, materials.edgeLineMaterial);
  cabinetGroup.add(cabinet);

  // Puerta de acceso lateral para cambio de hoja con bisagras industriales y pomo
  const doorGeom = new THREE.BoxGeometry(0.02, 0.68, 0.58);
  const door = new THREE.Mesh(doorGeom, materials.castIron);
  door.position.set(0.76, 0, 0);
  addCADEdges(door, materials.edgeLineMaterial);
  cabinetGroup.add(door);

  // Tomas de aspiración inferior de serrín DN120
  const dustPort = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.14, 20), materials.machinedSteel);
  dustPort.rotation.z = Math.PI / 2;
  dustPort.position.set(0.78, -0.22, 0.35);
  cabinetGroup.add(dustPort);

  // Cuadro de control frontal: pulsador Marcha (verde), Paro (rojo con candado LOTO)
  const switchBox = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.16), materials.warningOrange);
  switchBox.position.set(0.42, 0.25, 0.68);
  cabinetGroup.add(switchBox);

  // Volante frontal mecanizado para regulación de altura de hoja (Elevation Handwheel)
  const elevWheelGeom = new THREE.TorusGeometry(0.12, 0.018, 12, 28);
  const elevWheel = new THREE.Mesh(elevWheelGeom, materials.chrome);
  elevWheel.position.set(-0.2, 0.05, 0.67);
  elevWheel.rotation.y = 0;
  cabinetGroup.add(elevWheel);

  const elevHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.012, 0.08, 12), materials.darkRubber);
  elevHandle.position.set(-0.2, 0.15, 0.71);
  elevHandle.rotation.x = Math.PI / 2;
  cabinetGroup.add(elevHandle);

  // Volante lateral para inclinación de bisel 0°-45° con cuadrante graduado de latón
  const tiltWheel = new THREE.Mesh(elevWheelGeom, materials.chrome);
  tiltWheel.position.set(-0.76, 0.05, -0.1);
  tiltWheel.rotation.y = Math.PI / 2;
  cabinetGroup.add(tiltWheel);

  const brassScaleGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.01, 24, 1, false, 0, Math.PI / 2);
  const brassScale = new THREE.Mesh(brassScaleGeom, materials.brass);
  brassScale.position.set(-0.76, 0.05, -0.1);
  brassScale.rotation.z = Math.PI / 2;
  cabinetGroup.add(brassScale);
  root.add(cabinetGroup);

  parts.push({
    id: 'cabinet',
    name: 'Gabinete_Chapa_Plegada_Rigida.SLDPRT',
    category: 'Mueble Base',
    materialName: 'Chapa de Acero Galvanizado 3 mm con Aislamiento Acústico Interior',
    massKg: 95,
    acousticContributionDb: 72.0,
    acousticMechanism: 'Caja de resonancia acústica excitada por el motor y la transmisión por correa',
    object: cabinetGroup,
    explodeDirection: new THREE.Vector3(0, -0.4, 0),
    originalPosition: cabinetGroup.position.clone(),
  });

  // Mesa principal superior de fundición gris rectificada con rectificado Blanchard y ranuras en T
  const tableGroup = new THREE.Group();
  tableGroup.position.set(0, 0.92, 0);

  const tableGeom = new THREE.BoxGeometry(1.7, 0.08, 1.5);
  const table = new THREE.Mesh(tableGeom, materials.machinedSteel);
  table.receiveShadow = true;
  addCADEdges(table, materials.edgeLineMaterial);
  tableGroup.add(table);

  // Ranuras en T mecanizadas de precisión para guía de inglete
  [-0.32, 0.32].forEach((zPos) => {
    const slotGeom = new THREE.BoxGeometry(1.68, 0.02, 0.035);
    const slot = new THREE.Mesh(slotGeom, materials.castIron);
    slot.position.set(0, 0.035, zPos);
    tableGroup.add(slot);
  });

  // Inserto intercambiable de aluminio (Throat Plate / Zero Clearance)
  const throatGeom = new THREE.BoxGeometry(0.85, 0.015, 0.12);
  const throat = new THREE.Mesh(throatGeom, materials.warningOrange);
  throat.position.set(0, 0.042, 0);
  tableGroup.add(throat);

  // Guía paralela de corte (Rip Fence) con lupa milimétrica y palanca excéntrica
  const fenceGroup = new THREE.Group();
  fenceGroup.position.set(0, 0.08, 0.45);

  const fenceBeam = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.06), materials.brushedAluminum);
  addCADEdges(fenceBeam, materials.edgeLineMaterial);
  fenceGroup.add(fenceBeam);

  const lockLever = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.16, 12), materials.machinedSteel);
  lockLever.position.set(-0.76, 0.04, 0);
  lockLever.rotation.z = -0.4;
  fenceGroup.add(lockLever);
  tableGroup.add(fenceGroup);
  root.add(tableGroup);

  parts.push({
    id: 'table',
    name: 'Mesa_Fundicion_Rectificada_T_Slots.SLDPRT',
    category: 'Superficie de Referencia',
    materialName: 'Fundición Gris EN-GJL-250 Rectificada con Planitud 0.03 mm',
    massKg: 148,
    acousticContributionDb: 78.4,
    acousticMechanism: 'Radiación acústica por flexión de placa excitada por las vibraciones del corte',
    object: tableGroup,
    explodeDirection: new THREE.Vector3(0, 0.32, 0),
    originalPosition: tableGroup.position.clone(),
  });

  // Hoja de sierra circular industrial de metal duro TCT (Diámetro 350 mm, 60 dientes de widia)
  const bladeGroup = new THREE.Group();
  bladeGroup.position.set(0, 1.02, 0);

  // Lámina central de acero aleado con ranuras láser de expansión térmica y amortiguadores de cobre
  const discGeom = new THREE.CylinderGeometry(0.38, 0.38, 0.008, 48);
  const discMesh = new THREE.Mesh(discGeom, materials.cuttingToolSteel);
  discMesh.rotation.x = Math.PI / 2;
  bladeGroup.add(discMesh);

  // 36 Dientes de Carburo de Tungsteno (Widia) con ángulo de corte positivo de 15°
  for (let t = 0; t < 36; t++) {
    const angle = (t / 36) * Math.PI * 2;
    const toothGeom = new THREE.BoxGeometry(0.042, 0.022, 0.012);
    const tooth = new THREE.Mesh(toothGeom, materials.carbideTungsten);
    tooth.position.set(Math.cos(angle) * 0.39, Math.sin(angle) * 0.39, 0);
    tooth.rotation.z = angle + 0.35;
    bladeGroup.add(tooth);
  }

  // Brida de fijación rectificada y tuerca de apriete M20 rosca izquierda
  const flangeGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.035, 24);
  const flange = new THREE.Mesh(flangeGeom, materials.machinedSteel);
  flange.rotation.x = Math.PI / 2;
  bladeGroup.add(flange);

  const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 6), materials.boltMaterial);
  nut.rotation.x = Math.PI / 2;
  nut.position.z = 0.025;
  bladeGroup.add(nut);
  root.add(bladeGroup);

  parts.push({
    id: 'blade',
    name: 'Disco_Sierra_TCT_60Dientes.SLDPRT',
    category: 'Herramienta de Corte',
    materialName: 'Acero Aleado 75Cr1 con Pastillas Soldadas de Carburo de Tungsteno Micrograno',
    massKg: 3.6,
    acousticContributionDb: 98.7,
    acousticMechanism: 'Interacción diente-madera a 4200 RPM, vórtices aeroacústicos en gargantas y silbido de lámina',
    object: bladeGroup,
    explodeDirection: new THREE.Vector3(0, 0.55, 0),
    originalPosition: bladeGroup.position.clone(),
  });

  // Cuchillo divisor curvo (Riving Knife) y campana transparente Makrolon suspendida
  const guardGroup = new THREE.Group();
  guardGroup.position.set(0, 1.25, 0);

  const hoodGeom = new THREE.BoxGeometry(0.72, 0.18, 0.12);
  const hood = new THREE.Mesh(hoodGeom, materials.clearAcrylic);
  guardGroup.add(hood);

  // Manguera flexible de aspiración superior DN60
  const dustHose = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.45, 16), materials.darkRubber);
  dustHose.position.set(0.15, 0.22, 0);
  dustHose.rotation.z = 0.4;
  guardGroup.add(dustHose);

  // Cuchillo divisor de acero al carbono de 2.8 mm
  const knifeGeom = new THREE.BoxGeometry(0.14, 0.32, 0.015);
  const knife = new THREE.Mesh(knifeGeom, materials.machinedSteel);
  knife.position.set(0.32, -0.18, 0);
  guardGroup.add(knife);
  root.add(guardGroup);

  parts.push({
    id: 'guard',
    name: 'Campana_Protectora_Aspiracion_Makrolon.SLDPRT',
    category: 'Seguridad Colectiva',
    materialName: 'Policarbonato Makrolon Antichoque con Toma de Aspiración DN60',
    massKg: 5.2,
    acousticContributionDb: 82.0,
    acousticMechanism: 'Atenuación parcial de alta frecuencia y ruido de flujo turbulento de captación',
    object: guardGroup,
    explodeDirection: new THREE.Vector3(0, 0.65, 0),
    originalPosition: guardGroup.position.clone(),
  });

  // Volantes de fundición cromados frontales para inclinación (0-45°) y elevación de hoja
  [-0.2, 0.2].forEach((xPos, idx) => {
    const handwheel = new THREE.Group();
    handwheel.position.set(xPos, 0.65, 0.66);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 12, 24), materials.chrome);
    handwheel.add(rim);

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.08, 12), materials.darkRubber);
    handle.position.set(0.09, 0, 0.04);
    handle.rotation.x = Math.PI / 2;
    handwheel.add(handle);

    root.add(handwheel);
  });

  const noisePins = [
    {
      id: 'f1',
      name: 'F1: Interfaz Diente-Pieza de Madera',
      position: new THREE.Vector3(-0.25, 1.05, 0),
      freqRange: '2000 - 8000 Hz',
      splContribution: 98.7,
    },
    {
      id: 'f2',
      name: 'F2: Resonancia Torsional de la Lámina',
      position: new THREE.Vector3(0, 1.02, 0.18),
      freqRange: '1000 - 4000 Hz',
      splContribution: 92.5,
    },
    {
      id: 'f3',
      name: 'F3: Transmisión por Poleas Poly-V',
      position: new THREE.Vector3(0, 0.48, -0.35),
      freqRange: '250 - 500 Hz',
      splContribution: 81.3,
    },
  ];

  const animate = (dt: number, _time: number, isActive: boolean) => {
    const speed = isActive ? 1.0 : 0.02;
    bladeGroup.rotation.z -= dt * 48 * speed;
  };

  return {
    root,
    parts,
    noisePins,
    animate,
    boundsRadius: 1.6,
  };
}

/* =========================================================================
   4. PULIDORA / ESMERILADORA ANGULAR INDUSTRIAL 230 MM (SOLIDWORKS EXPERT)
   ========================================================================= */
export function buildAngleGrinderCAD(materials: CADMaterialSet): CADAssemblyResult {
  const root = new THREE.Group();
  root.name = 'ENSAMBLAJE_ESMERILADORA_ANGULAR_SLDASM';
  const parts: CADPartInfo[] = [];

  const toolGroup = new THREE.Group();
  toolGroup.position.set(0, 0.65, 0);
  toolGroup.rotation.z = -0.12;

  // Cuerpo motor estilizado de poliamida PA6-GF30 con estrías ergonómicas de sujeción
  const motorBodyGeom = new THREE.CylinderGeometry(0.125, 0.135, 0.92, 28);
  const motorBody = new THREE.Mesh(motorBodyGeom, materials.kaeserAnthracite);
  motorBody.rotation.z = Math.PI / 2;
  addCADEdges(motorBody, materials.edgeLineMaterial);
  toolGroup.add(motorBody);

  // Zona de empuñadura trasera con recubrimiento de elastómero Soft-Grip naranja
  const gripGeom = new THREE.CylinderGeometry(0.13, 0.13, 0.38, 28);
  const grip = new THREE.Mesh(gripGeom, materials.warningOrange);
  grip.rotation.z = Math.PI / 2;
  grip.position.set(0.24, 0, 0);
  toolGroup.add(grip);

  // Interruptor tipo gatillo hombre-muerto con seguro de bloqueo
  const triggerGeom = new THREE.BoxGeometry(0.16, 0.04, 0.04);
  const trigger = new THREE.Mesh(triggerGeom, materials.darkRubber);
  trigger.position.set(0.18, -0.15, 0);
  toolGroup.add(trigger);

  // Tapones roscados ranurados de inspección y recambio de escobillas de carbón M14
  [-0.14, 0.14].forEach((zPos) => {
    const brushCap = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.015, 16), materials.machinedSteel);
    brushCap.rotation.x = Math.PI / 2;
    brushCap.position.set(-0.05, 0, zPos);
    toolGroup.add(brushCap);
  });

  // Rejilla de aspiración de refrigeración trasera con microfiltro de polvo desmontable
  const airInletGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 20);
  const airInlet = new THREE.Mesh(airInletGeom, materials.machinedSteel);
  airInlet.rotation.z = Math.PI / 2;
  airInlet.position.set(0.42, 0, 0);
  toolGroup.add(airInlet);

  // Entrada de cable con manguito flexible de goma anticolapso
  const cableBootGeom = new THREE.CylinderGeometry(0.035, 0.06, 0.18, 16);
  const cableBoot = new THREE.Mesh(cableBootGeom, materials.darkRubber);
  cableBoot.rotation.z = Math.PI / 2;
  cableBoot.position.set(0.55, 0, 0);
  toolGroup.add(cableBoot);

  // Cabezal de engranajes angulares cónico-espirales de fundición de aluminio inyectado AlSi10Mg
  const gearHeadGeom = new THREE.BoxGeometry(0.28, 0.25, 0.26);
  const gearHead = new THREE.Mesh(gearHeadGeom, materials.brushedAluminum);
  gearHead.position.set(-0.54, 0, 0);
  addCADEdges(gearHead, materials.edgeLineMaterial);
  toolGroup.add(gearHead);

  // Botón rojo de bloqueo del husillo para cambio de disco (Spindle Lock)
  const lockBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 16), materials.glowingSteel);
  lockBtn.position.set(-0.54, 0.14, 0);
  toolGroup.add(lockBtn);

  // Empuñadura lateral auxiliar antivibratoria con núcleo elástico
  const handleGeom = new THREE.CylinderGeometry(0.045, 0.055, 0.42, 20);
  const handle = new THREE.Mesh(handleGeom, materials.darkRubber);
  handle.position.set(-0.54, 0, 0.32);
  handle.rotation.x = Math.PI / 2;
  addCADEdges(handle, materials.edgeLineMaterial);
  toolGroup.add(handle);

  // Protector de disco metálico envolvente de acero embutido con palanca de fijación rápida
  const guardGeom = new THREE.CylinderGeometry(0.33, 0.33, 0.05, 32, 1, false, 0, Math.PI * 1.35);
  const guard = new THREE.Mesh(guardGeom, materials.machinedSteel);
  guard.position.set(-0.54, -0.08, 0);
  guard.rotation.x = Math.PI / 2;
  addCADEdges(guard, materials.edgeLineMaterial);
  toolGroup.add(guard);

  // Disco abrasivo de desbaste (230 mm con centro embutido y 3 mallas de fibra de vidrio)
  const discGroup = new THREE.Group();
  discGroup.position.set(-0.54, -0.13, 0);

  const discGeom = new THREE.CylinderGeometry(0.31, 0.31, 0.016, 36);
  const discMesh = new THREE.Mesh(discGeom, materials.castIron);
  discMesh.rotation.x = Math.PI / 2;
  discGroup.add(discMesh);

  // Anillo de metal con etiqueta de especificaciones técnicas (80 m/s - 6600 RPM)
  const labelRing = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.018, 24), materials.machinedSteel);
  labelRing.rotation.x = Math.PI / 2;
  discGroup.add(labelRing);

  // Tuerca de amarre M14 con agujeros para llave de pivotes
  const nutGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.032, 20);
  const nut = new THREE.Mesh(nutGeom, materials.boltMaterial);
  nut.rotation.x = Math.PI / 2;
  discGroup.add(nut);
  toolGroup.add(discGroup);
  root.add(toolGroup);

  parts.push({
    id: 'grinderTool',
    name: 'Esmeriladora_Angular_2400W_230mm.SLDASM',
    category: 'Herramienta Electroportátil',
    materialName: 'Poliamida PA6-GF30 con Cabezal de Aleación AlSi10Mg y Disco Corindón Abrasivo',
    massKg: 5.8,
    acousticContributionDb: 96.2,
    acousticMechanism: 'Fricción abrasiva grano-acero a 80 m/s y aullido del par cónico espiral a 6600 RPM',
    object: toolGroup,
    explodeDirection: new THREE.Vector3(0, 0.45, 0),
    originalPosition: toolGroup.position.clone(),
  });

  const noisePins = [
    {
      id: 'f1',
      name: 'F1: Contacto Abrasivo Disco-Pieza Metálica',
      position: new THREE.Vector3(-0.68, 0.38, 0),
      freqRange: '2000 - 8000 Hz',
      splContribution: 96.2,
    },
    {
      id: 'f2',
      name: 'F2: Engranajes Cónico-Espirales Gleason',
      position: new THREE.Vector3(-0.54, 0.68, 0),
      freqRange: '1000 - 2000 Hz',
      splContribution: 89.5,
    },
    {
      id: 'f3',
      name: 'F3: Motor Universal y Colector de Escobillas',
      position: new THREE.Vector3(0.08, 0.68, 0),
      freqRange: '500 - 1000 Hz',
      splContribution: 87.0,
    },
  ];

  const animate = (dt: number, _time: number, isActive: boolean) => {
    const speed = isActive ? 1.0 : 0.02;
    discGroup.rotation.y += dt * 65 * speed;
  };

  return {
    root,
    parts,
    noisePins,
    animate,
    boundsRadius: 1.3,
  };
}

/* =========================================================================
   5. TROQUELADORA MECÁNICA / PRENSA EXCÉNTRICA 80T (SOLIDWORKS EXPERT)
   ========================================================================= */
export function buildStampingPressCAD(materials: CADMaterialSet): CADAssemblyResult {
  const root = new THREE.Group();
  root.name = 'ENSAMBLAJE_PRENSA_EXCENTRICA_80T_SLDASM';
  const parts: CADPartInfo[] = [];

  // Bastidor monolítico en cuello de cisne (C-Frame) de fundición de alta rigidez
  const frameGroup = new THREE.Group();
  frameGroup.position.set(0, 0.95, 0);

  // Mesa inferior maciza con placa bolster rectificada y ranuras en cruz
  const baseGeom = new THREE.BoxGeometry(1.35, 0.38, 1.5);
  const baseMesh = new THREE.Mesh(baseGeom, materials.castIron);
  baseMesh.position.set(0, -0.72, 0);
  addCADEdges(baseMesh, materials.edgeLineMaterial);
  frameGroup.add(baseMesh);

  // Placa Bolster rectificada
  const bolsterGeom = new THREE.BoxGeometry(1.05, 0.08, 1.1);
  const bolster = new THREE.Mesh(bolsterGeom, materials.machinedSteel);
  bolster.position.set(0.12, -0.49, 0);
  addCADEdges(bolster, materials.edgeLineMaterial);
  frameGroup.add(bolster);

  // Columna trasera con grandes nervaduras triangulares de refuerzo
  const columnGeom = new THREE.BoxGeometry(0.62, 1.75, 0.9);
  const columnMesh = new THREE.Mesh(columnGeom, materials.castIron);
  columnMesh.position.set(-0.38, 0.18, 0);
  addCADEdges(columnMesh, materials.edgeLineMaterial);
  frameGroup.add(columnMesh);

  // Cabezal superior porta-cigüeñal mecanizado
  const headGeom = new THREE.BoxGeometry(1.18, 0.52, 0.9);
  const headMesh = new THREE.Mesh(headGeom, materials.castIron);
  headMesh.position.set(0.12, 0.94, 0);
  addCADEdges(headMesh, materials.edgeLineMaterial);
  frameGroup.add(headMesh);

  // Guías prismáticas de bronce en V ajustables
  [-0.26, 0.26].forEach((zPos) => {
    const gibGeom = new THREE.BoxGeometry(0.12, 0.85, 0.06);
    const gib = new THREE.Mesh(gibGeom, materials.brass);
    gib.position.set(0.08, 0.28, zPos);
    frameGroup.add(gib);
  });
  root.add(frameGroup);

  parts.push({
    id: 'frame',
    name: 'Bastidor_Fundicion_Cuello_Cisne_80T.SLDPRT',
    category: 'Estructura Rígida',
    materialName: 'Fundición Nodular EN-GJS-600-3 Estabilizada Térmicamente',
    massKg: 3400,
    acousticContributionDb: 86.4,
    acousticMechanism: 'Deformación elástica instantánea y snap-through estructural en el punto de cizalladura de chapa',
    object: frameGroup,
    explodeDirection: new THREE.Vector3(-0.65, 0, 0),
    originalPosition: frameGroup.position.clone(),
  });

  // Gran Volante de inercia lateral con ranuras de polea trapezoidal y embrague-freno neumático
  const flywheelGroup = new THREE.Group();
  flywheelGroup.position.set(0.12, 1.88, 0.62);

  const wheelRimGeom = new THREE.TorusGeometry(0.62, 0.14, 20, 36);
  const wheelRim = new THREE.Mesh(wheelRimGeom, materials.castIron);
  addCADEdges(wheelRim, materials.edgeLineMaterial);
  flywheelGroup.add(wheelRim);

  // 6 Radios robustos de perfil elíptico
  for (let r = 0; r < 6; r++) {
    const angle = (r / 6) * Math.PI;
    const spokeGeom = new THREE.CylinderGeometry(0.05, 0.05, 1.18, 16);
    const spoke = new THREE.Mesh(spokeGeom, materials.castIron);
    spoke.rotation.z = angle;
    flywheelGroup.add(spoke);
  }

  // Cubo central del embrague-freno neumático multidisco Ortlinghaus
  const clutchGeom = new THREE.CylinderGeometry(0.26, 0.26, 0.24, 24);
  const clutch = new THREE.Mesh(clutchGeom, materials.warningOrange);
  clutch.rotation.x = Math.PI / 2;
  addCADEdges(clutch, materials.edgeLineMaterial);
  flywheelGroup.add(clutch);

  // Válvula de seguridad neumática de doble cuerpo con silenciador de escape de bronce sinterizado
  const dualValve = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.14), materials.anodizedBlue);
  dualValve.position.set(0, 0.34, 0.12);
  flywheelGroup.add(dualValve);
  root.add(flywheelGroup);

  parts.push({
    id: 'flywheel',
    name: 'Volante_Inercia_Embrague_Neumatico_Ortlinghaus.SLDPRT',
    category: 'Acumulación de Energía',
    materialName: 'Acero Fundido GS-20Mn5 Equilibrado Dinámicamente Grado G 2.5',
    massKg: 580,
    acousticContributionDb: 88.0,
    acousticMechanism: 'Impacto cíclico de acoplamiento embrague-freno y zumbido de correas trapezoidales',
    object: flywheelGroup,
    explodeDirection: new THREE.Vector3(0, 0, 0.75),
    originalPosition: flywheelGroup.position.clone(),
  });

  // Corredera móvil (Ram) guiada por prismas con punzón de corte
  const ramGroup = new THREE.Group();
  ramGroup.position.set(0.28, 0.92, 0);

  const ramGeom = new THREE.BoxGeometry(0.48, 0.54, 0.52);
  const ramMesh = new THREE.Mesh(ramGeom, materials.machinedSteel);
  addCADEdges(ramMesh, materials.edgeLineMaterial);
  ramGroup.add(ramMesh);

  // Matriz superior / Punzón intercambiable de acero de corte D2
  const punchGeom = new THREE.CylinderGeometry(0.09, 0.09, 0.22, 20);
  const punch = new THREE.Mesh(punchGeom, materials.cuttingToolSteel);
  punch.position.y = -0.38;
  ramGroup.add(punch);

  // Columnas guía con casquillos de bolas de precisión del troquel
  [-0.18, 0.18].forEach((zPos) => {
    const guidePillar = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.42, 16), materials.chrome);
    guidePillar.position.set(0.18, -0.35, zPos);
    ramGroup.add(guidePillar);
  });
  root.add(ramGroup);

  parts.push({
    id: 'ram',
    name: 'Corredera_Ram_Troquel_Punzon_D2.SLDPRT',
    category: 'Cinemática de Conformado',
    materialName: 'Acero Forjado 42CrMo4 Templado con Punzones de Acero D2 (1.2379) Tratamiento Criogénico',
    massKg: 310,
    acousticContributionDb: 104.5,
    acousticMechanism: 'Impacto impulsivo de rotura plástica sobre chapa de acero de 4 mm (pico instantáneo > 120 dB)',
    object: ramGroup,
    explodeDirection: new THREE.Vector3(0, 0.55, 0),
    originalPosition: ramGroup.position.clone(),
  });

  // Barreras ópticas de seguridad fotoeléctricas de Categoría 4 en los laterales
  [-0.45, 0.45].forEach((zPos) => {
    const lightCurtain = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.8, 0.05), materials.kaeserYellow);
    lightCurtain.position.set(0.45, 0.45, zPos);
    root.add(lightCurtain);
  });

  // Cilindros neumáticos gemelos de compensación de peso de corredera y troquel (Counterbalance Cylinders)
  [-0.32, 0.32].forEach((zPos) => {
    const cbCylGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.65, 20);
    const cbCyl = new THREE.Mesh(cbCylGeom, materials.anodizedBlue);
    cbCyl.position.set(0.08, 1.45, zPos);
    addCADEdges(cbCyl, materials.edgeLineMaterial);
    root.add(cbCyl);

    const cbRod = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.45, 16), materials.chrome);
    cbRod.position.set(0.08, 1.15, zPos);
    root.add(cbRod);
  });

  // Consola de control de operario con mando bimanual anti-repetición según EN 574
  const consoleGroup = new THREE.Group();
  consoleGroup.position.set(0.85, 0.55, 0);

  const pedestalGeom = new THREE.CylinderGeometry(0.04, 0.05, 0.95, 16);
  const pedestal = new THREE.Mesh(pedestalGeom, materials.castIron);
  pedestal.position.y = -0.05;
  consoleGroup.add(pedestal);

  const consoleDesk = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.65), materials.warningOrange);
  consoleDesk.position.set(0, 0.42, 0);
  addCADEdges(consoleDesk, materials.edgeLineMaterial);
  consoleGroup.add(consoleDesk);

  // Pulsadores de palma amarillos separados 300 mm y paro de emergencia rojo central
  [-0.22, 0.22].forEach((zPos) => {
    const palmBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.025, 16), materials.kaeserYellow);
    palmBtn.position.set(0, 0.49, zPos);
    consoleGroup.add(palmBtn);
  });
  const estopConsole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16), materials.glowingSteel);
  estopConsole.position.set(0, 0.49, 0);
  consoleGroup.add(estopConsole);
  root.add(consoleGroup);

  const noisePins = [
    {
      id: 'f1',
      name: 'F1: Impacto de Punzonado en Chapa Metálica',
      position: new THREE.Vector3(0.28, 0.52, 0.32),
      freqRange: '500 - 4000 Hz (Ruido de Impacto Peak)',
      splContribution: 104.5,
    },
    {
      id: 'f2',
      name: 'F2: Escape del Embrague-Freno Neumático',
      position: new THREE.Vector3(0.12, 1.88, 0.75),
      freqRange: '1000 - 2000 Hz',
      splContribution: 91.2,
    },
    {
      id: 'f3',
      name: 'F3: Resonancia Estructural del Bastidor C',
      position: new THREE.Vector3(-0.38, 1.15, 0.48),
      freqRange: '125 - 250 Hz',
      splContribution: 86.4,
    },
  ];

  let crankAngle = 0;
  const animate = (dt: number, _time: number, isActive: boolean) => {
    const speed = isActive ? 1.0 : 0.05;
    crankAngle += dt * 9 * speed;
    flywheelGroup.rotation.z -= dt * 9 * speed;

    // Cinemática armónica de corredera excéntrica con carrera de 140 mm
    const stroke = 0.16;
    ramGroup.position.y = 0.92 + Math.cos(crankAngle) * stroke;
  };

  return {
    root,
    parts,
    noisePins,
    animate,
    boundsRadius: 2.2,
  };
}

/* =========================================================================
   6. MARTINETE NEUMÁTICO / MARTILLO DE FORJA INDUSTRIAL (SOLIDWORKS EXPERT)
   ========================================================================= */
export function buildForgingHammerCAD(materials: CADMaterialSet): CADAssemblyResult {
  const root = new THREE.Group();
  root.name = 'ENSAMBLAJE_MARTINETE_PILON_FORJA_SLDASM';
  const parts: CADPartInfo[] = [];

  // Yunque macizo de forja monolítico (12 Toneladas) aislado sobre madera de roble
  const anvilGroup = new THREE.Group();
  anvilGroup.position.set(0, 0.38, 0);

  const anvilGeom = new THREE.BoxGeometry(0.98, 0.76, 0.98);
  const anvilMesh = new THREE.Mesh(anvilGeom, materials.castIron);
  addCADEdges(anvilMesh, materials.edgeLineMaterial);
  anvilGroup.add(anvilMesh);

  // Estampa / sufridera inferior con sujeción por chaveta cónica de cuña
  const lowerDieGeom = new THREE.BoxGeometry(0.36, 0.18, 0.36);
  const lowerDie = new THREE.Mesh(lowerDieGeom, materials.cuttingToolSteel);
  lowerDie.position.y = 0.46;
  anvilGroup.add(lowerDie);

  // Palanquilla de forja al rojo vivo incandescente (1150 °C) con emisión térmica
  const billetGeom = new THREE.BoxGeometry(0.2, 0.1, 0.2);
  const billet = new THREE.Mesh(billetGeom, materials.glowingSteel);
  billet.position.y = 0.58;
  anvilGroup.add(billet);

  // Tenazas de forja de acero forjado sosteniendo la palanquilla
  const tongsGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.85, 12);
  const tongs = new THREE.Mesh(tongsGeom, materials.machinedSteel);
  tongs.rotation.z = Math.PI / 2.2;
  tongs.position.set(0.48, 0.58, 0);
  anvilGroup.add(tongs);
  root.add(anvilGroup);

  parts.push({
    id: 'anvil',
    name: 'Yunque_Forja_Monolitico_12T.SLDPRT',
    category: 'Masa de Absorción de Choque',
    materialName: 'Acero Fundido 35CrMo4 sobre Capas de Amortiguación de Madera de Roble y Neopreno',
    massKg: 5200,
    acousticContributionDb: 89.0,
    acousticMechanism: 'Transmisión de onda elástica de choque hacia el suelo y rebote acústico',
    object: anvilGroup,
    explodeDirection: new THREE.Vector3(0, -0.45, 0),
    originalPosition: anvilGroup.position.clone(),
  });

  // Columnas verticales de guiado (Twin Uprights) y cilindro neumático superior de potencia
  const columnsGroup = new THREE.Group();
  columnsGroup.position.set(0, 1.55, 0);

  // Columna izquierda y derecha
  [-0.48, 0.48].forEach((xPos) => {
    const colGeom = new THREE.BoxGeometry(0.26, 1.6, 0.42);
    const col = new THREE.Mesh(colGeom, materials.castIron);
    col.position.x = xPos;
    addCADEdges(col, materials.edgeLineMaterial);
    columnsGroup.add(col);

    // Guías templadas en cola de milano
    const guide = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.4, 0.08), materials.brass);
    guide.position.set(xPos > 0 ? xPos - 0.14 : xPos + 0.14, 0, 0);
    columnsGroup.add(guide);
  });

  // Cilindro neumático superior de potencia de doble efecto (Diámetro 320 mm)
  const cylGeom = new THREE.CylinderGeometry(0.32, 0.32, 0.92, 28);
  const cylinder = new THREE.Mesh(cylGeom, materials.castIron);
  cylinder.position.y = 1.12;
  addCADEdges(cylinder, materials.edgeLineMaterial);
  columnsGroup.add(cylinder);

  // Tapa superior del cilindro con tornillos de apriete
  const topCylFlange = createFlangeWithBolts(0.36, 0.1, 0.05, 8, materials);
  topCylFlange.position.y = 1.58;
  columnsGroup.add(topCylFlange);

  // Manómetro de presión neumática de culata (0-10 bar)
  const hammerGaugeGeom = new THREE.CylinderGeometry(0.075, 0.075, 0.03, 20);
  const hammerGauge = new THREE.Mesh(hammerGaugeGeom, materials.chrome);
  hammerGauge.position.set(0, 1.72, 0.28);
  hammerGauge.rotation.x = Math.PI / 2;
  addCADEdges(hammerGauge, materials.edgeLineMaterial);
  columnsGroup.add(hammerGauge);

  // Engrasador por goteo de aceite de cilindro en latón y pyrex (Drop-Feed Lubricator)
  const lubricatorGeom = new THREE.CylinderGeometry(0.045, 0.045, 0.12, 16);
  const lubricator = new THREE.Mesh(lubricatorGeom, materials.oilLevelLiquid);
  lubricator.position.set(-0.28, 1.75, 0);
  columnsGroup.add(lubricator);

  const lubCap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16), materials.brass);
  lubCap.position.set(-0.28, 1.82, 0);
  columnsGroup.add(lubCap);

  // Varillaje mecánico de transmisión desde la válvula distribuidora al pedal de pie
  const linkRodGeom = new THREE.CylinderGeometry(0.015, 0.015, 1.45, 12);
  const linkRod = new THREE.Mesh(linkRodGeom, materials.machinedSteel);
  linkRod.position.set(0.58, 0.5, 0.2);
  columnsGroup.add(linkRod);
  root.add(columnsGroup);

  parts.push({
    id: 'columns',
    name: 'Columnas_Guia_Cilindro_Neumatico_DobleEfecto.SLDPRT',
    category: 'Accionamiento Neumático',
    materialName: 'Fundición Perlítica con Camisa Bruñida y Guías Templadas por Inducción',
    massKg: 1850,
    acousticContributionDb: 94.6,
    acousticMechanism: 'Escape neumático a alta presión (8 bar) con descompresión súbita en cada embolada',
    object: columnsGroup,
    explodeDirection: new THREE.Vector3(0, 0.55, 0),
    originalPosition: columnsGroup.position.clone(),
  });

  // Maza móvil / Pilón de impacto de forja (Tup de 250 kg)
  const tupGroup = new THREE.Group();
  tupGroup.position.set(0, 1.35, 0);

  const tupGeom = new THREE.BoxGeometry(0.46, 0.6, 0.46);
  const tupMesh = new THREE.Mesh(tupGeom, materials.machinedSteel);
  addCADEdges(tupMesh, materials.edgeLineMaterial);
  tupGroup.add(tupMesh);

  // Vástago de conexión cromado rectificado
  const pistonRod = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.75, 20), materials.chrome);
  pistonRod.position.y = 0.55;
  tupGroup.add(pistonRod);

  // Estampa superior de forja de acero templado
  const upperDieGeom = new THREE.BoxGeometry(0.36, 0.16, 0.36);
  const upperDie = new THREE.Mesh(upperDieGeom, materials.cuttingToolSteel);
  upperDie.position.y = -0.37;
  tupGroup.add(upperDie);
  root.add(tupGroup);

  parts.push({
    id: 'tup',
    name: 'Maza_Impacto_Pilon_Forja_250kg.SLDPRT',
    category: 'Herramienta de Forja',
    materialName: 'Acero Forjado al Níquel-Cromo-Molibdeno 56NiCrMoV7',
    massKg: 340,
    acousticContributionDb: 108.2,
    acousticMechanism: 'Choque metálico inelástico masivo a 6.5 m/s produciendo frentes de onda de choque transitorios impulsivos',
    object: tupGroup,
    explodeDirection: new THREE.Vector3(0, 0.45, 0),
    originalPosition: tupGroup.position.clone(),
  });

  // Pedal perimetral envolvente de accionamiento con retorno por muelle
  const treadleGeom = new THREE.TorusGeometry(0.72, 0.025, 12, 32, Math.PI);
  const treadle = new THREE.Mesh(treadleGeom, materials.machinedSteel);
  treadle.rotation.x = Math.PI / 2;
  treadle.position.set(0, 0.12, 0.25);
  root.add(treadle);

  const noisePins = [
    {
      id: 'f1',
      name: 'F1: Choque de Impacto Maza-Palanquilla-Yunque',
      position: new THREE.Vector3(0, 0.65, 0.35),
      freqRange: '250 - 4000 Hz (Ruido de Impacto de Forja)',
      splContribution: 108.2,
    },
    {
      id: 'f2',
      name: 'F2: Descarga Neumática Súbita del Cilindro',
      position: new THREE.Vector3(0.38, 2.45, 0),
      freqRange: '1000 - 8000 Hz',
      splContribution: 94.6,
    },
    {
      id: 'f3',
      name: 'F3: Resonancia de la Masa Sísmica del Yunque',
      position: new THREE.Vector3(0, 0.38, 0.52),
      freqRange: '63 - 250 Hz',
      splContribution: 89.0,
    },
  ];

  let tupPhase = 0;
  const animate = (dt: number, _time: number, isActive: boolean) => {
    const speed = isActive ? 1.0 : 0.05;
    tupPhase += dt * 7 * speed;

    // Embolada brusca no lineal de forja (subida lenta, caída súbita e impacto)
    const cycle = (tupPhase % (Math.PI * 2)) / (Math.PI * 2);
    let yDisp = 0;
    if (cycle < 0.6) {
      yDisp = Math.sin((cycle / 0.6) * (Math.PI / 2)) * 0.42;
    } else {
      // Caída rápida por gravedad y presión neumática
      const fall = (cycle - 0.6) / 0.4;
      yDisp = 0.42 * (1 - Math.pow(fall, 2));
    }

    tupGroup.position.y = 1.02 + yDisp;
  };

  return {
    root,
    parts,
    noisePins,
    animate,
    boundsRadius: 2.3,
  };
}
