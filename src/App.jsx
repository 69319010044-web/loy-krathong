import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Sunset,
  Moon,
  Sun,
  Eye,
  RotateCcw,
  Bell,
  Zap,
  Music,
  X,
  Send,
  HeartHandshake
} from 'lucide-react';
import confetti from 'canvas-confetti';

// =========================================================================
// 1. WEB AUDIO API SYNTHESIZER: Traditional Thai Instruments & Loy Krathong Song
// =========================================================================
class FestivalAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.volume = 0.6;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicTimer = null;
    this.isPlaying = false;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    this.startRiverAmbience();
    this.startLoyKrathongSong();
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  startRiverAmbience() {
    if (!this.ctx) return;
    const len = 2 * this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0.0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (last + 0.02 * white) / 1.02;
      last = data[i];
      data[i] *= 1.8;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.2, this.ctx.currentTime);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.sfxGain);
    src.start();
  }

  playTempleBell() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    [1, 2.02, 3.01].forEach((m, idx) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.frequency.setValueAtTime(587.33 * m, now);
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.2 / (idx + 1), now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 3.0);
    });
  }

  playFirecrackers() {
    if (!this.ctx || this.isMuted) return;
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let j = 0; j < data.length; j++) {
          data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (this.ctx.sampleRate * 0.01));
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.3, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        src.connect(g);
        g.connect(this.sfxGain);
        src.start(now);
      }, i * 65 + Math.random() * 20);
    }
  }

  playWaterSplash() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);
    g.gain.setValueAtTime(0.35, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  playLanternWhoosh() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const len = 0.7;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.setValueAtTime(300, now);
    f.frequency.exponentialRampToValueAtTime(700, now + len);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.3, now);
    g.gain.exponentialRampToValueAtTime(0.01, now + len);
    src.connect(f);
    f.connect(g);
    g.connect(this.sfxGain);
    src.start(now);
  }

  playRanadNote(freq, time, dur = 0.4) {
    if (!this.ctx || this.isMuted || freq === 0) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    // Mallet click
    const click = this.ctx.createOscillator();
    const clickG = this.ctx.createGain();
    click.type = 'triangle';
    click.frequency.setValueAtTime(freq * 3, time);
    clickG.gain.setValueAtTime(0.06, time);
    clickG.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);
    click.connect(clickG);
    clickG.connect(this.musicGain);
    click.start(time);
    click.stop(time + 0.03);

    g.gain.setValueAtTime(0.001, time);
    g.gain.linearRampToValueAtTime(0.2, time + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(g);
    g.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + dur);
  }

  playChing(isChing, time) {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2950, time);
    g.gain.setValueAtTime(0.001, time);
    g.gain.linearRampToValueAtTime(0.08, time + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, time + (isChing ? 0.6 : 0.08));
    osc.connect(g);
    g.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + (isChing ? 0.6 : 0.08));
  }

  startLoyKrathongSong() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    const N = {
      G4: 392.00, A4: 440.00, C5: 523.25, D5: 587.33, E5: 659.25, REST: 0
    };
    const s = 0.28, q = 0.56, h = 1.12;

    const melody = [
      // วันเพ็ญเดือนสิบสอง น้ำนองเต็มตลิ่ง
      { f: N.G4, d: s, c: true }, { f: N.A4, d: s }, { f: N.C5, d: q },
      { f: N.C5, d: s, c: false }, { f: N.D5, d: s }, { f: N.C5, d: s }, { f: N.A4, d: s },
      { f: N.G4, d: q, c: true }, { f: N.REST, d: s }, { f: N.G4, d: s, c: false },
      { f: N.A4, d: s }, { f: N.C5, d: s }, { f: N.D5, d: q, c: true },
      { f: N.E5, d: s }, { f: N.D5, d: s }, { f: N.C5, d: h, c: false },

      // เราทั้งหลายชายหญิง สนุกกันจริงวันลอยกระทง
      { f: N.G4, d: s, c: true }, { f: N.A4, d: s }, { f: N.C5, d: q },
      { f: N.C5, d: s, c: false }, { f: N.D5, d: s }, { f: N.C5, d: s }, { f: N.A4, d: s },
      { f: N.G4, d: q, c: true }, { f: N.REST, d: s }, { f: N.G4, d: s, c: false },
      { f: N.A4, d: s }, { f: N.C5, d: s }, { f: N.D5, d: q, c: true },
      { f: N.E5, d: s }, { f: N.D5, d: s }, { f: N.C5, d: h, c: false },

      // ลอย ลอยกระทง ลอย ลอยกระทง
      { f: N.E5, d: q, c: true }, { f: N.E5, d: s }, { f: N.D5, d: s },
      { f: N.C5, d: q, c: false }, { f: N.D5, d: q },
      { f: N.E5, d: q, c: true }, { f: N.E5, d: s }, { f: N.D5, d: s },
      { f: N.C5, d: q, c: false }, { f: N.D5, d: q },

      // ลอยกระทงกันแล้ว ขอเชิญน้องแก้วออกมารำวง
      { f: N.E5, d: s, c: true }, { f: N.D5, d: s }, { f: N.C5, d: s }, { f: N.A4, d: s },
      { f: N.G4, d: q, c: false }, { f: N.A4, d: s }, { f: N.C5, d: s },
      { f: N.D5, d: q, c: true }, { f: N.C5, d: s }, { f: N.A4, d: s },
      { f: N.G4, d: q, c: false }, { f: N.A4, d: q },

      // รำวงวันลอยกระทง รำวงวันลอยกระทง
      { f: N.C5, d: s, c: true }, { f: N.D5, d: s }, { f: N.C5, d: s }, { f: N.A4, d: s },
      { f: N.G4, d: q, c: false }, { f: N.C5, d: q },
      { f: N.C5, d: s, c: true }, { f: N.D5, d: s }, { f: N.C5, d: s }, { f: N.A4, d: s },
      { f: N.G4, d: q, c: false }, { f: N.A4, d: q },

      // บุญจะส่งให้เราสุขใจ
      { f: N.G4, d: s, c: true }, { f: N.A4, d: s }, { f: N.C5, d: q },
      { f: N.D5, d: s, c: false }, { f: N.C5, d: s }, { f: N.A4, d: s }, { f: N.G4, d: s },
      { f: N.C5, d: h, c: true }, { f: N.REST, d: q, c: false }
    ];

    let idx = 0;
    const playNote = () => {
      if (!this.isPlaying || !this.ctx) return;
      const note = melody[idx];
      const now = this.ctx.currentTime;
      if (note.f > 0) {
        this.playRanadNote(note.f, now, note.d * 1.1);
      }
      if (note.c !== undefined) {
        this.playChing(note.c, now);
      }
      idx = (idx + 1) % melody.length;
      this.musicTimer = setTimeout(playNote, note.d * 1000);
    };
    playNote();
  }
}

const festivalAudio = new FestivalAudio();

