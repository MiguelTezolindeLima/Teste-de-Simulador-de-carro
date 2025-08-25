// Configuração básica do Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Habilitar sombras
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Sombras suaves
document.body.appendChild(renderer.domElement);

// Céu simples
const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
const skyMaterial = new THREE.MeshBasicMaterial({
    color: 0x87CEEB, // Azul claro
    side: THREE.BackSide,
});
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

// Luzes aprimoradas
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Luz ambiente suave
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Luz solar
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;

// Ajustar resolução das sombras
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;
scene.add(directionalLight);

// Pista
const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x2F4F4F, // Cinza asfalto
    roughness: 0.7,
    metalness: 0.1,
});
const roadGeometry = new THREE.PlaneGeometry(10, 100);
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2;
road.position.y = 0.1;
road.receiveShadow = true;
scene.add(road);

// Função para adicionar faixas na pista
function addRoadLines() {
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF }); // Branco
    const lineGeometry = new THREE.PlaneGeometry(0.2, 2);

    for (let i = -45; i <= 45; i += 4) {
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.set(0, 0.11, i); // Eleva ligeiramente acima da pista
        line.rotation.x = -Math.PI / 2;
        scene.add(line);
    }
}
addRoadLines();

// Grama
const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x32CD32 }); // Verde limão
const grassLeft = new THREE.Mesh(new THREE.PlaneGeometry(30, 100), grassMaterial);
grassLeft.position.x = -15;
grassLeft.rotation.x = -Math.PI / 2;
grassLeft.receiveShadow = true;
scene.add(grassLeft);

const grassRight = grassLeft.clone();
grassRight.position.x = 15;
scene.add(grassRight);

// Função para criar árvores
function createTree(x, z) {
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Marrom
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2);
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, 1, z);
    trunk.castShadow = true;

    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // Verde escuro
    const leavesTop = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 16), leavesMaterial);
    leavesTop.position.set(x, 3, z);
    leavesTop.castShadow = true;

    scene.add(trunk);
    scene.add(leavesTop);
}

// Adicionar árvores
createTree(-10, -20);
createTree(-10, -40);
createTree(10, -30);
createTree(10, -50);

// Função para criar carro estiloso com melhorias
function createBeautifulCar(color) {
    const carBodyMaterial = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.9,
        roughness: 0.3,
    });
    const carBody = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 4), carBodyMaterial);
    carBody.castShadow = true;

    // Rodas esportivas
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
    const wheelPositions = [
        [-0.9, -0.5, 1.5],
        [-0.9, -0.5, -1.5],
        [0.9, -0.5, 1.5],
        [0.9, -0.5, -1.5],
    ];

    wheelPositions.forEach(([x, y, z]) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(x, y, z);
        wheel.rotation.z = Math.PI / 2;
        carBody.add(wheel);
    });

    return carBody;
}

// Carro principal
const playerCar = createBeautifulCar(0x1E90FF); // Azul estiloso
playerCar.position.set(0, 0.5, 0);
scene.add(playerCar);

// Obstáculos
const obstacles = [];
for (let i = 0; i < 3; i++) {
    const obstacleCar = createBeautifulCar(0xFF0000); // Vermelho
    obstacleCar.position.set(0, 0.5, -10 * (i + 1));
    obstacleCar.castShadow = true;
    obstacles.push(obstacleCar);
    scene.add(obstacleCar);
}

// Variáveis de controle
let playerSpeed = 0;
let playerHorizontalSpeed = 0;

// Controle do jogador via teclado
document.addEventListener("keydown", (event) => {
    if (event.key === "w") playerSpeed = 0.2; // Frente
    if (event.key === "s") playerSpeed = -0.1; // Ré
    if (event.key === "a") playerHorizontalSpeed = -0.1; // Esquerda
    if (event.key === "d") playerHorizontalSpeed = 0.1; // Direita
});

document.addEventListener("keyup", (event) => {
    if (["w", "s"].includes(event.key)) playerSpeed = 0; // Parar movimento
    if (["a", "d"].includes(event.key)) playerHorizontalSpeed = 0; // Parar movimento
});

// Função de animação
function animate() {
    requestAnimationFrame(animate);

    // Atualizar posição do carro principal
    playerCar.position.z += playerSpeed;
    playerCar.position.x += playerHorizontalSpeed;

    // Limitar movimento horizontal dentro da pista
    playerCar.position.x = Math.max(-3, Math.min(3, playerCar.position.x));

    renderer.render(scene, camera);
}

// Configuração da câmera
camera.position.set(0, 15, 30); // Ajusta a visão geral
camera.lookAt(0, 0, 0);

// Iniciar animação
animate(1);