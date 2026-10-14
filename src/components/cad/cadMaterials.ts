import * as THREE from 'three';

export interface CADMaterialSet {
  kaeserYellow: THREE.MeshStandardMaterial;
  kaeserAnthracite: THREE.MeshStandardMaterial;
  castIron: THREE.MeshStandardMaterial;
  machinedSteel: THREE.MeshStandardMaterial;
  chrome: THREE.MeshStandardMaterial;
  brushedAluminum: THREE.MeshStandardMaterial;
  darkRubber: THREE.MeshStandardMaterial;
  copperWinding: THREE.MeshStandardMaterial;
  clearAcrylic: THREE.MeshPhysicalMaterial;
  glowingSteel: THREE.MeshStandardMaterial;
  brass: THREE.MeshStandardMaterial;
  cuttingToolSteel: THREE.MeshStandardMaterial;
  soundFoam: THREE.MeshStandardMaterial;
  warningOrange: THREE.MeshStandardMaterial;
  anodizedBlue: THREE.MeshStandardMaterial;
  braidedStainless: THREE.MeshStandardMaterial;
  galvanizedSteel: THREE.MeshStandardMaterial;
  carbideTungsten: THREE.MeshStandardMaterial;
  oilLevelLiquid: THREE.MeshPhysicalMaterial;
  edgeLineMaterial: THREE.LineBasicMaterial;
  highlightLineMaterial: THREE.LineBasicMaterial;
  boltMaterial: THREE.MeshStandardMaterial;
}

// Generador procedural de textura de cepillado metálico para aluminio aeronáutico y acero torneado
function createBrushedMetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#b0b8c4';
  ctx.fillRect(0, 0, 512, 512);

  // Micro-estrías de mecanizado y cepillado tangencial
  for (let i = 0; i < 4000; i++) {
    const y = Math.random() * 512;
    const len = 30 + Math.random() * 120;
    const x = Math.random() * 512;
    const brightness = 140 + Math.floor(Math.random() * 110);
    ctx.strokeStyle = `rgba(${brightness}, ${brightness + 4}, ${brightness + 10}, 0.22)`;
    ctx.lineWidth = 0.5 + Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// Generador de textura rugosa de fundición nodular (Cast Iron Stipple)
function createCastIronNoiseTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = 110 + Math.floor(Math.random() * 55);
    data[i] = n;
    data[i + 1] = n;
    data[i + 2] = n;
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// Generador de textura de malla trenzada de acero para mangueras hidráulicas
function createBraidedHoseTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#2a313d';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#8a99ad';
  ctx.lineWidth = 2;
  const step = 8;
  for (let i = -256; i < 512; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 256, 256);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i, 256);
    ctx.lineTo(i + 256, 0);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 16);
  return texture;
}

