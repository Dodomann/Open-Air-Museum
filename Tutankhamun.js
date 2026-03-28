import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.set(0, 12, 35);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

//Lights
scene.add(new THREE.HemisphereLight(0xfff7e5, 0x85734d, 0.85));

const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(30, 60, 30);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 400;
sun.shadow.camera.left = -200;
sun.shadow.camera.right = 200;
sun.shadow.camera.top = 200;
sun.shadow.camera.bottom = -200;
scene.add(sun);

//Controls 
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxDistance = 900;
controls.minDistance = 5;

//Ground 
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(2000, 2000),
  new THREE.MeshStandardMaterial({ color: 0xE6C9A8, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

//Helpers 
function putOnGround(root, targetH = 3) {
  scene.add(root);
  root.updateWorldMatrix(true, true);

  let box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  root.position.sub(center);

  const scale = targetH / Math.max(size.y, 0.0001);
  root.scale.setScalar(scale);

  root.updateWorldMatrix(true, true);
  box = new THREE.Box3().setFromObject(root);
  root.position.y -= box.min.y;
}

function frameObject(obj, padding = 1.5) {
  obj.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);

  let dist = (maxDim / 2) / Math.tan(fov / 2);
  dist *= padding;

  controls.target.copy(center);

  camera.position.set(center.x, center.y + maxDim * 0.35, center.z + dist);
  camera.lookAt(center);
  controls.update();
}

function normalizeModelToHeight(base, targetH) {
  base.updateWorldMatrix(true, true);
  let box = new THREE.Box3().setFromObject(base);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  base.position.sub(center);

  const s = targetH / Math.max(size.y, 0.0001);
  base.scale.setScalar(s);

  base.updateWorldMatrix(true, true);
  box = new THREE.Box3().setFromObject(base);
  base.position.y -= box.min.y;

  base.updateWorldMatrix(true, true);
}

function snapToGround(obj) {
  obj.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(obj);
  obj.position.y -= box.min.y;
  obj.updateWorldMatrix(true, true);
}

const loader = new GLTFLoader();
const clock = new THREE.Clock();

let abuSimbel, edfuTemple, edfuMixer;
let amon, horus, throne, paintedChest, canopicChest;
let camel, camelMixer; 

let obeliskBase = null;
let obeliskReady = false;

//POSITIONS
const POS = {
  EDFU_Z: -18,
  STATUES_Z: -55,
  AMON_X: -18,
  HORUS_X: 18,
  ABU_SIMBEL_Z: -120,
};

//Clouds 
const cloudTexture = new THREE.TextureLoader().load("./textures/image-from-rawpixel.png");
cloudTexture.colorSpace = THREE.SRGBColorSpace;

const cloudMaterial = new THREE.MeshLambertMaterial({
  map: cloudTexture,
  transparent: true,
  opacity: 0.65,
  depthWrite: false,
});

const clouds = [];
const CLOUD_BOUNDS = 250;

for (let i = 0; i < 12; i++) {
  const cloud = new THREE.Mesh(new THREE.PlaneGeometry(120, 60), cloudMaterial);

  cloud.position.set(
    Math.random() * (CLOUD_BOUNDS * 2) - CLOUD_BOUNDS,
    80 + Math.random() * 30,
    Math.random() * (CLOUD_BOUNDS * 2) - CLOUD_BOUNDS
  );

  cloud.rotation.y = Math.random() * Math.PI;
  cloud.rotation.z = Math.random() * 0.15;

  scene.add(cloud);
  clouds.push(cloud);
}

//ROCKS 
const OUTSIDE_OFFSET = 2.2;
const INSET = 1.8;

function applyRockMaterialAndShadows(root) {
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0xc9a87c,
    roughness: 0.9,
    metalness: 0.0,
  });

  root.traverse((m) => {
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
      m.material = rockMat;
    }
  });
}

function normalizeRock(obj, targetH) {
  obj.updateWorldMatrix(true, true);

  let box = new THREE.Box3().setFromObject(obj);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  obj.position.sub(center);

  const s = targetH / Math.max(size.y, 0.0001);
  obj.scale.setScalar(s);

  obj.updateWorldMatrix(true, true);
  box = new THREE.Box3().setFromObject(obj);

  obj.position.y -= box.min.y;

  obj.updateWorldMatrix(true, true);
  return new THREE.Box3().setFromObject(obj);
}

