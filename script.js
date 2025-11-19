// --- Lógica 3D con Three.js (Estilo White Ethereal - Más Partículas y Movimiento) ---
const init3D = () => {
    console.log("Inicializando 3D Ethereal...");

    const container = document.getElementById('canvas-container');

    // Variables interacción
    const mouse = new THREE.Vector2();
    let targetIntensity = 0; 
    let currentIntensity = 0; 

    // Escena
    const scene = new THREE.Scene();
    // Niebla negra para profundidad (hace que las partículas lejanas se desvanezcan)
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    // Cámara
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 6;

    // Renderizador
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // --- Objeto Central: Esfera Blanca Fantasma ---
    const geometry = new THREE.IcosahedronGeometry(2.2, 4);
    const originalPositions = geometry.attributes.position.array.slice(); 
    
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        wireframe: true,
        transparent: true,
        opacity: 0.5 // Ajustado para visibilidad
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // --- Partículas de Fondo (MASIVAS Y EN MOVIMIENTO) ---
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 3000; // AUMENTADO: De 1000 a 3000 partículas
    
    const posArray = new Float32Array(particlesCount * 3);
    // Guardamos las posiciones iniciales para calcular el movimiento relativo
    const initialParticlePositions = new Float32Array(particlesCount * 3); 
    // Guardamos velocidades aleatorias para cada partícula
    const particleSpeeds = new Float32Array(particlesCount);

    for(let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        // Posiciones aleatorias
        posArray[i3] = (Math.random() - 0.5) * 40; // X
        posArray[i3 + 1] = (Math.random() - 0.5) * 40; // Y
        posArray[i3 + 2] = (Math.random() - 0.5) * 40; // Z

        // Guardamos la posición inicial
        initialParticlePositions[i3] = posArray[i3];
        initialParticlePositions[i3+1] = posArray[i3+1];
        initialParticlePositions[i3+2] = posArray[i3+2];

        // Velocidad aleatoria para cada una (para que no se muevan igual)
        particleSpeeds[i] = Math.random(); 
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({ 
        size: 0.02, 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.4 // Un poco más visibles
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // --- Event Listener Mouse ---
    document.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // --- Animación ---
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        // 1. Movimiento de la Esfera Central
        sphere.rotation.y += 0.001;
        sphere.rotation.z += 0.0005;

        // 2. Movimiento del Grupo de Partículas (Rotación general)
        particlesMesh.rotation.y = -time * 0.05; 

        // 3. Movimiento INDIVIDUAL de partículas (Efecto flotante)
        const pPositions = particlesGeometry.attributes.position.array;
        
        for(let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            
            // Hacemos que floten en el eje Y usando Seno basado en el tiempo y su velocidad única
            // initialParticlePositions[i3+1] es la base Y original
            // Math.sin(time + particleSpeeds[i] * 10) crea la oscilación
            pPositions[i3 + 1] = initialParticlePositions[i3+1] + Math.sin(time + particleSpeeds[i] * 10) * 0.5;
        }
        particlesGeometry.attributes.position.needsUpdate = true; // Importante para ver el movimiento

        // 4. Interacción con Mouse (Esfera)
        const distToCenter = Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y);
        const maxDist = 0.5;
        if (distToCenter < maxDist) {
            targetIntensity = 1.5; 
        } else {
            targetIntensity = 0.2; 
        }
        currentIntensity += (targetIntensity - currentIntensity) * 0.03; 

        // 5. Deformación de vértices de la esfera
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const ox = originalPositions[i];
            const oy = originalPositions[i + 1];
            const oz = originalPositions[i + 2];

            const noise = Math.sin(ox * 1.5 + time * 1.5) * Math.cos(oy * 1.5 + time * 2);
            const deformation = 1 + (noise * 0.15 * currentIntensity);

            positions[i] = ox * deformation;
            positions[i + 1] = oy * deformation;
            positions[i + 2] = oz * deformation;
        }

        geometry.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
    };

    animate();

    // Responsive
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
};

init3D();

// --- Modales ---
function openModal(modalId) {
    document.getElementById(modalId).style.display = "block";
    document.body.style.overflow = "hidden";
}
function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
    document.body.style.overflow = "auto";
}
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
        document.body.style.overflow = "auto";
    }
}