export function createCADMaterials(): CADMaterialSet {
  const brushedMetalMap = typeof document !== 'undefined' ? createBrushedMetalTexture() : null;
  const castIronBumpMap = typeof document !== 'undefined' ? createCastIronNoiseTexture() : null;
  const braidedMap = typeof document !== 'undefined' ? createBraidedHoseTexture() : null;

  // Amarillo industrial Kaeser SIGMA RAL 1021 electrostático
  const kaeserYellow = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.28,
    metalness: 0.18,
  });

  // Gris grafito antracita industrial RAL 7024 (chasis y protecciones)
  const kaeserAnthracite = new THREE.MeshStandardMaterial({
    color: 0x1b222d,
    roughness: 0.38,
    metalness: 0.35,
  });

  // Fundición gris perlítica EN-GJL-250 con relieve superficial de colada
  const castIron = new THREE.MeshStandardMaterial({
    color: 0x3a4352,
    roughness: 0.65,
    metalness: 0.55,
    bumpMap: castIronBumpMap || undefined,
    bumpScale: 0.015,
  });

  // Acero mecanizado rectificado / torneado espejo de precisión
  const machinedSteel = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.16,
    metalness: 0.92,
    map: brushedMetalMap || undefined,
  });

  // Cromo pulido de alta especificación
  const chrome = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.04,
    metalness: 0.98,
  });

  // Aluminio cepillado grado aeroespacial 6061-T6
  const brushedAluminum = new THREE.MeshStandardMaterial({
    color: 0xd4dbe4,
    roughness: 0.28,
    metalness: 0.85,
    map: brushedMetalMap || undefined,
  });

  // Tornillería y fijaciones DIN 912 / DIN 933 pavonadas en negro o cromadas
  const boltMaterial = new THREE.MeshStandardMaterial({
    color: 0xc4cbd5,
    roughness: 0.22,
    metalness: 0.94,
  });

  // Caucho sintético NBR antivibratorio y sellos
  const darkRubber = new THREE.MeshStandardMaterial({
    color: 0x111418,
    roughness: 0.92,
    metalness: 0.04,
  });

  // Cobre electrolítico de bobinados y escobillas
  const copperWinding = new THREE.MeshStandardMaterial({
    color: 0xc25e10,
    roughness: 0.24,
    metalness: 0.88,
  });

  // Policarbonato Makrolon transparente antichoque
  const clearAcrylic = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transmission: 0.94,
    opacity: 1,
    transparent: true,
    roughness: 0.06,
    ior: 1.54,
    thickness: 0.6,
  });

  // Acero forjado al rojo vivo incandescente (1150 °C)
  const glowingSteel = new THREE.MeshStandardMaterial({
    color: 0xff4500,
    emissive: 0xff2a00,
    emissiveIntensity: 1.2,
    roughness: 0.35,
    metalness: 0.3,
  });

  // Latón naval CW614N para válvulas y manómetros
  const brass = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.22,
    metalness: 0.88,
  });

  // Acero de herramienta HSS / Plaquitas de Carburo de Tungsteno
  const cuttingToolSteel = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.12,
    metalness: 0.96,
  });

  // Carburo de tungsteno virgen (Widia sinterizado)
  const carbideTungsten = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.18,
    metalness: 0.9,
  });

  // Malla flexible de acero inoxidable para conductos hidráulicos a presión
  const braidedStainless = new THREE.MeshStandardMaterial({
    color: 0xb8c4d4,
    roughness: 0.32,
    metalness: 0.85,
    map: braidedMap || undefined,
  });

  // Acero galvanizado por inmersión en caliente
  const galvanizedSteel = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.42,
    metalness: 0.75,
  });

  // Naranja de advertencia / seguridad industrial ISO 3864
  const warningOrange = new THREE.MeshStandardMaterial({
    color: 0xea580c,
    roughness: 0.25,
    metalness: 0.2,
  });

  // Azul anodizado de actuadores neumáticos
  const anodizedBlue = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.25,
    metalness: 0.7,
  });

  // Aceite mineral sintético de refrigeración ISO VG 46
  const oilLevelLiquid = new THREE.MeshPhysicalMaterial({
    color: 0xf59e0b,
    transmission: 0.85,
    opacity: 0.9,
    transparent: true,
    roughness: 0.1,
    ior: 1.48,
  });

  // Espuma fonoabsorbente alveolar acústica
  const soundFoam = new THREE.MeshStandardMaterial({
    color: 0x181e26,
    roughness: 0.98,
    metalness: 0.01,
  });

  // Aristas técnicas de precisión vectorial estilo SolidWorks RealView Graphics
  const edgeLineMaterial = new THREE.LineBasicMaterial({
    color: 0x0f172a,
    linewidth: 1,
    transparent: true,
    opacity: 0.92,
  });

  // Resalte cyan de selección
  const highlightLineMaterial = new THREE.LineBasicMaterial({
    color: 0x06b6d4,
    linewidth: 2,
  });

  return {
    kaeserYellow,
    kaeserAnthracite,
    castIron,
    machinedSteel,
    chrome,
    brushedAluminum,
    darkRubber,
    copperWinding,
    clearAcrylic,
    glowingSteel,
    brass,
    cuttingToolSteel,
    soundFoam,
    warningOrange,
    anodizedBlue,
    braidedStainless,
    galvanizedSteel,
    carbideTungsten,
    oilLevelLiquid,
    edgeLineMaterial,
    highlightLineMaterial,
    boltMaterial,
  };
}

