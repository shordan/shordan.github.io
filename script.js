// --- Lógica 3D con Three.js ---
const init3D = () => {
    const container = document.getElementById('canvas-container');

    // Variables para interacción
    const mouse = new THREE.Vector2();
    const target = new THREE.Vector3(); // Donde está el mouse en el mundo 3D
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    // Escena
    const scene = new THREE.Scene();

    // Cámara
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderizador
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // Para pantallas retina/alta definición
    container.appendChild(renderer.domElement);

    // Objeto Central: IcoSphere
    const geometry = new THREE.IcosahedronGeometry(2, 1);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x00f3ff, 
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // --- Sistema de Partículas ---
    const particlesCount = 800;
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);
    const initialPosArray = new Float32Array(particlesCount * 3); // Guardamos posición original

    for(let i = 0; i < particlesCount * 3; i++) {
        // Dispersión más amplia
        posArray[i] = (Math.random() - 0.5) * 20; 
        initialPosArray[i] = posArray[i];
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.03, // Un poco más grandes para verlas mejor
        color: 0xbc13fe,
        transparent: true,
        opacity: 0.8
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // --- Event Listener Mouse ---
    document.addEventListener('mousemove', (event) => {
        // Coordenadas normalizadas (-1 a 1)
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // --- Animación ---
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // 1. Rotación constante de la esfera central
        sphere.rotation.y += 0.002;
        sphere.rotation.x += 0.001;

        // 2. Calcular posición del mouse en el espacio 3D (Proyección)
        // Proyectamos el mouse sobre el plano Z=0 donde están la mayoría de partículas
        let vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        vector.unproject(camera);
        let dir = vector.sub(camera.position).normalize();
        let distance = -camera.position.z / dir.z;
        let finalPos = camera.position.clone().add(dir.multiplyScalar(distance));
        
        // 3. Lógica de Partículas
        const positions = particlesGeometry.attributes.position.array;

        for (let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            
            // Posición actual de la partícula
            let px = positions[i3];
            let py = positions[i3 + 1];
            let pz = positions[i3 + 2];

            // Posición original (destino)
            let ox = initialPosArray[i3];
            let oy = initialPosArray[i3 + 1];
            let oz = initialPosArray[i3 + 2];

            // Calcular distancia entre la partícula y el mouse (finalPos)
            let dx = px - finalPos.x;
            let dy = py - finalPos.y;
            // Ignoramos Z para que el efecto sea como un cilindro infinito desde la vista
            let dist = Math.sqrt(dx * dx + dy * dy); 

            // Parámetros del efecto
            const repulsionRadius = 3.0; // Radio de efecto
            const force = 2.0; // Fuerza de empuje

            if (dist < repulsionRadius) {
                // Calcular ángulo y fuerza
                let angle = Math.atan2(dy, dx);
                let pushX = Math.cos(angle) * force;
                let pushY = Math.sin(angle) * force;
                
                // Empujar la partícula lejos del mouse (mezclamos con su posición actual)
                // Usamos Lerp para suavizar el empuje
                positions[i3] += (pushX - (positions[i3] - ox)) * 0.05;
                positions[i3 + 1] += (pushY - (positions[i3 + 1] - oy)) * 0.05;
            } else {
                // Si el mouse no está cerca, volver suavemente a posición original
                positions[i3] += (ox - px) * 0.02;
                positions[i3 + 1] += (oy - py) * 0.02;
                positions[i3 + 2] += (oz - pz) * 0.02;
            }
        }

        particlesGeometry.attributes.position.needsUpdate = true;
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

// Iniciar
init3D();

// --- Lógica de Modales (Igual que antes) ---
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