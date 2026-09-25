import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { sections } from './content.js';

const HOME = {
  position: new THREE.Vector3(10.5, 7.5, 12),
  target: new THREE.Vector3(0.3, 1.8, 0),
};

// ---------------------------------------------------------------- renderer

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#f4e4cf');

// Soft studio reflections for the chrome/brass/glass materials.
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.35;

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);


const controls = new OrbitControls(camera, canvas);
camera.position.copy(homeView().position);
controls.target.copy(HOME.target);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 1.5;
controls.maxDistance = 60;
controls.maxPolarAngle = THREE.MathUtils.degToRad(84);
controls.update();

// ---------------------------------------------------------------- lights

scene.add(new THREE.HemisphereLight('#fff4e6', '#c9b29b', 1.1));

const sun = new THREE.DirectionalLight('#ffe9cf', 2.4);
sun.position.set(7, 12, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -9;
sun.shadow.camera.right = 9;
sun.shadow.camera.top = 9;
sun.shadow.camera.bottom = -9;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 30;
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.02;
scene.add(sun);

// Warm fill from the wall lamp by the window.
const lampLight = new THREE.PointLight('#ffb866', 2.5, 6, 1.6);
lampLight.position.set(2.6, 3.7, -2.4);
scene.add(lampLight);

// ---------------------------------------------------------------- post

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const outline = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outline.edgeStrength = 4;
outline.edgeThickness = 1.5;
outline.edgeGlow = 0;
outline.visibleEdgeColor.set('#fff6e0');
outline.hiddenEdgeColor.set('#000000');
composer.addPass(outline);

const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.4, 0.5, 1.6);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------------------------------------------------------------- load model

const loaderEl = document.getElementById('loader');
const loaderFill = document.getElementById('loader-fill');
const manager = new THREE.LoadingManager();
manager.onProgress = (_url, loaded, total) => {
  loaderFill.style.width = `${(loaded / total) * 100}%`;
};

const nodes = {}; // mesh name -> Object3D
const meshToSection = new Map(); // mesh -> section
const clickable = []; // meshes the raycaster tests against
let lampOn = true;
let bulbMaterial = null;

new GLTFLoader(manager).load(
  `${import.meta.env.BASE_URL}models/lowpoly_cafe.glb`,
  (gltf) => {
    const model = gltf.scene;

    model.traverse((obj) => {
      if (!obj.isMesh) return;
      nodes[obj.name] = obj;
      obj.castShadow = true;
      obj.receiveShadow = true;
      fixMaterial(obj);
    });
    // Multi-material meshes load as a Group of primitives; register the group name too.
    model.traverse((obj) => {
      if (obj.isGroup && obj.name) nodes[obj.name] = obj;
    });

    // The export's floor is a black shadow catcher; make it shadow-only over the background.
    const ground = nodes.StudioFloor;
    if (ground) {
      ground.castShadow = false;
      ground.material = new THREE.ShadowMaterial({ color: '#6b4a32', opacity: 0.22 });
    }
    for (const name of ['SunbeamVolume', 'WindowSky']) {
      if (nodes[name]) nodes[name].castShadow = false;
    }

    setupSections();
    setupEasterEggs();

    scene.add(model);
    loaderEl.classList.add('done');
    setTimeout(showWelcome, 500); // after the loader fades out
  },
  (e) => {
    if (e.total) loaderFill.style.width = `${(e.loaded / e.total) * 100}%`;
  },
  (err) => {
    console.error(err);
    loaderEl.querySelector('p').textContent = 'Could not load the café model.';
  },
);