//Abu Simbel + Rocks
loader.load("./modules/abu_simbel.glb", (gltf) => {
  abuSimbel = gltf.scene;

  abuSimbel.traverse((m) => {
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
      m.material = new THREE.MeshStandardMaterial({
        color: 0xc9a87c,
        roughness: 0.9,
        metalness: 0.0,
      });
    }
  });

  scene.add(abuSimbel);

  abuSimbel.updateWorldMatrix(true, true);
  let box = new THREE.Box3().setFromObject(abuSimbel);
  const size = box.getSize(new THREE.Vector3());
  const scale = 30 / Math.max(size.y, 0.0001);
  abuSimbel.scale.setScalar(scale);

  abuSimbel.updateWorldMatrix(true, true);
  box = new THREE.Box3().setFromObject(abuSimbel);
  abuSimbel.position.y -= box.min.y;

  abuSimbel.position.set(-20, abuSimbel.position.y, POS.ABU_SIMBEL_Z);

  abuSimbel.updateWorldMatrix(true, true);
  const abuBox = new THREE.Box3().setFromObject(abuSimbel);
  const abuHeight = abuBox.getSize(new THREE.Vector3()).y;
  const abuZCenter = (abuBox.min.z + abuBox.max.z) / 2;

  // Load rocks separately for this Abu Simbel instance
  loader.load("./modules/rock_10.glb", (gltfRock) => {
    const rockBase = gltfRock.scene;
    applyRockMaterialAndShadows(rockBase);

    const rockLeft = rockBase.clone(true);
    applyRockMaterialAndShadows(rockLeft);
    scene.add(rockLeft);
    normalizeRock(rockLeft, abuHeight);

    rockLeft.position.x = abuBox.min.x - OUTSIDE_OFFSET;
    rockLeft.position.z = abuZCenter;
    rockLeft.position.x += INSET;
    rockLeft.rotation.y += 0.05;
    rockLeft.position.y -= 1.2;

    const rockRight = rockBase.clone(true);
    applyRockMaterialAndShadows(rockRight);
    scene.add(rockRight);
    normalizeRock(rockRight, abuHeight);

    rockRight.position.x = abuBox.max.x + OUTSIDE_OFFSET;
    rockRight.position.z = abuZCenter;
    rockRight.position.x -= INSET;
    rockRight.rotation.y -= 0.05;
    rockRight.position.y -= 1.2;
  }, undefined, (error) => {
    console.error('Error loading rocks:', error);
  });
}, undefined, (error) => {
  console.error('Error loading Abu Simbel:', error);
});

//LOAD OBELISK BASE ONCE 
loader.load("./modules/egypt_obelisk.glb", (gltf) => {
  obeliskBase = gltf.scene;

  obeliskBase.traverse((m) => {
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });

  normalizeModelToHeight(obeliskBase, 7);

  obeliskReady = true;
});

//Temple of Edfu 
loader.load("./modules/templo_de_horus_edfu_egipto.glb", (gltf) => {
  edfuTemple = gltf.scene;

  edfuTemple.traverse((m) => {
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });

  scene.add(edfuTemple);

  if (gltf.animations && gltf.animations.length > 0) {
    edfuMixer = new THREE.AnimationMixer(edfuTemple);
    gltf.animations.forEach((clip) => edfuMixer.clipAction(clip).play());
  }

  edfuTemple.updateWorldMatrix(true, true);
  let box = new THREE.Box3().setFromObject(edfuTemple);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  edfuTemple.position.sub(center);

  const scale = 25 / Math.max(size.y, 0.0001);
  edfuTemple.scale.setScalar(scale);

  edfuTemple.updateWorldMatrix(true, true);
  box = new THREE.Box3().setFromObject(edfuTemple);

  edfuTemple.position.y -= box.min.y;
  edfuTemple.position.x = 0;
  edfuTemple.position.z = POS.EDFU_Z;

  edfuTemple.rotation.y = Math.PI + (8 * (Math.PI / 180));

  const placeObelisksTwoLines = () => {
    if (!obeliskReady || !obeliskBase) return;

    edfuTemple.updateWorldMatrix(true, true);
    const tBox = new THREE.Box3().setFromObject(edfuTemple);
    const tCenter = tBox.getCenter(new THREE.Vector3());

    const centerX = tCenter.x - 5;
    const templeFrontZ = tBox.max.z;

    const pairs = 5;
    const spacing = 10;
    const laneOffset = 7;
    const startZ = templeFrontZ + 6;

    for (let i = 0; i < pairs; i++) {
      const z = startZ + i * spacing;

      const left = obeliskBase.clone(true);
      left.traverse((m) => {
        if (m.isMesh) {
          m.castShadow = true;
          m.receiveShadow = true;
        }
      });
      left.scale.multiplyScalar(2);
      left.position.set(centerX - laneOffset, 0, z);
      left.rotation.set(0, 0, 0);
      snapToGround(left);
      scene.add(left);

      const right = obeliskBase.clone(true);
      right.traverse((m) => {
        if (m.isMesh) {
          m.castShadow = true;
          m.receiveShadow = true;
        }
      });
      right.scale.multiplyScalar(2);
      right.position.set(centerX + laneOffset, 0, z);
      right.rotation.set(0, 0, 0);
      snapToGround(right);
      scene.add(right);
    }
  };

  placeObelisksTwoLines();
  if (!obeliskReady) {
    const tryInterval = setInterval(() => {
      if (obeliskReady) {
        placeObelisksTwoLines();
        clearInterval(tryInterval);
      }
    }, 50);
  }

  frameObject(edfuTemple, 1.6);
});

