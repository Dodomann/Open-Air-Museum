import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Sky } from "three/addons/objects/Sky.js";

const canvas = document.querySelector(".canvas");

// ================= VARIABLES =================
let loadedModels = 0;
const totalModels = 5;
let selectedObject = null;
let isDragging = false;
let dragMode = "move";
let isTourActive = false;
let currentTourStop = 0;
const clickableObjects = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// ================= MODEL DESCRIPTIONS =================
const modelDescriptions = {
  "Temple": "The Deir el-Bahari Temple, also known as the Temple of Hatshepsut, is a mortuary temple built for the Eighteenth Dynasty pharaoh Hatshepsut. Constructed around 1450 BCE, it features a series of terraces and colonnades, showcasing innovative architecture and serving as a place for the worship of the pharaoh and the god Amun.",
  "Hatshepsut": "Hatshepsut was one of the most successful pharaohs of ancient Egypt, ruling as a female king from 1479 to 1458 BCE. Known for her ambitious building projects and trade expeditions, she presented herself as male in official depictions to legitimize her rule, leaving a lasting legacy in Egyptian history.",
  "Egypt Obelisk": "An obelisk is a tall, four-sided, narrow tapering monument which ends in a pyramid-like shape at the top. In ancient Egypt, obelisks were raised in pairs at the entrance of temples and symbolized the benben stone, associated with the sun god Ra and the creation myth.",
  "Khufu Solar Ship": "The Khufu ship is an intact full-size vessel from ancient Egypt that was sealed into a pit in the Giza pyramid complex at the foot of the Great Pyramid of Khufu around 2500 BCE. It represents the solar barge used by the sun god Ra and was likely used by the pharaoh in the afterlife.",
  "Anubis": "Anubis is the ancient Egyptian god of mummification and the afterlife, often depicted as a jackal or a man with a jackal head. He was responsible for guiding souls to the underworld and overseeing the 'Weighing of the Heart' ceremony."
};

// ================= SCENE =================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfd9e8);
scene.fog = new THREE.Fog(0xcfd9e8, 60, 220);

// ================= CAMERA =================
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 35);
scene.add(camera);

// ================= LIGHTS =================
const hemiLight = new THREE.HemisphereLight(0xfff8e8, 0x555566, 0.6);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffe8b0, 3.2);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(4096, 4096);
dirLight.shadow.camera.near = 10;
dirLight.shadow.camera.far = 200;
dirLight.shadow.camera.left = -80;
dirLight.shadow.camera.right = 80;
dirLight.shadow.camera.top = 80;
dirLight.shadow.camera.bottom = -80;
dirLight.shadow.bias = -0.0002;
scene.add(dirLight);

// ================= MYRRH TREES (PUNT) =================
function addMyrrhTree(x, z) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 2), new THREE.MeshStandardMaterial({ color: 0x4d2600 }));
  const leaves = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), new THREE.MeshStandardMaterial({ color: 0x2d5a27 }));
  leaves.position.y = 1.5;
  g.add(trunk, leaves);
  g.position.set(x, -1, z);
  g.castShadow = true;
  g.receiveShadow = true;
  scene.add(g);
}

for (let i = 0; i < 5; i++) addMyrrhTree(-18 + i * 2.5, -6);

// ================= SKY =================
const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);

const sun = new THREE.Vector3();
sky.material.uniforms.sunPosition.value.copy(sun.setFromSphericalCoords(1, THREE.MathUtils.degToRad(80), THREE.MathUtils.degToRad(180)));
dirLight.position.copy(sun).multiplyScalar(100);
sky.material.uniforms.mieDirectionalG.value = 0;

const loader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

