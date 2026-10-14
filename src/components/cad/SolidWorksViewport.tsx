import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { SoundSource, NoiseGeneratorPoint } from '../../types';
import {
  createCADMaterials,
  CADMaterialSet,
} from './cadMaterials';
import {
  buildKaeserCompressorCAD,
  buildCentrifugalTurbineCAD,
  buildTableSawCAD,
  buildAngleGrinderCAD,
  buildStampingPressCAD,
  buildForgingHammerCAD,
  CADAssemblyResult,
  CADPartInfo,
} from './cadModels3D';
import {
  Box,
  Maximize2,
  Layers,
  Scissors,
  Split,
  Waves,
  Sun,
  Moon,
  Info,
  Volume2,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Eye,
  Sliders,
} from 'lucide-react';

interface SolidWorksViewportProps {
  source: SoundSource;
  isActive: boolean;
  distance: number;
  onSelectGenerator?: (gen: NoiseGeneratorPoint) => void;
  selectedGenerator?: NoiseGeneratorPoint | null;
}

export const SolidWorksViewport: React.FC<SolidWorksViewportProps> = ({
  source,
  isActive,
  distance,
  onSelectGenerator,
  selectedGenerator,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const triadCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Estados de control de SolidWorks Viewport (Por defecto: 'shadedEdges' - Sombreado con Aristas de Precisión SolidWorks RealView)
  const [displayStyle, setDisplayStyle] = useState<'shadedEdges' | 'shaded' | 'wireframe' | 'xray'>('shadedEdges');
  const [cadTheme, setCadTheme] = useState<'studioLight' | 'workstationDark'>('workstationDark');
  const [isSectionView, setIsSectionView] = useState<boolean>(false);
  const [sectionPlaneAxis, setSectionPlaneAxis] = useState<'x' | 'y' | 'z'>('z');
  const [explodedAmount, setExplodedAmount] = useState<number>(0);
  const [showExplodeSlider, setShowExplodeSlider] = useState<boolean>(false);
  const [showWaves, setShowWaves] = useState<boolean>(true);
  const [showTree, setShowTree] = useState<boolean>(false);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [activeFocalPin, setActiveFocalPin] = useState<string | null>(null);

  // Referencias mutables para animación y Three.js
  const threeRefs = useRef<{
    renderer: THREE.WebGLRenderer | null;
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    controls: OrbitControls | null;
    materials: CADMaterialSet | null;
    assembly: CADAssemblyResult | null;
    clippingPlane: THREE.Plane | null;
    waveGroup: THREE.Group | null;
    triadRenderer: THREE.WebGLRenderer | null;
    triadScene: THREE.Scene | null;
    triadCamera: THREE.PerspectiveCamera | null;
    gridHelper: THREE.GridHelper | null;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    animFrameId: number | null;
  }>({
    renderer: null,
    scene: null,
    camera: null,
    controls: null,
    materials: null,
    assembly: null,
    clippingPlane: null,
    waveGroup: null,
    triadRenderer: null,
    triadScene: null,
    triadCamera: null,
    gridHelper: null,
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    animFrameId: null,
  });

  // Lista de piezas CAD del ensamblaje actual para el árbol de operaciones
  const [assemblyParts, setAssemblyParts] = useState<CADPartInfo[]>([]);

  // Inicialización de Three.js Scene, Renderer, PBR Lighting y Studio
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const triadCanvas = triadCanvasRef.current;
    if (!container || !canvas || !triadCanvas) return;

    const width = container.clientWidth || 840;
    const height = Math.round(width * 0.52);

    // 1. Renderer Principal WebGL PBR
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;

    // 2. Escena y Entorno de Reflexión de Estudio (RoomEnvironment)
    const scene = new THREE.Scene();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    pmremGenerator.dispose();

    // 3. Cámara de Perspectiva CAD
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(3.8, 2.6, 4.4);

    // 4. Controles de Órbita SolidWorks (Damping suave, rotación con botón izquierdo, paneo con derecho)
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 14;
    controls.minDistance = 0.8;
    controls.target.set(0, 0.75, 0);

    // 5. Iluminación de Estudio SolidWorks (Key, Fill, Rim)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(5, 8, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    const d = 3.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 1.2);
    fillLight.position.set(-6, 4, -4);
    scene.add(fillLight);

    const bottomRimLight = new THREE.DirectionalLight(0x94a3b8, 0.6);
    bottomRimLight.position.set(0, -3, 0);
    scene.add(bottomRimLight);

    // 6. Suelo de Taller Industrial de Hormigón Epoxi Pulido y Sombra de Contacto
    const floorGeom = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111620,
      roughness: 0.28,
      metalness: 0.2,
    });
    const floorMesh = new THREE.Mesh(floorGeom, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.012;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Cuadrícula técnica (oculta por defecto para realismo fotográfico)
    const gridHelper = new THREE.GridHelper(10, 20, 0x0284c7, 0x334155);
    gridHelper.position.y = -0.005;
    gridHelper.visible = false;
    scene.add(gridHelper);

    // Plano de sombra de contacto suave
    const shadowPlaneGeom = new THREE.PlaneGeometry(8, 8);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.55 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeom, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.008;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 7. Grupo de Ondas Acústicas 3D
    const waveGroup = new THREE.Group();
    scene.add(waveGroup);

    // 8. Plano de Corte en Sección CAD (SolidWorks Section View)
    const clippingPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.3);

    // 9. Renderer para la Tríada de Coordenadas X-Y-Z en miniatura
    const triadRenderer = new THREE.WebGLRenderer({
      canvas: triadCanvas,
      antialias: true,
      alpha: true,
    });
    triadRenderer.setSize(80, 80);
    triadRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const triadScene = new THREE.Scene();
    const triadCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
    triadCamera.position.set(0, 0, 2.8);

    const triadAxes = new THREE.AxesHelper(1.1);
    (triadAxes.material as THREE.Material).depthTest = false;
    triadAxes.renderOrder = 999;
    triadScene.add(triadAxes);

    // Guardar en referencias
    threeRefs.current.renderer = renderer;
    threeRefs.current.scene = scene;
    threeRefs.current.camera = camera;
    threeRefs.current.controls = controls;
    threeRefs.current.materials = createCADMaterials();
    threeRefs.current.clippingPlane = clippingPlane;
    threeRefs.current.waveGroup = waveGroup;
    threeRefs.current.triadRenderer = triadRenderer;
    threeRefs.current.triadScene = triadScene;
    threeRefs.current.triadCamera = triadCamera;
    threeRefs.current.gridHelper = gridHelper;

    // Manejo de redimensionado responsivo
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const newWidth = containerRef.current.clientWidth || 840;
      const newHeight = Math.round(newWidth * 0.52);
      renderer.setSize(newWidth, newHeight);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (threeRefs.current.animFrameId) {
        cancelAnimationFrame(threeRefs.current.animFrameId);
      }
      renderer.dispose();
      triadRenderer.dispose();
    };
  }, []);

  // Carga del modelo CAD según la máquina seleccionada
  useEffect(() => {
    const { scene, materials, waveGroup } = threeRefs.current;
    if (!scene || !materials) return;

    // Eliminar ensamblaje anterior
    if (threeRefs.current.assembly) {
      scene.remove(threeRefs.current.assembly.root);
    }

    // Limpiar ondas anteriores
    if (waveGroup) {
      while (waveGroup.children.length > 0) {
        waveGroup.remove(waveGroup.children[0]);
      }
    }

    let assembly: CADAssemblyResult;

    switch (source.id) {
      case 'compresor':
        assembly = buildKaeserCompressorCAD(materials);
        break;
      case 'turbina':
        assembly = buildCentrifugalTurbineCAD(materials);
        break;
      case 'sierra':
        assembly = buildTableSawCAD(materials);
        break;
      case 'pulidora':
        assembly = buildAngleGrinderCAD(materials);
        break;
      case 'troqueladora':
        assembly = buildStampingPressCAD(materials);
        break;
      case 'martinete':
        assembly = buildForgingHammerCAD(materials);
        break;
      default:
        assembly = buildKaeserCompressorCAD(materials);
        break;
    }

    scene.add(assembly.root);
    threeRefs.current.assembly = assembly;
    setAssemblyParts(assembly.parts);

    // Crear marcadores 3D para los focos acústicos F1..Fn
    if (waveGroup) {
      assembly.noisePins.forEach((pin, idx) => {
        const pinGroup = new THREE.Group();
        pinGroup.name = `pin_${pin.id}`;
        pinGroup.position.copy(pin.position);

        // Esfera luminosa pulsante de foco acústico ISO 9612
        const sphereGeom = new THREE.SphereGeometry(0.065, 16, 16);
        const sphereMat = new THREE.MeshStandardMaterial({
          color: 0xea580c,
          emissive: 0xea580c,
          emissiveIntensity: 0.9,
          roughness: 0.2,
        });
        const sphere = new THREE.Mesh(sphereGeom, sphereMat);
        pinGroup.add(sphere);

        // Anillo orbital de foco acústico
        const ringGeom = new THREE.TorusGeometry(0.12, 0.015, 8, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.name = 'pulseRing';
        pinGroup.add(ring);

        // Banderola MBD de Inspección Metrológica 3D SolidWorks
        if (typeof document !== 'undefined') {
          const canvas = document.createElement('canvas');
          canvas.width = 380;
          canvas.height = 120;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = 'rgba(14, 18, 23, 0.94)';
            ctx.strokeStyle = '#ea580c';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(4, 4, 372, 112, 10);
            ctx.fill();
            ctx.stroke();

            // Cabecera de cota
            ctx.fillStyle = '#ea580c';
            ctx.fillRect(4, 4, 372, 34);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px monospace';
            ctx.fillText(pin.name.split(':')[0] || 'FOCO', 14, 27);

            ctx.textAlign = 'right';
            ctx.fillText(`${pin.splContribution.toFixed(1)} dB(A)`, 360, 27);

            ctx.textAlign = 'left';
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 18px sans-serif';
            const cleanName = (pin.name.split(':')[1] || pin.name).trim();
            ctx.fillText(cleanName.slice(0, 26), 14, 68);

            ctx.fillStyle = '#38bdf8';
            ctx.font = '16px monospace';
            ctx.fillText(`ISO 9612: ${pin.freqRange}`, 14, 100);

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.scale.set(0.68, 0.22, 1);
            sprite.position.set(0, 0.35, 0);
            pinGroup.add(sprite);

            // Línea de referencia / Leader Line
            const lineGeom = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(0, 0.07, 0),
              new THREE.Vector3(0, 0.24, 0),
            ]);
            const lineMat = new THREE.LineBasicMaterial({ color: 0xea580c, transparent: true, opacity: 0.8 });
            pinGroup.add(new THREE.Line(lineGeom, lineMat));
          }
        }

        waveGroup.add(pinGroup);
      });
    }

    // Centrar la cámara suavemente en el nuevo modelo
    if (threeRefs.current.controls && threeRefs.current.camera) {
      threeRefs.current.controls.target.set(0, 0.75, 0);
      threeRefs.current.camera.position.set(3.4, 2.4, 3.8);
      threeRefs.current.controls.update();
    }
  }, [source.id]);

  // Actualizar modo de visualización de aristas, sombreado y corte de sección
  useEffect(() => {
    const { assembly, clippingPlane, renderer } = threeRefs.current;
    if (!assembly || !renderer) return;

    if (renderer) {
      renderer.clippingPlanes = isSectionView && clippingPlane ? [clippingPlane] : [];
    }

    if (clippingPlane) {
      if (sectionPlaneAxis === 'x') {
        clippingPlane.normal.set(-1, 0, 0);
        clippingPlane.constant = 0.2;
      } else if (sectionPlaneAxis === 'y') {
        clippingPlane.normal.set(0, -1, 0);
        clippingPlane.constant = 0.9;
      } else {
        clippingPlane.normal.set(0, 0, -1);
        clippingPlane.constant = 0.25;
      }
    }

    assembly.root.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        // Manejo de aristas CAD
        const edgesChild = obj.children.find((c) => c.name === '__cad_edge__');
        if (edgesChild) {
          edgesChild.visible = displayStyle === 'shadedEdges' || displayStyle === 'wireframe';
        }

        // Estilos de visualización
        if (displayStyle === 'wireframe') {
          obj.material.wireframe = true;
        } else if (displayStyle === 'xray') {
          obj.material.wireframe = false;
          obj.material.transparent = true;
          obj.material.opacity = 0.35;
        } else {
          obj.material.wireframe = false;
          obj.material.transparent = false;
          obj.material.opacity = 1.0;
        }
      }
    });

    if (threeRefs.current.gridHelper) {
      threeRefs.current.gridHelper.visible = displayStyle === 'shadedEdges' || displayStyle === 'wireframe';
    }
  }, [displayStyle, isSectionView, sectionPlaneAxis]);

  // Manejo de la vista explosionada (Exploded View CAD)
  useEffect(() => {
    const { assembly } = threeRefs.current;
    if (!assembly) return;

    const factor = explodedAmount / 100;
    assembly.parts.forEach((p) => {
      const targetPos = p.originalPosition.clone().add(p.explodeDirection.clone().multiplyScalar(factor));
      p.object.position.copy(targetPos);
    });
  }, [explodedAmount]);

  // Loop principal de animación y renderizado cinemático
  useEffect(() => {
    let lastTime = performance.now();

    const renderLoop = (currentTime: number) => {
      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const { renderer, scene, camera, controls, assembly, waveGroup, triadRenderer, triadScene, triadCamera } =
        threeRefs.current;

      if (renderer && scene && camera && controls) {
        controls.update();

        // 1. Cinemática mecánica del modelo CAD
        if (assembly) {
          assembly.animate(dt, currentTime / 1000, isActive);
        }

        // 2. Animación de ondas sonoras y anillos pulsantes
        if (waveGroup && showWaves) {
          waveGroup.visible = true;
          const timeSec = currentTime / 1000;

          waveGroup.children.forEach((child, index) => {
            const ring = child.getObjectByName('pulseRing') as THREE.Mesh | null;
            if (ring) {
              const pulse = (timeSec * 3 + index * 1.2) % 2;
              const scale = 1 + pulse * 1.5;
              ring.scale.set(scale, scale, scale);
              (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - pulse / 2);
              (ring.material as THREE.MeshBasicMaterial).transparent = true;
              ring.rotation.x += dt * 1.5;
              ring.rotation.y += dt * 2.0;
            }
          });
        } else if (waveGroup) {
          waveGroup.visible = false;
        }

        // 3. Render principal
        renderer.render(scene, camera);

        // 4. Render de la Tríada de Orientación SolidWorks sincronizada con la cámara
        if (triadRenderer && triadScene && triadCamera) {
          triadCamera.position.copy(camera.position).sub(controls.target).normalize().multiplyScalar(2.6);
          triadCamera.lookAt(0, 0, 0);
          triadRenderer.render(triadScene, triadCamera);
        }
      }

      threeRefs.current.animFrameId = requestAnimationFrame(renderLoop);
    };

    threeRefs.current.animFrameId = requestAnimationFrame(renderLoop);

    return () => {
      if (threeRefs.current.animFrameId) {
        cancelAnimationFrame(threeRefs.current.animFrameId);
      }
    };
  }, [isActive, showWaves]);

  // Manejo de presets de vistas SolidWorks estándar
  const handleSetStandardView = (view: 'iso' | 'front' | 'top' | 'right') => {
    const { camera, controls } = threeRefs.current;
    if (!camera || !controls) return;

    controls.target.set(0, 0.75, 0);

    switch (view) {
      case 'iso':
        camera.position.set(3.4, 2.4, 3.8);
        break;
      case 'front':
        camera.position.set(0, 0.75, 4.8);
        break;
      case 'top':
        camera.position.set(0, 5.2, 0.01);
        break;
      case 'right':
        camera.position.set(4.8, 0.75, 0);
        break;
    }
    controls.update();
  };

  const handleZoomToFit = () => {
    const { camera, controls, assembly } = threeRefs.current;
    if (!camera || !controls || !assembly) return;
    controls.target.set(0, 0.75, 0);
    camera.position.set(3.2, 2.2, 3.6);
    controls.update();
  };

  // Selección de parte desde el árbol o viewport
  const handleSelectPart = (part: CADPartInfo) => {
    setSelectedPartId(part.id);
    const targetGen = source.noiseGenerators?.find((g) =>
      part.acousticMechanism.toLowerCase().includes(g.name.toLowerCase().split(' ')[0])
    );
    if (targetGen && onSelectGenerator) {
      onSelectGenerator(targetGen);
    }
  };

  return (
    <div className="cad-industrial-steel cad-bevel-panel rounded-2xl p-3 relative overflow-hidden flex flex-col gap-2.5">
      {/* Tornillería Allen de montaje de bastidor */}
      <div className="absolute top-2.5 left-2.5 cad-allen-bolt" />
      <div className="absolute top-2.5 right-2.5 cad-allen-bolt" />

      {/* 1. Cabecera SolidWorks y Estado de Ensamblaje */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-2 px-1 pt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg cad-chassis-faceplate cad-bevel-panel-subtle flex items-center justify-center text-[#f97316] font-bold">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-mono">
                <span>{source.name}</span>
                <span className="text-[10px] text-[#f97316] font-mono font-bold">
                  · SOLIDWORKS® 3D CAD
                </span>
                {source.id === 'compresor' && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    · KAESER CSDX 165
                  </span>
                )}
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              Ensamblaje paramétrico PBR con cinemática activa, sombreado con aristas y focos ISO 9612
            </p>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Alternar Árbol de Operaciones CAD */}
          <button
            onClick={() => setShowTree(!showTree)}
            className={`px-2.5 py-1 text-[11px] rounded-lg cad-bevel-btn font-semibold flex items-center gap-1 transition-all ${
              showTree
                ? 'cad-orange-active'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Mostrar u ocultar el Árbol de Operaciones y Piezas CAD"
          >
            <Layers className="w-3.5 h-3.5 text-[#f97316]" />
            <span>Árbol CAD ({assemblyParts.length})</span>
          </button>

          {/* Alternar Ondas Acústicas 3D */}
          <button
            onClick={() => setShowWaves(!showWaves)}
            className={`px-2 py-1 text-[11px] rounded-lg cad-bevel-btn font-semibold flex items-center gap-1 transition-all ${
              showWaves
                ? 'cad-orange-active'
                : 'text-slate-400'
            }`}
            title="Visualizar frentes de onda de presión sonora 3D emitidos"
          >
            <Waves className="w-3.5 h-3.5 text-[#f97316]" />
            <span>Ondas 3D: {showWaves ? 'ON' : 'OFF'}</span>
          </button>

          {/* Alternar Tema de Entorno CAD (Estudio Claro vs Oscuro) */}
          <button
            onClick={() => setCadTheme(cadTheme === 'studioLight' ? 'workstationDark' : 'studioLight')}
            className="p-1 rounded-lg cad-bevel-btn text-slate-300 hover:text-white transition-colors"
            title="Alternar entre Fondo Gris Estudio SolidWorks y Modo Estación Oscura"
          >
            {cadTheme === 'studioLight' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-[#f97316]" />}
          </button>

          {/* Indicador de Estado Operativo */}
          <div className="text-[11px] font-mono text-slate-300 cad-gunmetal px-2.5 py-1 rounded-lg border border-slate-700/80 cad-bevel-panel-subtle">
            Estado: <strong className={isActive ? 'text-[#f97316] font-bold' : 'text-slate-500'}>{isActive ? 'OPERANDO' : 'PARADA'}</strong>
          </div>
        </div>
      </div>

      {/* 2. SolidWorks Heads-Up View Toolbar (Barra Superior de Visualización Flotante de Precisión) */}
      <div className="flex items-center justify-between gap-2 cad-gunmetal cad-bevel-panel-subtle rounded-xl px-2.5 py-1.5 text-xs">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 flex items-center gap-1 font-mono">
            <Eye className="w-3 h-3 text-[#f97316]" /> Vistas:
          </span>

          {/* Zoom del ajuste */}
          <button
            onClick={handleZoomToFit}
            className="p-1 rounded cad-bevel-btn text-slate-200 text-[10px] flex items-center gap-1"
            title="Zoom del ajuste (Ajustar al centro - F)"
          >
            <Maximize2 className="w-3 h-3 text-[#f97316]" />
            <span>Ajustar</span>
          </button>

          {/* Vistas estándar */}
          <div className="flex items-center cad-chassis-faceplate rounded border border-slate-700/60 p-0.5">
            <button
              onClick={() => handleSetStandardView('iso')}
              className="px-1.5 py-0.5 text-[10px] rounded hover:bg-slate-700 text-[#f97316] font-mono font-bold"
              title="Vista Isométrica (Ctrl + 7)"
            >
              ISO
            </button>
            <button
              onClick={() => handleSetStandardView('front')}
              className="px-1.5 py-0.5 text-[10px] rounded hover:bg-slate-700 text-slate-300 font-mono"
              title="Vista Frontal / Alzado (Ctrl + 1)"
            >
              ALZ
            </button>
            <button
              onClick={() => handleSetStandardView('top')}
              className="px-1.5 py-0.5 text-[10px] rounded hover:bg-slate-700 text-slate-300 font-mono"
              title="Vista Superior / Planta (Ctrl + 5)"
            >
              PLA
            </button>
            <button
              onClick={() => handleSetStandardView('right')}
              className="px-1.5 py-0.5 text-[10px] rounded hover:bg-slate-700 text-slate-300 font-mono"
              title="Vista Lateral / Perfil (Ctrl + 4)"
            >
              PER
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-700 mx-1" />

          {/* Estilos de Visualización: RealView con Aristas vs PBR Suave */}
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 font-mono">Render:</span>
          <div className="flex items-center cad-chassis-faceplate rounded border border-slate-700/60 p-0.5">
            <button
              onClick={() => setDisplayStyle('shadedEdges')}
              className={`px-2 py-0.5 text-[10px] rounded transition-all font-medium ${
                displayStyle === 'shadedEdges' ? 'cad-orange-btn font-bold text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
              title="SolidWorks RealView Graphics: Sombreado con Aristas de Ingeniería de Precisión (Estándar de Modelado Experto)"
            >
              RealView Aristas
            </button>
            <button
              onClick={() => setDisplayStyle('shaded')}
              className={`px-2 py-0.5 text-[10px] rounded transition-all font-medium ${
                displayStyle === 'shaded' ? 'cad-orange-btn font-bold text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
              title="Render Fotorrealista PBR continuo (SolidWorks Visualize)"
            >
              PBR Suave
            </button>
            <button
              onClick={() => setDisplayStyle('wireframe')}
              className={`px-1.5 py-0.5 text-[10px] rounded transition-all font-medium ${
                displayStyle === 'wireframe' ? 'cad-orange-btn font-bold text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
              title="Estructura Alámbrica de Malla CAD"
            >
              Alámbrico
            </button>
            <button
              onClick={() => setDisplayStyle('xray')}
              className={`px-1.5 py-0.5 text-[10px] rounded transition-all font-medium ${
                displayStyle === 'xray' ? 'cad-orange-btn font-bold text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
              title="Rayos X / Translúcido para inspección interior"
            >
              Rayos X
            </button>
          </div>
        </div>

        {/* Acciones de Sección y Explosión CAD */}
        <div className="flex items-center gap-1.5">
          {/* Vista de Sección CAD */}
          <button
            onClick={() => setIsSectionView(!isSectionView)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold cad-bevel-btn flex items-center gap-1 transition-all ${
              isSectionView
                ? 'cad-orange-active'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Activar plano de corte transversal para ver componentes internos en rotación"
          >
            <Scissors className="w-3 h-3 text-red-400" />
            <span>Corte {isSectionView ? `[${sectionPlaneAxis.toUpperCase()}]` : 'CAD'}</span>
          </button>

          {isSectionView && (
            <div className="flex items-center cad-chassis-faceplate rounded border border-red-800/60 p-0.5">
              {(['x', 'y', 'z'] as const).map((axis) => (
                <button
                  key={axis}
                  onClick={() => setSectionPlaneAxis(axis)}
                  className={`px-1 py-0.2 text-[9px] font-mono rounded ${
                    sectionPlaneAxis === axis ? 'bg-red-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  {axis.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {/* Vista Explosionada */}
          <button
            onClick={() => setShowExplodeSlider(!showExplodeSlider)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold cad-bevel-btn flex items-center gap-1 transition-all ${
              showExplodeSlider || explodedAmount > 0
                ? 'cad-orange-active'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Despiece técnico y vista explosionada del ensamblaje"
          >
            <Split className="w-3 h-3 text-[#f97316]" />
            <span>Explosión {explodedAmount > 0 ? `${explodedAmount}%` : ''}</span>
          </button>
        </div>
      </div>

      {/* Control deslizante de Vista Explosionada con Ranura Mecanizada */}
      {showExplodeSlider && (
        <div className="cad-gunmetal cad-inset-well p-2.5 rounded-xl border border-[#ea580c]/40 flex items-center gap-3 text-xs">
          <span className="text-[#f97316] font-bold text-[11px] flex items-center gap-1 font-mono">
            <Sliders className="w-3.5 h-3.5" /> Separación de Componentes (Despiece SolidWorks):
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={explodedAmount}
            onChange={(e) => setExplodedAmount(Number(e.target.value))}
            className="flex-1 accent-[#ea580c] cursor-pointer h-1.5 bg-[#090d14] rounded-lg shadow-inner"
          />
          <span className="font-mono text-[#fed7aa] text-xs w-10 text-right">{explodedAmount}%</span>
          {explodedAmount > 0 && (
            <button
              onClick={() => setExplodedAmount(0)}
              className="text-[10px] px-2 py-0.5 rounded cad-bevel-btn text-slate-300 hover:text-white font-mono"
            >
              Reensamblar
            </button>
          )}
        </div>
      )}

      {/* 3. Área de Visualización CAD 3D con Fondo SolidWorks y Tríada */}
      <div className="relative rounded-xl overflow-hidden cad-bevel-panel select-none">
        {/* Contenedor del Canvas Three.js con gradiente SolidWorks según tema */}
        <div
          ref={containerRef}
          className={`w-full relative transition-all duration-300 ${
            cadTheme === 'studioLight'
              ? 'bg-gradient-to-b from-[#e8ecf1] via-[#dbe3eb] to-[#cfd7df]'
              : 'bg-gradient-to-b from-[#181f2a] via-[#121620] to-[#0a0d14]'
          }`}
        >
          <canvas ref={canvasRef} className="w-full h-auto block cursor-grab active:cursor-grabbing" />
        </div>

        {/* Tríada de Orientación SolidWorks X-Y-Z en la esquina inferior izquierda */}
        <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-xl p-1.5 flex flex-col items-center pointer-events-none shadow-lg">
          <canvas ref={triadCanvasRef} width={80} height={80} className="w-16 h-16 block" />
          <div className="text-[9px] font-mono font-bold text-slate-300 flex items-center gap-1">
            <span className="text-red-400">X</span>
            <span className="text-emerald-400">Y</span>
            <span className="text-cyan-400">Z</span>
            <span className="text-slate-500">| ISO</span>
          </div>
        </div>

        {/* Marca de Agua Técnica SolidWorks en la esquina superior izquierda */}
        <div className="absolute top-2.5 left-2.5 pointer-events-none bg-slate-950/85 backdrop-blur-sm border border-slate-700/80 px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-300 flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse" />
          <span className="font-bold text-[#fed7aa]">SOLIDWORKS 2026 EXPERT CAD</span>
          <span className="text-cyan-400 font-semibold">· {source.id.toUpperCase()}_ASM.SLDASM</span>
          <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-slate-800 text-[9px] text-slate-400 border border-slate-700">REALVIEW GRAPHICS ON</span>
        </div>

        {/* Leyenda de Ayuda Rápida de Interacción CAD en la esquina inferior derecha */}
        <div className="absolute bottom-2.5 right-2.5 pointer-events-none bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] text-slate-300 flex items-center gap-3">
          <span>
            <strong className="text-cyan-300">Arrastrar Izq:</strong> Rotar 3D
          </span>
          <span>·</span>
          <span>
            <strong className="text-cyan-300">Arrastrar Der:</strong> Desplazar (Pan)
          </span>
          <span>·</span>
          <span>
            <strong className="text-cyan-300">Rueda:</strong> Zoom
          </span>
        </div>

        {/* Panel Desplegable: Árbol de Operaciones / Piezas CAD (FeatureManager Design Tree) */}
        {showTree && (
          <div className="absolute top-10 left-2.5 bottom-12 w-72 bg-slate-950/95 backdrop-blur-md border border-cyan-500/40 rounded-xl shadow-2xl p-2.5 overflow-y-auto z-20 flex flex-col text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 font-bold text-slate-200">
              <span className="text-cyan-300 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5" /> FeatureManager (Árbol CAD)
              </span>
              <button
                onClick={() => setShowTree(false)}
                className="text-[10px] text-slate-400 hover:text-white px-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 mt-2 flex-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                [+] {source.name.replace(/\s+/g, '_')}.SLDASM
              </div>

              {assemblyParts.map((part) => {
                const isSelected = selectedPartId === part.id;
                return (
                  <div
                    key={part.id}
                    onClick={() => handleSelectPart(part)}
                    className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 shadow-sm ring-1 ring-cyan-500/50'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-slate-200 truncate">
                        {part.name}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400">{part.massKg} kg</span>
                    </div>
                    <div className="text-[9px] text-amber-300 font-medium truncate mt-0.5">
                      {part.category}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate mt-0.5">
                      {part.materialName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Selector de Focos Acústicos ISO 9612 con Vinculación Mecánica */}
      <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            Fuentes Generadoras de Ruido en el Ensamblaje CAD (ISO 9612):
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Total {source.noiseGenerators?.length || 0} focos activos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {source.noiseGenerators?.map((gen, idx) => {
            const isSelected = selectedGenerator?.id === gen.id;
            return (
              <div
                key={gen.id}
                onClick={() => onSelectGenerator && onSelectGenerator(gen)}
                className={`p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-200 mb-0.5">
                  <span className="text-amber-400 font-mono">F{idx + 1}: {gen.name.split(' ')[0]}</span>
                  <span className="text-[10px] font-mono text-cyan-400">~{gen.splContribution} dB</span>
                </div>
                <div className="text-[10px] text-slate-300 font-medium truncate">{gen.name}</div>
                <div className="text-[9px] text-slate-400 mt-0.5 font-mono">
                  Banda: <span className="text-amber-300">{gen.freqRange}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ficha Técnica del Foco Seleccionado */}
        {selectedGenerator && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <strong className="text-amber-300 font-bold">{selectedGenerator.name}</strong>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedGenerator.type}
                </span>
                <span className="text-[10px] font-mono text-cyan-300">
                  Aporte Acústico: ~{selectedGenerator.splContribution} dB SPL
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                <strong>Mecanismo Cinemático de Generación:</strong> {selectedGenerator.mechanism}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
