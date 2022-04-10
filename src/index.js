import {
    AmbientLight,
    BoxGeometry,
    Mesh,
    MeshLambertMaterial,
    PerspectiveCamera,
    PointLight,
    Scene,
    Vector3,
    WebGLRenderer,
} from "three";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new Scene();

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
camera.position.set(0,0,100);
camera.lookAt(0,0,0);

const ambientLight = new AmbientLight(0x404040);
scene.add(ambientLight);

const pointLight = new PointLight(0xffffff, 2);
pointLight.position.set(200,250,600);
pointLight.castShadow = true;
scene.add(pointLight);

const playerGeometry = new BoxGeometry(10,10,10);
const playerMaterial = new MeshLambertMaterial(
    {color: 0x00ff00,
     opacity: 0.4,
     transparent: true
    });
const player = new Mesh(playerGeometry, playerMaterial);
scene.add(player);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const animate = () => {
    requestAnimationFrame(animate);

    player.rotation.x += 0.02;
    player.rotation.y += 0.03;
    renderer.render(scene, camera);
    controls.update();
}
animate();
