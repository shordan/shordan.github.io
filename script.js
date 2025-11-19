// --- Lógica 3D con Three.js (Estilo Deep Space - Partículas Corregidas) ---
const init3D = () => {
    console.log("Inicializando 3D Deep Space...");

    const container = document.getElementById('canvas-container');

    // Variables interacción
    const mouse = new THREE.Vector2();
    let targetIntensity = 0; 
    let currentIntensity = 0; 

    // Escena
    const scene = new THREE.Scene();
    // Reducimos un poco la niebla para que se vean las partículas del fondo lejano
    scene.fog = new THREE.FogExp2(0x000000, 0.015);

    // Cámara
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 6;

    // Renderizador
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // --- Objeto Central: Esfera Blanca Fantasma (Sin cambios, como te gustó) ---
    const geometry = new THREE.IcosahedronGeometry(2.2, 4);
    const originalPositions = geometry.attributes.position.array.slice(); 
    
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        wireframe: true,
        transparent: true,
        opacity: 0.5 // Mantenemos la visibilidad que te gustó
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // --- Partículas de Fondo (MODIFICADO PARA MAYOR VISIBILIDAD) ---
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 6000; // AUMENTADO: De 3000 a 6000 para llenar el espacio
    
    const posArray = new Float32Array(particlesCount * 3);
    const initialParticlePositions = new Float32Array(particlesCount * 3); 
    const particleSpeeds = new Float32Array(particlesCount);

    for(let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        // AUMENTADO EL RANGO: De 40 a 90 para llenar más pantalla
        posArray[i3] = (Math.random() - 0.5) * 15; 
        posArray[i3 + 1] = (Math.random() - 0.5) * 15; 
        posArray[i3 + 2] = (Math.random() - 0.5) * 15; 

        initialParticlePositions[i3] = posArray[i3];
        initialParticlePositions[i3+1] = posArray[i3+1];
        initialParticlePositions[i3+2] = posArray[i3+2];

        particleSpeeds[i] = Math.random(); 
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({ 
        size: 0.05, // AUMENTADO: De 0.02 a 0.05 (Crucial para verse con el blur)
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.8 // AUMENTADO: Para que brillen más
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

        // 2. Movimiento del Grupo de Partículas
        particlesMesh.rotation.y = -time * 0.03; // Rotación suave del universo

        // 3. Movimiento INDIVIDUAL (Flotación)
        const pPositions = particlesGeometry.attributes.position.array;
        
        for(let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            // Movimiento vertical suave oscilatorio
            pPositions[i3 + 1] = initialParticlePositions[i3+1] + Math.sin(time + particleSpeeds[i] * 10) * 0.5;
        }
        particlesGeometry.attributes.position.needsUpdate = true; 

        // 4. Interacción Mouse (Esfera)
        const distToCenter = Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y);
        const maxDist = 0.5;
        if (distToCenter < maxDist) {
            targetIntensity = 2.5 * (1 - distToCenter / maxDist);
        } else {
            targetIntensity = 0.2; 
        }
        currentIntensity += (targetIntensity - currentIntensity) * 0.03; 

        // 5. Deformación Esfera
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