// =========================================================================
// 2. MAIN APP COMPONENT (Rock-Solid Pure Three.js Canvas Engine)
// =========================================================================
export default function App() {
  const mountRef = useRef(null);

  // States
  const [timeOfDay, setTimeOfDay] = useState(1); // 0: Sunset, 1: Twilight, 2: Full Moon
  const [isPhotoActive, setIsPhotoActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.6);

  // Modals
  const [isKrathongModalOpen, setIsKrathongModalOpen] = useState(false);
  const [isLanternModalOpen, setIsLanternModalOpen] = useState(false);

  // Custom Items
  const [userKrathongsCount, setUserKrathongsCount] = useState(0);
  const [userLanternsCount, setUserLanternsCount] = useState(0);

  // Ref to scene objects for dynamic updates
  const sceneStateRef = useRef({
    waterMesh: null,
    ambientLight: null,
    dirLight: null,
    ferrisWheel: null,
    cabins: [],
    boat: null,
    fireflies: null,
    userKrathongs: [],
    userLanterns: [],
    ambientKrathongs: [],
    ambientLanterns: [],
    fireworks: []
  });

  // Start audio on first user action
  useEffect(() => {
    const handleGesture = () => {
      festivalAudio.init();
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
    window.addEventListener('click', handleGesture);
    window.addEventListener('keydown', handleGesture);
    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
  }, []);

  // Initialize and run Three.js direct canvas loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#070b19');
    scene.fog = new THREE.FogExp2('#070b19', 0.015);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 300);
    camera.position.set(0, 9, 26);
    camera.lookAt(0, 3, -6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight('#38bdf8', 0.5);
    scene.add(ambientLight);
    sceneStateRef.current.ambientLight = ambientLight;

    const dirLight = new THREE.DirectionalLight('#fef08a', 1.8);
    dirLight.position.set(10, 30, -35);
    scene.add(dirLight);
    sceneStateRef.current.dirLight = dirLight;

    // 3. Moon & Sky Stars
    const moonGeo = new THREE.SphereGeometry(4, 24, 24);
    const moonMat = new THREE.MeshBasicMaterial({ color: '#fef08a' });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(8, 30, -50);
    scene.add(moon);

    // Stars
    const starCount = 1500;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3 + 0] = (Math.random() - 0.5) * 200;
      starPos[i * 3 + 1] = Math.random() * 80 + 10;
      starPos[i * 3 + 2] = -Math.random() * 120 - 20;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: '#ffffff', size: 0.35, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 4. Ground River Bank & Promenade (ตลิ่งและลานวัดริมน้ำ)
    // 4.1 Ground River Bank (ตลิ่งฝั่งวัดและงานวัด)
    const bankGeo = new THREE.BoxGeometry(200, 2.5, 60);
    const bankMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.85 });
    const bank = new THREE.Mesh(bankGeo, bankMat);
    bank.position.set(0, 0.8, -25);
    scene.add(bank);

    // Stone / Paved Promenade floor (ลานคนเดินและงานวัดปูหิน)
    const paveGeo = new THREE.PlaneGeometry(190, 48);
    const paveMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.6 });
    const pave = new THREE.Mesh(paveGeo, paveMat);
    pave.rotation.x = -Math.PI / 2;
    pave.position.set(0, 2.06, -22);
    scene.add(pave);

    // Riverbank Steps (บันไดท่าน้ำหินทอดยาวลงสู่แม่น้ำ)
    for (let step = 0; step < 7; step++) {
      const stepMesh = new THREE.Mesh(
        new THREE.BoxGeometry(80, 0.35, 1.4),
        new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.7 })
      );
      stepMesh.position.set(0, 2.0 - step * 0.32, -0.5 + step * 0.9);
      scene.add(stepMesh);
    }

    // Wooden Pier / Floating Dock (สะพานไม้และโป๊ะท่าน้ำลอยกระทง)
    const pierGroup = new THREE.Group();
    pierGroup.position.set(0, 0.1, 4.5);
    const pierPlanks = new THREE.Mesh(
      new THREE.BoxGeometry(18, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.8 })
    );
    pierGroup.add(pierPlanks);

    // Pier wooden railings and lantern posts
    [-8.5, 8.5].forEach((rx) => {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 1.1, 8),
        new THREE.MeshStandardMaterial({ color: '#451a03' })
      );
      rail.position.set(rx, 0.6, 0);
      pierGroup.add(rail);

      const postLight = new THREE.PointLight('#f59e0b', 1.5, 8);
      postLight.position.set(rx, 1.2, 3.5);
      pierGroup.add(postLight);
    });
    scene.add(pierGroup);

    // 4.2 Opposite River Bank (ตลิ่งฝั่งตรงข้ามในระยะไกล เพื่อความสมดุล)
    const oppBank = new THREE.Mesh(
      new THREE.BoxGeometry(220, 4, 50),
      new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.9 })
    );
    oppBank.position.set(0, 1.2, 48);
    scene.add(oppBank);

    // 4.3 Coconut Palms & River Trees (ต้นมะพร้าวและแมกไม้ริมตลิ่ง)
    const treeGroup = new THREE.Group();
    const palmPositions = [
      [-28, 2.0, -10, 1.2, 0.3],
      [-36, 2.0, -4, 1.0, -0.2],
      [-22, 2.0, -2, 1.1, 0.25],
      [22, 2.0, -3, 1.1, -0.3],
      [30, 2.0, -8, 1.25, 0.2],
      [38, 2.0, -14, 0.95, -0.25],
      // Trees on opposite bank
      [-40, 3.0, 35, 1.4, 0.2],
      [0, 3.0, 40, 1.3, -0.15],
      [45, 3.0, 38, 1.5, 0.25]
    ];

    palmPositions.forEach((tp) => {
      const palm = new THREE.Group();
      palm.position.set(tp[0], tp[1], tp[2]);
      palm.scale.setScalar(tp[3]);
      palm.rotation.z = tp[4];

      // Trunk
      for (let s = 0; s < 5; s++) {
        const seg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3 - s * 0.02, 0.34 - s * 0.02, 1.6, 8),
          new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.85 })
        );
        seg.position.set(s * 0.15, s * 1.4 + 0.8, 0);
        palm.add(seg);
      }

      // Fronds
      for (let f = 0; f < 6; f++) {
        const frond = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.06, 3.6),
          new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.6, side: THREE.DoubleSide })
        );
        const ang = (f / 6) * Math.PI * 2;
        frond.position.set(0.6 + Math.cos(ang) * 1.5, 7.5, Math.sin(ang) * 1.5);
        frond.rotation.set(0.4, ang, 0.3);
        palm.add(frond);
      }
      treeGroup.add(palm);
    });
    scene.add(treeGroup);

    // 4.4 Realistic Human Crowd Models with Live Animations (ผู้คนขยับได้ เดินไปมา ก้มลอยกระทง ยกมือไหว้)
    const crowdGroup = new THREE.Group();
    const skinMat = new THREE.MeshStandardMaterial({ color: '#fcd34d', roughness: 0.6 });
    const hairMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.9 });

    const peopleList = [];
    const peopleConfig = [
      // คนกราบและก้มปล่อยกระทงตรงโป๊ะท่าน้ำ
      { x: -3.5, y: 0.25, z: 6.2, col: '#f43f5e', type: 'kneeling', rot: 0, speed: 1.5, offset: 0 },
      { x: 3.5, y: 0.25, z: 6.2, col: '#3b82f6', type: 'kneeling', rot: 0, speed: 1.8, offset: 1.2 },
      { x: 0.0, y: 0.25, z: 7.2, col: '#fbbf24', type: 'kneeling', rot: 0, speed: 1.4, offset: 2.5 },
      // คนยืนไหว้และชมพลุริมบันไดท่าน้ำ
      { x: -7, y: 1.5, z: 2.2, col: '#10b981', type: 'praying', rot: -0.2, speed: 1.0, offset: 0.5 },
      { x: 7, y: 1.5, z: 2.2, col: '#ec4899', type: 'praying', rot: 0.2, speed: 1.2, offset: 1.8 },
      { x: -14, y: 2.1, z: 0.5, col: '#f97316', type: 'gazing', rot: -0.4, speed: 0.8, offset: 2.0 },
      { x: 14, y: 2.1, z: 0.5, col: '#8b5cf6', type: 'gazing', rot: 0.4, speed: 0.9, offset: 0.7 },
      // คนเดินไป-มาชมงานวัดริมร้านค้า (Walking Strollers)
      { x: -18, y: 2.1, z: -8, col: '#e11d48', type: 'walking', rot: Math.PI / 2, speed: 1.6, offset: 0, minX: -26, maxX: -4, dir: 1 },
      { x: -10, y: 2.1, z: -10, col: '#0284c7', type: 'walking', rot: -Math.PI / 2, speed: 2.0, offset: 1.5, minX: -24, maxX: 6, dir: -1 },
      { x: 2, y: 2.1, z: -8.5, col: '#d97706', type: 'walking', rot: Math.PI / 2, speed: 1.8, offset: 0.8, minX: -12, maxX: 18, dir: 1 },
      { x: 12, y: 2.1, z: -10.5, col: '#059669', type: 'walking', rot: -Math.PI / 2, speed: 1.5, offset: 2.2, minX: -2, maxX: 25, dir: -1 },
      { x: 20, y: 2.1, z: -7.5, col: '#c026d3', type: 'walking', rot: Math.PI / 2, speed: 2.2, offset: 3.1, minX: 6, maxX: 30, dir: 1 }
    ];

    peopleConfig.forEach((p, idx) => {
      const person = new THREE.Group();
      person.position.set(p.x, p.y, p.z);
      person.rotation.y = p.rot;

      const clothMat = new THREE.MeshStandardMaterial({ color: p.col, roughness: 0.5 });
      const pantsMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.7 });

      let torso, head, armL, armR, legL, legR;

      if (p.type === 'kneeling') {
        // ท่าคุกเข่าปล่อยกระทง
        const legs = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.28, 0.6), pantsMat);
        legs.position.set(0, 0.14, -0.1);
        person.add(legs);

        torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.55, 0.26), clothMat);
        torso.position.set(0, 0.5, 0.05);
        torso.rotation.x = 0.25;
        person.add(torso);

        head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 10), skinMat);
        head.position.set(0, 0.9, 0.16);
        person.add(head);

        armL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.45), clothMat);
        armL.position.set(-0.24, 0.45, 0.22);
        armL.rotation.x = -0.55;
        person.add(armL);

        armR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.45), clothMat);
        armR.position.set(0.24, 0.45, 0.22);
        armR.rotation.x = -0.55;
        person.add(armR);

        // กระทงจิ๋วสมส่วนในมือ (ขนาด 0.25m สวยงาม)
        const miniK = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.06, 8), new THREE.MeshStandardMaterial({ color: '#4d7c0f' }));
        miniK.position.set(0, 0.32, 0.42);
        const miniCandle = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.08, 4), new THREE.MeshBasicMaterial({ color: '#fef08a' }));
        miniCandle.position.set(0, 0.39, 0.42);
        person.add(miniK);
        person.add(miniCandle);
      } else {
        // ท่ายืน/เดิน (Standing & Walking)
        legL = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.75, 6), pantsMat);
        legL.position.set(-0.14, 0.38, 0);
        legR = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.75, 6), pantsMat);
        legR.position.set(0.14, 0.38, 0);
        person.add(legL);
        person.add(legR);

        torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.65, 0.24), clothMat);
        torso.position.set(0, 1.05, 0);
        person.add(torso);

        // สไบเฉียงสีทองพาดบ่า
        const sabai = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.68, 0.26), new THREE.MeshStandardMaterial({ color: '#fef08a', metalness: 0.3 }));
        sabai.position.set(-0.1, 1.05, 0.01);
        person.add(sabai);

        head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), skinMat);
        head.position.set(0, 1.5, 0);
        person.add(head);

        const hair = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 8), hairMat);
        hair.position.set(0, 1.56, -0.05);
        person.add(hair);

        armL = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.58), clothMat);
        armL.position.set(-0.28, 0.98, 0);
        armR = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.58), clothMat);
        armR.position.set(0.28, 0.98, 0);
        person.add(armL);
        person.add(armR);

        // หากเป็นคนพนมมือไหว้พระแม่คงคา
        if (p.type === 'praying') {
          armL.rotation.set(-0.6, 0.4, -0.3);
          armR.rotation.set(-0.6, -0.4, 0.3);
          armL.position.set(-0.12, 1.05, 0.2);
          armR.position.set(0.12, 1.05, 0.2);
        }
      }

      peopleList.push({
        group: person,
        config: p,
        torso,
        head,
        armL,
        armR,
        legL,
        legR
      });
      crowdGroup.add(person);
    });

    scene.add(crowdGroup);
    sceneStateRef.current.peopleList = peopleList;

    // 5. River Water (แม่น้ำตรงกลางระหว่างสองฝั่งตลิ่ง)
    const waterGeo = new THREE.PlaneGeometry(220, 42, 32, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: '#082647',
      roughness: 0.15,
      metalness: 0.75,
      transparent: true,
      opacity: 0.94
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.2, 22);
    scene.add(water);
    sceneStateRef.current.waterMesh = water;

    // 6. THAI TEMPLE & GOLDEN CHEDI
    const templeGroup = new THREE.Group();
    templeGroup.position.set(0, 0, -28);

    // Base plinth
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(24, 2, 18),
      new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.4 })
    );
    plinth.position.y = 1;
    templeGroup.add(plinth);

    // Hall
    const hall = new THREE.Mesh(
      new THREE.BoxGeometry(16, 6, 12),
      new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 })
    );
    hall.position.y = 5;
    templeGroup.add(hall);

    // Golden Temple Door
    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 4.2),
      new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.8, roughness: 0.2 })
    );
    door.position.set(0, 4.2, 6.05);
    templeGroup.add(door);

    // Pillars
    [-6, -2, 2, 6].forEach((px) => {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.45, 6, 12),
        new THREE.MeshStandardMaterial({ color: '#ffffff' })
      );
      pillar.position.set(px, 5, 6.7);
      templeGroup.add(pillar);
    });

    // Tiered Thai Roof
    [
      { y: 8.8, w: 18, d: 14, h: 2.6, col: '#b91c1c' },
      { y: 10.6, w: 14, d: 11, h: 2.2, col: '#991b1b' },
      { y: 12.2, w: 10, d: 8, h: 2.0, col: '#7f1d1d' }
    ].forEach((rf) => {
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(rf.w * 0.55, rf.h, 4),
        new THREE.MeshStandardMaterial({ color: rf.col, roughness: 0.4 })
      );
      roof.position.y = rf.y;
      templeGroup.add(roof);

      const goldTrim = new THREE.Mesh(
        new THREE.BoxGeometry(rf.w, 0.25, rf.d),
        new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.8 })
      );
      goldTrim.position.y = rf.y - rf.h * 0.45;
      templeGroup.add(goldTrim);
    });

    // Golden Chedi (Stupa)
    const chediGroup = new THREE.Group();
    chediGroup.position.set(16, 0, 0);
    const cBase = new THREE.Mesh(
      new THREE.CylinderGeometry(5, 6.5, 2.5, 8),
      new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.85, roughness: 0.2 })
    );
    cBase.position.y = 1.25;
    chediGroup.add(cBase);

    const cBell = new THREE.Mesh(
      new THREE.SphereGeometry(3.5, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.65),
      new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.9, roughness: 0.15 })
    );
    cBell.position.y = 4.2;
    chediGroup.add(cBell);

    const cSpire = new THREE.Mesh(
      new THREE.ConeGeometry(1.2, 8, 16),
      new THREE.MeshStandardMaterial({ color: '#fde047', metalness: 0.95, roughness: 0.1 })
    );
    cSpire.position.y = 10.5;
    chediGroup.add(cSpire);

    templeGroup.add(chediGroup);

    // Warm Temple lights
    const templeLight = new THREE.PointLight('#f59e0b', 3.5, 30);
    templeLight.position.set(0, 6, 8);
    templeGroup.add(templeLight);
    scene.add(templeGroup);

    // 7. VIBRANT TEMPLE FAIR & FERRIS WHEEL
    const fairGroup = new THREE.Group();
    fairGroup.position.set(-18, 0, -22);

    const wheelRadius = 7.5;
    const wheelHub = new THREE.Group();
    wheelHub.position.y = wheelRadius + 2;

    // Wheel Ring
    const wheelRim = new THREE.Mesh(
      new THREE.TorusGeometry(wheelRadius, 0.1, 8, 32),
      new THREE.MeshBasicMaterial({ color: '#ec4899' })
    );
    wheelHub.add(wheelRim);

    // Spokes and Cabins
    const cabins = [];
    const spokeCount = 8;
    const cabinColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#a855f7'];

    for (let i = 0; i < spokeCount; i++) {
      const angle = (i / spokeCount) * Math.PI * 2;
      const spoke = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, wheelRadius, 6),
        new THREE.MeshStandardMaterial({ color: '#ffffff' })
      );
      spoke.position.set((Math.cos(angle) * wheelRadius) / 2, (Math.sin(angle) * wheelRadius) / 2, 0);
      spoke.rotation.z = angle + Math.PI / 2;
      wheelHub.add(spoke);

      // Cabin
      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.0, 1.4),
        new THREE.MeshStandardMaterial({ color: cabinColors[i % cabinColors.length] })
      );
      cabin.position.set(Math.cos(angle) * wheelRadius, Math.sin(angle) * wheelRadius, 0);
      wheelHub.add(cabin);
      cabins.push(cabin);
    }

    fairGroup.add(wheelHub);
    sceneStateRef.current.ferrisWheel = wheelHub;
    sceneStateRef.current.cabins = cabins;

    // Support legs
    [-1, 1].forEach((lx) => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.25, 10, 8),
        new THREE.MeshStandardMaterial({ color: '#3b82f6' })
      );
      leg.position.set(lx * 2.5, 4.5, 0);
      leg.rotation.z = -lx * 0.3;
      fairGroup.add(leg);
    });

    // Detailed Market Stalls & Fair Booths (ซุ้มร้านค้างานวัดละเอียดสูงหลากหลายร้าน)
    const stallsData = [
      { x: 10, z: 4, name: 'ผัดไทย โบราณ', color: '#f97316', roof: '#ea580c', signCol: '#fb923c' },
      { x: 15, z: 4, name: 'ลูกชิ้นปิ้ง น้ำจิ้มเด็ด', color: '#eab308', roof: '#ca8a04', signCol: '#fde047' },
      { x: 20, z: 4, name: 'ขนมเบื้องหวานมัน', color: '#ec4899', roof: '#db2777', signCol: '#f472b6' },
      { x: 25, z: 4, name: 'น้ำอ้อยคั้นสด & ชาไทย', color: '#10b981', roof: '#059669', signCol: '#34d399' },
      { x: 5, z: 4, name: 'กระทงดอกไม้สด', color: '#3b82f6', roof: '#2563eb', signCol: '#60a5fa' },
      { x: 0, z: 4, name: 'สอยดาวการกุศล', color: '#a855f7', roof: '#7e22ce', signCol: '#c084fc' }
    ];

    stallsData.forEach((s) => {
      const stallGroup = new THREE.Group();
      stallGroup.position.set(s.x, 0, s.z);

      // ไม้เคาน์เตอร์ร้าน
      const counter = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 1.8, 2.2),
        new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.7 })
      );
      counter.position.y = 0.9;
      stallGroup.add(counter);

      // โต๊ะวางของ/สินค้าหน้าร้าน
      const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 0.15, 0.7),
        new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.4 })
      );
      shelf.position.set(0, 1.85, 0.95);
      stallGroup.add(shelf);

      // เสาเต็นท์ 4 ต้น
      [[-1.6, -0.9], [1.6, -0.9], [-1.6, 0.9], [1.6, 0.9]].forEach(([px, pz]) => {
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 2.8, 6),
          new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.7 })
        );
        pole.position.set(px, 1.4, pz);
        stallGroup.add(pole);
      });

      // หลังคาผ้าใบเต็นท์ทรงจั่วแบบงานวัด
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(2.7, 1.3, 4),
        new THREE.MeshStandardMaterial({ color: s.roof, roughness: 0.4 })
      );
      roof.position.y = 3.2;
      roof.rotation.y = Math.PI / 4;
      stallGroup.add(roof);

      // ป้ายไฟนีออนชื่อร้าน (Neon Glowing Signboard)
      const signMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.6, 0.08),
        new THREE.MeshStandardMaterial({ color: s.signCol, emissive: s.color, emissiveIntensity: 2.2 })
      );
      signMesh.position.set(0, 2.6, 1.15);
      stallGroup.add(signMesh);

      // แสงไฟนีออนประจำร้าน
      const light = new THREE.PointLight(s.color, 2.0, 9);
      light.position.set(0, 2.2, 1.4);
      stallGroup.add(light);

      // โต๊ะและเก้าอี้หน้าร้าน
      const table = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.65, 0.1, 12),
        new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.4 })
      );
      table.position.set(0, 0.7, 2.6);
      stallGroup.add(table);

      const tableLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.7, 6),
        new THREE.MeshStandardMaterial({ color: '#334155' })
      );
      tableLeg.position.set(0, 0.35, 2.6);
      stallGroup.add(tableLeg);

      // เก้าอี้สตูล 2 ตัว
      [-0.7, 0.7].forEach((cx) => {
        const chair = new THREE.Mesh(
          new THREE.CylinderGeometry(0.28, 0.28, 0.45, 10),
          new THREE.MeshStandardMaterial({ color: '#ef4444' })
        );
        chair.position.set(cx, 0.25, 2.6);
        stallGroup.add(chair);
      });

      fairGroup.add(stallGroup);
    });

    // Triangular Bunting Flags
    for (let f = 0; f < 18; f++) {
      const flag = new THREE.Mesh(
        new THREE.ConeGeometry(0.28, 0.5, 3),
        new THREE.MeshStandardMaterial({ color: cabinColors[f % cabinColors.length], side: THREE.DoubleSide })
      );
      flag.position.set(5 + f * 1.2, 3.4 + Math.sin((f / 18) * Math.PI) * -0.5, 6);
      flag.rotation.z = Math.PI;
      fairGroup.add(flag);
    }

    scene.add(fairGroup);

    // 8. RIVER BOAT PASSING BY
    const boatGroup = new THREE.Group();
    boatGroup.position.set(30, 0, 18);
    const hull = new THREE.Mesh(
      new THREE.BoxGeometry(7, 0.9, 1.8),
      new THREE.MeshStandardMaterial({ color: '#57361a' })
    );
    hull.position.y = 0.4;
    boatGroup.add(hull);

    const boatLight = new THREE.PointLight('#fef08a', 2.0, 12);
    boatLight.position.set(0, 1.5, 0);
    boatGroup.add(boatLight);
    scene.add(boatGroup);
    sceneStateRef.current.boat = boatGroup;

    // 9. AMBIENT INSTANCED KRATHONGS (60 Natural-sized Krathongs in river)
    const krathongCount = 60;
    // ปรับสเกลขนาดกระทงให้สมจริงตามธรรมชาติ: กว้าง ~0.45m แทนของเดิม 1.2m
    const kGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.12, 12);
    const kMat = new THREE.MeshStandardMaterial({ color: '#3f6212', roughness: 0.6 });
    const kMesh = new THREE.InstancedMesh(kGeo, kMat, krathongCount);

    // ดอกดาวเรืองสีส้ม/ทองล้อมรอบ
    const flowerGeo = new THREE.TorusGeometry(0.28, 0.08, 6, 12);
    const flowerMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.5 });
    const fMesh = new THREE.InstancedMesh(flowerGeo, flowerMat, krathongCount);

    // เทียนและเปลวไฟส่องสว่าง
    const candleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8);
    const candleMat = new THREE.MeshBasicMaterial({ color: '#fef08a' });
    const cMesh = new THREE.InstancedMesh(candleGeo, candleMat, krathongCount);

    const flameGeo = new THREE.ConeGeometry(0.04, 0.12, 6);
    const flameMat = new THREE.MeshBasicMaterial({ color: '#fb923c' });
    const flMesh = new THREE.InstancedMesh(flameGeo, flameMat, krathongCount);

    const dummy = new THREE.Object3D();
    const ambientKList = [];

    for (let i = 0; i < krathongCount; i++) {
      const item = {
        x: (Math.random() - 0.5) * 90,
        z: Math.random() * 26 + 8,
        speed: 0.8 + Math.random() * 0.9,
        rotSpeed: (Math.random() - 0.5) * 0.5,
        rot: Math.random() * Math.PI * 2,
        bobOffset: Math.random() * Math.PI * 2
      };
      ambientKList.push(item);
    }
    sceneStateRef.current.ambientKrathongs = ambientKList;

    scene.add(kMesh);
    scene.add(fMesh);
    scene.add(cMesh);
    scene.add(flMesh);

    // 10. AMBIENT SKY LANTERNS (45 floating in the sky)
    const lanternCount = 45;
    const lGeo = new THREE.CylinderGeometry(0.5, 0.4, 0.9, 10, 1, true);
    const lMat = new THREE.MeshBasicMaterial({ color: '#f97316', side: THREE.DoubleSide });
    const lMesh = new THREE.InstancedMesh(lGeo, lMat, lanternCount);

    const ambientLList = [];
    for (let i = 0; i < lanternCount; i++) {
      ambientLList.push({
        x: (Math.random() - 0.5) * 90,
        y: Math.random() * 45 + 5,
        z: -Math.random() * 60 + 10,
        speedY: 1.0 + Math.random() * 1.5,
        swayOffset: Math.random() * Math.PI * 2
      });
    }
    sceneStateRef.current.ambientLanterns = ambientLList;
    scene.add(lMesh);

    // 11. FIREFLIES PARTICLES
    const ffCount = 50;
    const ffGeo = new THREE.BufferGeometry();
    const ffPos = new Float32Array(ffCount * 3);
    for (let i = 0; i < ffCount; i++) {
      ffPos[i * 3 + 0] = (Math.random() - 0.5) * 35;
      ffPos[i * 3 + 1] = Math.random() * 5 + 0.5;
      ffPos[i * 3 + 2] = Math.random() * 15 - 5;
    }
    ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));
    const ffMat = new THREE.PointsMaterial({ color: '#a3e635', size: 0.22, transparent: true, opacity: 0.9 });
    const fireflies = new THREE.Points(ffGeo, ffMat);
    scene.add(fireflies);

    // Orbit Drag Controls (Manual lightweight implementation)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = { radius: 28, theta: 0, phi: Math.PI / 2.7 };

    const updateCameraPos = () => {
      spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, spherical.phi));
      spherical.radius = Math.max(8, Math.min(65, spherical.radius));
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 3, -6);
    };
    updateCameraPos();

    const onMouseDown = (e) => {
      if (e.target.tagName === 'CANVAS') {
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      spherical.theta -= dx * 0.006;
      spherical.phi -= dy * 0.006;
      updateCameraPos();
    };
    const onMouseUp = () => {
      isDragging = false;
    };
    const onWheel = (e) => {
      spherical.radius += e.deltaY * 0.03;
      updateCameraPos();
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('wheel', onWheel, { passive: true });

    // Handle Window Resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ==========================================
    // RENDER ANIMATION LOOP
    // ==========================================
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // 1. Water bob
      water.position.y = -0.2 + Math.sin(elapsed * 1.5) * 0.04;

      // 2. Ferris wheel rotation
      if (sceneStateRef.current.ferrisWheel) {
        sceneStateRef.current.ferrisWheel.rotation.z += delta * 0.4;
        sceneStateRef.current.cabins.forEach((c) => {
          c.rotation.z = -sceneStateRef.current.ferrisWheel.rotation.z;
        });
      }

      // 3. Boat cruising
      if (sceneStateRef.current.boat) {
        sceneStateRef.current.boat.position.x -= delta * 3.2;
        sceneStateRef.current.boat.position.y = Math.sin(elapsed * 2.0) * 0.06;
        if (sceneStateRef.current.boat.position.x < -55) sceneStateRef.current.boat.position.x = 55;
      }

      // 4. Update Ambient Krathongs (ขยับคลื่นเบาๆ และลอยล่องตามกระแสน้ำ)
      ambientKList.forEach((k, i) => {
        k.x -= k.speed * delta * 1.3;
        if (k.x < -50) k.x = 50;
        k.rot += k.rotSpeed * delta;
        const bob = Math.sin(elapsed * 2.2 + k.bobOffset) * 0.05;

        // Base
        dummy.position.set(k.x, bob, k.z);
        dummy.rotation.set(0, k.rot, 0);
        dummy.scale.set(1.0, 1.0, 1.0);
        dummy.updateMatrix();
        kMesh.setMatrixAt(i, dummy.matrix);

        // Flowers
        dummy.position.set(k.x, bob + 0.08, k.z);
        dummy.rotation.set(Math.PI / 2, 0, 0);
        dummy.updateMatrix();
        fMesh.setMatrixAt(i, dummy.matrix);

        // Candle
        dummy.position.set(k.x, bob + 0.22, k.z);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        cMesh.setMatrixAt(i, dummy.matrix);

        // Flame
        dummy.position.set(k.x, bob + 0.38, k.z);
        dummy.updateMatrix();
        flMesh.setMatrixAt(i, dummy.matrix);
      });
      kMesh.instanceMatrix.needsUpdate = true;
      fMesh.instanceMatrix.needsUpdate = true;
      cMesh.instanceMatrix.needsUpdate = true;
      flMesh.instanceMatrix.needsUpdate = true;

      // 4.1 Update Live Animated Crowd (ผู้คนเดินสวนกันไปมา ก้มลอยกระทง และยกมือไหว้)
      if (sceneStateRef.current.peopleList) {
        sceneStateRef.current.peopleList.forEach((p) => {
          const cfg = p.config;
          const t = elapsed * cfg.speed + cfg.offset;

          if (cfg.type === 'walking') {
            // เดินไป-กลับตามแนวตลิ่ง
            p.group.position.x += cfg.dir * delta * cfg.speed * 1.2;
            // สลับทิศเมื่อถึงขอบเขต
            if (cfg.dir > 0 && p.group.position.x > cfg.maxX) {
              cfg.dir = -1;
              p.group.rotation.y = -Math.PI / 2;
            } else if (cfg.dir < 0 && p.group.position.x < cfg.minX) {
              cfg.dir = 1;
              p.group.rotation.y = Math.PI / 2;
            }
            // ขยับขาและแกว่งแขนสลับกันตามจังหวะเดิน
            const walkCycle = Math.sin(t * 3.5);
            if (p.legL) p.legL.rotation.x = walkCycle * 0.45;
            if (p.legR) p.legR.rotation.x = -walkCycle * 0.45;
            if (p.armL) p.armL.rotation.x = -walkCycle * 0.4;
            if (p.armR) p.armR.rotation.x = walkCycle * 0.4;
            p.group.position.y = cfg.y + Math.abs(Math.sin(t * 3.5)) * 0.05;
          } else if (cfg.type === 'kneeling') {
            // โค้งคำนับกราบไหว้พระแม่คงคา
            if (p.torso) p.torso.rotation.x = 0.25 + Math.sin(t * 1.5) * 0.08;
            if (p.head) p.head.rotation.x = 0.15 + Math.sin(t * 1.5) * 0.05;
          } else if (cfg.type === 'praying') {
            // ยืนพนมมือไหว้เบาๆ
            if (p.armL) p.armL.position.y = 1.05 + Math.sin(t * 2.0) * 0.03;
            if (p.armR) p.armR.position.y = 1.05 + Math.sin(t * 2.0) * 0.03;
          } else if (cfg.type === 'gazing') {
            // เงยหน้ามองฟ้าชะเง้อดูพลุและโคมลอย
            if (p.head) p.head.rotation.x = -0.3 + Math.sin(t * 1.0) * 0.08;
            p.group.position.y = cfg.y + Math.sin(t * 1.2) * 0.02;
          }
        });
      }

      // 5. Update Ambient Lanterns
      ambientLList.forEach((l, i) => {
        l.y += l.speedY * delta;
        l.x += delta * 0.5;
        if (l.y > 55) {
          l.y = 4;
          l.x = (Math.random() - 0.5) * 70;
        }
        const sway = Math.sin(elapsed * 0.9 + l.swayOffset) * 0.3;
        dummy.position.set(l.x + sway, l.y, l.z);
        dummy.rotation.set(0, elapsed * 0.2, 0.04);
        dummy.scale.set(1.0, 1.2, 1.0);
        dummy.updateMatrix();
        lMesh.setMatrixAt(i, dummy.matrix);
      });
      lMesh.instanceMatrix.needsUpdate = true;

      // 6. User Custom Krathongs drift
      sceneStateRef.current.userKrathongs.forEach((uk) => {
        if (uk.mesh) {
          uk.mesh.position.x -= delta * 1.2;
          uk.mesh.position.y = Math.sin(elapsed * 2.2 + uk.id) * 0.08;
          uk.mesh.rotation.y += delta * 0.15;
        }
      });

      // 7. User Custom Lanterns ascent
      sceneStateRef.current.userLanterns.forEach((ul) => {
        if (ul.mesh) {
          ul.mesh.position.y += delta * 2.4;
          ul.mesh.position.x += delta * 0.5;
          ul.mesh.rotation.y += delta * 0.3;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Atmosphere on Time of Day change
  const handleTimeChange = (t) => {
    setTimeOfDay(t);
    const { ambientLight, dirLight, waterMesh } = sceneStateRef.current;
    if (!ambientLight || !dirLight || !waterMesh) return;

    if (t === 0) {
      // Sunset
      ambientLight.color.set('#f97316');
      ambientLight.intensity = 0.65;
      dirLight.color.set('#fed7aa');
      dirLight.intensity = 1.4;
      waterMesh.material.color.set('#1a0826');
    } else if (t === 1) {
      // Twilight
      ambientLight.color.set('#38bdf8');
      ambientLight.intensity = 0.5;
      dirLight.color.set('#fef08a');
      dirLight.intensity = 1.8;
      waterMesh.material.color.set('#082647');
    } else {
      // Full Moon
      ambientLight.color.set('#93c5fd');
      ambientLight.intensity = 0.35;
      dirLight.color.set('#f8fafc');
      dirLight.intensity = 2.4;
      waterMesh.material.color.set('#041527');
    }
  };

  // Float User Krathong into Three.js Scene
  const handleFloatKrathong = (data) => {
    festivalAudio.init();
    festivalAudio.playWaterSplash();

    // Create 3D Krathong mesh in the main scene
    const kGroup = new THREE.Group();
    kGroup.position.set(0, 0, 5.5);

    // Base
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.45, 0.35, 16),
      new THREE.MeshStandardMaterial({ color: data.baseType === 'banana' ? '#4d7c0f' : '#15803d', roughness: 0.7 })
    );
    base.position.y = 0.15;
    kGroup.add(base);

    // Leaves
    for (let l = 0; l < 10; l++) {
      const angle = (l / 10) * Math.PI * 2;
      const leaf = new THREE.Mesh(
        new THREE.ConeGeometry(0.35, 0.75, 3),
        new THREE.MeshStandardMaterial({ color: '#65a30d', side: THREE.DoubleSide })
      );
      leaf.position.set(Math.cos(angle) * 1.4, 0.3, Math.sin(angle) * 1.4);
      leaf.rotation.set(0.3, -angle + Math.PI / 2, 0);
      kGroup.add(leaf);
    }

    // Flower Garland
    const flowers = new THREE.Mesh(
      new THREE.TorusGeometry(0.85, 0.2, 8, 16),
      new THREE.MeshStandardMaterial({ color: data.flowerColor, roughness: 0.4 })
    );
    flowers.rotation.x = Math.PI / 2;
    flowers.position.y = 0.35;
    kGroup.add(flowers);

    // Candle & Flame
    const candle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8),
      new THREE.MeshStandardMaterial({ color: '#fef08a' })
    );
    candle.position.y = 0.7;
    kGroup.add(candle);

    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.35, 8),
      new THREE.MeshBasicMaterial({ color: '#f59e0b' })
    );
    flame.position.y = 1.25;
    kGroup.add(flame);

    const pLight = new THREE.PointLight('#f59e0b', 2.0, 8);
    pLight.position.y = 1.3;
    kGroup.add(pLight);

    // Wish Banner Billboard (Canvas Texture)
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 512;
    textCanvas.height = 128;
    const ctx = textCanvas.getContext('2d');
    ctx.fillStyle = '#fef3c7';
    ctx.roundRect(0, 0, 512, 128, 24);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.wish.slice(0, 22), 256, 64);

    const textTex = new THREE.CanvasTexture(textCanvas);
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 0.9),
      new THREE.MeshBasicMaterial({ map: textTex, transparent: true, side: THREE.DoubleSide })
    );
    banner.position.y = 2.1;
    kGroup.add(banner);

    // Add to scene
    if (sceneStateRef.current.waterMesh && sceneStateRef.current.waterMesh.parent) {
      sceneStateRef.current.waterMesh.parent.add(kGroup);
      sceneStateRef.current.userKrathongs.push({ id: Date.now(), mesh: kGroup });
      setUserKrathongsCount((prev) => prev + 1);
    }

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#f59e0b', '#fbbf24', '#f43f5e', '#10b981']
    });
  };

  // Release User Sky Lantern into Three.js Scene
  const handleReleaseLantern = (data) => {
    festivalAudio.init();
    festivalAudio.playLanternWhoosh();

    const lGroup = new THREE.Group();
    lGroup.position.set((Math.random() - 0.5) * 8, 3.5, 7);

    // Lantern cylinder
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.6, 1.4, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: '#fef08a', side: THREE.DoubleSide, transparent: true, opacity: 0.92 })
    );
    lGroup.add(body);

    const burner = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 8),
      new THREE.MeshBasicMaterial({ color: '#ffffff' })
    );
    burner.position.y = -0.5;
    lGroup.add(burner);

    const light = new THREE.PointLight('#f59e0b', 3.0, 12);
    light.position.y = -0.4;
    lGroup.add(light);

    // Wish Banner tag
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 512;
    textCanvas.height = 128;
    const ctx = textCanvas.getContext('2d');
    ctx.fillStyle = '#fffbeb';
    ctx.roundRect(0, 0, 512, 128, 20);
    ctx.fill();
    ctx.fillStyle = '#c2410c';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.wish.slice(0, 20), 256, 64);

    const textTex = new THREE.CanvasTexture(textCanvas);
    const tag = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 0.7),
      new THREE.MeshBasicMaterial({ map: textTex, transparent: true, side: THREE.DoubleSide })
    );
    tag.position.y = -1.2;
    lGroup.add(tag);

    if (sceneStateRef.current.waterMesh && sceneStateRef.current.waterMesh.parent) {
      sceneStateRef.current.waterMesh.parent.add(lGroup);
      sceneStateRef.current.userLanterns.push({ id: Date.now(), mesh: lGroup });
      setUserLanternsCount((prev) => prev + 1);
    }

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.85 },
      colors: ['#ea580c', '#f59e0b', '#fde047']
    });
  };

  const times = [
    { id: 0, label: 'ยามเย็นพลบค่ำ', icon: Sunset },
    { id: 1, label: 'หัวค่ำงานวัด', icon: Sun },
    { id: 2, label: 'คืนวันเพ็ญเดือนสิบสอง', icon: Moon }
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* Three.js Direct Canvas Viewport */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Photo Mode Exit Button */}
      {isPhotoActive && (
        <div className="absolute top-6 right-6 z-40">
          <button
            onClick={() => setIsPhotoActive(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-amber-400 text-amber-300 font-medium text-sm shadow-xl hover:bg-slate-800 transition"
          >
            <Eye className="w-4 h-4" />
            ออกจากโหมดถ่ายภาพ
          </button>
        </div>
      )}

      {/* Main UI Overlay */}
      {!isPhotoActive && (
        <div className="pointer-events-none fixed inset-0 z-30 flex flex-col justify-between p-4 md:p-6">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Title & Live Status */}
            <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-amber-500/30 rounded-2xl p-4 shadow-2xl max-w-md">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🪷</span>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold font-charm tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
                    ประเพณีลอยกระทง ๓ มิติ
                  </h1>
                  <p className="text-[11px] text-amber-200/70 font-light flex items-center gap-1.5 mt-0.5">
                    <Music className="w-3 h-3 text-amber-400 animate-pulse" />
                    บรรเลง: เพลงรำวงวันลอยกระทง (ระนาดเอก • ขลุ่ย • ฉิ่ง)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>กระทงในน้ำ: <strong className="text-amber-400 font-semibold">{35 + userKrathongsCount}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  <span>โคมลอยบนฟ้า: <strong className="text-amber-400 font-semibold">{45 + userLanternsCount}</strong></span>
                </div>
              </div>
            </div>

            {/* Top Toolbar */}
            <div className="pointer-events-auto flex flex-wrap items-center gap-2 self-start md:self-auto">
              {/* Soundboard Buttons */}
              <div className="flex bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-800 gap-1">
                <button
                  onClick={() => { festivalAudio.init(); festivalAudio.playTempleBell(); }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition"
                  title="ตีระฆังวัด"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>ตีระฆังวัด</span>
                </button>
                <button
                  onClick={() => { festivalAudio.init(); festivalAudio.playFirecrackers(); }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition"
                  title="จุดประทัดงานวัด"
                >
                  <Zap className="w-3.5 h-3.5 text-rose-400" />
                  <span>จุดประทัด</span>
                </button>
              </div>

              {/* Time Selector */}
              <div className="flex bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-800">
                {times.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleTimeChange(t.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        timeOfDay === t.id
                          ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Audio Controls */}
              <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                <button
                  onClick={() => { festivalAudio.init(); setIsMuted(festivalAudio.toggleMute()); }}
                  className="hover:text-amber-400 transition p-1"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    festivalAudio.init();
                    const v = parseFloat(e.target.value);
                    festivalAudio.setVolume(v);
                    setVolume(v);
                    if (isMuted && v > 0) setIsMuted(false);
                  }}
                  className="w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Photo Mode */}
              <button
                onClick={() => setIsPhotoActive(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 hover:border-amber-400/50 text-slate-300 hover:text-amber-300 text-xs font-medium transition shadow-lg"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">โหมดถ่ายภาพ</span>
              </button>
            </div>
          </header>

          {/* Mouse hint */}
          <div className="self-center pointer-events-auto bg-slate-950/70 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 shadow-lg">
            <span>คลิกลากเพื่อหมุนมุมกล้อง • เลื่อนล้อเมาส์เพื่อซูมเข้า/ออก</span>
          </div>

          {/* Bottom Action Buttons */}
          <footer className="pointer-events-auto self-center flex flex-wrap items-center justify-center gap-3 md:gap-4 max-w-xl w-full">
            <button
              onClick={() => setIsKrathongModalOpen(true)}
              className="flex-1 min-w-[200px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm md:text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 transition transform active:scale-95"
            >
              <Sparkles className="w-5 h-5" />
              <span>สร้างกระทง 3D (ลอยลงน้ำ)</span>
            </button>

            <button
              onClick={() => setIsLanternModalOpen(true)}
              className="py-3.5 px-6 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-amber-400/40 hover:border-amber-400 text-amber-300 font-semibold text-sm md:text-base shadow-xl hover:bg-slate-800/90 flex items-center justify-center gap-2 transition transform active:scale-95"
            >
              <Flame className="w-5 h-5 text-orange-400" />
              <span>ปล่อยโคมลอย</span>
            </button>
          </footer>
        </div>
      )}

      {/* 3D Krathong Customizer Modal */}
      {isKrathongModalOpen && (
        <KrathongModal
          onClose={() => setIsKrathongModalOpen(false)}
          onFloat={handleFloatKrathong}
        />
      )}

      {/* Sky Lantern Modal */}
      {isLanternModalOpen && (
        <LanternModal
          onClose={() => setIsLanternModalOpen(false)}
          onRelease={handleReleaseLantern}
        />
      )}
    </div>
  );
}

// =========================================================================
// 3. KRATHONG MODAL COMPONENT
// =========================================================================
function KrathongModal({ onClose, onFloat }) {
  const [baseType, setBaseType] = useState('banana');
  const [flowerColor, setFlowerColor] = useState('#f59e0b');
  const [wish, setWish] = useState('');

  const flowers = [
    { label: 'ดาวเรืองทองมงคล', color: '#f59e0b', bg: 'bg-amber-500' },
    { label: 'บัวหลวงชมพูศิริ', color: '#f43f5e', bg: 'bg-rose-500' },
    { label: 'กล้วยไม้ม่วงหรูหรา', color: '#a855f7', bg: 'bg-purple-500' },
    { label: 'มะลิขาวบริสุทธิ์', color: '#f8fafc', bg: 'bg-slate-100' }
  ];

  const quickWishes = [
    'ขอขมาพระแม่คงคา ขอให้ชีวิตร่มเย็นเป็นสุข',
    'ขอให้ครอบครัวมีสุขภาพแข็งแรง ปราศจากโรคภัย',
    'ขอให้การงานราบรื่น ประสบความสำเร็จ ร่ำรวยเงินทอง'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onFloat({
      baseType,
      flowerColor,
      wish: wish.trim() || 'ขอขมาพระแม่คงคา สุขกายสบายใจ'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-6 md:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold font-charm text-amber-300 mb-1">
          ออกแบบกระทงของคุณ
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          เลือกวัสดุธรรมชาติ ดอกไม้ และพิมพ์คำอธิษฐานก่อนลอยลงสู่แม่น้ำคงคา
        </p>

        {/* Base */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-300 block mb-2">1. ฐานกระทง</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'banana', label: 'หยวกกล้วยแท้', sub: 'ดั้งเดิม ย่อยสลายง่าย' },
              { id: 'lotus', label: 'ใบบัวมงคล', sub: 'ธรรมชาติ 100%' }
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBaseType(b.id)}
                className={`p-2.5 rounded-xl border text-left transition ${
                  baseType === b.id
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400'
                }`}
              >
                <div className="text-xs font-medium">{b.label}</div>
                <div className="text-[10px] text-slate-500">{b.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Flower */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-300 block mb-2">2. ดอกไม้ประดับ</label>
          <div className="flex flex-wrap gap-2">
            {flowers.map((f) => (
              <button
                key={f.color}
                type="button"
                onClick={() => setFlowerColor(f.color)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition ${
                  flowerColor === f.color
                    ? 'border-amber-400 bg-amber-500/20 text-white font-medium'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full ${f.bg}`} />
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Wish */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-300 block mb-2">3. คำอธิษฐานของคุณ</label>
          <textarea
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            placeholder="พิมพ์คำอธิษฐานขอพร..."
            rows={2}
            maxLength={60}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <div className="flex flex-col gap-1 mt-2">
            {quickWishes.map((qw, qIdx) => (
              <button
                key={qIdx}
                type="button"
                onClick={() => setWish(qw)}
                className="text-left text-[11px] px-2 py-1 rounded bg-slate-800/60 text-slate-400 hover:text-amber-200"
              >
                ✦ {qw}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 text-slate-950 font-bold text-base shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition"
        >
          <HeartHandshake className="w-5 h-5" />
          ลอยกระทงลงสู่สายน้ำ
        </button>
      </div>
    </div>
  );
}

// =========================================================================
// 4. LANTERN MODAL COMPONENT
// =========================================================================
function LanternModal({ onClose, onRelease }) {
  const [wish, setWish] = useState('');

  const quickWishes = [
    'ปล่อยเคราะห์ ปล่อยโศก มีแต่โชคลาภตลอดปี',
    'ขอให้ชีวิตสว่างไสว ดั่งโคมลอยสู่ฟากฟ้า',
    'ขอให้ความฝันและความปรารถนาสำเร็จทุกประการ'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onRelease({
      wish: wish.trim() || 'ขอให้ชีวิตสว่างไสว ปราศจากทุกข์โศกโรคภัย'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold font-charm text-amber-300 mb-1">
          ปล่อยโคมลอยบูชาพระธาตุ
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          พิมพ์คำอธิษฐานส่งผ่านโคมลอยขึ้นสู่สรวงสวรรค์
        </p>

        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-300 block mb-2">คำอธิษฐานติดโคมลอย</label>
          <textarea
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            placeholder="พิมพ์คำอธิษฐาน..."
            rows={3}
            maxLength={60}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <div className="flex flex-col gap-1.5 mt-2">
            {quickWishes.map((qw, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setWish(qw)}
                className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/70 text-slate-400 hover:text-amber-200"
              >
                ✦ {qw}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-slate-950 font-bold text-base shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition"
        >
          <Send className="w-4 h-4" />
          จุดไฟและปล่อยโคมลอย
        </button>
      </div>
    </div>
  );
}
