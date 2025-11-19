// --- Lógica 3D con Three.js (Fusión Final: Fórmulas Robóticas Flotantes) ---

// IMPORTANTE: Ahora importamos THREE y los complementos usando el Import Map
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

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
        "dq = J^-1 * dx",    // Cinemática Inversa
        "T = [ R  p ]",         // Transformación
        "PID",            // Control
        "dx/dt",          // Derivada
        "Tau = M(q)q'' + C + G"       // Dinámica (Usamos Tau en vez del simbolo griego para evitar errores de fuente)
    ];

    const floatingFormulas = []; 

    // Cargador de Fuente
    const loader = new FontLoader();
    
    // Cargamos la fuente desde el CDN usando la ruta del Import Map
    loader.load('https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        
        const textMaterialBase = new THREE.MeshBasicMaterial({
            color: 0xffffff, // white
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });

        formulas.forEach((formula, i) => {
            const textGeo = new TextGeometry(formula, {
                font: font,
                size: 0.25,      
                height: 0.02,   
                curveSegments: 12,
                bevelEnabled: false
            });

            // Centrar el texto
            textGeo.computeBoundingBox();
            const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
            textGeo.translate( centerOffset, 0, 0 );

            // Material independiente
            const textMesh = new THREE.Mesh(textGeo, textMaterialBase.clone());

            // Posicionamiento
            const theta = Math.random() * Math.PI * 2;
            const radius = 6.5 + Math.random() * 2; 
            
            textMesh.position.x = Math.cos(theta) * radius;
            textMesh.position.y = (Math.random() - 0.5) * 5;
            textMesh.position.z = Math.sin(theta) * radius * 0.5;

            textMesh.lookAt(camera.position);

            scene.add(textMesh);
            
            floatingFormulas.push({
                mesh: textMesh,
                initialY: textMesh.position.y,
                speed: 0.001 + Math.random() * 0.002,
                floatOffset: Math.random() * 100 
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

        // C. Animación Fórmulas
        if (floatingFormulas.length > 0) {
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(floatingFormulas.map(f => f.mesh));

            floatingFormulas.forEach(item => {
                // Flotación
                item.mesh.position.y = item.initialY + Math.sin(time + item.floatOffset) * 0.4;
                
                // Mirar a cámara + twist
                item.mesh.lookAt(camera.position); 
                item.mesh.rotation.z = Math.sin(time * 0.5 + item.floatOffset) * 0.1;

                // Interacción
                const isHovered = intersects.find(hit => hit.object === item.mesh);

                if (isHovered) {
                    item.mesh.material.opacity = 0.6;        
                    item.mesh.material.color.set(0xffffff); 
                    item.mesh.scale.setScalar(1.0);         
                } else {
                    item.mesh.material.opacity = 0.2;       
                    item.mesh.material.color.set(0xffffff); 
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

// ==========================================
// 2. LÓGICA DEL SLIDER MULTIMEDIA (CARRUSEL)
// ==========================================

function initializeSliders() {
    const sliders = document.querySelectorAll('.media-slider-container');
    
    sliders.forEach(container => {
        const slider = container.querySelector('.media-slider');
        const slides = Array.from(slider.children);
        const prevBtn = container.querySelector('.prev-btn');
        const nextBtn = container.querySelector('.next-btn');
        const dotsContainer = container.querySelector('.slider-dots');
        let currentIndex = 0;

        // Crear puntos de navegación (dots)
        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });
        const dots = Array.from(dotsContainer.children);

        function goToSlide(index) {
            // Pausar videos al cambiar de slide
            slides[currentIndex].querySelectorAll('video').forEach(video => video.pause());

            // Calcular nuevo índice circular
            currentIndex = (index + slides.length) % slides.length;
            
            // Mover el slider
            slider.style.transform = `translateX(-${currentIndex * 100}%)`;

            // Actualizar estado de los puntos
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        }

        // Event Listeners Botones
        prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
        nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

        // Resetear slider cuando se abre el modal
        container.closest('.modal').addEventListener('modal-opened', () => {
            goToSlide(0);
        });
    });
}

// Ejecutar inicialización de sliders al cargar la página
document.addEventListener('DOMContentLoaded', initializeSliders);

// ==========================================
// 3. LÓGICA DE MODALES (VENTANAS EMERGENTES)
// ==========================================

// Función para abrir modales (Global)
window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "block";
        document.body.style.overflow = "hidden"; // Bloquear scroll de fondo
        
        // Disparar evento para avisar al slider que el modal se abrió
        // Pequeño timeout para asegurar que el display block ya se aplicó
        setTimeout(() => {
            const event = new CustomEvent('modal-opened');
            modal.dispatchEvent(event);
        }, 50);
    }
}

// Función para cerrar modales (Global)
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto"; // Reactivar scroll
        
        // Pausar todos los videos dentro del modal al cerrarlo
        modal.querySelectorAll('video').forEach(video => video.pause());
    }
}

// Cerrar modal si se hace clic fuera del contenido (en el fondo oscuro)
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
        document.body.style.overflow = "auto";
        event.target.querySelectorAll('video').forEach(video => video.pause());
    }
}

// ==========================================
// 4. LÓGICA DE LIGHTBOX (PANTALLA COMPLETA)
// ==========================================

const lightbox = document.getElementById('fullscreen-lightbox');
const lightboxImg = document.getElementById('fullscreen-image');
const closeLightbox = document.getElementById('close-fullscreen');

// Función para abrir el lightbox
function openLightbox(src) {
    if (!lightbox) return; // Seguridad si no existe el elemento
    
    lightbox.style.display = 'flex';
    // Pequeño delay para permitir la transición de opacidad CSS
    setTimeout(() => {
        lightbox.classList.add('active');
    }, 10);
    lightboxImg.src = src;
}

// Función para cerrar
function closeLightboxFunc() {
    if (!lightbox) return;

    lightbox.classList.remove('active');
    setTimeout(() => {
        lightbox.style.display = 'none';
        lightboxImg.src = ''; // Limpiar src
    }, 300); // Esperar a que termine la transición CSS
}

// Event Listeners Globales para abrir Lightbox
// Usamos delegación de eventos para detectar clics en imágenes dentro de los sliders
document.addEventListener('click', function(e) {
    // Si el elemento clickeado tiene la clase 'slider-media' Y es una imagen (IMG)
    if (e.target && e.target.classList.contains('slider-media') && e.target.tagName === 'IMG') {
        openLightbox(e.target.src);
    }
});

// Event Listeners para cerrar
if(closeLightbox) closeLightbox.addEventListener('click', closeLightboxFunc);

// Cerrar al dar clic fuera de la imagen (en el fondo oscuro)
if(lightbox) {
    lightbox.addEventListener('click', function(e) {
        // Si el click fue directamente en el fondo (y no en la imagen)
        if (e.target === lightbox) {
            closeLightboxFunc();
        }
    });
}

// Cerrar con tecla ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
        closeLightboxFunc();
    }
});