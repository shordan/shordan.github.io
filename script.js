// --- Lógica 3D con Three.js (Fusión Final: Fórmulas Robóticas Flotantes) ---

// Importamos FontLoader y TextGeometry desde CDN (Necesario para texto 3D)
import { FontLoader } from 'https://threejs.org/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://threejs.org/examples/jsm/geometries/TextGeometry.js';

const init3D = () => {
    console.log("Inicializando 3D Matemático...");

    const container = document.getElementById('canvas-container');

    // Variables interacción
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    let targetIntensity = 0; 
    let currentIntensity = 0; 

    // Escena
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    // Cámara
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 6;

    // Renderizador
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // --- 1. Objeto Central: Esfera Blanca Fantasma ---
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

    // --- 2. Partículas de Fondo ---
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000; 
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
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

    // --- 3. NUEVO: Fórmulas de Robótica Flotantes ---
    const formulas = [
        "J(q)",           // Jacobiano
        "x = f(q)",       // Cinemática Directa
        "q = f^-1(x)",    // Cinemática Inversa
        "T = Rp",         // Transformación
        "PID",            // Control
        "dx/dt",          // Derivada
        "τ = M(q)a"       // Dinámica simplificada
    ];

    const floatingFormulas = []; // Array para guardar las mallas de texto

    // Cargador de Fuente
    const loader = new FontLoader();
    
    // Cargamos la fuente desde el repositorio de ejemplos de Three.js
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        
        const textMaterialBase = new THREE.MeshBasicMaterial({
            color: 0x00ffff, // Cian
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });

        formulas.forEach((formula, i) => {
            const textGeo = new TextGeometry(formula, {
                font: font,
                size: 0.3,      // Tamaño del texto
                height: 0.02,   // Grosor del texto (profundidad 3D)
                curveSegments: 12,
                bevelEnabled: false
            });

            // Centrar el texto en su propio eje
            textGeo.computeBoundingBox();
            const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
            textGeo.translate( centerOffset, 0, 0 );

            // Creamos la malla con material clonado (independiente)
            const textMesh = new THREE.Mesh(textGeo, textMaterialBase.clone());

            // Posicionamiento aleatorio orbital
            const theta = Math.random() * Math.PI * 2;
            const radius = 3.5 + Math.random() * 2; // Distancia orbital
            
            textMesh.position.x = Math.cos(theta) * radius;
            textMesh.position.y = (Math.random() - 0.5) * 5;
            textMesh.position.z = Math.sin(theta) * radius * 0.5;

            // Orientar texto hacia la cámara inicialmente
            textMesh.lookAt(camera.position);

            scene.add(textMesh);
            
            // Guardamos datos para animación
            floatingFormulas.push({
                mesh: textMesh,
                initialY: textMesh.position.y,
                speed: 0.001 + Math.random() * 0.002,
                floatOffset: Math.random() * 100 // Para que no floten sincronizados
            });
        });
    });

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

        // A. Movimiento Esfera 
        sphere.rotation.y += 0.001;
        sphere.rotation.z += 0.0005;

        // B. Movimiento Partículas
        particlesMesh.rotation.y = -time * 0.05; 
        particlesMesh.rotation.x = time * 0.01; 

        // C. Animación e Interacción de Fórmulas
        // (Solo ejecutamos si ya se cargaron las fuentes y existen fórmulas)
        if (floatingFormulas.length > 0) {
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(floatingFormulas.map(f => f.mesh));

            floatingFormulas.forEach(item => {
                // 1. Flotación suave ("Efecto respiración")
                item.mesh.position.y = item.initialY + Math.sin(time + item.floatOffset) * 0.4;
                
                // 2. Rotación lenta para que siempre traten de mirar al frente pero con variación
                item.mesh.lookAt(camera.position); 
                // Le damos un pequeño twist extra para que no se vean estáticas
                item.mesh.rotation.z = Math.sin(time * 0.5 + item.floatOffset) * 0.1;

                // 3. Interacción Hover (Individual)
                const isHovered = intersects.find(hit => hit.object === item.mesh);

                if (isHovered) {
                    item.mesh.material.opacity = 1;        // Opacidad total
                    item.mesh.material.color.set(0xffffff); // Blanco brillante
                    item.mesh.scale.setScalar(1.2);         // Crece más evidente
                } else {
                    item.mesh.material.opacity = 0.4;       // Fantasma
                    item.mesh.material.color.set(0x00ffff); // Cian
                    item.mesh.scale.setScalar(1.0);
                }
            });
        }

        // D. Interacción Esfera
        const distToCenter = Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y);
        const maxDist = 0.5;
        if (distToCenter < maxDist) {
            targetIntensity = 2.5 * (1 - distToCenter / maxDist);
        } else {
            targetIntensity = 0.2; 
        }
        currentIntensity += (targetIntensity - currentIntensity) * 0.03; 

        // E. Deformación
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