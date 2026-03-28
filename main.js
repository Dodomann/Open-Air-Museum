import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.117.1/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/loaders/GLTFLoader.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/controls/PointerLockControls.js";

//HTML elements
const interactionPrompt = document.getElementById('interactionPrompt');
const objectInfoPanel = document.getElementById('objectInfoPanel');
const portalOverlay = document.getElementById('portalOverlay');
// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Controls
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

document.body.addEventListener('click', () => {
    controls.lock();
});

const movespeed = 0.1;
const movestate = { forward: false, backward: false, left: false, right: false };

const raycaster = new THREE.Raycaster();
const collidableObjects = [];
const camels = [];
const interactiveObjects = [];
let nearbyInteractiveObject = null;

document.addEventListener('keydown', (event) => {
    switch(event.code) {
        case 'KeyW': movestate.forward = true; break;
        case 'KeyS': movestate.backward = true; break;
        case 'KeyA': movestate.left = true; break;
        case 'KeyD': movestate.right = true; break;
        case 'KeyE':
            if (nearbyInteractiveObject && controls.isLocked) {
                if (nearbyInteractiveObject.userData.isPortal) {
                    const destination = nearbyInteractiveObject.userData.portalDestination;
                    const name = nearbyInteractiveObject.userData.portalName;
                    activatePortal(destination, name);
                } else {
                    showObjectInfo(nearbyInteractiveObject.userData.objectInfo);
                    controls.unlock();
                }
            }
            break;
    }
});
function activatePortal(destination, pharaohName) {
    controls.unlock();
    
    if (isPlayingWalkingSound && walkingsound) {
        walkingsound.pause();
        isPlayingWalkingSound = false;
    }
    
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'sand-particle';
            particle.style.animationDelay = `${i * 0.15}s`;
            particle.style.borderColor = i % 2 === 0 ? '#d2b48c' : 'gold';
            particle.style.width = `${200 + i * 20}px`;
            particle.style.height = `${200 + i * 20}px`;
            portalOverlay.appendChild(particle);
        }, i * 100);
    }
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const grain = document.createElement('div');
            grain.className = 'sand-grain';
            grain.style.left = `${Math.random() * 100}%`;
            grain.style.animationDelay = `${Math.random() * 2}s`;
            grain.style.animationDuration = `${2 + Math.random() * 2}s`;
            portalOverlay.appendChild(grain);
        }, Math.random() * 1000);
    }
    
    setTimeout(() => {
        const text = document.createElement('div');
        text.className = 'portal-text';
        text.textContent = `Entering ${pharaohName}'s World...`;
        portalOverlay.appendChild(text);
    }, 800);
    
    portalOverlay.classList.add('active');
    
    setTimeout(() => {
        window.location.href = destination;
    }, 3000);
}
document.addEventListener('keyup', (event) => {
    switch(event.code) {
        case 'KeyW': movestate.forward = false; break;
        case 'KeyS': movestate.backward = false; break;
        case 'KeyA': movestate.left = false; break;
        case 'KeyD': movestate.right = false; break;
    }
});
    
// Lights
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 100;
dirLight.shadow.camera.left = -50;
dirLight.shadow.camera.right = 50;
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = -50;
scene.add(dirLight);


