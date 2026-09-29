// Shared café setup used by both the homepage hero and the full café page:
// renderer settings, lighting, and loading the model with its material fixes.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const MODEL_URL = `${import.meta.env.BASE_URL}models/lowpoly_cafe.glb`;

export function configureRenderer(renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
}

// Adds the environment map and lights to the scene. Returns the lamp light so
// callers can toggle it.
export function addLighting(scene, renderer) {
  // Soft studio reflections for the chrome/brass/glass materials.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;

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

  return lampLight;
}

// Loads the café and fixes up its materials.
// Resolves to { model, nodes, bulbMaterial } where nodes maps object names to objects.
export function loadCafe({ manager, onProgress } = {}) {
  return new Promise((resolve, reject) => {
    new GLTFLoader(manager).load(
      MODEL_URL,
      (gltf) => {
        const model = gltf.scene;
        const nodes = {};
        let bulbMaterial = null;

        model.traverse((obj) => {
          if (!obj.isMesh) return;
          nodes[obj.name] = obj;
          obj.castShadow = true;
          obj.receiveShadow = true;
          bulbMaterial = fixMaterial(obj) ?? bulbMaterial;
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

        resolve({ model, nodes, bulbMaterial });
      },
      onProgress,
      reject,
    );
  });
}

// A few materials in the export need fixing up for real-time rendering.
// Returns the bulb material if this mesh uses it.
function fixMaterial(mesh) {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  let bulb = null;
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
        bulb = m;
        m.userData.onIntensity = m.emissiveIntensity;
        break;
    }
  }
  return bulb;
}
