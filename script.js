// --- Lógica 3D con Three.js (Fusión: Esfera Nueva + Partículas Clásicas) ---
const init3D = () => {
    console.log("Inicializando 3D Fusion...");

    const container = document.getElementById('canvas-container');

    // Variables interacción
    const mouse = new THREE.Vector2();
    let targetIntensity = 0; 
    let currentIntensity = 0; 

    // Escena
    const scene = new THREE.Scene();
    // Niebla suave para profundidad
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    // Cámara
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 6;

    // Renderizador
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // --- 1. Objeto Central: Esfera Blanca Fantasma (TU FAVORITA) ---
    const geometry = new THREE.IcosahedronGeometry(2.2, 4);
    const originalPositions = geometry.attributes.position.array.slice(); 
    
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        wireframe: true,
        transparent: true,
        opacity: 0.25 
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // --- 2. Partículas de Fondo (LÓGICA CLÁSICA RESTAURADA) ---
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500; // Cantidad media para buen rendimiento y densidad
    
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        // VOLVEMOS A LA DISPERSIÓN CORTA (Como en el primer código)
        // Antes era 90 (muy lejos), ahora es 25 (cerca de la esfera)
        posArray[i] = (Math.random() - 0.5) * 25; 
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.04, // Tamaño visible
        color: 0xffffff, // Blanco
        transparent: true,
        opacity: 0.6 // Buena visibilidad
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

        // A. Movimiento Esfera (Interactivo)
        sphere.rotation.y += 0.001;
        sphere.rotation.z += 0.0005;

        // B. Movimiento Partículas (Lógica Clásica: Rotación Simple)
        // Esto hace que giren alrededor de la esfera en bloque, como te gustaba
        particlesMesh.rotation.y = -time * 0.05; 
        particlesMesh.rotation.x = time * 0.01; // Un toque leve en X para dinamismo

        // C. Interacción Mouse (Solo afecta a la esfera)
        const distToCenter = Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y);
        const maxDist = 0.5;
        if (distToCenter < maxDist) {
            targetIntensity = 2.5 * (1 - distToCenter / maxDist);
        } else {
            targetIntensity = 0.2; 
        }
        currentIntensity += (targetIntensity - currentIntensity) * 0.03; 

        // D. Deformación Vértices Esfera
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

// --- Modales (Sin cambios) ---
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