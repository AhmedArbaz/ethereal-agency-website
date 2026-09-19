'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function makeGlowTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(238,205,118,0.9)');
  gradient.addColorStop(0.4, 'rgba(201,162,39,0.35)');
  gradient.addColorStop(1, 'rgba(201,162,39,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export default function HeroScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch (e) {
      return undefined; // No WebGL support — hero still works without it.
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.15, 8);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // ---- Lighting: warm gold key light + cool rim light + soft ambient ----
    scene.add(new THREE.AmbientLight(0x4a3620, 1.6));
    const keyLight = new THREE.PointLight(0xffcf8a, 110, 40, 2);
    keyLight.position.set(4, 3, 6);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0x9fd0ff, 20, 40, 2);
    rimLight.position.set(-5, -2, -4);
    scene.add(rimLight);
    const fillLight = new THREE.PointLight(0xffe6b0, 35, 30, 2);
    fillLight.position.set(-2, -1, 7);
    scene.add(fillLight);

    // ---- A group holds the gem + ring, offset lower so headline text
    // reads clearly above/around it rather than fighting it for space ----
    const group = new THREE.Group();
    group.position.set(0, -0.9, 0);
    scene.add(group);

    // ---- Central faceted "gem" ----
    const gemGeo = new THREE.IcosahedronGeometry(1.25, 2);
    const gemMat = new THREE.MeshPhysicalMaterial({
      color: 0xc9a227,
      metalness: 1,
      roughness: 0.32,
      clearcoat: 0.7,
      clearcoatRoughness: 0.2,
      emissive: 0x4a2f0a,
      emissiveIntensity: 0.35,
      flatShading: true,
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    group.add(gem);

    // ---- Halo ring ----
    const ringGeo = new THREE.TorusGeometry(2.05, 0.03, 16, 120);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xeecd76,
      metalness: 1,
      roughness: 0.3,
      emissive: 0x2a1c08,
      emissiveIntensity: 0.4,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.4;
    group.add(ring);

    // ---- Soft glow sprite behind everything ----
    const glowTex = makeGlowTexture();
    const glowMat = new THREE.SpriteMaterial({ map: glowTex, color: 0xffe6b0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const glow = new THREE.Sprite(glowMat);
    glow.scale.set(6.5, 6.5, 1);
    glow.position.set(0, -0.9, -1.5);
    scene.add(glow);

    // ---- Drifting gold dust particles ----
    const PARTICLE_COUNT = reduceMotion ? 0 : 160;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xeecd76,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ---- Mouse parallax (lerped) ----
    let targetX = 0;
    let targetY = 0;
    let mouseX = 0;
    let mouseY = 0;
    function onPointerMove(e) {
      const rect = container.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }
    window.addEventListener('pointermove', onPointerMove);

    // ---- Resize handling ----
    function resize() {
      const { clientWidth, clientHeight } = container;
      if (!clientWidth || !clientHeight) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // ---- Animation loop ----
    let raf;
    const clock = new THREE.Clock();
    function tick() {
      const t = clock.getElapsedTime();

      if (!reduceMotion) {
        gem.rotation.y = t * 0.28;
        gem.rotation.x = Math.sin(t * 0.2) * 0.18;
        ring.rotation.z = t * 0.12;

        const posAttr = particleGeo.attributes.position;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          posAttr.array[i * 3 + 1] += 0.0022;
          if (posAttr.array[i * 3 + 1] > 4.6) posAttr.array[i * 3 + 1] = -4.6;
        }
        posAttr.needsUpdate = true;

        mouseX += (targetX - mouseX) * 0.04;
        mouseY += (targetY - mouseY) * 0.04;
        camera.position.x = mouseX * 0.9;
        camera.position.y = 0.15 - mouseY * 0.6 + Math.sin(t * 0.25) * 0.08;
        camera.lookAt(0, -0.5, 0);
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      ro.disconnect();
      gemGeo.dispose();
      gemMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      glowMat.dispose();
      glowTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="hero-scene" aria-hidden="true" />;
}
