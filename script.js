import * as THREE from "https://esm.sh/three@latest";
import { OrbitControls } from "https://esm.sh/three@latest/examples/jsm/controls/OrbitControls.js";

console.log("Three.js 加载成功", THREE);

let scene, camera, renderer, particles;
let particlePositions = [], initialPositions = [];
let time = 0, rotationSpeed = 0.002;
const particleCount = 40000; // **增加粒子数量，使爱心更饱满**

function createHeartShapeParticles() {
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    let t = Math.random() * Math.PI * 2;
    let u = Math.random() * Math.PI;
    let scale = Math.random();

    // **使用 3D 实心心形数学公式**
    let r = 1.5 * (1 - Math.sin(u));
    let x = r * 16 * Math.pow(Math.sin(t), 3);
    let y = r * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    let z = (Math.random() - 0.5) * 10;

    x += (Math.random() - 0.5) * 3;
    y += (Math.random() - 0.5) * 3;
    z += (Math.random() - 0.5) * 3;

    particlePositions.push({ x: x, y: y, z: z });

    // **初始爆炸位置**
    initialPositions.push({
      x: (Math.random() - 0.5) * 2000,
      y: (Math.random() - 0.5) * 2000,
      z: (Math.random() - 0.5) * 2000
    });

    positions[i * 3] = initialPositions[i].x;
    positions[i * 3 + 1] = initialPositions[i].y;
    positions[i * 3 + 2] = initialPositions[i].z;

    colors[i * 3] = Math.random() * 0.4 + 0.3;
    colors[i * 3 + 1] = Math.random() * 0.3;
    colors[i * 3 + 2] = Math.random() * 0.5 + 0.3;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    vertexColors: true,
    size: 1.5,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    depthTest: false,
    blending: THREE.NormalBlending
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 0, 500);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  createHeartShapeParticles();

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  window.addEventListener("wheel", (event) => {
    rotationSpeed += event.deltaY * -0.00001;
  });

  animate();
}

// **优化动画：确保爆炸 & 聚合过程可见，并控制到 5 秒**
function animate() {
  requestAnimationFrame(animate);
  time += 0.005; // **确保完整循环 5 秒（加快节奏）**

  // **确保爆炸 & 聚合可见，同时延长爱心状态**
  let phase = (Math.sin(time * Math.PI / 5) + 1) / 2;  // **完整 5 秒动画**
  let transition = Math.pow(phase, 3);  // **平滑变化，确保能看到聚合动画**

  let positions = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = initialPositions[i].x * (1 - transition) + particlePositions[i].x * transition;
    positions[i * 3 + 1] = initialPositions[i].y * (1 - transition) + particlePositions[i].y * transition;
    positions[i * 3 + 2] = initialPositions[i].z * (1 - transition) + particlePositions[i].z * transition;
  }
  particles.geometry.attributes.position.needsUpdate = true;

  // **让粒子在爱心形态时微动**
  if (transition > 0.95) {
    let speed = 0.005 * (1 - transition);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += Math.sin(time + i * 0.01) * speed;
      positions[i * 3 + 1] += Math.cos(time + i * 0.01) * speed;
      positions[i * 3 + 2] += Math.sin(time * 0.5 + i * 0.02) * speed;
    }
  }

  // 旋转粒子，让立体感更强
  particles.rotation.y += rotationSpeed;
  particles.rotation.x += Math.sin(time * 0.5) * 0.002;

  // **动态背景变化**
  let bgColor = new THREE.Color(`hsl(${(time * 1.5) % 360}, 20%, 5%)`);
  scene.background = bgColor;

  renderer.render(scene, camera);
}

init();
