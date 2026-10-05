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
  RotateCcw, 
  Cpu
} from 'lucide-react';

interface ParticleData {
  pos: THREE.Vector3;
  velocity: THREE.Vector3;
  rotSpeed: THREE.Vector3;
  size: number;
  color: THREE.Color;
}

export default function Capsule3DHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBroken, setIsBroken] = useState(true);
  const [titleVisible, setTitleVisible] = useState(false);

  // Animation progress ref for smooth lerping
  const animProgressRef = useRef(0); // 0 = closed, 1 = fully broken open
  const targetProgressRef = useRef(1); // target state
  const mousePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    // Initial sequence: start closed, then break open smoothly after 300ms
    const timer = setTimeout(() => {
      targetProgressRef.current = 1;
      setIsBroken(true);
    }, 300);

    const titleTimer = setTimeout(() => {
      setTitleVisible(true);
    }, 700);

    return () => {
      clearTimeout(timer);
      clearTimeout(titleTimer);
    };
  }, []);

  const toggleBreak = () => {
    if (targetProgressRef.current > 0.5) {
      targetProgressRef.current = 0;
      setIsBroken(false);
      setTitleVisible(false);
    } else {
      targetProgressRef.current = 1;
      setIsBroken(true);
      setTimeout(() => setTitleVisible(true), 400);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || window.innerHeight - 120;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x09090b, 0.035);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: 'high-performance' 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xcccccc, 1.8);
    rimLight.position.set(-4, -4, -3);
    scene.add(rimLight);

    const corePointLight = new THREE.PointLight(0xffffff, 3.0, 8);
    corePointLight.position.set(0, 0, 0);
    scene.add(corePointLight);

    // --- 3D Capsule Geometry Construction ---
    const capsuleGroup = new THREE.Group();
    scene.add(capsuleGroup);

    const radius = 0.75;
    const halfLength = 0.85;

    // Materials - Pure Monochromatic Titanium & Frosted Crystal Glass
    // Top Half Material (Translucent Frosted Platinum Glass Sheen)
    const topMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf4f4f5,
      emissive: 0x27272a,
      emissiveIntensity: 0.2,
      roughness: 0.15,
      metalness: 0.15,
      transmission: 0.75,
      thickness: 0.8,
      transparent: true,
      opacity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });

    // Bottom Half Material (Obsidian Matte Titanium)
    const bottomMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x18181b,
      emissive: 0x09090b,
      emissiveIntensity: 0.1,
      roughness: 0.22,
      metalness: 0.9,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15
    });

    // Middle Metallic Seam Ring (Polished Platinum Silver)
    const ringGeo = new THREE.TorusGeometry(radius * 1.01, 0.04, 16, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x52525b,
      emissiveIntensity: 0.3
    });
    const seamRing = new THREE.Mesh(ringGeo, ringMat);
    seamRing.rotation.x = Math.PI / 2;

    // Top Cap Assembly (Cylinder + Top Sphere)
    const topGroup = new THREE.Group();
    const topCylGeo = new THREE.CylinderGeometry(radius, radius, halfLength, 32, 1, true);
    const topCylMesh = new THREE.Mesh(topCylGeo, topMaterial);
    topCylMesh.position.y = halfLength / 2;

    const topSphereGeo = new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const topSphereMesh = new THREE.Mesh(topSphereGeo, topMaterial);
    topSphereMesh.position.y = halfLength;

    topGroup.add(topCylMesh);
    topGroup.add(topSphereMesh);
    topGroup.add(seamRing.clone());
    capsuleGroup.add(topGroup);

    // Bottom Cap Assembly (Cylinder + Bottom Sphere)
    const bottomGroup = new THREE.Group();
    const botCylGeo = new THREE.CylinderGeometry(radius, radius, halfLength, 32, 1, true);
    const botCylMesh = new THREE.Mesh(botCylGeo, bottomMaterial);
    botCylMesh.position.y = -halfLength / 2;

    const botSphereGeo = new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const botSphereMesh = new THREE.Mesh(botSphereGeo, bottomMaterial);
    botSphereMesh.position.y = -halfLength;

    bottomGroup.add(botCylMesh);
    bottomGroup.add(botSphereMesh);
    capsuleGroup.add(bottomGroup);

    // Inner Glowing Core / Pill Core Lattice (Monochrome Platinum Silver)
    const coreGeo = new THREE.IcosahedronGeometry(0.45, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x71717a,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      wireframe: true
    });
    const innerCore = new THREE.Mesh(coreGeo, coreMat);
    capsuleGroup.add(innerCore);

    // --- Molecular Bio-Particle Vortex (Monochrome Shimmer) ---
    const particleCount = 220;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    const particlesData: ParticleData[] = [];
    const colorChoices = [
      new THREE.Color(0xffffff), // Pure White
      new THREE.Color(0xe4e4e7), // Platinum Light Grey
      new THREE.Color(0xa1a1aa), // Silver Grey
      new THREE.Color(0x71717a)  // Neutral Slate Grey
    ];

    for (let i = 0; i < particleCount; i++) {
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.acos(Math.random() * 2 - 1);
      const speed = 0.8 + Math.random() * 2.2;

      const dir = new THREE.Vector3(
        Math.sin(theta) * Math.cos(phi),
        Math.sin(theta) * Math.sin(phi),
        Math.cos(theta)
      );

      const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];

      particlesData.push({
        pos: new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4),
        velocity: dir.multiplyScalar(speed),
        rotSpeed: new THREE.Vector3(Math.random() * 0.02, Math.random() * 0.02, Math.random() * 0.02),
        size: 0.04 + Math.random() * 0.08,
        color: color
      });

      particlePositions[i * 3] = particlesData[i].pos.x;
      particlePositions[i * 3 + 1] = particlesData[i].pos.y;
      particlePositions[i * 3 + 2] = particlesData[i].pos.z;

      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;

      particleScales[i] = particlesData[i].size;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Create custom particle material using circular monochrome texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.35, 'rgba(244, 244, 245, 0.8)');
      gradient.addColorStop(0.8, 'rgba(161, 161, 170, 0.25)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.16,
      map: particleTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(particleGeo, particleMaterial);
    scene.add(particleSystem);

    // Initial capsule tilt
    capsuleGroup.rotation.z = -Math.PI / 6;
    capsuleGroup.rotation.x = Math.PI / 8;

    // --- Mouse Parallax Handler ---
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePosRef.current.targetX = x * 0.4;
      mousePosRef.current.targetY = y * 0.4;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // --- Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || window.innerHeight - 120;
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

      // Smooth lerp progress toward target
      const diff = targetProgressRef.current - animProgressRef.current;
      animProgressRef.current += diff * (delta * 4.5);

      const p = animProgressRef.current;

      // Mouse Parallax Smooth Lerp
      mousePosRef.current.x += (mousePosRef.current.targetX - mousePosRef.current.x) * 0.08;
      mousePosRef.current.y += (mousePosRef.current.targetY - mousePosRef.current.y) * 0.08;

      // Capsule Base Float & Tilt
      const floatY = Math.sin(elapsed * 1.5) * 0.12;
      capsuleGroup.position.y = floatY;
      capsuleGroup.rotation.y = elapsed * 0.3 + mousePosRef.current.x;
      capsuleGroup.rotation.x = Math.PI / 8 + mousePosRef.current.y * 0.5;

      // Top Half Break Separation Physics
      const topSeparation = p * 1.6;
      topGroup.position.y = topSeparation;
      topGroup.position.x = -p * 0.6;
      topGroup.position.z = p * 0.4;
      topGroup.rotation.z = -p * 0.55;
      topGroup.rotation.x = p * 0.35;

      // Bottom Half Break Separation Physics
      const botSeparation = -p * 1.6;
      bottomGroup.position.y = botSeparation;
      bottomGroup.position.x = p * 0.6;
      bottomGroup.position.z = -p * 0.4;
      bottomGroup.rotation.z = p * 0.55;
      bottomGroup.rotation.x = -p * 0.35;

      // Inner Core rotation and pulse
      innerCore.rotation.x += 0.015;
      innerCore.rotation.y += 0.02;
      const coreScale = 0.7 + Math.sin(elapsed * 4) * 0.15 + (1 - p) * 0.3;
      innerCore.scale.set(coreScale, coreScale, coreScale);
      corePointLight.intensity = 2.0 + p * 3.0 + Math.sin(elapsed * 6) * 0.8;

      // Particle Dispersal Physics
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const pData = particlesData[i];
        
        if (p > 0.01) {
          const distScale = Math.min(p * 2.8, 2.5);
          const orbitAngle = elapsed * 0.4 + (i * 0.05);

          const curX = pData.velocity.x * distScale + Math.cos(orbitAngle) * (0.3 * p);
          const curY = pData.velocity.y * distScale + floatY + Math.sin(orbitAngle) * (0.3 * p);
          const curZ = pData.velocity.z * distScale;

          positions[i * 3] = curX;
          positions[i * 3 + 1] = curY;
          positions[i * 3 + 2] = curZ;
        } else {
          positions[i * 3] = (Math.random() - 0.5) * 0.2;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 0.4 + floatY;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;
      particleMaterial.opacity = Math.min(p * 1.2, 0.95);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
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
    };
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-6.5rem)] min-h-[580px] rounded-2xl bg-background border border-surface-border overflow-hidden shadow-card flex flex-col justify-between">
      {/* Background Ambience & Grid in Pure Monochrome */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* 3D WebGL Canvas Layer */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10"
      />

      {/* Floating Interactive Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
        <button
          onClick={toggleBreak}
          className="inline-flex items-center space-x-1.5 rounded-lg bg-surface-raised/90 hover:bg-surface-overlay border border-surface-border px-3 py-1.5 text-[11px] font-mono font-medium text-gray-300 hover:text-white transition-all shadow-specular backdrop-blur-md"
          title="Toggle Capsule Rupture Physics"
        >
          <RotateCcw className={`h-3.5 w-3.5 text-gray-300 transition-transform duration-500 ${isBroken ? 'rotate-180' : ''}`} />
          <span>{isBroken ? 'Reassemble Capsule' : 'Rupture Capsule'}</span>
        </button>
      </div>

      {/* Emerged Title & Hero Content Overlay (Synchronized with Capsule Break) */}
      <div 
        className={`relative z-20 flex flex-col justify-between h-full p-6 sm:p-10 pointer-events-none transition-all duration-700 ease-out ${
          titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Top Badging */}
        <div className="flex items-center space-x-2">
          <div className="inline-flex items-center space-x-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-[11px] font-mono text-gray-200 font-medium backdrop-blur-md">
            <Cpu className="h-3.5 w-3.5 animate-pulse text-white" />
            <span>NEO4J AURADB CLOUD • MULTI-HOP BIOMEDICAL GRAPH</span>
          </div>
        </div>

        {/* Center / Bottom Title Typography Emerging from the Capsule Core */}
        <div className="max-w-3xl space-y-4 pointer-events-auto">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-xs font-mono text-gray-300 uppercase tracking-widest font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span>Computational Drug Repurposing Engine</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Drug<span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-300 to-neutral-500">Copilot</span>
            </h1>
            
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
              Unlocking hidden therapeutic mechanisms through high-precision graph traversal across <strong>ChEMBL</strong>, <strong>Open Targets</strong>, <strong>UniProtKB</strong>, <strong>PubChem</strong>, and <strong>ClinicalTrials.gov</strong>.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/copilot"
              className="inline-flex items-center space-x-2 rounded-lg bg-white hover:bg-neutral-200 text-black px-5 py-3 text-xs font-bold shadow-specular-strong transition-all transform hover:-translate-y-0.5"
            >
              <Bot className="h-4 w-4 text-black" />
              <span>Launch AI Copilot</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 text-black" />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center space-x-2 rounded-lg bg-surface-raised/90 hover:bg-surface-overlay border border-surface-border px-5 py-3 text-xs font-semibold text-white transition-all shadow-specular backdrop-blur-md"
            >
              <Network className="h-4 w-4 text-gray-300" />
              <span>Explore Knowledge Graph</span>
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center space-x-2 rounded-lg bg-surface-raised/80 hover:bg-surface-overlay border border-surface-border px-4 py-3 text-xs font-medium text-gray-300 hover:text-white transition-all shadow-specular backdrop-blur-md"
            >
              <Database className="h-3.5 w-3.5 text-gray-400" />
              <span>Live AuraDB Status</span>
            </Link>
          </div>
        </div>

        {/* Bottom Feature Micro-Pills */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-gray-400 pt-4 border-t border-surface-border">
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
    </div>
  );
}