/**
 * Agrega aristas de ingeniería estilo SolidWorks ("Shaded with Edges") a cualquier Mesh.
 */
export function addCADEdges(
  mesh: THREE.Mesh,
  edgeMaterial: THREE.LineBasicMaterial,
  thresholdAngle: number = 24
): THREE.LineSegments {
  const edgesGeom = new THREE.EdgesGeometry(mesh.geometry, thresholdAngle);
  const edges = new THREE.LineSegments(edgesGeom, edgeMaterial);
  edges.name = '__cad_edge__';
  mesh.add(edges);
  return edges;
}

/* =========================================================================
   ELEMENTOS DE FERRETERÍA Y COMPONENTES PARAMÉTRICOS DIN/ISO
   ========================================================================= */

// Perno Hexagonal DIN 933 con arandela de asiento achaflanada
export function createHexBoltMesh(
  radius: number = 0.04,
  length: number = 0.03,
  materials: CADMaterialSet
): THREE.Group {
  const group = new THREE.Group();
  
  // Arandela plana DIN 125
  const washerGeom = new THREE.CylinderGeometry(radius * 1.5, radius * 1.5, length * 0.25, 12);
  const washer = new THREE.Mesh(washerGeom, materials.machinedSteel);
  washer.position.y = length * 0.125;
  group.add(washer);

  // Cabeza hexagonal de 6 caras
  const headGeom = new THREE.CylinderGeometry(radius, radius, length * 0.85, 6);
  const head = new THREE.Mesh(headGeom, materials.boltMaterial);
  head.position.y = length * 0.55;
  head.castShadow = true;
  addCADEdges(head, materials.edgeLineMaterial, 30);
  group.add(head);

  return group;
}

// Tornillo de cabeza cilíndrica con hexágono interior (Allen DIN 912)
export function createAllenBoltMesh(
  radius: number = 0.035,
  length: number = 0.035,
  materials: CADMaterialSet
): THREE.Group {
  const group = new THREE.Group();

  // Cabeza cilíndrica estriada
  const headGeom = new THREE.CylinderGeometry(radius, radius, length, 16);
  const head = new THREE.Mesh(headGeom, materials.boltMaterial);
  head.position.y = length * 0.5;
  addCADEdges(head, materials.edgeLineMaterial, 30);
  group.add(head);

  // Hueco hexagonal Allen negro interior
  const hexSocketGeom = new THREE.CylinderGeometry(radius * 0.55, radius * 0.55, length * 0.4, 6);
  const hexSocket = new THREE.Mesh(hexSocketGeom, materials.kaeserAnthracite);
  hexSocket.position.y = length * 0.82;
  group.add(hexSocket);

  return group;
}

// Círculo de tornillos con paso angular exacto (para bridas, tapas de rodamientos y carcasas)
export function createBoltCircle(
  radius: number,
  count: number,
  boltSize: number,
  materials: CADMaterialSet,
  axis: 'x' | 'y' | 'z' = 'y'
): THREE.Group {
  const group = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const bolt = createAllenBoltMesh(boltSize, boltSize, materials);

    if (axis === 'y') {
      bolt.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    } else if (axis === 'z') {
      bolt.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      bolt.rotation.x = Math.PI / 2;
    } else {
      bolt.position.set(0, Math.cos(angle) * radius, Math.sin(angle) * radius);
      bolt.rotation.z = Math.PI / 2;
    }
    group.add(bolt);
  }
  return group;
}