function createStonePath(x, z, length, rotation = 0) {
  const pathTex = textureLoader.load("./ground/ground%20sand.jpg", 
    undefined, 
    undefined, 
    (error) => {
      console.warn("Stone path texture not found, using fallback");
    }
  );
  pathTex.wrapS = pathTex.wrapT = THREE.RepeatWrapping;
  pathTex.repeat.set(1, length / 5);

  const path = new THREE.Mesh(
    new THREE.PlaneGeometry(4, length),
    new THREE.MeshStandardMaterial({
      map: pathTex,
      roughness: 0.8,
      metalness: 0.05,
    })
  );

  path.rotation.x = -Math.PI / 2;
  path.rotation.z = rotation;
  path.position.set(x, -1.98, z);
  path.receiveShadow = true;
  scene.add(path);
}

createStonePath(-10, -12, 20);
createStonePath(-5, -16, 15, Math.PI / 6);

// ================= GROUND (MUSEUM FLOOR) =================
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(600, 600),
  new THREE.MeshStandardMaterial({ 
    color: 0xd4c4a8, // Fallback limestone color
    roughness: 0.2, 
    metalness: 0.0 
  })
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -2;
ground.receiveShadow = true;
scene.add(ground);

// Load limestone texture for ground
textureLoader.load(
  "./ground/limestone.jpeg", 
  (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(25, 25);
    ground.material.map = texture;
    ground.material.needsUpdate = true;
  },
  undefined,
  (error) => console.error("Error loading limestone texture:", error)
);

// Load road path texture
textureLoader.load(
  "./Road/road path.jpeg",
  (texture) => {
    console.log("Roadpath texture loaded successfully");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    const width = 70;   
    const length = 80;  

    texture.repeat.set(4, 6); 

    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(width, length),
      new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.95,
        metalness: 0.8,
      })
    );

    path.position.set(60, -1.99, 0);             
    path.rotation.x = -Math.PI / 2;
    path.rotation.z = 0;
    path.receiveShadow = true;

    scene.add(path);
  },
  undefined,
  (error) => console.error("Error loading Roadpath texture:", error)
);

// ================= RENDERER =================
if (!canvas) {
  console.error("Canvas not found");
}

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ================= CONTROLS =================
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// ================= FUNCTIONS =================
function registerForRaycast(root, name) {
  root.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.userData.modelName = name;
      clickableObjects.push(child);
    }
  });
}

function checkAllModelsLoaded() {
  loadedModels++;
  console.log(`Models loaded: ${loadedModels}/${totalModels}`);
  if (loadedModels === totalModels) {
    console.log("All models loaded successfully");
  }
}

function fadeOutInfo() {
  const panel = document.getElementById("info-panel");
  if (panel) {
    panel.style.opacity = "0";
    setTimeout(() => panel.style.display = "none", 400);
  }
}

function showInfo(name, text = "") {
  const panel = document.getElementById("info-panel");
  if (!panel) return;
  
  panel.style.display = "block";
  panel.style.opacity = "0";
  panel.innerHTML = `<h2>${name}</h2><p>${text}</p>`;
  setTimeout(() => panel.style.opacity = "1", 10);
}

// ================= MODEL LOADERS =================
// DEIR EL-BAHARI TEMPLE
loader.load(
  "./textures1/deir_el-bahari.glb",
  (gltf) => {
    console.log("Temple model loaded successfully");
    const templeModel = gltf.scene;
    const box = new THREE.Box3().setFromObject(templeModel);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleValue = 28 / maxDim;
    templeModel.scale.setScalar(scaleValue);

    box.setFromObject(templeModel);
    const center = box.getCenter(new THREE.Vector3());
    const min = box.min.clone();
    templeModel.position.sub(center);

    const groundY = -2;
    const currentBottomY = min.y + templeModel.position.y;
    templeModel.position.y += (groundY - currentBottomY) + 0.02;
    templeModel.position.set(-8, templeModel.position.y, -18);
    templeModel.rotation.y = THREE.MathUtils.degToRad(8);

    templeModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.roughness = 0.9;
          child.material.metalness = 0.0;
        }
      }
    });

    templeModel.userData = { modelName: "Temple", focusPoint: new THREE.Vector3(-8, 4, -18) };
    registerForRaycast(templeModel, "Temple");
    scene.add(templeModel);
    checkAllModelsLoaded();
  },
  undefined,
  (error) => console.error("Error loading Deir el-Bahari Temple:", error)
);