// Canvas for the walk of life
const walkoflifeCanvas = document.createElement('canvas');
walkoflifeCanvas.width = 256;
walkoflifeCanvas.height = 128;
const ctx = walkoflifeCanvas.getContext('2d');
const walkoflifeCanvas1 = document.createElement('canvas');
walkoflifeCanvas1.width = 256;
walkoflifeCanvas1.height = 128;
const walkoflifeCanvas2 = document.createElement('canvas');
walkoflifeCanvas2.width = 256;
walkoflifeCanvas2.height = 128;
const walkoflifeCanvas3 = document.createElement('canvas');
walkoflifeCanvas3.width = 256;
walkoflifeCanvas3.height = 128;
const walkoflifeCanvas4 = document.createElement('canvas');
walkoflifeCanvas4.width = 256;
walkoflifeCanvas4.height = 128;
const walkoflifeCanvas5 = document.createElement('canvas');
walkoflifeCanvas5.width = 256;
walkoflifeCanvas5.height = 128;
const ctx5 = walkoflifeCanvas5.getContext('2d');
ctx5.fillStyle = 'rgba(0, 0, 0, 0.5)';
ctx5.fillRect(0, 0, walkoflifeCanvas5.width, walkoflifeCanvas5.height);
ctx5.fillStyle = 'gold';
ctx5.font = '24px Arial';
ctx5.textAlign = 'center';
ctx5.textBaseline = 'middle';
ctx5.fillText('The End', walkoflifeCanvas5.width / 2, walkoflifeCanvas5.height / 2);
const texture6 = new THREE.CanvasTexture(walkoflifeCanvas5);
const material6 = new THREE.SpriteMaterial({ map: texture6 });
const sprite6 = new THREE.Sprite(material6);
sprite6.scale.set(2, 1, 1);
sprite6.position.set(-13, 1.5, 22); 
scene.add(sprite6);
const ctx4 = walkoflifeCanvas4.getContext('2d');
ctx4.fillStyle = 'rgba(0, 0, 0, 0.5)';
ctx4.fillRect(0, 0, walkoflifeCanvas4.width, walkoflifeCanvas4.height);
ctx4.fillStyle = 'gold';
ctx4.font = '24px Arial';
ctx4.textAlign = 'center';
ctx4.textBaseline = 'middle';
ctx4.fillText('40-50', walkoflifeCanvas4.width / 2, walkoflifeCanvas4.height / 2);
const texture5 = new THREE.CanvasTexture(walkoflifeCanvas4);
const material5 = new THREE.SpriteMaterial({ map: texture5 });
const sprite5 = new THREE.Sprite(material5);
sprite5.scale.set(2, 1, 1);
sprite5.position.set(-16, 1.5, 22); 
scene.add(sprite5);
const ctx1 = walkoflifeCanvas1.getContext('2d');
const ctx3 = walkoflifeCanvas3.getContext('2d');
ctx3.fillStyle = 'rgba(0, 0, 0, 0.5)';
ctx3.fillRect(0, 0, walkoflifeCanvas3.width, walkoflifeCanvas3.height);
const ctx2 = walkoflifeCanvas2.getContext('2d');
ctx2.fillStyle = 'rgba(0, 0, 0, 0.5)';
ctx2.fillRect(0, 0, walkoflifeCanvas2.width, walkoflifeCanvas2.height);

ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
ctx.fillRect(0, 0, walkoflifeCanvas.width, walkoflifeCanvas.height);
ctx3.fillStyle = 'gold';
ctx3.font = '24px Arial';
ctx3.textAlign = 'center';
ctx3.textBaseline = 'middle';
ctx3.fillText('30-40', walkoflifeCanvas3.width / 2, walkoflifeCanvas3.height / 2);
ctx1.fillStyle = 'gold';
ctx1.font = '24px Arial';
ctx1.textAlign = 'center';
ctx1.textBaseline = 'middle';
ctx1.fillText('10-20', walkoflifeCanvas1.width / 2, walkoflifeCanvas1.height / 2);
ctx2.fillStyle = 'gold';
ctx2.font = '24px Arial';
ctx2.textAlign = 'center';
ctx2.textBaseline = 'middle';
ctx2.fillText('20-30', walkoflifeCanvas2.width / 2, walkoflifeCanvas2.height / 2);
ctx.fillStyle = 'gold';
ctx.font = '24px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('0-10', walkoflifeCanvas.width / 2, walkoflifeCanvas.height / 2);
const texture4 = new THREE.CanvasTexture(walkoflifeCanvas3);
const material4 = new THREE.SpriteMaterial({ map: texture4 });
const sprite4 = new THREE.Sprite(material4);
const texture3 = new THREE.CanvasTexture(walkoflifeCanvas2);
const material3 = new THREE.SpriteMaterial({ map: texture3 });
const sprite3 = new THREE.Sprite(material3);
const texture2 = new THREE.CanvasTexture(walkoflifeCanvas1);
const material2 = new THREE.SpriteMaterial({ map: texture2 });
const sprite2 = new THREE.Sprite(material2);
sprite4.scale.set(2, 1, 1);
sprite4.position.set(-13, 1.5, 18);
scene.add(sprite4);
sprite3.scale.set(2, 1, 1);
sprite3.position.set(-17, 1.5, 18);
sprite2.scale.set(2, 1, 1);
sprite2.position.set(-13, 1.5, 15);
scene.add(sprite2);
scene.add(sprite3);
const texture = new THREE.CanvasTexture(walkoflifeCanvas);
const material = new THREE.SpriteMaterial({ map: texture });
const sprite = new THREE.Sprite(material);
sprite.scale.set(2, 1, 1);
sprite.position.set(-17, 1.5, 15);

