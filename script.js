import * as THREE from "https://esm.sh/three@latest";
import { OrbitControls } from "https://esm.sh/three@latest/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, particles;
let particlePositions = [], initialPositions = [];
let time = 0, rotationSpeed = 0.002;
const particleCount = 80000;  // **增加粒子数量，使爱心更精细**
const cycleDuration = 20;  
const heartDuration = 10;  
const transitionDuration = (cycleDuration - heartDuration) / 2;

function createHeartShapeParticles() {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        let theta = Math.random() * Math.PI * 2;
        let phi = Math.acos(2 * Math.random() - 1); 
        let r = 10 * (1 - Math.abs(Math.cos(phi)));  

        let x = r * 16 * Math.pow(Math.sin(theta), 3);
        let y = r * (13 * Math.cos(theta) - 5 * Math.cos(2 * theta) - 2 * Math.cos(3 * theta) - Math.cos(4 * theta));
        let z = r * (Math.random() - 0.5) * 15;  // **增加 Z 轴深度**

        // **填充 3D 体积**
        x += (Math.random() - 0.5) * 4;
        y += (Math.random() - 0.5) * 4;
        z += (Math.random() - 0.5) * 4;

        particlePositions.push({ x, y, z });

        // **爆炸状态**
        initialPositions.push({
            x: (Math.random() - 0.5) * 600,  
            y: (Math.random() - 0.5) * 600,  
            z: (Math.random() - 0.5) * 600
        });

        positions[i * 3] = initialPositions[i].x;
        positions[i * 3 + 1] = initialPositions[i].y;
        positions[i * 3 + 2] = initialPositions[i].z;

        // **颜色渐变（炫光效果）**
        let hue = (x + 16) / 32 * 360;
        let color = new THREE.Color();
        color.setHSL(hue / 360, 1.0, 0.7);

        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        vertexColors: true,
        size: 1.2,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.9,
        depthTest: false,
        blending: THREE.AdditiveBlending // **炫光效果**
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

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    time += 0.005;

    let phase = (Math.sin(time * Math.PI / cycleDuration) + 1) / 2;
    let transition = Math.pow(phase, 3); // **平滑过渡**

    let positions = particles.geometry.attributes.position.array;
    let colors = particles.geometry.attributes.color.array;

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = initialPositions[i].x * (1 - transition) + particlePositions[i].x * transition;
        positions[i * 3 + 1] = initialPositions[i].y * (1 - transition) + particlePositions[i].y * transition;
        positions[i * 3 + 2] = initialPositions[i].z * (1 - transition) + particlePositions[i].z * transition;

        // **动态渐变颜色**
        let hueShift = (time * 15 + i * 0.002) % 360;
        let color = new THREE.Color();
        color.setHSL(hueShift / 360, 1.0, 0.6);

        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.color.needsUpdate = true;

    // **让爱心微微浮动**
    let floatFactor = Math.sin(time * 2) * 0.1;
    particles.scale.set(1 + floatFactor, 1 + floatFactor, 1 + floatFactor);

    // **轻微旋转**
    particles.rotation.y += 0.001;
    particles.rotation.x += Math.sin(time * 0.5) * 0.002;

    renderer.render(scene, camera);
}

init();