// HATSHEPSUT
loader.load(
  "./textures1/statue_of_hatshepsut.glb",
  (gltf) => {
    console.log("Hatshepsut model loaded successfully");
    const hatshepsut = gltf.scene;
    let box = new THREE.Box3().setFromObject(hatshepsut);
    let size = box.getSize(new THREE.Vector3());
    let scale = 10 / Math.max(size.x, size.y, size.z);
    hatshepsut.scale.setScalar(scale);

    box.setFromObject(hatshepsut);
    const center = box.getCenter(new THREE.Vector3());
    const min = box.min.clone();
    hatshepsut.position.sub(center);

    const groundY = -2;
    hatshepsut.position.y += groundY - (min.y + hatshepsut.position.y);
    hatshepsut.position.set(-12, hatshepsut.position.y, -15);
    hatshepsut.rotation.y = THREE.MathUtils.degToRad(12);

    hatshepsut.traverse((m) => {
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });

    hatshepsut.userData.modelName = "Hatshepsut";
    registerForRaycast(hatshepsut, "Hatshepsut");
    scene.add(hatshepsut);
    checkAllModelsLoaded();
  },
  undefined,
  (error) => console.error("Error loading Hatshepsut:", error)
);

// OBELISK
loader.load(
  "./textures1/egypt_obelisk/scene.gltf",
  (gltf) => {
    console.log("Egypt Obelisk model loaded successfully");
    const obelisk = gltf.scene;
    let box = new THREE.Box3().setFromObject(obelisk);
    let size = box.getSize(new THREE.Vector3());
    let scale = 26 / Math.max(size.x, size.y, size.z);
    obelisk.scale.setScalar(scale);

    box.setFromObject(obelisk);
    const center = box.getCenter(new THREE.Vector3());
    const min = box.min.clone();
    obelisk.position.sub(center);

    const groundY = -2;
    obelisk.position.y += groundY - (min.y + obelisk.position.y);
    obelisk.position.set(-2, obelisk.position.y, -16);
    obelisk.rotation.y = THREE.MathUtils.degToRad(5);

    obelisk.traverse((m) => {
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });

    obelisk.userData.modelName = "Egypt Obelisk";
    registerForRaycast(obelisk, "Egypt Obelisk");
    scene.add(obelisk);
    checkAllModelsLoaded();
  },
  undefined,
  (error) => console.error("Error loading Obelisk:", error)
);

// KHUFU SOLAR SHIP
loader.load(
  "./textures1/khufu_solar_ship_-_egypt/scene.gltf",
  (gltf) => {
    console.log("Khufu Solar Ship model loaded successfully");
    const ship = gltf.scene;
    let box = new THREE.Box3().setFromObject(ship);
    let size = box.getSize(new THREE.Vector3());
    let scale = 30 / Math.max(size.x, size.y, size.z);
    ship.scale.setScalar(scale);

    box.setFromObject(ship);
    const center = box.getCenter(new THREE.Vector3());
    const min = box.min.clone();
    ship.position.sub(center);

    const waterY = -2;
    ship.position.y += waterY - (min.y + ship.position.y) + 0.03;
    ship.position.set(-60, ship.position.y, 0);
    ship.rotation.y = THREE.MathUtils.degToRad(45);

    ship.traverse((m) => {
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });

    ship.userData = { modelName: "Khufu Solar Ship", baseY: ship.position.y, baseZ: ship.position.z };
    registerForRaycast(ship, "Khufu Solar Ship");
    scene.add(ship);
    checkAllModelsLoaded();
  },
  undefined,
  (error) => console.error("Error loading Khufu Solar Ship:", error)
);