// A few materials in the export need fixing up for real-time rendering.
function fixMaterial(mesh) {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  for (const m of mats) {
    switch (m.name) {
      case 'Cafe_Glass':
        m.transparent = true;
        m.opacity = 0.18;
        m.roughness = 0.05;
        m.metalness = 0;
        m.depthWrite = false;
        mesh.castShadow = false;
        mesh.renderOrder = 1;
        break;
      case 'Cafe_Sunbeam': {
        // Fake volumetric light shaft: additive, unlit, no shadows, not clickable.
        const beam = new THREE.MeshBasicMaterial({
          color: '#ffd9a0',
          transparent: true,
          opacity: 0.07,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        beam.name = m.name;
        mesh.material = beam;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        mesh.raycast = () => {};
        mesh.renderOrder = 2;
        break;
      }
      case 'Cafe_Bulb':
        bulbMaterial = m;
        m.userData.onIntensity = m.emissiveIntensity;
        break;
    }
  }
}

// ---------------------------------------------------------------- sections

const nav = document.getElementById('nav');
const panel = document.getElementById('panel');
const panelBody = document.getElementById('panel-body');
const tooltip = document.getElementById('tooltip');
const hint = document.getElementById('hint');
let activeSection = null;

function setupSections() {
  for (const section of sections) {
    section.meshes = [];
    for (const name of section.nodes) {
      const node = nodes[name];
      if (!node) {
        console.warn(`content.js: no mesh named "${name}" in the model`);
        continue;
      }
      node.traverse((o) => {
        if (o.isMesh) {
          section.meshes.push(o);
          meshToSection.set(o, section);
        }
      });
    }

    const btn = document.createElement('button');
    btn.textContent = section.label;
    btn.addEventListener('click', () => openSection(section));
    section.button = btn;
    nav.appendChild(btn);
  }
}

function sectionView(section) {
  const box = new THREE.Box3();
  for (const m of section.meshes) box.expandByObject(m);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3()).length();

  const dir = new THREE.Vector3(...section.viewDir).normalize();
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const aspect = window.innerWidth / window.innerHeight;
  const portrait = aspect < 1 ? 0.75 / aspect : 1;
  const dist = (size / 2 / Math.tan(fov / 2)) * (section.zoom ?? 1) * Math.max(portrait, 1) + 0.8;
  return { position: center.clone().addScaledVector(dir, dist), target: center };
}

function openSection(section) {
  activeSection = section;
  for (const s of sections) s.button?.classList.toggle('active', s === section);
  panelBody.innerHTML = section.html;
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  outline.selectedObjects = section.meshes;
  flyTo(sectionView(section));
  hint.style.opacity = 0;
}

function closeSection() {
  activeSection = null;
  for (const s of sections) s.button?.classList.remove('active');
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  outline.selectedObjects = [];
  flyTo(homeView());
}

document.getElementById('panel-close').addEventListener('click', closeSection);

// ---------------------------------------------------------------- welcome popup

const welcome = document.getElementById('welcome');
const welcomeClose = document.getElementById('welcome-close');

function showWelcome() {
  welcome.hidden = false;
  requestAnimationFrame(() => welcome.classList.add('show'));
  welcomeClose.focus();
}

function hideWelcome() {
  welcome.classList.remove('show');
  setTimeout(() => (welcome.hidden = true), 400);
}

welcomeClose.addEventListener('click', hideWelcome);
// Clicking the dimmed backdrop (outside the card) also closes it.
welcome.addEventListener('click', (e) => {
  if (e.target === welcome) hideWelcome();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !welcome.hidden) hideWelcome();
  else if (e.key === 'Escape' && activeSection) closeSection();
});

// ---------------------------------------------------------------- camera tween

let tween = null;
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// While the panel is open on wide screens, shift the projection so the object
// is centred in the part of the screen the panel doesn't cover.
const viewShift = new THREE.Vector2();
function panelShift() {
  if (!activeSection) return new THREE.Vector2();
  if (window.innerWidth <= 640) return new THREE.Vector2(0, (panel.offsetHeight + 16) / 2);
  return new THREE.Vector2((panel.offsetWidth + 16) / 2, 0);
}
function applyViewShift() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (viewShift.lengthSq() < 0.25) camera.clearViewOffset();
  else camera.setViewOffset(w, h, viewShift.x, viewShift.y, w, h);
}

// Pull the overview camera back on portrait screens so the whole diorama fits.
function homeView() {
  const aspect = window.innerWidth / window.innerHeight;
  const k = aspect < 1.2 ? Math.min(1.35 / aspect, 3) : 1;
  const offset = HOME.position.clone().sub(HOME.target).multiplyScalar(k);
  return { position: HOME.target.clone().add(offset), target: HOME.target };
}