scene.add(sprite);

// walk of life Ground
function createTimelinePath() {
    const pathGroup = new THREE.Group();

    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#d2b48c';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 50; i++) {
        ctx.strokeStyle = `rgba(${160 + Math.random() * 30}, ${130 + Math.random() * 20}, ${90 + Math.random() * 20}, ${0.3 + Math.random() * 0.3})`;
        ctx.lineWidth = 1 + Math.random() * 3;
        ctx.beginPath();
        ctx.moveTo(0, Math.random()*512);
        ctx.lineTo(512, Math.random()*512);
        ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;

    const plankMat = new THREE.MeshStandardMaterial({ map: tex, color: 0xd2b48c, roughness: 0.9 });
    for (let i = 0; i < 25; i++) {
        const plank = new THREE.Mesh(new THREE.BoxGeometry(3,0.1,0.9), plankMat);
        plank.position.set(15,0.05,10-i*4);
        plank.rotation.y = (Math.random()-0.5)*0.03;
        plank.castShadow = plank.receiveShadow = true;
        pathGroup.add(plank);
    }

    const supportMat = new THREE.MeshStandardMaterial({ map: tex, color: 0xc19a6b, roughness: 0.95 });
    const leftSupport = new THREE.Mesh(new THREE.BoxGeometry(0.25,0.12,100), supportMat);
    leftSupport.position.set(13.6,0.06,-40);
    leftSupport.castShadow = true;
    const rightSupport = leftSupport.clone();
    rightSupport.position.set(16.4,0.06,-40);
    pathGroup.add(leftSupport, rightSupport);

    pathGroup.rotation.y = Math.PI; // Rotate 180°
    pathGroup.position.z = 20;
    scene.add(pathGroup);
}

createTimelinePath();

//Clouds and ground texture and walking sound 

let walkingsound = null
let isPlayingWalkingSound = false;
function setupwalkingSound() {
    walkingsound = new Audio('./Sound/steps-on-sandy-ground-360-76681.mp3');
    walkingsound.loop = true;
    walkingsound.volume = 0.5;
}
setupwalkingSound();
const sandTexture = new THREE.TextureLoader().load('./textures/gravelly_sand_diff_4k.jpg');
sandTexture.wrapS = THREE.RepeatWrapping;
sandTexture.wrapT = THREE.RepeatWrapping;
sandTexture.repeat.set(20, 20);

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ map: sandTexture })
);
const skygeo= new THREE.SphereGeometry(500, 32, 15);
const skymat= new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('./textures/blue-sky-with-scattered-white-clouds.jpg'),
    side: THREE.BackSide,
    fog: false
    
});
const sky= new THREE.Mesh(skygeo, skymat);
scene.add(sky);
ground.rotation.x = -Math.PI/2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

scene.background = new THREE.Color(0x89CFF0);


const loader = new GLTFLoader();

