// =============================================================
// INITIALIZATION
// =============================================================
window.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
});

// =============================================================
// 1. PAGE NAVIGATION LOGIC (Cu clase responsive pentru mobil)
// =============================================================
function switchPage(targetPage) {
    const pageProfile = document.getElementById('page-profile');
    const pageJourney = document.getElementById('page-journey');
    const btnProfile = document.getElementById('nav-btn-profile');
    const btnJourney = document.getElementById('nav-btn-journey');

    // Păstrăm clasele responsive ca să arate bine pe telefon
    const activeClass = "px-3 lg:px-5 py-1.5 lg:py-2 rounded-full text-[10px] lg:text-xs font-semibold uppercase tracking-wider transition-all duration-300 text-bgMain bg-cyanAccent shadow-cyanGlow whitespace-nowrap";
    const inactiveClass = "px-3 lg:px-5 py-1.5 lg:py-2 rounded-full text-[10px] lg:text-xs font-semibold uppercase tracking-wider transition-all duration-300 text-textSec hover:text-textMain whitespace-nowrap";

    if (targetPage === 'profile') {
        pageJourney.classList.add('opacity-0');
        setTimeout(() => {
            pageJourney.classList.add('hidden');
            pageProfile.classList.remove('hidden');
            setTimeout(() => pageProfile.classList.remove('opacity-0'), 50);
        }, 300);

        btnProfile.className = activeClass;
        btnJourney.className = inactiveClass;
    } else {
        pageProfile.classList.add('opacity-0');
        setTimeout(() => {
            pageProfile.classList.add('hidden');
            pageJourney.classList.remove('hidden');
            setTimeout(() => {
                pageJourney.classList.remove('opacity-0');
                if (window.resizeProjector) window.resizeProjector();
                ScrollTrigger.refresh();
            }, 50);
        }, 300);

        btnJourney.className = activeClass;
        btnProfile.className = inactiveClass;
    }
}

// =============================================================
// 2. THREE.JS 3D VINYL DISC (PAGE 1)
// =============================================================
let vinylScene, vinylCamera, vinylRenderer, vinylDiscMesh;
let isAudioPlaying = false;

function initVinyl3D() {
    const canvas = document.getElementById('vinyl-canvas');
    if (!canvas) return;
    const container = canvas.parentElement;

    vinylScene = new THREE.Scene();

    vinylCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    vinylCamera.position.set(0, 3.5, 3.5);
    vinylCamera.lookAt(0, 0, 0);

    vinylRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    vinylRenderer.setSize(container.clientWidth, container.clientHeight);
    vinylRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const discGroup = new THREE.Group();

    const discGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.08, 64);
    const discMat = new THREE.MeshStandardMaterial({ color: 0x0a0f18, roughness: 0.3, metalness: 0.8 });
    vinylDiscMesh = new THREE.Mesh(discGeo, discMat);
    discGroup.add(vinylDiscMesh);

    for (let r = 0.7; r <= 1.6; r += 0.15) {
        const ringGeo = new THREE.RingGeometry(r, r + 0.04, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x182538, side: THREE.DoubleSide });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = 0.045;
        discGroup.add(ringMesh);
    }

    const labelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.09, 32);
    const labelMat = new THREE.MeshStandardMaterial({ color: 0x55D6FF, roughness: 0.2, metalness: 0.5, emissive: 0x113e54 });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    discGroup.add(labelMesh);

    const holeGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x080D16 });
    const holeMesh = new THREE.Mesh(holeGeo, holeMat);
    discGroup.add(holeMesh);

    vinylScene.add(discGroup);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    vinylScene.add(ambientLight);

    const cyanLight = new THREE.DirectionalLight(0x55D6FF, 2);
    cyanLight.position.set(3, 5, 2);
    vinylScene.add(cyanLight);

    function animateVinyl() {
        requestAnimationFrame(animateVinyl);
        if (isAudioPlaying && discGroup) {
            discGroup.rotation.y += 0.03;
        }
        vinylRenderer.render(vinylScene, vinylCamera);
    }
    animateVinyl();

    // Fix pentru redimensionare disc 3D pe telefon (rotire ecran)
    window.addEventListener('resize', () => {
        if (vinylRenderer && vinylCamera) {
            vinylRenderer.setSize(container.clientWidth, container.clientHeight);
        }
    });
}

