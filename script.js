// --- Lógica 3D con Three.js (Estilo White Ethereal) ---
const init3D = () => {
    console.log("Inicializando 3D Ethereal...");

    const container = document.getElementById('canvas-container');

    // Variables interacción
    const mouse = new THREE.Vector2();
    let targetIntensity = 0; 
    let currentIntensity = 0; 

    // Escena
    const scene = new THREE.Scene();
    // Opcional: Añadir un poco de niebla negra para profundidad
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
    const geometry = new THREE.IcosahedronGeometry(2.2, 4); // Ligeramente más grande
    const originalPositions = geometry.attributes.position.array.slice(); 
    
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, // BLANCO PURO
        wireframe: true,
        transparent: true,
        opacity: 0.15 // MUY TRANSPARENTE (Casi invisible)
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // --- Partículas de Fondo (Polvo de estrellas blanco) ---
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000; // Más partículas
    const posArray = new Float32Array(particlesCount * 3);
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 35; 
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({ 
        size: 0.02, // Muy finas
        color: 0xffffff, // BLANCO
        transparent: true, 
        opacity: 0.3 // Sutiles
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

        // Rotación lenta y elegante
        sphere.rotation.y += 0.001;
        sphere.rotation.z += 0.0005;
        particlesMesh.rotation.y = -time * 0.02; // Rotación muy lenta del universo

        // Interacción suave
        const distToCenter = Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y);
        const maxDist = 0.5;
        if (distToCenter < maxDist) {
            targetIntensity = 1.5; // Deformación moderada
        } else {
            targetIntensity = 0.2; // "Respiración" muy leve
        }
        currentIntensity += (targetIntensity - currentIntensity) * 0.03; // Movimiento muy fluido y lento

        // Deformación de vértices
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const ox = originalPositions[i];
            const oy = originalPositions[i + 1];
            const oz = originalPositions[i + 2];

            // Ruido suave
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