function flyTo({ position, target }, duration = 1.4) {
  tween = {
    fromShift: viewShift.clone(),
    toShift: panelShift(),
    fromPos: camera.position.clone(),
    fromTarget: controls.target.clone(),
    toPos: position.clone(),
    toTarget: target.clone(),
    t: 0,
    duration,
  };
}

function updateTween(dt) {
  if (!tween) return;
  tween.t = Math.min(tween.t + dt / tween.duration, 1);
  const k = easeInOutCubic(tween.t);
  camera.position.lerpVectors(tween.fromPos, tween.toPos, k);
  controls.target.lerpVectors(tween.fromTarget, tween.toTarget, k);
  viewShift.lerpVectors(tween.fromShift, tween.toShift, k);
  applyViewShift();
  if (tween.t === 1) tween = null;
}

// Grabbing the scene mid-flight cancels the tween.
controls.addEventListener('start', () => {
  tween = null;
  hint.style.opacity = 0;
});

// ---------------------------------------------------------------- picking

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered = null; // section or special object under the pointer
let downAt = null;

function pick(clientX, clientY) {
  pointer.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(scene.children, true)[0];
  if (!hit) return null;
  return meshToSection.get(hit.object) ?? eggs.get(hit.object) ?? null;
}

canvas.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  const target = pick(e.clientX, e.clientY);
  if (target !== hovered) {
    hovered = target;
    canvas.style.cursor = target ? 'pointer' : '';
    if (!activeSection) outline.selectedObjects = target?.meshes ?? [];
  }
  if (target) {
    tooltip.hidden = false;
    tooltip.textContent = target.tooltip;
    tooltip.style.left = `${e.clientX}px`;
    tooltip.style.top = `${e.clientY}px`;
  } else {
    tooltip.hidden = true;
  }
});

canvas.addEventListener('pointerleave', () => {
  tooltip.hidden = true;
});

// Treat it as a click only if the pointer barely moved (so orbiting doesn't trigger it).
canvas.addEventListener('pointerdown', (e) => {
  downAt = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener('pointerup', (e) => {
  if (!downAt || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 5) return;
  const target = pick(e.clientX, e.clientY);
  if (target?.onClick) target.onClick();
  else if (target) openSection(target);
});

// ---------------------------------------------------------------- easter eggs

const eggs = new Map(); // mesh -> { tooltip, meshes, onClick }
const hops = []; // active pigeon hops

function setupEasterEggs() {
  for (const name of ['Pigeon_A', 'Pigeon_B']) {
    const pigeon = nodes[name];
    if (!pigeon) continue;
    const egg = {
      tooltip: 'Coo?',
      meshes: [],
      onClick: () => hops.push({ obj: pigeon, t: 0, baseY: pigeon.userData.baseY }),
    };
    pigeon.userData.baseY = pigeon.position.y;
    pigeon.traverse((o) => o.isMesh && (egg.meshes.push(o), eggs.set(o, egg)));
  }

  const lamp = nodes.WallLamp;
  if (lamp) {
    const egg = {
      tooltip: 'Toggle the lamp',
      meshes: [],
      onClick: () => {
        lampOn = !lampOn;
        lampLight.visible = lampOn;
        if (bulbMaterial) bulbMaterial.emissiveIntensity = lampOn ? bulbMaterial.userData.onIntensity : 0;
      },
    };
    lamp.traverse((o) => o.isMesh && (egg.meshes.push(o), eggs.set(o, egg)));
  }
}

function updateHops(dt) {
  for (let i = hops.length - 1; i >= 0; i--) {
    const h = hops[i];
    h.t += dt / 0.45;
    const t = Math.min(h.t, 1);
    h.obj.position.y = h.baseY + Math.sin(t * Math.PI) * 0.35;
    if (t === 1) hops.splice(i, 1);
  }
}

// ---------------------------------------------------------------- loop

const timer = new THREE.Timer();

renderer.setAnimationLoop((time) => {
  timer.update(time);
  const dt = Math.min(timer.getDelta(), 0.05);
  updateTween(dt);
  updateHops(dt);
  controls.update();
  composer.render();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  viewShift.copy(panelShift());
  applyViewShift();
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