// Brida industrial completa con agujero central, cuello de soldadura y pernos
export function createFlangeWithBolts(
  outerRadius: number,
  innerRadius: number,
  thickness: number,
  boltCount: number,
  materials: CADMaterialSet
): THREE.Group {
  const group = new THREE.Group();

  // Disco de la brida
  const flangeGeom = new THREE.CylinderGeometry(outerRadius, outerRadius, thickness, 24);
  const flangeMesh = new THREE.Mesh(flangeGeom, materials.machinedSteel);
  addCADEdges(flangeMesh, materials.edgeLineMaterial);
  group.add(flangeMesh);

  // Cuello de soldadura cónico
  const hubGeom = new THREE.CylinderGeometry(innerRadius * 1.35, innerRadius * 1.15, thickness * 1.5, 24);
  const hub = new THREE.Mesh(hubGeom, materials.castIron);
  hub.position.y = thickness * 1.1;
  addCADEdges(hub, materials.edgeLineMaterial);
  group.add(hub);

  // Círculo de pernos en la corona exterior
  const boltCircleRadius = (outerRadius + innerRadius * 1.35) * 0.5;
  const bolts = createBoltCircle(boltCircleRadius, boltCount, thickness * 0.28, materials, 'y');
  bolts.position.y = thickness * 0.5;
  group.add(bolts);

  return group;
}

// Placa de características técnicas industrial serigrafiada con remaches de fijación
export function createNameplateMesh(
  width: number,
  height: number,
  brand: string,
  model: string,
  specs: string,
  materials: CADMaterialSet
): THREE.Group {
  const group = new THREE.Group();

  // Placa de aluminio
  const plateGeom = new THREE.BoxGeometry(width, height, 0.008);
  const plate = new THREE.Mesh(plateGeom, materials.brushedAluminum);
  addCADEdges(plate, materials.edgeLineMaterial);
  group.add(plate);

  // Remaches ciegos en las 4 esquinas
  const rivetRadius = 0.012;
  const rivetGeom = new THREE.SphereGeometry(rivetRadius, 8, 8);
  const corners = [
    [-width / 2 + 0.025, height / 2 - 0.025],
    [width / 2 - 0.025, height / 2 - 0.025],
    [-width / 2 + 0.025, -height / 2 + 0.025],
    [width / 2 - 0.025, -height / 2 + 0.025],
  ];
  corners.forEach(([x, y]) => {
    const rivet = new THREE.Mesh(rivetGeom, materials.chrome);
    rivet.position.set(x, y, 0.006);
    group.add(rivet);
  });

  // Etiqueta gráfica serigrafiada con canvas de alta definición
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 512, 256);

      // Franja de marca
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(10, 10, 492, 45);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(brand.toUpperCase(), 24, 42);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(model, 24, 95);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px monospace';
      const lines = specs.split(' | ');
      lines.forEach((l, idx) => {
        ctx.fillText(l, 24, 130 + idx * 26);
      });

      // Marcado CE y símbolo de tierra
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(430, 75, 60, 45);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('CE', 440, 107);

      const labelTex = new THREE.CanvasTexture(canvas);
      const labelMat = new THREE.MeshBasicMaterial({ map: labelTex });
      const labelGeom = new THREE.PlaneGeometry(width * 0.9, height * 0.88);
      const labelMesh = new THREE.Mesh(labelGeom, labelMat);
      labelMesh.position.set(0, 0, 0.005);
      group.add(labelMesh);
    }
  }

  return group;
}

// Rejilla de persiana de ventilación (Acoustic Louvers) estampada en chapa
export function createAcousticLouverMesh(
  width: number,
  height: number,
  louverCount: number,
  materials: CADMaterialSet
): THREE.Group {
  const group = new THREE.Group();

  // Marco perimetral
  const frameGeom = new THREE.BoxGeometry(width, height, 0.03);
  const frame = new THREE.Mesh(frameGeom, materials.kaeserAnthracite);
  addCADEdges(frame, materials.edgeLineMaterial);
  group.add(frame);

  // Lamas inclinadas a 35° para atenuación de ruido
  const spacing = height / (louverCount + 1);
  for (let i = 0; i < louverCount; i++) {
    const louverGeom = new THREE.BoxGeometry(width * 0.88, 0.02, 0.06);
    const louver = new THREE.Mesh(louverGeom, materials.machinedSteel);
    louver.position.set(0, -height / 2 + spacing * (i + 1), 0);
    louver.rotation.x = -Math.PI / 5;
    group.add(louver);
  }

  return group;
}
