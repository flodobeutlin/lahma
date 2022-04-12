import {
    AmbientLight,
    Box3,
    BoxGeometry,
    Clock,
    DoubleSide,
    FlatShading,
    Group,
    IcosahedronGeometry,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    MeshStandardMaterial,
    PerspectiveCamera,
    PlaneGeometry,
    PointLight,
    Scene,
    SphereGeometry,
    Vector3,
    WebGLRenderer,
} from "three";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let camera;
let floor;
let player;
let playervAngle = 0;
let obstacle;
let nextObstacleTime = 0;

const obstacles = new Group();
const OBSTACLE_SPEED = 10;
const OBSTACLE_N = 10;
const OBSTACLE_MIN_X = -20;
const OBSTACLE_SPAWN_X = 40;

const JUMP_SPEED = 0.05;
const JUMP_GRAVITY = 0.1;
let jumpPressed = false;

let sky = new Group();
const CLOUD_COLORS = [0xFFFFFF, 0xEFD2DA, 0xC1EDED, 0xCCC9DE];

document.addEventListener("mousedown", () => jumpPressed = true);
document.addEventListener("mouseup", () => jumpPressed = false);

document.addEventListener("keydown", (e) => {
    const keyCode = e.which;
    switch(keyCode){
    case 32: //space
        jumpPressed = true;
        break;
    }
});
document.addEventListener("keyup", () => jumpPressed=false);

const scene = new Scene();
scene.add(obstacles);
scene.add(sky);

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const clock = new Clock();

const createCamera = () => {
    camera = new PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        500);
    camera.position.set(-5,4,10);
    camera.lookAt(100,100,0);

    // handle window resize
    window.addEventListener(
        "resize",
        () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        },
        false
    );
};
createCamera();

const createLights = () => {
    const ambientLight = new AmbientLight(0x404040);
    scene.add(ambientLight);
    ambientLight.castShadow = true;
    
    const pointLight = new PointLight(0xffffff, 2);
    pointLight.position.set(200,250,600);
    pointLight.castShadow = true;
    scene.add(pointLight);    
}
createLights();

const createPlayer = () => {
    const geometry = new BoxGeometry(1,1,1);
    const material = new MeshLambertMaterial(
        {color: 0xff0000,
        });
    player = new Mesh(geometry, material);
    player.castShadow = true;
    player.receiveShadow = true;
    scene.add(player);    
};

const createObstacle = () => {
    const geometry = new IcosahedronGeometry(0.5, 0);
    const material = new MeshStandardMaterial(
        {color: 0x137704});
    obstacle = new Mesh(geometry,material);
    obstacle.castShadow = true;
    obstacle.receiveShadow = true;
}
createObstacle();

const createFloor = () => {
    const geometry = new PlaneGeometry(1000,1000,10,10);
    const material = new MeshLambertMaterial(
        { color: 0x21d006}
    );
    floor = new Mesh(geometry,material);
    floor.material.side = DoubleSide;
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.4;
    floor.castShadow = false;
    floor.receiveShadow = true;
    scene.add(floor);
};
createFloor();

const createSky = () => {
    const skyRadius = 64;
    const geometry = new SphereGeometry(skyRadius,32,40);
    geometry.scale(-1,1,1);
    const material = new MeshBasicMaterial(
        { color: 0x82a3ff });
    const background = new Mesh(geometry,material);
    sky.add(background);

    const cloudGeometry = new IcosahedronGeometry(0.4,0);
    for(let i = 0; i < 32; i++){
        const cloudMaterial = new MeshStandardMaterial({
            color: CLOUD_COLORS[Math.floor(Math.random() * CLOUD_COLORS.length)]});
        const cloudMesh = new Mesh(cloudGeometry,cloudMaterial);
        let x = Math.random();
        let y = Math.random();
        let z = Math.random();
        const nv = Math.sqrt(x * x + y * y + z * z);
        x = (x * skyRadius - 4) / nv;
        y = Math.abs((y * skyRadius - 4) / nv);
        z = (z * skyRadius - 4) / nv;
        cloudMesh.position.set(x,y,z);
        sky.add(cloudMesh);
    }
}
createSky();

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const spawnObstacle = () => {
    const o = obstacle.clone();
    obstacles.add(o);
    o.position.x = OBSTACLE_SPAWN_X;
    const scale = Math.random() + 1;
    o.scale.multiplyScalar(scale);
};

const jump = (speed) => {
    playervAngle += speed;
    player.position.y = Math.max(Math.sin(playervAngle) + 1.38, 0.4);
};

const checkCollisions = () => {
    const playerHitbox = new Box3();
    playerHitbox.setFromObject(player);

    for(const o of obstacles.children){
        const hitbox = new Box3();
        hitbox.setFromObject(o);
        if(hitbox.intersectsBox(playerHitbox)){
            console.log("HIT");
            return;
        }
    }
};

const update = (delta) => {
    checkCollisions();
    if(jumpPressed){
        jump(JUMP_SPEED);
    } else {
        if(player.position.y > 0.4){
            jump(JUMP_GRAVITY);
        }
    }
    
    //spawn new obstacles
    if(clock.elapsedTime > nextObstacleTime){
        spawnObstacle();
        nextObstacleTime = clock.elapsedTime + Math.random() * 4;
    }
    
    // move obstacles
    for (const o of obstacles.children){
        o.position.x -= OBSTACLE_SPEED * delta;
        if(o.position.x < OBSTACLE_MIN_X){
            obstacles.remove(o);
        }
    }

    sky.rotation.y += 0.002;
};

const animate = () => {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    update(delta);
    renderer.render(scene, camera);
    controls.update();
};



const start = () => {
    createPlayer();
    animate();
};

const init = () => {
    renderer.render(scene,camera);

    const button = document.createElement("dialog");
    button.id = "button-start";
    button.innerHTML = "start";
    button.addEventListener("click", () => {
        button.close();
        start();
    });
    document.body.appendChild(button);
    button.showModal();
};
init();