loader.load(
    "./modules/amenhotep_2.glb",
    (gltf) => {
        const model = gltf.scene;
        model.scale.set(1, 1, 1);
        model.position.set(0, 1.8, 0);
        
        model.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                collidableObjects.push(node);
                node.userData.isInteractive = true;
                node.userData.objectInfo = {
                    name: "Pharaoh Amenhotep II",
                    description: "Amenhotep II was a warrior pharaoh of the 18th Dynasty. Known for his incredible physical strength and skill with the bow, he could shoot arrows through copper targets.",
                    period: "1427-1401 BC",
                    significance: "He led successful military campaigns against Syria and Nubia, securing Egypt's borders and bringing back vast amounts of tribute."
                };
            }
        });
        
        scene.add(model);
        interactiveObjects.push(model);
    }
);
loader.load(
    "./modules/mountains.glb",
    (gltf) => {
        const original = gltf.scene;
        const radius = 90; // How far from center
        const count = 12; // Number of mountain copies
       
        for (let i = 0; i < count; i++) {
            const mountain = original.clone();
            const angle = (i / count) * Math.PI * 2;
            
            mountain.position.set(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
            
            // Rotate to face inward
            mountain.rotation.y = angle + Math.PI;
            mountain.scale.set(1, 1, 1);
            
            scene.add(mountain);
        }
    }
);
loader.load(
    "./modules/offering_table_of_mersuankh_from_tomb_of_rawer.glb",
    (gltf) => {
        const offeringTable = gltf.scene;
        offeringTable.scale.set(2, 2, 2);
        offeringTable.position.set(-12, -1.6, 22);
        offeringTable.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                collidableObjects.push(node);
                node.userData.isInteractive = true;
                node.userData.objectInfo = {
                    name: "Amenhotep II's Burial",
                    description: "Amenhotep II passed away around 1401 BC. This sarcophagus represents his final resting place, following traditional royal burial rituals.",
                    period: "1401 BC",
                    significance: "Marks the end of his life and the continuation of worship through offerings to Amun-Ra."
                };
            }
        });
        scene.add(offeringTable);
        interactiveObjects.push(offeringTable);
    }
);
loader.load(
    "./modules/fighter.glb",
    
    (gltf) => {
        const fighter = gltf.scene;
        fighter.scale.set(1.2, 1.2, 1.2);
        fighter.position.set(-12.5, 1.2, 18);
        fighter.rotation.y = -Math.PI/2;
        fighter.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                collidableObjects.push(node);
                node.userData.isInteractive = true;
                node.userData.objectInfo = {
                    name: "Military Campaigns & Expansion",
                    description: "Amenhotep II led several military campaigns into Syria and Nubia. Known for his exceptional physical strength and archery skills, he personally demonstrated his prowess in battle, securing tribute and expanding Egypt’s influence.",
                    period: "1430-1420 BC",
                    significance: "Symbolizes the pharaoh as a warrior-king, defending and extending Egypt’s borders, and showcasing the divine strength granted by Amun-Ra."
                };
            }
        });
        scene.add(fighter);
        interactiveObjects.push(fighter);
    }
);
loader.load(
    "./modules/egyptian_throne.glb",
    (gltf) => {
        const throne = gltf.scene;
        throne.scale.set(0.3, 0.3, 0.3);
        throne.position.set(-19, 0, 18);
        throne.rotation.y = Math.PI / 2;
        throne.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                collidableObjects.push(node);
                node.userData.isInteractive = true;
                node.userData.objectInfo = {
                    name: "Egyptian Throne",
                    description: "The throne of Amenhotep II was a symbol of his divine kingship and power.",
                    period: "1427-1401 BC",
                    significance: "It represented the authority and legitimacy of the pharaoh in ancient Egypt."
                };
            }
        });
        scene.add(throne);
        interactiveObjects.push(throne);
    }
);
loader.load(
  "./textures1/statue_of_hatshepsut.glb",
    (gltf) => {
        const statue = gltf.scene;
        statue.scale.set(1, 1, 1);
        statue.position.set(10, -1.6, -5);
        statue.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                collidableObjects.push(node);
                node.userData.isInteractive = true;
               node.userData.isPortal = true;
               node.userData.portalDestination = 'hatshepsut.html';
                node.userData.portalName = 'hatshepsut';
            }
        });
        scene.add(statue);
        interactiveObjects.push(statue);
    }
);
loader.load(
    "./modules/the_bust_of_pharaoh_tutankhamun.glb",
    (gltf) => {
        const bust = gltf.scene;
        bust.scale.set(1, 1, 1);
        bust.position.set(7, 0, -5);
        
        bust.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                collidableObjects.push(node);
                node.userData.isPortal = true;
               node.userData.isInteractive = true;
               node.userData.portalDestination = 'tutankhamun.html';
                node.userData.portalName = 'Tutankhamun';
                
            }
        });
        scene.add(bust);
        interactiveObjects.push(bust);
    }
);
loader.load(
    "./modules/horse_downloadable.glb",
    (gltf) => {
        const horse = gltf.scene;
        horse.scale.set(0.5, 0.5, 0.5);
        horse.position.set(-12.5, 1.2, 15);
        horse.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                collidableObjects.push(node);
                node.userData.isInteractive = true;
                node.userData.objectInfo = {
                    name: "Childhood & Early Life of Amenhotep II",
                    description: "Ages 10–20: Amenhotep II trained in horseback riding, archery, and military tactics. He accompanied his father in minor campaigns and started learning leadership skills.",
                    period: "1427–1417 BC",
                    significance: "This period prepared him to become a skilled warrior pharaoh, capable of leading armies and maintaining Egypt's borders."
            };
         interactiveObjects.push(horse);
            }
        });
        scene.add(horse);
    });