//Amon 
loader.load("./modules/amon_tutankhamon.glb", (gltf) => {
  amon = gltf.scene;

  amon.traverse((m) => {
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
      m.material = new THREE.MeshStandardMaterial({
        color: 0xd2b48c,
        roughness: 0.2,
        metalness: 0.3,
      });
    }
  });

  putOnGround(amon, 3.2);
  amon.position.set(-14, amon.position.y, 100);
  scene.add(amon);
});

//Throne 
loader.load("./modules/reproduction_of_the_throne_of_king_tutankhamun.glb", (gltf) => {
  throne = gltf.scene;

  throne.traverse((m) => {
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });

  putOnGround(throne, 3.2);
  throne.position.set(-14.5, throne.position.y, 83.5);
  throne.rotation.y = -Math.PI / 2;
  scene.add(throne);
});

//Painted Chest
loader.load("./modules/painted_chest_of_tutankhamen.glb", (gltf) => {
  paintedChest = gltf.scene;

  paintedChest.traverse((m) => {
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });

  putOnGround(paintedChest, 3.2);
  paintedChest.position.set(-1, paintedChest.position.y, 80);
  scene.add(paintedChest);
});

//Canopic Chest
loader.load("./modules/canopic_chest_of_tutankhamen.glb", (gltf) => {
  canopicChest = gltf.scene;

  canopicChest.traverse((m) => {
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });

  putOnGround(canopicChest, 3.2);
  canopicChest.position.set(-19, canopicChest.position.y, 63);
  scene.add(canopicChest);
});

//Tutankhamun Bust
loader.load("./modules/the_bust_of_pharaoh_tutankhamun.glb", (gltf) => {
  const bust = gltf.scene;

  bust.traverse((m) => {
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });

  putOnGround(bust, 3.2);
  bust.position.set(-1, bust.position.y, 53);
  bust.rotation.y = -Math.PI / 2;
  scene.add(bust);
});

//Horus 
loader.load("./modules/models_horus.glb", (gltf2) => {
  const base = gltf2.scene;
  base.rotation.set(Math.PI / 2, 0, 1.5);

  horus = base.clone(true);
  horus.traverse((m) => {
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
      m.material = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 1.0,
        roughness: 0.2,
      });
    }
  });

  putOnGround(horus, 8.2);
  
  horus.updateWorldMatrix(true, true);
  const horusBox = new THREE.Box3().setFromObject(horus);
  const groundY = -horusBox.min.y;
  
  horus.position.set(-1, groundY, 95);
  horus.rotation.y = Math.PI;
  scene.add(horus);
});

//Camel
loader.load("./modules/camell.glb", (gltf) => {
  camel = gltf.scene;

  camel.traverse((m) => {
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });

  putOnGround(camel, 4);

  camel.position.set(100, camel.position.y, -25); 
  camel.rotation.y = Math.PI - (30 * (Math.PI / 180)); 
  
  if (gltf.animations && gltf.animations.length > 0) {
    camelMixer = new THREE.AnimationMixer(camel);
    gltf.animations.forEach((clip) => {
      const action = camelMixer.clipAction(clip);
      action.play(); 
    });
  }

  scene.add(camel);

  const speed = 0.01; 
  function moveCamel() {
    camel.position.z += speed; 
    requestAnimationFrame(moveCamel);
  }
  moveCamel();
  
  camel.position.y = 0;
});

//Animate 
function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();
  
  if (edfuMixer) edfuMixer.update(dt);
  if (camelMixer) camelMixer.update(dt);

  clouds.forEach((c) => {
    c.lookAt(camera.position);
    c.position.x += 0.02;
    if (c.position.x > CLOUD_BOUNDS) c.position.x = -CLOUD_BOUNDS;
  });

  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});