// ANUBIS
loader.load(
  "./textures1/scene.gltf",
  (gltf) => {
    console.log("Anubis loaded successfully");
    const anubis = gltf.scene;
    let box = new THREE.Box3().setFromObject(anubis);
    let size = box.getSize(new THREE.Vector3());
    let scale = 20 / Math.max(size.x, size.y, size.z);
    anubis.scale.setScalar(scale);

    box.setFromObject(anubis);
    const center = box.getCenter(new THREE.Vector3());
    const min = box.min.clone();
    anubis.position.sub(center);

    const groundY = -2;
    anubis.position.y += groundY - (min.y + anubis.position.y);
    anubis.position.set(-12, anubis.position.y, -10);
    anubis.rotation.y = THREE.MathUtils.degToRad(0);

    anubis.traverse((m) => {
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
        if (m.material) {
          m.material.roughness = 0.8;
          m.material.metalness = 0.0;
        }
      }
    });

    anubis.userData.modelName = "Anubis";
    registerForRaycast(anubis, "Anubis");
    scene.add(anubis);
    checkAllModelsLoaded();
  },
  undefined,
  (error) => console.error("Error loading Anubis:", error)
);

// ================= HIGHLIGHT MARKER =================
const highlightMaterial = new THREE.MeshStandardMaterial({
  color: 0xffd500,
  emissive: 0xffcc33,
  emissiveIntensity: 1.8
});

const highlightMarker = new THREE.Mesh(
  new THREE.RingGeometry(0.6, 0.9, 32),
  highlightMaterial
);
highlightMarker.rotation.x = -Math.PI / 2;
highlightMarker.visible = false;
scene.add(highlightMarker);

// ================= DRAG PLANE =================
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const dragOffset = new THREE.Vector3();

// ================= TOUR STOPS =================
const tourStops = [
  { name: "Hatshepsut", position: new THREE.Vector3(18, 12, 30), target: new THREE.Vector3(-12, 2, -15), duration: 3000 },
  { name: "Temple", position: new THREE.Vector3(-8, 10, -5), target: new THREE.Vector3(-8, 2, -18), duration: 4000 },
  { name: "Egypt Obelisk", position: new THREE.Vector3(-2, 12, -8), target: new THREE.Vector3(-2, 4, -16), duration: 3500 },
  { name: "Khufu Solar Ship", position: new THREE.Vector3(-50, 10, 10), target: new THREE.Vector3(-60, 2, 0), duration: 3500 },
  { name: "Anubis", position: new THREE.Vector3(-12, 10, 5), target: new THREE.Vector3(-12, 2, -10), duration: 3500 }
];

// ================= LIFE TIMELINE =================
const timeline = [
  { t: "Birth (1507 BCE)", d: "Daughter of Thutmose I, born into the royal family of the Eighteenth Dynasty", x: -22 },
  { t: "Queen", d: "Wife of Thutmose II, serving as queen consort during his reign", x: -18 },
  { t: "Regent", d: "Guardian and regent for her stepson Thutmose III, ruling as co-regent", x: -14 },
  { t: "Pharaoh", d: "Crowned as Pharaoh Hatshepsut, ruling as female king of Egypt", x: -10 },
  { t: "Punt", d: "Organized a successful trade expedition to the land of Punt, bringing back exotic goods and establishing diplomatic relations", x: -6 },
  { t: "Legacy", d: "Her memory was deliberately erased after her death, but has been rediscovered and restored through archaeological efforts", x: -2 }
];

timeline.forEach(e => {
  const s = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.4, 0.6), 
    new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  s.position.set(e.x, -1.3, -5);
  s.castShadow = true;
  s.receiveShadow = true;
  s.userData.modelName = e.t;
  s.userData.infoText = e.d;
  scene.add(s);
  clickableObjects.push(s);
});

// ================= EVENT HANDLERS =================
function onClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableObjects, false);

  if (intersects.length > 0) {
    const hit = intersects[0].object;
    selectedObject = hit.parent && hit.parent.isGroup ? hit.parent : hit;
    const name = hit.userData.modelName || selectedObject.userData.modelName || "unknown";

    highlightMarker.position.copy(intersects[0].point);
    highlightMarker.position.y = -1.9;
    highlightMarker.visible = true;

    let description = "";
    if (hit.userData.infoText) {
      description = hit.userData.infoText;
    } else if (modelDescriptions[name]) {
      description = modelDescriptions[name];
    }

    showInfo(name, description);
  } else {
    selectedObject = null;
    highlightMarker.visible = false;
    fadeOutInfo();
  }
}

