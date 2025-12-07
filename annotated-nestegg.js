// ===============================
// IMPORT THREE.JS FROM CDN
// ===============================
import * as THREE from "https://unpkg.com/three@0.158.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.158.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js";

// ===============================
// SCENE SETUP
// ===============================
const container = document.getElementById("model-section");
const canvas = document.getElementById("three-canvas");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf7f7f2);

const camera = new THREE.PerspectiveCamera(
    40,
    container.clientWidth / container.clientHeight,
    0.1,
    2000
);
camera.position.set(0, 0, 15);

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
});
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// ===============================
// LIGHTS
// ===============================
scene.add(new THREE.DirectionalLight(0xffffff, 1.2).position.set(5, 10, 10));
scene.add(new THREE.AmbientLight(0xffffff, 0.55));

// ===============================
// ORBIT CONTROLS
// ===============================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.7;
controls.enablePan = false;

// ===============================
// LOAD NESTEGG MODEL
// ===============================
let model;
const loader = new GLTFLoader();

loader.load(
    "assets/NestEggFBCR.glb",   // IMPORTANT: FIXED PATH
    (gltf) => {
        model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        model.scale.set(3, 3, 3);

        scene.add(model);
    },
    undefined,
    (err) => console.error("MODEL LOAD ERROR:", err)
);

// ===============================
// ANNOTATIONS
// ===============================
const annotationLayer = document.getElementById("annotation-layer");

const FEATURES = [
    { id: "entrance",   name: "Entrance Aperture",           pos: new THREE.Vector3(2.509, 0, 3.672) },
    { id: "vent-left",  name: "Ventilation Aperture (Left)", pos: new THREE.Vector3(0, -2.149, 3.849) },
    { id: "drain",      name: "Drainage Aperture",           pos: new THREE.Vector3(-0.877, 0.036, -3.951) },
    { id: "joint",      name: "Shell Separation Joint",      pos: new THREE.Vector3(-0.003, 0.036, -0.419) },
];

const annotations = new Map();

// CREATE ANNOTATION ELEMENTS
FEATURES.forEach(f => {
    const wrap = document.createElement("div");
    wrap.className = "annotation";

    const dot = document.createElement("div");
    dot.className = "dot";

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = f.name;

    wrap.appendChild(dot);
    wrap.appendChild(label);
    annotationLayer.appendChild(wrap);

    annotations.set(f.id, { el: wrap, data: f });
});

// ===============================
// UPDATE ANNOTATIONS
// ===============================
function updateAnnotations() {
    if (!model) return;

    FEATURES.forEach(f => {
        const entry = annotations.get(f.id);
        const screen = f.pos.clone().project(camera);

        const x = (screen.x * 0.5 + 0.5) * container.clientWidth;
        const y = (-screen.y * 0.5 + 0.5) * container.clientHeight;

        entry.el.style.left = `${x}px`;
        entry.el.style.top = `${y}px`;
        entry.el.style.display = (screen.z < 1) ? "block" : "none";
    });
}

// ===============================
// ANIMATION LOOP
// ===============================
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    updateAnnotations();
}

animate();
