// --- Lógica 3D con Three.js (Opción 2: Onda Cerebral) ---
const init3D = () => {
    const container = document.getElementById('canvas-container');

    // Variables interacción
    const mouse = new THREE.Vector2();
    let targetIntensity = 0; // Intensidad objetivo de la distorsión
    let currentIntensity = 0; // Intensidad actual (para suavizado)

    // Escena
    const scene = new THREE.Scene();

    // Cámara
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 6; // Un poco más lejos para ver la expansión

    // Renderizador
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // --- Objeto Central: Esfera Dinámica ---
    // Aumentamos el detalle (subdivisiones) a 4 para tener más vértices que mover
    const geometry = new THREE.IcosahedronGeometry(2, 10); 
    
    // Guardamos las posiciones originales de cada vértice para tener referencia
    const originalPositions = geometry.attributes.position.array.slice(); 
    
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x00f3ff, 
        wireframe: true,
        transparent: true,
        opacity: 0.4
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // --- Fondo de Partículas (Sutil, para acompañar) ---
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 25;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({ size: 0.03, color: 0xbc13fe, opacity: 0.5, transparent: true });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // --- Event Listener Mouse ---
    document.addEventListener('mousemove', (event) => {
        // Coordenadas normalizadas
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // --- Animación ---
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        // 1. Rotación base
        sphere.rotation.y += 0.002;
        particlesMesh.rotation.y -= 0.0005;

        // 2. Calcular distancia del mouse al centro de la pantalla
        // (Asumiendo que la esfera está en el centro 0,0)
        const distToCenter = Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y);
        
        // Si el mouse está cerca del centro (distancia < 0.5), la intensidad sube
        // Si está lejos, la intensidad baja a un "latido" mínimo
        const maxDist = 0.8;
        if (distToCenter < maxDist) {
            // Cuanto más cerca, más intenso (invertimos la distancia)
            targetIntensity = 2.5 * (1 - distToCenter / maxDist); 
        } else {
            targetIntensity = 0.3; // Intensidad de reposo (respiración)
        }

        // Lerp para suavizar el cambio de intensidad (que no sea brusco)
        currentIntensity += (targetIntensity - currentIntensity) * 0.05;

        // 3. Manipulación de Vértices (El efecto "Brain Wave")
        const positions = geometry.attributes.position.array;

        for (let i = 0; i < positions.length; i += 3) {
            // Posición original del vértice
            const ox = originalPositions[i];
            const oy = originalPositions[i + 1];
            const oz = originalPositions[i + 2];

            // Vector normalizado (dirección desde el centro hacia afuera)
            // Como es una esfera en 0,0,0, la posición es igual a la normal
            const vector = new THREE.Vector3(ox, oy, oz);
            vector.normalize();

            // Crear "ruido" usando funciones seno/coseno basadas en posición y tiempo
            // Esto simula ondas complejas sin necesitar una librería de Perlin Noise
            const noise = Math.sin(vector.x * 5 + time * 2) + 
                          Math.cos(vector.y * 3 + time * 3) + 
                          Math.sin(vector.z * 7 + time);

            // Calcular desplazamiento
            const distance = 2 + (noise * 0.1 * currentIntensity);

            // Aplicar nueva posición
            positions[i] = vector.x * distance;
            positions[i + 1] = vector.y * distance;
            positions[i + 2] = vector.z * distance;
        }

        geometry.attributes.position.needsUpdate = true; // Importante: notificar cambios

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