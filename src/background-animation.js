/**
 * Three.js Background Animation
 * Theme: x.ai inspired (Dark, Monochrome, Network/Constellation)
 * Enhanced with cursor interaction
 */

class BackgroundAnimation {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'bg-animation';
        Object.assign(this.container.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            zIndex: '-1',
            pointerEvents: 'none',
            opacity: '0.6'
        });
        document.body.appendChild(this.container);

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.lines = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseZ = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;

        this.init();
        this.animate();
        this.addEventListeners();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 50;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Particles
        this.createParticles();
    }

    createParticles() {
        const particleCount = Math.min(Math.floor(window.innerWidth / 4), 200);
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];
        const originalPositions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const x = (Math.random() - 0.5) * 150;
            const y = (Math.random() - 0.5) * 100;
            const z = (Math.random() - 0.5) * 80;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            originalPositions[i * 3] = x;
            originalPositions[i * 3 + 1] = y;
            originalPositions[i * 3 + 2] = z;

            velocities.push({
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.01
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particles = new THREE.Points(
            geometry,
            new THREE.PointsMaterial({
                color: 0xffffff,
                size: 1.2,
                transparent: true,
                opacity: 0.4,
                sizeAttenuation: true
            })
        );
        this.particles.userData = {
            velocities: velocities,
            originalPositions: originalPositions
        };
        this.scene.add(this.particles);
    }

    addEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(event) {
        this.targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
        this.targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Smooth mouse following
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        if (this.particles) {
            const positions = this.particles.geometry.attributes.position.array;
            const velocities = this.particles.userData.velocities;
            const originalPositions = this.particles.userData.originalPositions;

            // Mouse position in 3D space
            const mouseVector = new THREE.Vector3(
                this.mouseX * 60,
                this.mouseY * 40,
                10
            );

            // Update particle positions with cursor interaction
            for (let i = 0; i < velocities.length; i++) {
                const i3 = i * 3;

                // Get current position
                let x = positions[i3];
                let y = positions[i3 + 1];
                let z = positions[i3 + 2];

                // Calculate distance to mouse
                const dx = x - mouseVector.x;
                const dy = y - mouseVector.y;
                const dz = z - mouseVector.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                // Magnetic attraction/repulsion effect
                const interactionRadius = 30;
                if (distance < interactionRadius) {
                    const force = (interactionRadius - distance) / interactionRadius;
                    // Repulsion effect
                    x += (dx / distance) * force * 0.5;
                    y += (dy / distance) * force * 0.5;
                    z += (dz / distance) * force * 0.3;
                }

                // Gentle drift back to original position
                const ox = originalPositions[i3];
                const oy = originalPositions[i3 + 1];
                const oz = originalPositions[i3 + 2];

                x += (ox - x) * 0.02;
                y += (oy - y) * 0.02;
                z += (oz - z) * 0.02;

                // Apply velocity for ambient movement
                x += velocities[i].x;
                y += velocities[i].y;
                z += velocities[i].z;

                positions[i3] = x;
                positions[i3 + 1] = y;
                positions[i3 + 2] = z;
            }

            // Draw connection lines between nearby particles
            this.updateLines(positions);

            this.particles.geometry.attributes.position.needsUpdate = true;
        }

        // Subtle camera movement based on mouse
        this.camera.position.x += (this.mouseX * 2 - this.camera.position.x) * 0.02;
        this.camera.position.y += (this.mouseY * 2 - this.camera.position.y) * 0.02;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
    }

    updateLines(positions) {
        // Remove old lines
        if (this.lines) {
            this.scene.remove(this.lines);
            this.lines.geometry.dispose();
        }

        const linePositions = [];
        const maxDistance = 25;
        const particleCount = positions.length / 3;

        // Find nearby particles and connect them
        for (let i = 0; i < particleCount; i++) {
            for (let j = i + 1; j < particleCount; j++) {
                const dx = positions[i * 3] - positions[j * 3];
                const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (distance < maxDistance) {
                    linePositions.push(
                        positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                        positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
                    );
                }
            }
        }

        if (linePositions.length > 0) {
            const lineGeometry = new THREE.BufferGeometry();
            lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.1
            });

            this.lines = new THREE.LineSegments(lineGeometry, lineMaterial);
            this.scene.add(this.lines);
        }
    }
}

// Initialize only if on main thread and DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new BackgroundAnimation());
} else {
    new BackgroundAnimation();
}