function onMouseDown(event) {
  if (!selectedObject) return;
  const name = selectedObject.userData.modelName;
  if (name !== "Hatshepsut") return;

  isDragging = true;
  controls.enabled = false;

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), selectedObject.position);
  raycaster.setFromCamera(mouse, camera);
  const planeHit = new THREE.Vector3();
  raycaster.ray.intersectPlane(dragPlane, planeHit);
  dragOffset.copy(planeHit).sub(selectedObject.position);
}

function onMouseMove(event) {
  if (!isDragging || !selectedObject) return;

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const planeHit = new THREE.Vector3();
  raycaster.ray.intersectPlane(dragPlane, planeHit);

  if (dragMode === "move") {
    const targetPos = planeHit.sub(dragOffset);
    selectedObject.position.x = targetPos.x;
    selectedObject.position.z = targetPos.z;
  } else if (dragMode === "rotate") {
    const deltaX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    selectedObject.rotation.y += deltaX * 0.01;
  }
}

function onMouseUp() {
  isDragging = false;
  controls.enabled = true;
}

renderer.domElement.addEventListener("click", onClick);
renderer.domElement.addEventListener("mousedown", onMouseDown);
renderer.domElement.addEventListener("mousemove", onMouseMove);
renderer.domElement.addEventListener("mouseup", onMouseUp);

window.addEventListener("keydown", (e) => {
  if (e.key === "m" || e.key === "M") {
    dragMode = "move";
    console.log("Mode: Move");
  }
  if (e.key === "r" || e.key === "R") {
    dragMode = "rotate";
    console.log("Mode: Rotate");
  }
  if (e.key === "t" || e.key === "T") {
    startTour();
  }
});

// ================= TOUR FUNCTIONS =================
function startTour() {
  if (isTourActive) return;
  isTourActive = true;
  currentTourStop = 0;
  controls.enabled = false;
  console.log("Starting tour...");
  nextTourStop();
}

function nextTourStop() {
  if (currentTourStop >= tourStops.length) {
    endTour();
    return;
  }

  const stop = tourStops[currentTourStop];
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const endPos = stop.position.clone();
  const endTarget = stop.target.clone();

  const duration = stop.duration || 2000;
  const startTime = performance.now();

  function animateCamera() {
    const elapsed = performance.now() - startTime;
    const t = Math.min(elapsed / duration, 1);
    const easeT = t * t * (3 - 2 * t);

    camera.position.lerpVectors(startPos, endPos, easeT);
    controls.target.lerpVectors(startTarget, endTarget, easeT);
    controls.update();

    if (t < 1) {
      requestAnimationFrame(animateCamera);
    } else {
      const description = modelDescriptions[stop.name] || "";
      showInfo(stop.name, description);
      currentTourStop++;
      setTimeout(nextTourStop, 2000);
    }
  }
  animateCamera();
}

function endTour() {
  isTourActive = false;
  controls.enabled = true;
  fadeOutInfo();
  console.log("Tour ended");
}

// Tour button event listener
const tourBtn = document.getElementById("start-tour-btn");
if (tourBtn) {
  tourBtn.addEventListener("click", startTour);
}

// ================= ANIMATE =================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  // Floating animations
  scene.traverse((child) => {
    if (!child.userData.modelName || !child.userData.baseY) return;

    const baseY = child.userData.baseY;
    switch (child.userData.modelName) {
      case "Khufu Solar Ship":
        child.position.y = baseY + Math.sin(time * 1.5) * 0.05;
        child.rotation.z = Math.sin(time) * 0.02;
        break;
    }
  });

  // Pulse highlight marker
  if (highlightMarker.visible) {
    highlightMarker.material.emissiveIntensity = 1.8 + Math.sin(time * 5) * 0.5;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

// ================= RESIZE HANDLER =================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});