loader.load(
    "./modules/camel_stylised.glb",
    (gltf) => {
        const cameltemplate = gltf.scene;
        
        for (let i = 0; i < 10; i++) {
            const camel = cameltemplate.clone();
            camel.scale.set(0.9, 0.9, 0.9);
            camel.position.set(
                Math.random() * 20 - 10,
                0,
                Math.random() * -30 - 10
            );
            camel.rotation.y = Math.random() * Math.PI * 2;
            
            camel.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            
            camel.userData = {
                speed: 0.01 + Math.random() * 0.02,
                turnChance: 0.02
            };
            
            scene.add(camel);
            camels.push(camel);
        }
    }
);
loader.load(
    "./modules/pharaoh_amenhotep_ii_in_the_cairo_egyptian_muse..glb",
    (gltf) => {
        const pharaoh = gltf.scene;
        pharaoh.scale.set(2, 2, 2);
        pharaoh.position.set(-17, 0, 22);   
        pharaoh.rotation.y = Math.PI / 2;
        pharaoh.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                collidableObjects.push(node);
                node.userData.isInteractive = true;
                node.userData.objectInfo = {
                    name: "Later Reign of Amenhotep II",
                    description: "Focused on consolidating Egypt’s power, maintaining a strong military, overseeing religious and temple projects, and preparing his son for succession. He delegated administrative duties and ensured stability across the kingdom.",
                    period: "1410–1401 BC",
                    significance: "This period highlights Amenhotep II’s wisdom and authority as a ruler. It symbolizes his legacy, his connection to Amun-Ra, and the continuity of the pharaoh line."
                };
            }
        });
        scene.add(pharaoh);
        interactiveObjects.push(pharaoh);
    }
);
loader.load(
    "./modules/ancient_torch.glb",
    (gltf) => {
        const torch = gltf.scene;
        torch.scale.set(2.5, 2.5, 2.5);
        torch.position.set(-13.3, -0.5, 10);

        
        torch.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });

        scene.add(torch);

        const torch2 = torch.clone();
        torch2.position.set(-16.7, -0.5, 10);
        torch2.rotation.y = -Math.PI;
        torch2.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });

        scene.add(torch2);
    }
);
loader.load(
    "./modules/cool_bow.glb",
    (gltf) => {
        const bow = gltf.scene;
        bow.scale.set(1, 1, 1);
        bow.position.set(-19, 1, 15);
        bow.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                
                collidableObjects.push(node);
                node.userData.isInteractive = true;
                node.userData.objectInfo = {
                    name: "Childhood & Early Life of Amenhotep II",
                    description: "Born as the son of Thutmose III. Grew up in the royal palace, trained in archery, combat, and administration.",
                    period: "15th Century BC",
                    significance: "His early training prepared him for his future role as a warrior pharaoh, known for his physical prowess and military skills."
                };
            }
        });
        scene.add(bow);
        interactiveObjects.push(bow);
    }   
);
loader.load(  
    "./modules/amun_ram_ashmolean.glb",
    (gltf) => { 
        const statue = gltf.scene;
        statue.position.set(4, 1, -7);
        statue.scale.set(0.2, 0.2, 0.2);
        
        statue.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                collidableObjects.push(node);
                node.userData.isInteractive = true;
                node.userData.objectInfo = {
                    name: "Statue of Amun-Ra",
                    description: "This is a sacred statue of Amun-Ra, the king of the Egyptian gods. Amun-Ra was worshipped as the god of the sun, air, and creation. Pharaohs believed they derived their power from Amun-Ra.",
                    period: "New Kingdom Period",
                    significance: "Statues like this were placed in temples where priests would perform daily rituals to honor the gods."
                };
            }
        });
        
        scene.add(statue);
        interactiveObjects.push(statue);
    }
);

loader.load(
    "./modules/karnak_temple_virtual_-_ia__egypt.glb",
    (gltf) => {
        const original = gltf.scene;
        
        const temple = original.clone();
        temple.scale.set(100, 100, 100);
        temple.position.set(0, 6, -50);
        collidableObjects.push(temple);
        temple.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        scene.add(temple);  
    }
);
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animateCamels() {
    camels.forEach((camel) => {
        camel.position.x += Math.sin(camel.rotation.y) * camel.userData.speed;
        camel.position.z += Math.cos(camel.rotation.y) * camel.userData.speed;
        
        if (Math.random() < camel.userData.turnChance) {
            camel.rotation.y += (Math.random() - 0.5) * Math.PI / 4;
        }
        
        if (Math.abs(camel.position.x) > 40) {
            camel.rotation.y += Math.PI;
        }
        
        if (camel.position.z < -80 || camel.position.z > 10) {
            camel.rotation.y += Math.PI;
        }
    });
}
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

