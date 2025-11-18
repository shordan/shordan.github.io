// --- Lógica 3D con Three.js ---
const init3D = () => {
    const container = document.getElementById('canvas-container');

    // Variables para la interactividad del mouse
    const mouse = new THREE.Vector2();
    let mouseX = 0, mouseY = 0; // Usaremos estas para la posición en la escena

    // Escena
    const scene = new THREE.Scene();

    // Cámara
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderizador
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); // alpha true para fondo transparente
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Objeto: IcoSphere (Representando un nodo de IA)
    const geometry = new THREE.IcosahedronGeometry(2, 1); // Radio 2, Detalle 1
    const material = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Partículas orbitales (Efecto Átomo/Robótica)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 700;
    const posArray = new Float32Array(particlesCount * 3);

    // Almacenamos las posiciones iniciales para que puedan volver a su lugar
    const initialPosArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 15; // Dispersión
        initialPosArray[i] = posArray[i]; // Guardamos la posición inicial
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: 0xbc13fe
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // --- Event Listener para el movimiento del mouse ---
    window.addEventListener('mousemove', (event) => {
        // Normalizar las coordenadas del mouse a un rango de -1 a 1
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Convertir coordenadas del mouse a coordenadas 3D para la escena
        // Esto es una aproximación, ajusta Z según la profundidad que quieras
        mouseX = mouse.x * 2; // Multiplicador para ajustar la sensibilidad
        mouseY = mouse.y * 2;
    });


    // Animación
    const animate = () => {
        requestAnimationFrame(animate);

        // Rotación lenta de la esfera
        sphere.rotation.x += 0.001;
        sphere.rotation.y += 0.002;

        // Rotación de las partículas (para el movimiento inicial)
        particlesMesh.rotation.y -= 0.0005;

        // --- Lógica del efecto campo magnético ---
        const positions = particlesGeometry.attributes.position.array;
        const initialPositions = initialPosArray; // Usamos las posiciones iniciales

        for (let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;

            // Posición actual de la partícula (en la escena)
            // Consideramos la rotación global para el cálculo de distancia si queremos más precisión
            const particleX = positions[i3];
            const particleY = positions[i3 + 1];
            const particleZ = positions[i3 + 2];

            // Distancia al mouse (simple en 2D por ahora, ya que el mouse solo tiene X,Y)
            const dx = particleX - mouseX;
            const dy = particleY - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Ajusta este valor para cambiar la fuerza de la interacción
            const repulsionRadius = 1.0; 
            const repulsionStrength = 0.05; // Cuánto se mueven

            if (distance < repulsionRadius) {
                // Calcular la dirección de repulsión
                const angle = Math.atan2(dy, dx);
                const repelX = Math.cos(angle);
                const repelY = Math.sin(angle);

                // Mover la partícula away del mouse, con un decaimiento basado en la distancia
                // También interpolamos para que vuelva a su posición original lentamente
                const force = (repulsionRadius - distance) * repulsionStrength;
                
                // Mover la partícula
                positions[i3] += repelX * force;
                positions[i3 + 1] += repelY * force;
            }

            // Interpolación para que las partículas vuelvan a su posición original
            // Lerp (Linear Interpolation) para un movimiento suave
            positions[i3] += (initialPositions[i3] - positions[i3]) * 0.01;
            positions[i3 + 1] += (initialPositions[i3 + 1] - positions[i3 + 1]) * 0.01;
            positions[i3 + 2] += (initialPositions[i3 + 2] - positions[i3 + 2]) * 0.01;

        }

        particlesGeometry.attributes.position.needsUpdate = true; // Notificar a Three.js que las posiciones cambiaron

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

// Iniciar 3D
init3D();

// --- Lógica de Modales ---
function openModal(modalId) {
    document.getElementById(modalId).style.display = "block";
    document.body.style.overflow = "hidden"; // Evitar scroll de fondo
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
    document.body.style.overflow = "auto"; // Permitir scroll de nuevo
}

// Cerrar modal si se hace clic fuera del contenido
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
        document.body.style.overflow = "auto";
    }
}