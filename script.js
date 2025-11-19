// --- Lógica 3D con Three.js (Fusión Final: Esfera + Partículas Clásicas + Paneles Robótica) ---
const init3D = () => {
    console.log("Inicializando 3D Final...");

    const container = document.getElementById('canvas-container');

    // Variables interacción
    const mouse = new THREE.Vector2();
    // Raycaster para detectar si el mouse toca los paneles
    const raycaster = new THREE.Raycaster();

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
    const particlesCount = 2000; 
    
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        // Dispersión corta (15) para mantenerlas concentradas
        posArray[i] = (Math.random() - 0.5) * 15; 
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.04, 
        color: 0xffffff, 
        transparent: true,
        opacity: 0.8 
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // --- 3. NUEVO: Paneles de Datos Flotantes (Efecto Robótica) ---
    const dataPanels = [];
    const panelCount = 20; // 5 Paneles flotando
    const panelMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff, // Cian Tecnológico
        transparent: true,
        opacity: 0.6,   // Muy sutiles por defecto
        side: THREE.DoubleSide,
        wireframe: true 
    });

    for (let i = 0; i < panelCount; i++) {
        // Alternamos entre Rectángulos y Triángulos
        let panelShape;
        if (i % 2 === 0) {
            panelShape = new THREE.PlaneGeometry(2, 1.2); // Rectángulo tipo pantalla
        } else {
            panelShape = new THREE.CircleGeometry(1, 3); // Triángulo
        }
        
        const panelMesh = new THREE.Mesh(panelShape, panelMaterial);

        // Posicionamiento aleatorio alrededor de la esfera (entre radio 3 y 5)
        const theta = Math.random() * Math.PI * 2; // Ángulo aleatorio
        const radius = 3.5 + Math.random() * 1.5; // Distancia del centro
        
        panelMesh.position.x = Math.cos(theta) * radius;
        panelMesh.position.y = (Math.random() - 0.5) * 4; // Altura variable
        panelMesh.position.z = Math.sin(theta) * radius * 0.5; // Profundidad

        // Rotación aleatoria inicial
        panelMesh.rotation.set(Math.random(), Math.random(), Math.random());

        scene.add(panelMesh);
        // Guardamos referencia y posición inicial para animar
        dataPanels.push({ mesh: panelMesh, initialY: panelMesh.position.y, speed: 0.002 + Math.random() * 0.002 });
    }

    // --- Event Listener Mouse ---
    document.addEventListener('mousemove', (event) => {
        // Actualizamos mouse para esfera y para raycaster
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // --- Animación ---
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        // A. Movimiento Esfera 
        sphere.rotation.y += 0.001;
        sphere.rotation.z += 0.0005;

        // B. Movimiento Partículas (Rotación en bloque clásica)
        particlesMesh.rotation.y = -time * 0.05; 
        particlesMesh.rotation.x = time * 0.01; 

        // C. Movimiento e Interacción de Paneles (NUEVO)
        // Actualizamos el raycaster con la posición del mouse
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(dataPanels.map(p => p.mesh));

        dataPanels.forEach(panel => {
            // 1. Animación flotante
            panel.mesh.rotation.x += panel.speed;
            panel.mesh.rotation.y += panel.speed;
            panel.mesh.position.y = panel.initialY + Math.sin(time + panel.initialY) * 0.3;

            // 2. Interacción (Hover)
            // Si el mouse intersecta este panel...
            if (intersects.some(hit => hit.object === panel.mesh)) {
                panel.mesh.material.opacity = 1; // Se ilumina
                panel.mesh.material.color.set(0x00ffff); // Cian puro
                panel.mesh.scale.setScalar(1.1); // Crece un poquito
            } else {
                panel.mesh.material.opacity = 0.6; // Vuelve a ser fantasma
                panel.mesh.material.color.set(0x00ffff); 
                panel.mesh.scale.setScalar(1.0); // Tamaño normal
            }
        });

        // D. Interacción Mouse Esfera (Deformación)
        const distToCenter = Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y);
        const maxDist = 0.5;
        if (distToCenter < maxDist) {
            targetIntensity = 2.5 * (1 - distToCenter / maxDist);
        } else {
            targetIntensity = 0.2; 
        }
        currentIntensity += (targetIntensity - currentIntensity) * 0.03; 

        // E. Deformación Vértices Esfera
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