// =============================================================
// 3. AUDIO PLAYER CONTROLLER (2Pac - All Eyez On Me)
// =============================================================
let audio = null;
let progressInterval = null;

function initAudio() {
    if (!audio) {
        // ATENȚIE: Numele fișierului aici trebuie să coincidă cu cel din folder
        audio = new Audio('2pac.mp3'); 
        audio.loop = true;
    }
}

function toggleAudio() {
    initAudio();

    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const eqGraphic = document.getElementById('eq-graphic');

    if (audio.paused) {
        audio.play();
        isAudioPlaying = true;
        
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
        eqGraphic.classList.remove('paused');

        // Clear interval în caz că a mai rămas unul activ (previne bug-ul de viteză)
        clearInterval(progressInterval); 

        progressInterval = setInterval(() => {
            if(!audio.duration) return;
            const pct = (audio.currentTime / audio.duration) * 100;
            document.getElementById('audio-progress-bar').style.width = pct + '%';

            const mins = Math.floor(audio.currentTime / 60);
            const secs = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
            document.getElementById('audio-time').innerText = `${mins}:${secs}`;
        }, 1000);

    } else {
        audio.pause();
        isAudioPlaying = false;
        
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
        eqGraphic.classList.add('paused');

        clearInterval(progressInterval);
    }
}

// =============================================================
// 4. THREE.JS 3D VIDEO PROJECTOR (PAGE 2) - IMPROVED CROMATICS
// =============================================================
let projScene, projCamera, projRenderer, masterGroup, projectorGroup, lightBeamCone;

