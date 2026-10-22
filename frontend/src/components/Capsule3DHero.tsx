'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { 
  Bot, 
  Network, 
  Database, 
  ArrowRight, 
  Sparkles, 
  Cpu
} from 'lucide-react';

interface ParticleData {
  basePos: THREE.Vector3;
  velocity: THREE.Vector3;
  burstDir: THREE.Vector3;
  speed: number;
  size: number;
  color: THREE.Color;
}

interface Capsule3DHeroProps {
  showOverlay?: boolean;
}

export default function Capsule3DHero({ showOverlay = false }: Capsule3DHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [titleVisible, setTitleVisible] = useState(false);

  // Animation progress ref for smooth lerping (0 = closed/intact, 1 = fully burst open)
  const animProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const mousePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    // Scroll-driven rupture & burst
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      // Map scrollY: 0px = 0 (completely intact pill), 360px+ = 1 (complete particle burst)
      const progress = Math.min(Math.max(scrollY / 360, 0), 1);
      targetProgressRef.current = progress;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    // Synchronize title emergence
    const titleTimer = setTimeout(() => {
      setTitleVisible(true);
    }, 400);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(titleTimer);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.025);

    // Camera positioned with wider FoV to capture both capsule halves and burst particles
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.1, 7.8);

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: 'high-performance' 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // --- Lighting (Pure Monochromatic Platinum & Specular White) ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 3.2);
    topLight.position.set(4, 7, 5);
    scene.add(topLight);

    const bottomRimLight = new THREE.DirectionalLight(0xd4d4d8, 2.4);
    bottomRimLight.position.set(-4, -6, -3);
    scene.add(bottomRimLight);

    // Glowing core point light inside the pill that explodes on scroll
    const corePointLight = new THREE.PointLight(0xffffff, 2.5, 12);
    corePointLight.position.set(0, 0, 0);
    scene.add(corePointLight);

    // --- 3D Capsule Geometry Construction ---
    const capsuleGroup = new THREE.Group();
    capsuleGroup.position.set(0, 0.15, 0);
    scene.add(capsuleGroup);

    const radius = 0.72;
    const halfLength = 0.78;

    // Top Half Material (Translucent Frosted Platinum Glass Sheen)
    const topMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf4f4f5,
      emissive: 0x27272a,
      emissiveIntensity: 0.18,
      roughness: 0.12,
      metalness: 0.18,
      transmission: 0.75,
      thickness: 0.85,
      transparent: true,
      opacity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06
    });

    // Bottom Half Material (Obsidian Matte Titanium - Distinct & Clearly Visible)
    const bottomMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1f1f23,
      emissive: 0x121215,
      emissiveIntensity: 0.2,
      roughness: 0.22,
      metalness: 0.88,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });

    // Middle Metallic Seam Ring (Polished Platinum Silver)
    const ringGeo = new THREE.TorusGeometry(radius * 1.02, 0.04, 16, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.98,
      roughness: 0.1,
      emissive: 0x52525b,
      emissiveIntensity: 0.4
    });
    const seamRing = new THREE.Mesh(ringGeo, ringMat);
    seamRing.rotation.x = Math.PI / 2;

    // ── Top Cap Assembly ──
    const topGroup = new THREE.Group();
    const topCylGeo = new THREE.CylinderGeometry(radius, radius, halfLength, 36, 1, true);
    const topCylMesh = new THREE.Mesh(topCylGeo, topMaterial);
    topCylMesh.position.y = halfLength / 2;

    const topSphereGeo = new THREE.SphereGeometry(radius, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2);
    const topSphereMesh = new THREE.Mesh(topSphereGeo, topMaterial);
    topSphereMesh.position.y = halfLength;

    topGroup.add(topCylMesh);
    topGroup.add(topSphereMesh);
    topGroup.add(seamRing.clone());
    capsuleGroup.add(topGroup);

    // ── Bottom Cap Assembly (Now fully balanced & in frame) ──
    const bottomGroup = new THREE.Group();
    const botCylGeo = new THREE.CylinderGeometry(radius, radius, halfLength, 36, 1, true);
    const botCylMesh = new THREE.Mesh(botCylGeo, bottomMaterial);
    botCylMesh.position.y = -halfLength / 2;

    const botSphereGeo = new THREE.SphereGeometry(radius, 36, 18, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const botSphereMesh = new THREE.Mesh(botSphereGeo, bottomMaterial);
    botSphereMesh.position.y = -halfLength;

    bottomGroup.add(botCylMesh);
    bottomGroup.add(botSphereMesh);
    capsuleGroup.add(bottomGroup);

    // ── Inner Glowing Crystal Core (Nucleus inside the pill) ──
    const coreGeo = new THREE.IcosahedronGeometry(0.46, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xa1a1aa,
      emissiveIntensity: 0.9,
      roughness: 0.15,
      wireframe: true
    });
    const innerCore = new THREE.Mesh(coreGeo, coreMat);
    capsuleGroup.add(innerCore);

    // ── Molecular Bio-Particle Burst System (Inside the capsule) ──
    // At scroll=0, particles are contained tightly inside.
    // On scroll, they burst outward explosively in 3D toward the camera!
    const particleCount = 420;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const particlesData: ParticleData[] = [];
    const colorChoices = [
      new THREE.Color(0xffffff), // Pure White
      new THREE.Color(0xf4f4f5), // Platinum Light
      new THREE.Color(0xd4d4d8), // Silver
      new THREE.Color(0xa1a1aa), // Neutral Titanium
    ];

    for (let i = 0; i < particleCount; i++) {
      // Radial spherical dispersal direction for explosion
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random());

      const sinPhi = Math.sin(phi);
      const burstX = sinPhi * Math.cos(theta);
      const burstY = sinPhi * Math.sin(theta);
      const burstZ = Math.cos(phi);

      const burstDir = new THREE.Vector3(burstX, burstY, burstZ).normalize();
      const speed = 1.5 + Math.random() * 4.5;

      // Initial positions inside the closed capsule
      const basePos = new THREE.Vector3(
        (Math.random() - 0.5) * (radius * 0.9),
        (Math.random() - 0.5) * (halfLength * 1.5),
        (Math.random() - 0.5) * (radius * 0.9)
      );

      const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];

      particlesData.push({
        basePos,
        velocity: burstDir.clone().multiplyScalar(speed),
        burstDir,
        speed,
        size: 0.06 + Math.random() * 0.12,
        color
      });

      particlePositions[i * 3] = basePos.x;
      particlePositions[i * 3 + 1] = basePos.y;
      particlePositions[i * 3 + 2] = basePos.z;

      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Particle sprite texture (Pure white radiant orb)
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.3, 'rgba(244, 244, 245, 0.9)');
      gradient.addColorStop(0.7, 'rgba(161, 161, 170, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.22,
      map: particleTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(particleGeo, particleMaterial);
    capsuleGroup.add(particleSystem);

    // Initial balanced tilt of the capsule
    capsuleGroup.rotation.z = -Math.PI / 7;
    capsuleGroup.rotation.x = Math.PI / 10;

    // --- Mouse Parallax Handler ---
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePosRef.current.targetX = x * 0.35;
      mousePosRef.current.targetY = y * 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // --- Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // --- Animation Render Loop ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const render = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth lerp progress toward scroll target
      const diff = targetProgressRef.current - animProgressRef.current;
      animProgressRef.current += diff * (delta * 3.5);

      const p = animProgressRef.current; // 0 = closed intact pill, 1 = exploded burst

      // Mouse Parallax Smooth Lerp
      mousePosRef.current.x += (mousePosRef.current.targetX - mousePosRef.current.x) * 0.08;
      mousePosRef.current.y += (mousePosRef.current.targetY - mousePosRef.current.y) * 0.08;

      // Base Floating Rotation (gently swaying)
      const floatY = Math.sin(elapsed * 1.6) * 0.08;
      capsuleGroup.position.y = 0.15 + floatY;
      capsuleGroup.rotation.y = elapsed * 0.25 + mousePosRef.current.x;
      capsuleGroup.rotation.x = Math.PI / 10 + mousePosRef.current.y * 0.4;

      // ── TOP & BOTTOM HALF SEPARATION (Both strictly stay in frame!) ──
      // At p = 0: Both top and bottom touch perfectly, forming a solid complete capsule!
      // At p = 1 (scrolled down): Top glides gently up by 1.1, bottom glides gently down by 1.1
      const separation = p * 1.15;
      
      // Top Half Separation
      topGroup.position.y = separation;
      topGroup.position.x = -p * 0.45;
      topGroup.position.z = p * 0.3;
      topGroup.rotation.z = -p * 0.35;
      topGroup.rotation.x = p * 0.2;

      // Bottom Half Separation (NOW COMPLETELY VISIBLE AT ALL TIMES!)
      bottomGroup.position.y = -separation;
      bottomGroup.position.x = p * 0.45;
      bottomGroup.position.z = -p * 0.3;
      bottomGroup.rotation.z = p * 0.35;
      bottomGroup.rotation.x = -p * 0.2;

      // ── Inner Core Pulse & Expansion ──
      innerCore.rotation.x += 0.02;
      innerCore.rotation.y += 0.025;
      const coreScale = 0.65 + Math.sin(elapsed * 4) * 0.1 + p * 0.8;
      innerCore.scale.set(coreScale, coreScale, coreScale);
      
      // Core point light flashes bright white on scroll burst
      corePointLight.intensity = 2.0 + p * 7.0 + Math.sin(elapsed * 6) * 0.6;

      // ── MOLECULAR PARTICLE BURST ANIMATION ──
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const pData = particlesData[i];

        if (p < 0.02) {
          // Closed state: particles gently jitter inside the intact capsule
          positions[i * 3] = pData.basePos.x + Math.sin(elapsed * 2 + i) * 0.04;
          positions[i * 3 + 1] = pData.basePos.y + Math.cos(elapsed * 2 + i) * 0.04;
          positions[i * 3 + 2] = pData.basePos.z + Math.sin(elapsed * 3 + i) * 0.04;
        } else {
          // BURST EXPLOSION STATE:
          // Particles burst outward along their radial burst vector, expanding across the viewport!
          const burstDist = p * pData.speed * 1.6;
          const swirlAngle = elapsed * 0.5 + (i * 0.03);

          positions[i * 3] = pData.basePos.x + pData.burstDir.x * burstDist + Math.cos(swirlAngle) * (0.2 * p);
          positions[i * 3 + 1] = pData.basePos.y + pData.burstDir.y * burstDist + Math.sin(swirlAngle) * (0.2 * p);
          positions[i * 3 + 2] = pData.basePos.z + pData.burstDir.z * burstDist * 1.4; // Shoots toward camera
        }
      }
      particleGeo.attributes.position.needsUpdate = true;
      particleMaterial.size = 0.18 + p * 0.14; // Beads grow slightly as they burst outward
      particleMaterial.opacity = p < 0.05 ? 0.45 : Math.min(0.45 + p * 0.55, 1.0);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      particleGeo.dispose();
      particleMaterial.dispose();
      topCylGeo.dispose();
      topSphereGeo.dispose();
      botCylGeo.dispose();
      botSphereGeo.dispose();
      ringGeo.dispose();
      coreGeo.dispose();
      topMaterial.dispose();
      bottomMaterial.dispose();
      ringMat.dispose();
      coreMat.dispose();
      particleTexture.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] min-h-[640px] bg-transparent overflow-hidden flex flex-col justify-between select-none">
      {/* 3D WebGL Canvas Layer Covering the Hero Section */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10"
      />

      {/* Emerged Title & Hero Content Overlay (Only if showOverlay is true) */}
      {showOverlay && (
        <div 
          className={`relative z-20 flex flex-col justify-between h-full max-w-7xl mx-auto w-full p-6 sm:p-12 lg:p-16 pointer-events-none transition-all duration-700 ease-out ${
            titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Top Badging */}
          <div className="flex items-center space-x-2">
            <div className="inline-flex items-center space-x-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1.5 text-xs font-mono text-gray-200 font-medium backdrop-blur-md">
              <Cpu className="h-3.5 w-3.5 animate-pulse text-white" />
              <span>MULTI-HOP BIOMEDICAL KNOWLEDGE GRAPH</span>
            </div>
          </div>

          {/* Center / Emerged Title Typography from the Capsule Core */}
          <div className="max-w-3xl space-y-5 pointer-events-auto py-8">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 text-xs font-mono text-gray-300 uppercase tracking-widest font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-white" />
                <span>Computational Drug Repurposing Engine</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
                Drug<span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-300 to-neutral-500">Copilot</span>
              </h1>
              
              <p className="text-base sm:text-xl text-gray-300 max-w-2xl leading-relaxed font-sans">
                Unlocking hidden therapeutic indications through high-precision graph traversal across <strong>ChEMBL</strong>, <strong>Open Targets</strong>, <strong>UniProtKB</strong>, <strong>PubChem</strong>, and <strong>ClinicalTrials.gov</strong>.
              </p>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                href="/copilot"
                className="inline-flex items-center space-x-2 rounded-lg bg-white hover:bg-neutral-200 text-black px-6 py-3.5 text-xs sm:text-sm font-bold shadow-specular-strong transition-all transform hover:-translate-y-0.5"
              >
                <Bot className="h-4 w-4 text-black" />
                <span>Launch AI Copilot</span>
                <ArrowRight className="h-4 w-4 ml-1 text-black" />
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center space-x-2 rounded-lg bg-surface-raised/90 hover:bg-surface-overlay border border-surface-border px-6 py-3.5 text-xs sm:text-sm font-semibold text-white transition-all shadow-specular backdrop-blur-md"
              >
                <Network className="h-4 w-4 text-gray-300" />
                <span>Explore Knowledge Graph</span>
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center space-x-2 rounded-lg bg-surface-raised/80 hover:bg-surface-overlay border border-surface-border px-5 py-3.5 text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition-all shadow-specular backdrop-blur-md"
              >
                <Database className="h-4 w-4 text-gray-400" />
                <span>ETL Ingestion Hub</span>
              </Link>
            </div>
          </div>

          {/* Bottom Feature Micro-Pills */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-400 pt-6 border-t border-surface-border/80">
            <span className="flex items-center space-x-1.5 text-gray-200">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span>193 UniProt Targets</span>
            </span>
            <span className="text-gray-600">•</span>
            <span>122 Disease Ontologies</span>
            <span className="text-gray-600">•</span>
            <span>434 Verified Knowledge Edges</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-300">Zero Synthetic Hallucinations</span>
          </div>
        </div>
      )}
    </div>
  );
}
