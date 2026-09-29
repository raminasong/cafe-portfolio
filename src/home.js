import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { configureRenderer, addLighting, loadCafe } from './cafe-scene.js';

// ---------------------------------------------------------------- hero café

const canvas = document.getElementById('hero-cafe');
const container = canvas.parentElement;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
configureRenderer(renderer);

const scene = new THREE.Scene(); // no background: the page shows through
addLighting(scene, renderer);

const TARGET = new THREE.Vector3(0, 1.7, 0.8);
const VIEW_DIR = new THREE.Vector3(10.2, 5.7, 12).normalize();
const FIT_RADIUS = 5.2; // roughly the size of the diorama

const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

const controls = new OrbitControls(camera, canvas);
controls.target.copy(TARGET);
controls.enableDamping = true;
controls.enableZoom = false; // keep the page's scroll wheel for scrolling
controls.enablePan = false;
// Keep the view on the open (front) side of the café.
const homeAzimuth = Math.atan2(VIEW_DIR.x, VIEW_DIR.z);
controls.minAzimuthAngle = homeAzimuth - 0.6;
controls.maxAzimuthAngle = homeAzimuth + 0.6;
controls.minPolarAngle = THREE.MathUtils.degToRad(45);
controls.maxPolarAngle = THREE.MathUtils.degToRad(78);

// Gentle back-and-forth sway instead of a full spin (the back of the walls isn't pretty).
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
controls.autoRotate = !reduceMotion;
controls.autoRotateSpeed = 0.5;

// Let vertical swipes scroll the page on phones; horizontal drags still turn the café.
canvas.style.touchAction = 'pan-y';

function resize() {
  const { width, height } = container.getBoundingClientRect();
  if (!width || !height) return;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;

  // Pull back far enough that the whole diorama fits in the narrower direction.
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
  const dist = FIT_RADIUS / Math.sin(Math.min(vFov, hFov) / 2);
  const offset = camera.position.clone().sub(controls.target);
  const dir = offset.lengthSq() > 0 ? offset.normalize() : VIEW_DIR;
  camera.position.copy(controls.target).addScaledVector(dir, dist);
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(container);
resize();

loadCafe()
  .then(({ model }) => {
    scene.add(model);
    canvas.classList.add('ready');
  })
  .catch((err) => {
    console.error(err);
    container.hidden = true;
  });

// Only render while the hero is on screen.
let visible = true;
new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
}).observe(container);

renderer.setAnimationLoop(() => {
  if (!visible) return;
  // Flip the sway direction at either end of the allowed range.
  const az = controls.getAzimuthalAngle();
  if (az >= controls.maxAzimuthAngle - 0.01) controls.autoRotateSpeed = Math.abs(controls.autoRotateSpeed);
  if (az <= controls.minAzimuthAngle + 0.01) controls.autoRotateSpeed = -Math.abs(controls.autoRotateSpeed);
  controls.update();
  renderer.render(scene, camera);
});

// ---------------------------------------------------------------- project filter

const chips = document.querySelectorAll('.chip');
const cards = document.querySelectorAll('.card');

function applyFilter(filter) {
  for (const chip of chips) chip.classList.toggle('active', chip.dataset.filter === filter);
  for (const card of cards) {
    const tags = card.dataset.tags.split(' ');
    card.hidden = filter !== 'all' && !tags.includes(filter);
  }
}

for (const chip of chips) chip.addEventListener('click', () => applyFilter(chip.dataset.filter));

// ?focus=data or ?focus=ux preselects a filter (handy for tailoring the link per application).
const focus = new URLSearchParams(location.search).get('focus');
if (focus && document.querySelector(`.chip[data-filter="${CSS.escape(focus)}"]`)) applyFilter(focus);