function initProjector3D() {
    const canvas = document.getElementById('projector-canvas');
    if (!canvas) return;

    projScene = new THREE.Scene();

    projCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    projCamera.position.set(0, 0, 15);

    projRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    projRenderer.setClearColor(0x000000, 0); 
    projRenderer.setSize(window.innerWidth, window.innerHeight);
    projRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    masterGroup = new THREE.Group();
    projScene.add(masterGroup);

    projectorGroup = new THREE.Group();
    masterGroup.add(projectorGroup);

    // 1. Volumetric Light Cone Beam
    const beamGeo = new THREE.ConeGeometry(5.5, 25, 32, 1, true);
    beamGeo.translate(0, -12.5, 0);
    beamGeo.rotateZ(Math.PI / 2);

    const beamMat = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(0x55D6FF) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            varying vec2 vUv;
            void main() {
                float alpha = pow(vUv.y, 2.5) * 0.45; // Smooth fade effect
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    lightBeamCone = new THREE.Mesh(beamGeo, beamMat);
    lightBeamCone.position.set(1.2, 0, 0);
    projectorGroup.add(lightBeamCone);

    // 2. Load custom ciufu.glb or Enhanced Procedural Fallback
    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load('./ciufu.glb', function(gltf) {
        const model = gltf.scene;
        model.rotation.z = -Math.PI / 2;
        model.scale.set(1.5, 1.5, 1.5);
        projectorGroup.add(model);
    }, undefined, function(error) {
        console.warn("ciufu.glb not loaded. Using Enhanced Fallback model.");

        // Fallback Chassis (Graphite Metallic Finish)
        const bodyGeo = new THREE.BoxGeometry(2.8, 1.0, 2.0);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2A3B4C, roughness: 0.3, metalness: 0.8 });
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        projectorGroup.add(bodyMesh);

        // Fallback Top Detail Panel
        const topGeo = new THREE.BoxGeometry(2.6, 1.05, 1.8);
        const topMat = new THREE.MeshStandardMaterial({ color: 0x111D2C, roughness: 0.6, metalness: 0.4 });
        const topMesh = new THREE.Mesh(topGeo, topMat);
        projectorGroup.add(topMesh);

        // Fallback Lens Rim (Dark Titanium)
        const lensRimGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.2, 32);
        const lensRimMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.9 });
        const lensRim = new THREE.Mesh(lensRimGeo, lensRimMat);
        lensRim.rotation.z = -Math.PI / 2;
        lensRim.position.set(1.35, 0, 0);
        projectorGroup.add(lensRim);

        // Fallback Lens Core (Glowing Cyan)
        const lensCoreGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.22, 32);
        const lensCoreMat = new THREE.MeshStandardMaterial({ 
            color: 0x080D16, 
            emissive: 0x55D6FF, 
            emissiveIntensity: 0.6
        });
        const lensCore = new THREE.Mesh(lensCoreGeo, lensCoreMat);
        lensCore.rotation.z = -Math.PI / 2;
        lensCore.position.set(1.36, 0, 0);
        projectorGroup.add(lensCore);
    });

    // Enhanced Studio Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 1.5);
    projScene.add(ambLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(-5, 8, 5);
    projScene.add(mainLight);

    const cyanRimLight = new THREE.PointLight(0x55D6FF, 3, 20);
    cyanRimLight.position.set(2, 0, 2);
    projScene.add(cyanRimLight);

    // Render loop
    let clock = new THREE.Clock();

    function animateProjector() {
        requestAnimationFrame(animateProjector);
        const elapsedTime = clock.getElapsedTime();

        if (projectorGroup) {
            // Animație de plutire
            projectorGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.3;
        }

        projRenderer.render(projScene, projCamera);
    }

    animateProjector();

    // =========================================================
    // FUNCȚIA DE RESPONSIVITATE PĂSTRATĂ (SCALARE PE TELEFON)
    // =========================================================
    window.resizeProjector = function() {
        if (!projRenderer || !projCamera || !masterGroup) return;
        
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        projCamera.aspect = w / h;
        projCamera.updateProjectionMatrix();
        projRenderer.setSize(w, h);

        if (w < 768) {
            // TELEFON
            const scaleFactor = w / 600; 
            masterGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);
            masterGroup.position.set(-2.5, 4.5, -3); 
            masterGroup.rotation.set(0, Math.PI / 4, -Math.PI / 3);
        } else if (w < 1024) {
            // TABLETĂ
            const scaleFactor = w / 1000; 
            masterGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);
            masterGroup.position.set(-4.5, 2, 0);
            masterGroup.rotation.set(Math.PI / 10, -Math.PI / 6, 0);
        } else {
            // DESKTOP
            masterGroup.scale.set(1, 1, 1);
            masterGroup.position.set(-5, 0, 2);
            masterGroup.rotation.set(Math.PI / 12, -Math.PI / 7, 0);
        }
    };

    window.addEventListener('resize', window.resizeProjector);
    window.resizeProjector(); // Aplică setările la încărcare
}

// =============================================================
// 5. INTERACTIVE SCROLL ANIMATIONS (GSAP)
// =============================================================
function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    const cards = document.querySelectorAll('.journey-card');

    cards.forEach((card, index) => {
        gsap.set(card, { opacity: 0.25, scale: 0.95 });

        ScrollTrigger.create({
            trigger: card,
            start: "top 65%",
            end: "bottom 35%",
            onEnter: () => activateCardScroll(card, index),
            onEnterBack: () => activateCardScroll(card, index),
            onLeave: () => deactivateCardScroll(card),
            onLeaveBack: () => deactivateCardScroll(card),
        });
    });
}

function activateCardScroll(card, index) {
    gsap.to(card, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" });
    card.classList.add('glass-panel-active', 'shadow-cyanGlowIntense');

    if (projectorGroup && window.innerWidth >= 1024) {
        gsap.to(projectorGroup.rotation, {
            z: (index - 1.5) * -0.08,
            duration: 0.6,
            ease: 'power2.out'
        });
    }
}

function deactivateCardScroll(card) {
    gsap.to(card, { opacity: 0.25, scale: 0.95, duration: 0.5, ease: "power2.out" });
    card.classList.remove('glass-panel-active', 'shadow-cyanGlowIntense');
}

// =============================================================
// INITIALIZATION ON WINDOW LOAD
// =============================================================
window.addEventListener('load', () => {
    initVinyl3D();
    initProjector3D();
    initScrollAnimations();
});