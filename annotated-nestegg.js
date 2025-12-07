/* -------------------------------
   IMPORT THREE.JS FROM CDN
--------------------------------*/
import * as THREE from "https://unpkg.com/three@0.158.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.158.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js";

/* -------------------------------
   SCENE + CAMERA + RENDERER
--------------------------------*/
const section = document.getElementById("model-section");
const canvas = document.getElementById("three-canvas");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf7f7f2);

const camera = new THREE.PerspectiveCamera(
    40,
    section.clientWidth / section.clientHeight,
    0.1,
    2000
);
camera.position.set(0, 0, 14);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(section.clientWidth, section.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);

/* -------------------------------
   LIGHTING
--------------------------------*/
scene.add(new THREE.DirectionalLight(0xffffff, 1.2).position.set(5, 10, 10));
scene.add(new THREE.AmbientLight(0xffffff, 0.55));

/* -------------------------------
   CONTROLS
--------------------------------*/
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.6;
controls.enablePan = false;

let model;

/* -------------------------------
   LOAD GLB MODEL
--------------------------------*/
const loader = new GLTFLoader();

loader.load(
    "assets/NestEggFBCR.glb",
    gltf => {
        model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        model.scale.set(3, 3, 3);
        scene.add(model);

        console.log("MODEL LOADED SUCCESSFULLY");
    },
    undefined,
    err => console.error("MODEL LOAD ERROR:", err)
);

/* -------------------------------
   ANNOTATIONS
--------------------------------*/
const annotationLayer = document.getElementById("annotation-layer");

const features = [
    { id: "entrance", name: "Entrance Aperture", pos: new THREE.Vector3(2.509, 0.00, 3.672) },
    { id: "vent-left", name: "Ventilation Aperture (Left)", pos: new THREE.Vector3(0.0, -2.149, 3.849) },
    { id: "drainage", name: "Drainage Aperture", pos: new THREE.Vector3(-0.877, 0.036, -3.951) },
    { id: "shell-joint", name: "Shell Separation Joint", pos: new THREE.Vector3(-0.003, 0.036, -0.419) }
];

const annotationElements = [];

function createAnnotation(feature) {
    const wrapper = document.createElement("div");
    wrapper.className = "annotation";

    const dot = document.createElement("div");
    dot.className = "dot";

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = feature.name;

    wrapper.appendChild(dot);
    wrapper.appendChild(label);
    annotationLayer.appendChild(wrapper);

    annotationElements.push({ wrapper, feature });
}

features.forEach(createAnnotation);

/* -------------------------------
   UPDATE ANNOTATION POSITIONS
--------------------------------*/
function updateAnnotations() {
    if (!model) return;

    annotationElements.forEach(obj => {
        const { wrapper, feature } = obj;

        const projected = feature.pos.clone().project(camera);

        const x = (projected.x * 0.5 + 0.5) * section.clientWidth;
        const y = (-projected.y * 0.5 + 0.5) * section.clientHeight;

        wrapper.style.left = `${x}px`;
        wrapper.style.top = `${y}px`;

        wrapper.style.display = projected.z < 1 ? "block" : "none";
    });
}

/* -------------------------------
   RENDER LOOP
--------------------------------*/
function animate() {
    requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);

    updateAnnotations();
}

animate();

/* -------------------------------
   RESIZE HANDLER
--------------------------------*/
window.addEventListener("resize", () => {
    camera.aspect = section.clientWidth / section.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(section.clientWidth, section.clientHeight);
});
