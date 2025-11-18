// --- Lógica 3D con Three.js ---
const init3D = () => {
    const container = document.getElementById('canvas-container');
    
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
    
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 15; // Dispersión
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: 0xbc13fe
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Animación
    const animate = () => {
        requestAnimationFrame(animate);
        
        // Rotación lenta
        sphere.rotation.x += 0.001;
        sphere.rotation.y += 0.002;
        
        particlesMesh.rotation.y -= 0.0005;

        // Interactividad simple con el mouse (Opcional, se puede refinar)
        // Por ahora solo rotación automática elegante
        
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