function checkCollision(dir) {
    const ray = new THREE.Raycaster();
    ray.set(camera.position, dir);
    
    const intersects = ray.intersectObjects(collidableObjects, false);
    
    if (intersects.length > 0 && intersects[0].distance < 1.5) {
        return true;
    }
    return false;
}
function checkNearbyObjects() {
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    
    let allInteractiveMeshes = [];
    interactiveObjects.forEach(obj => {
        obj.traverse(node => {
            if (node.isMesh && node.userData.isInteractive) {
                allInteractiveMeshes.push(node);
            }
        });
    });
    
    const intersects = raycaster.intersectObjects(allInteractiveMeshes, false);
    
    if (intersects.length > 0 && intersects[0].distance < 5) {
        nearbyInteractiveObject = intersects[0].object;
        
        if (nearbyInteractiveObject.userData.isPortal) {
            interactionPrompt.innerHTML = `Press E to enter ${nearbyInteractiveObject.userData.portalName}'s world`;
        } else {
            interactionPrompt.innerHTML = 'Press E to examine';
        }
        
        interactionPrompt.style.display = 'block';
        return nearbyInteractiveObject;
    } else {
        nearbyInteractiveObject = null;
        interactionPrompt.style.display = 'none';
        return null;
    }
}

function showObjectInfo(info) {
    objectInfoPanel.innerHTML = `
        <h2 style="margin-top: 0; color: #ffd700; font-size: 28px; border-bottom: 2px solid #ffd700; padding-bottom: 10px;">
            ${info.name}
        </h2>
        <div style="color: #d4af37; font-size: 16px; margin: 15px 0; font-style: italic;">
            ${info.period}
        </div>
        <p style="font-size: 18px; line-height: 1.8; margin: 20px 0;">
            ${info.description}
        </p>
        <div style="background: rgba(212, 175, 55, 0.1); padding: 15px; border-left: 4px solid #ffd700; margin: 20px 0;">
            <strong style="color: #ffd700;">Historical Significance:</strong><br>
            <span style="font-size: 16px;">${info.significance}</span>
        </div>
        <p style="text-align: center; margin-bottom: 0; color: #aaa; margin-top: 30px;">
            <small>Press ESC or click to close</small>
        </p>
    `;
    objectInfoPanel.style.display = 'block';
    interactionPrompt.style.display = 'none';
}

document.addEventListener('click', (event) => {
    if (!controls.isLocked && objectInfoPanel.style.display === 'block') {
        objectInfoPanel.style.display = 'none';
    }
});

function animate() {
    requestAnimationFrame(animate);
    
    if (controls.isLocked) {
        checkNearbyObjects();
        
        // Check if player is moving
        const isMoving = movestate.forward || movestate.backward || movestate.left || movestate.right;
        
        // Play/pause walking sound
        if (isMoving && !isPlayingWalkingSound) {
            walkingsound.play();
            isPlayingWalkingSound = true;
        } else if (!isMoving && isPlayingWalkingSound) {
            walkingsound.pause();
            isPlayingWalkingSound = false;
        }
        
        velocity.x = 0;
        velocity.z = 0;
        
        direction.z = Number(movestate.forward) - Number(movestate.backward);
        direction.x = Number(movestate.right) - Number(movestate.left);
        direction.normalize();
        
        const moveDirection = new THREE.Vector3();
        
        if (movestate.forward || movestate.backward) {
            camera.getWorldDirection(moveDirection);
            moveDirection.y = 0;
            moveDirection.normalize();
            moveDirection.multiplyScalar(direction.z);
            
            if (!checkCollision(moveDirection)) {
                velocity.z = direction.z * movespeed;
            }
        }
        
        if (movestate.left || movestate.right) {
            camera.getWorldDirection(moveDirection);
            moveDirection.y = 0;
            moveDirection.normalize();
            moveDirection.cross(camera.up);
            moveDirection.multiplyScalar(direction.x);
            
            if (!checkCollision(moveDirection)) {
                velocity.x = direction.x * movespeed;
            }
        }
        
        controls.moveRight(velocity.x);
        controls.moveForward(velocity.z);
    }
    
    animateCamels();
    
    renderer.render(scene, camera);
}

animate();