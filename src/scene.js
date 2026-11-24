import * as THREE from 'three';
import { sound } from './audio.js';

export class WorldScene {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth || window.innerWidth;
    this.height = container.clientHeight || window.innerHeight;

    // High performance WebGL renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    container.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0d2244);
    this.scene.fog = new THREE.FogExp2(0x0d2244, 0.009);

    // Camera
    this.camera = new THREE.PerspectiveCamera(55, this.width / this.height, 0.1, 950);
    this.camera.position.set(0, 10, 26);

    this.skyLanterns = [];
    this.rockets = [];
    this.fireworkBursts = [];
    this.clock = new THREE.Clock();

    // Dazzling diamond starburst texture for spectacular sparkles
    this.sparkTexture = this.createDazzlingSparkTexture();
    this.glowTexture  = this.createGlowTexture();

    // Spectacular Multi-Color Firework Themes
    this.fireworkThemes = [
      {
        name: 'Golden Chrysanthemum',
        type: 'chrysanthemum',
        colors: [0xffd700, 0xffea75, 0xf59e0b, 0xfff9c4, 0xffffff]
      },
      {
        name: 'Rainbow Peony',
        type: 'peony',
        colors: [0xef4444, 0xf59e0b, 0x10b981, 0x06b6d4, 0x8b5cf6, 0xec4899, 0xffffff]
      },
      {
        name: 'Royal Orchid Willow',
        type: 'willow',
        colors: [0xa855f7, 0xd946ef, 0xf43f5e, 0xfde047, 0xfffbeb]
      },
      {
        name: 'Emerald Crown Ring',
        type: 'ring',
        colors: [0x10b981, 0x34d399, 0x6ee7b7, 0xfbbf24, 0xfef08a, 0xffffff]
      },
      {
        name: 'Electric Strobe Diamond',
        type: 'strobe',
        colors: [0x60a5fa, 0x38bdf8, 0x00f0ff, 0xffffff, 0xe0e7ff]
      },
      {
        name: 'Crimson Phoenix',
        type: 'phoenix',
        colors: [0xff4500, 0xff6b35, 0xffa500, 0xffd700, 0xffffff]
      }
    ];

    this.setupLighting();
    this.setupSkyAndMoon();
    this.setupWaterRiver();
    this.setupSkyLanterns();
    this.setupGround();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  // Create Dazzling Diamond Starburst Flare Texture
  createDazzlingSparkTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const cx = 64, cy = 64;

    // 1. Multi-layer radial glow
    const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 62);
    radGrad.addColorStop(0,   'rgba(255, 255, 255, 1.0)');
    radGrad.addColorStop(0.08,'rgba(255, 255, 255, 0.98)');
    radGrad.addColorStop(0.22,'rgba(255, 248, 180, 0.9)');
    radGrad.addColorStop(0.5, 'rgba(255, 200, 80, 0.4)');
    radGrad.addColorStop(0.8, 'rgba(255, 120, 20, 0.12)');
    radGrad.addColorStop(1,   'rgba(255, 80,  0,  0)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, 128, 128);

    // 2. 8-point star spikes (ประกายแฉก 8 ทิศ)
    const spikes = 8;
    for (let s = 0; s < spikes; s++) {
      const angle = (s / spikes) * Math.PI * 2;
      const len = s % 2 === 0 ? 60 : 40;
      const w   = s % 2 === 0 ? 2.8 : 1.4;
      ctx.strokeStyle = s % 2 === 0
        ? 'rgba(255, 255, 255, 0.95)'
        : 'rgba(255, 240, 160, 0.7)';
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(cx - Math.cos(angle) * len, cy - Math.sin(angle) * len);
      ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
      ctx.stroke();
    }

    // 3. Bright flare ring
    ctx.strokeStyle = 'rgba(255, 255, 220, 0.3)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Hot white core
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 9);
    coreGrad.addColorStop(0, 'rgba(255,255,255,1)');
    coreGrad.addColorStop(0.6,'rgba(255,250,200,0.9)');
    coreGrad.addColorStop(1,  'rgba(255,200,100,0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  // Soft round glow sprite for secondary particles
  createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const cx = 32, cy = 32;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 32);
    g.addColorStop(0,   'rgba(255,255,255,1)');
    g.addColorStop(0.3, 'rgba(255,255,220,0.8)');
    g.addColorStop(0.7, 'rgba(255,180,80,0.3)');
    g.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }


  setupLighting() {
    // Warm festive ambient lighting for temple fair atmosphere
    const ambientLight = new THREE.AmbientLight(0x283b5c, 1.8);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x3d5480, 0x1f2024, 1.3);
    this.scene.add(hemiLight);

    // Warm festival lantern glow for market street and gathering grounds
    const marketWarmLight1 = new THREE.PointLight(0xffa733, 2.2, 55);
    marketWarmLight1.position.set(0, 7, 20);
    marketWarmLight1.castShadow = false;
    this.scene.add(marketWarmLight1);

    const marketWarmLight2 = new THREE.PointLight(0xffbe55, 2.0, 50);
    marketWarmLight2.position.set(0, 6, -5);
    marketWarmLight2.castShadow = false;
    this.scene.add(marketWarmLight2);

    // Warm pier lights illuminating the Krathong floating area
    const pierLight = new THREE.PointLight(0xffc266, 2.4, 45);
    pierLight.position.set(0, 3, -33);
    pierLight.castShadow = false;
    this.scene.add(pierLight);

    // Moonlight Directional Light shining from the Full Moon
    this.moonLight = new THREE.DirectionalLight(0xdde8ff, 2.8);
    this.moonLight.position.set(25, 55, -80);
    this.moonLight.castShadow = true;
    this.moonLight.shadow.mapSize.width = 1024;
    this.moonLight.shadow.mapSize.height = 1024;
    this.moonLight.shadow.camera.near = 10;
    this.moonLight.shadow.camera.far = 220;
    this.moonLight.shadow.camera.left = -50;
    this.moonLight.shadow.camera.right = 50;
    this.moonLight.shadow.camera.top = 50;
    this.moonLight.shadow.camera.bottom = -50;
    this.moonLight.shadow.bias = -0.0005;
    this.scene.add(this.moonLight);
  }

  // Majestic Full Moon & Twinkling Night Stars in the horizon skyline
  setupSkyAndMoon() {
    // 1. Multi-tier Sparkling & Twinkling Night Stars (fog: false to stay brilliant)
    const makeStarTier = (count, minRadius, maxRadius, color, size, opacity) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i += 3) {
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 0.95);
        pos[i] = radius * Math.sin(phi) * Math.cos(theta);
        pos[i + 1] = radius * Math.cos(phi);
        pos[i + 2] = radius * Math.sin(phi) * Math.sin(theta);
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color: color,
        size: size,
        map: this.sparkTexture,
        transparent: true,
        opacity: opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false // Crucial: prevent fog from hiding the stars
      });
      const points = new THREE.Points(geo, mat);
      this.scene.add(points);
      return points;
    };

    // Tier 1: Large sparkling diamond starbursts (twinkle pulse 1)
    this.twinkleStars1 = makeStarTier(850, 200, 320, 0xffffff, 5.0, 0.95);

    // Tier 2: Vivid golden-white stars (twinkle pulse 2)
    this.twinkleStars2 = makeStarTier(750, 210, 340, 0xfff0aa, 4.2, 0.90);

    // Tier 3: Deep blue-white background stars
    this.ambientStars = makeStarTier(900, 220, 360, 0xd8eeff, 3.2, 0.80);

    // 2. High Detail Procedural Full Moon
    const moonCanvas = document.createElement('canvas');
    moonCanvas.width = 512;
    moonCanvas.height = 512;
    const mctx = moonCanvas.getContext('2d');

    const moonGrad = mctx.createRadialGradient(256, 256, 50, 256, 256, 256);
    moonGrad.addColorStop(0, '#ffffff');
    moonGrad.addColorStop(0.65, '#fef3c7');
    moonGrad.addColorStop(0.9, '#fde68a');
    moonGrad.addColorStop(1, '#fcd34d');
    mctx.fillStyle = moonGrad;
    mctx.beginPath();
    mctx.arc(256, 256, 256, 0, Math.PI * 2);
    mctx.fill();

    mctx.fillStyle = 'rgba(217, 165, 80, 0.28)';
    [
      [180, 190, 85], [310, 210, 70], [240, 320, 95],
      [160, 280, 60], [330, 300, 50], [210, 140, 45]
    ].forEach(([cx, cy, cr]) => {
      mctx.beginPath();
      mctx.arc(cx, cy, cr, 0, Math.PI * 2);
      mctx.fill();
    });

    const moonTex = new THREE.CanvasTexture(moonCanvas);
    const moonGeo = new THREE.SphereGeometry(16, 32, 32);
    const moonMat = new THREE.MeshBasicMaterial({ map: moonTex, fog: false });
    this.moon = new THREE.Mesh(moonGeo, moonMat);
    this.moon.position.set(22, 38, -92);
    this.scene.add(this.moon);

    // Dual layered atmospheric halos
    const innerHalo = new THREE.Mesh(
      new THREE.SphereGeometry(21, 24, 24),
      new THREE.MeshBasicMaterial({
        color: 0xffe4a0,
        transparent: true,
        opacity: 0.35,
        side: THREE.BackSide,
        fog: false
      })
    );
    this.moon.add(innerHalo);

    const outerHalo = new THREE.Mesh(
      new THREE.SphereGeometry(32, 24, 24),
      new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide,
        fog: false
      })
    );
    this.moon.add(outerHalo);
  }

  setupGround() {
    const groundGeo = new THREE.PlaneGeometry(160, 90, 8, 8);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a261c, roughness: 0.85 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, 15);
    ground.receiveShadow = true;
    this.scene.add(ground);

    const pathGeo = new THREE.PlaneGeometry(14, 75);
    const pathMat = new THREE.MeshStandardMaterial({ color: 0x47423c, roughness: 0.9 });
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.02, 12);
    path.receiveShadow = true;
    this.scene.add(path);

    const crossPathGeo = new THREE.PlaneGeometry(75, 12);
    const crossPath = new THREE.Mesh(crossPathGeo, pathMat);
    crossPath.rotation.x = -Math.PI / 2;
    crossPath.position.set(0, 0.03, -15);
    crossPath.receiveShadow = true;
    this.scene.add(crossPath);

    const bankGeo = new THREE.BoxGeometry(160, 3, 10);
    const bank = new THREE.Mesh(bankGeo, new THREE.MeshStandardMaterial({ color: 0x241d17, roughness: 0.9 }));
    bank.position.set(0, -1.5, -28);
    bank.receiveShadow = true;
    this.scene.add(bank);
  }

  setupWaterRiver() {
    const riverGeo = new THREE.PlaneGeometry(240, 110, 16, 16);
    this.waterMat = new THREE.MeshStandardMaterial({
      color: 0x07283e,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.94
    });

    this.waterMesh = new THREE.Mesh(riverGeo, this.waterMat);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.set(0, -2.8, -78);
    this.scene.add(this.waterMesh);
  }

  setupSkyLanterns() {
    const lanternCount = 38;
    const lanternGroup = new THREE.Group();

    const bodyGeo = new THREE.CylinderGeometry(0.5, 0.7, 1.4, 8, 1, true);
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0xffaa44, side: THREE.DoubleSide });
    const flameGeo = new THREE.SphereGeometry(0.25, 6, 6);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let i = 0; i < lanternCount; i++) {
      const lantern = new THREE.Group();
      lantern.add(new THREE.Mesh(bodyGeo, bodyMat));

      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.y = -0.3;
      lantern.add(flame);

      lantern.position.set(
        (Math.random() - 0.5) * 160,
        15 + Math.random() * 65,
        -45 - Math.random() * 95
      );
      lantern.userData = {
        speedY: 0.8 + Math.random() * 1.2,
        swaySpeed: 1 + Math.random() * 1.5,
        swayOffset: Math.random() * Math.PI * 2,
        baseX: lantern.position.x
      };
      lanternGroup.add(lantern);
      this.skyLanterns.push(lantern);
    }
    this.scene.add(lanternGroup);
  }

  // Launch Realistic Rocket Firework
  launchRocket(targetX, targetY, targetZ, themeIndex) {
    sound.playFireworkLaunch();

    const startX = targetX !== undefined ? targetX : (Math.random() - 0.5) * 60;
    const startZ = targetZ !== undefined ? targetZ : (-60 - Math.random() * 25);
    const burstY = targetY || (18 + Math.random() * 8);
    const theme = this.fireworkThemes[themeIndex !== undefined ? themeIndex : Math.floor(Math.random() * this.fireworkThemes.length)];

    const rocketMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    rocketMesh.position.set(startX, 0, startZ);
    this.scene.add(rocketMesh);

    const trailCount = 14;
    const trailPositions = new Float32Array(trailCount * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 2.8,
      map: this.sparkTexture,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const trailPoints = new THREE.Points(trailGeo, trailMat);
    this.scene.add(trailPoints);

    this.rockets.push({
      mesh: rocketMesh,
      trail: trailPoints,
      trailPositions: trailPositions,
      x: startX,
      y: 0,
      z: startZ,
      vy: 18 + Math.random() * 5,
      targetY: burstY,
      theme: theme
    });
  }

  launchBarrage(count = 5) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        // Spread barrage wide across river horizon at visible, lower eye-level height
        const x = (i - (count - 1) / 2) * 28 + (Math.random() - 0.5) * 10;
        const y = 18 + Math.random() * 7;
        const z = -60 - Math.random() * 25;
        this.launchRocket(x, y, z, i % this.fireworkThemes.length);
      }, i * 260);
    }
  }

  // Detonate rocket into spectacular shape-based fireworks (พลุแตกประกายสวยงามขยายกว้างไกล)
  detonateRocket(rocket) {
    sound.playFireworkExplosion();

    const theme = rocket.theme;
    const colors = theme.colors;
    const type   = theme.type || 'peony';
    const threeColors = colors.map(c => new THREE.Color(c));

    // === BUILD PARTICLES BASED ON BURST TYPE ===
    const particles = [];

    if (type === 'chrysanthemum') {
      // 200 long thin petals radiating outward widely
      for (let i = 0; i < 200; i++) {
        const theta = (i / 200) * Math.PI * 2;
        const phi   = Math.acos(Math.random() * 2 - 1);
        const speed = 18 + Math.random() * 14;
        const col   = threeColors[i % threeColors.length];
        particles.push({
          vx: speed * Math.sin(phi) * Math.cos(theta),
          vy: speed * Math.cos(phi) + 1.5,
          vz: speed * Math.sin(phi) * Math.sin(theta),
          r: col.r, g: col.g, b: col.b,
          drag: 0.974, gravity: 0.9, size: 5.5,
          strobe: false, secondary: false
        });
      }
      // 140 fine golden willow sparkles (cascade down)
      for (let i = 0; i < 140; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(Math.random() * 2 - 1);
        const speed = 7 + Math.random() * 12;
        const gold  = new THREE.Color(0xffd700);
        particles.push({
          vx: speed * Math.sin(phi) * Math.cos(theta),
          vy: speed * Math.cos(phi) + 0.5,
          vz: speed * Math.sin(phi) * Math.sin(theta),
          r: gold.r, g: gold.g, b: gold.b,
          drag: 0.96, gravity: 1.2, size: 3.5,
          strobe: false, secondary: true
        });
      }
    }

    else if (type === 'ring') {
      // Huge ring burst (140 particles in equatorial plane)
      for (let i = 0; i < 140; i++) {
        const theta = (i / 140) * Math.PI * 2;
        const spread = (Math.random() - 0.5) * 0.22;
        const speed  = 22 + Math.random() * 9;
        const col    = threeColors[i % threeColors.length];
        particles.push({
          vx: speed * Math.cos(theta),
          vy: speed * spread + 1.0,
          vz: speed * Math.sin(theta),
          r: col.r, g: col.g, b: col.b,
          drag: 0.975, gravity: 0.6, size: 6.2,
          strobe: false, secondary: false
        });
      }
      // Inner diamond sparkle cluster
      for (let i = 0; i < 90; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(Math.random() * 2 - 1);
        const speed = 4 + Math.random() * 10;
        const white = new THREE.Color(0xffffff);
        particles.push({
          vx: speed * Math.sin(phi) * Math.cos(theta),
          vy: speed * Math.cos(phi) + 0.8,
          vz: speed * Math.sin(phi) * Math.sin(theta),
          r: white.r, g: white.g, b: white.b,
          drag: 0.965, gravity: 0.4, size: 3.8,
          strobe: true, secondary: false
        });
      }
    }

    else if (type === 'willow') {
      // 220 grand weeping willow sparkles expanding far
      for (let i = 0; i < 220; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.random() * Math.PI;
        const speed = 12 + Math.random() * 19;
        const col   = threeColors[Math.floor(Math.random() * threeColors.length)];
        particles.push({
          vx: speed * Math.sin(phi) * Math.cos(theta),
          vy: speed * Math.cos(phi) + 2.5,
          vz: speed * Math.sin(phi) * Math.sin(theta),
          r: col.r, g: col.g, b: col.b,
          drag: 0.968, gravity: 1.8, size: 4.2,
          strobe: false, secondary: false
        });
      }
    }

    else if (type === 'strobe') {
      // 180 fast expanding diamonds that blink intensely across the sky
      for (let i = 0; i < 180; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(Math.random() * 2 - 1);
        const speed = 18 + Math.random() * 22;
        const col   = threeColors[i % threeColors.length];
        particles.push({
          vx: speed * Math.sin(phi) * Math.cos(theta),
          vy: speed * Math.cos(phi) + 1.2,
          vz: speed * Math.sin(phi) * Math.sin(theta),
          r: col.r, g: col.g, b: col.b,
          drag: 0.978, gravity: 0.35, size: 5.8,
          strobe: true, secondary: false
        });
      }
    }

    else if (type === 'phoenix') {
      // Double-shell: fast wide outer shell + slow inner burst
      for (let i = 0; i < 120; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(Math.random() * 2 - 1);
        const speed = 24 + Math.random() * 15;
        const col   = threeColors[i % threeColors.length];
        particles.push({
          vx: speed * Math.sin(phi) * Math.cos(theta),
          vy: speed * Math.cos(phi) + 1.5,
          vz: speed * Math.sin(phi) * Math.sin(theta),
          r: col.r, g: col.g, b: col.b,
          drag: 0.98, gravity: 0.5, size: 6.0,
          strobe: false, secondary: false
        });
      }
      for (let i = 0; i < 110; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(Math.random() * 2 - 1);
        const speed = 6 + Math.random() * 9;
        const gold  = new THREE.Color(0xffd700);
        particles.push({
          vx: speed * Math.sin(phi) * Math.cos(theta),
          vy: speed * Math.cos(phi) + 0.8,
          vz: speed * Math.sin(phi) * Math.sin(theta),
          r: gold.r, g: gold.g, b: gold.b,
          drag: 0.965, gravity: 0.9, size: 4.0,
          strobe: true, secondary: false
        });
      }
    }

    else {
      // === DEFAULT PEONY: 3-tier dazzling burst expanding wide ===
      for (let i = 0; i < 130; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(Math.random() * 2 - 1);
        const speed = 19 + Math.random() * 17;
        const col   = threeColors[i % threeColors.length];
        particles.push({
          vx: speed * Math.sin(phi) * Math.cos(theta),
          vy: speed * Math.cos(phi) + 1.5,
          vz: speed * Math.sin(phi) * Math.sin(theta),
          r: col.r, g: col.g, b: col.b,
          drag: 0.978, gravity: 0.5, size: 5.6,
          strobe: false, secondary: false
        });
      }
      const gold = new THREE.Color(0xffd700);
      for (let i = 0; i < 160; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(Math.random() * 2 - 1);
        const speed = 8 + Math.random() * 13;
        const col   = Math.random() > 0.4 ? gold : threeColors[i % threeColors.length];
        particles.push({
          vx: speed * Math.sin(phi) * Math.cos(theta),
          vy: speed * Math.cos(phi) + 0.8,
          vz: speed * Math.sin(phi) * Math.sin(theta),
          r: col.r, g: col.g, b: col.b,
          drag: 0.965, gravity: 0.7, size: 3.6,
          strobe: false, secondary: true
        });
      }
      const white = new THREE.Color(0xffffff);
      for (let i = 0; i < 90; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(Math.random() * 2 - 1);
        const speed = 4 + Math.random() * 10;
        particles.push({
          vx: speed * Math.sin(phi) * Math.cos(theta),
          vy: speed * Math.cos(phi) + 0.8,
          vz: speed * Math.sin(phi) * Math.sin(theta),
          r: white.r, g: white.g, b: white.b,
          drag: 0.955, gravity: 0.4, size: 3.8,
          strobe: true, secondary: false
        });
      }
    }

    // === ASSEMBLE GEOMETRY ===
    const totalParticles = particles.length;
    const geo       = new THREE.BufferGeometry();
    const positions  = new Float32Array(totalParticles * 3);
    const colorArray = new Float32Array(totalParticles * 3);

    for (let i = 0; i < totalParticles; i++) {
      positions[i * 3]     = rocket.x;
      positions[i * 3 + 1] = rocket.y;
      positions[i * 3 + 2] = rocket.z;
      colorArray[i * 3]     = particles[i].r;
      colorArray[i * 3 + 1] = particles[i].g;
      colorArray[i * 3 + 2] = particles[i].b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colorArray, 3));

    const mat = new THREE.PointsMaterial({
      size: 5.5,
      map: this.sparkTexture,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const burstMesh = new THREE.Points(geo, mat);
    this.scene.add(burstMesh);

    // Flash light (only 1 at a time to keep GPU happy)
    let flashLight = null;
    if (this.fireworkBursts.length <= 1) {
      flashLight = new THREE.PointLight(colors[0], 9.0, 130);
      flashLight.position.set(rocket.x, rocket.y, rocket.z);
      this.scene.add(flashLight);
    }

    this.fireworkBursts.push({
      mesh: burstMesh,
      light: flashLight,
      particles: particles,
      type: type,
      life: 1.0,
      maxLife: 1.0,
      decay: type === 'willow' ? 0.28 : type === 'chrysanthemum' ? 0.32 : 0.36,
      elapsed: 0
    });
  }

  update(delta) {
    const elapsed = this.clock.getElapsedTime();

    // 0. Twinkling & Sparkling Night Stars
    if (this.twinkleStars1) {
      this.twinkleStars1.material.opacity = 0.75 + Math.sin(elapsed * 3.4) * 0.25;
      this.twinkleStars1.material.size = 5.0 + Math.sin(elapsed * 4.2) * 1.8;
    }
    if (this.twinkleStars2) {
      this.twinkleStars2.material.opacity = 0.70 + Math.sin(elapsed * 2.7 + 1.8) * 0.30;
      this.twinkleStars2.material.size = 4.2 + Math.sin(elapsed * 3.6 + 1.2) * 1.5;
    }


    // 1. Water oscillation — keep waterY in sync for krathong bobbing
    this.waterSurfaceY = -2.72 + Math.sin(elapsed * 1.5) * 0.06;
    if (this.waterMesh) {
      this.waterMesh.position.y = this.waterSurfaceY - 0.1;
      this.waterMesh.rotation.z = Math.sin(elapsed * 0.8) * 0.003;
    }

    // 2. Sky lanterns floating
    for (const lantern of this.skyLanterns) {
      lantern.position.y += lantern.userData.speedY * delta;
      lantern.position.x = lantern.userData.baseX + Math.sin(elapsed * lantern.userData.swaySpeed + lantern.userData.swayOffset) * 1.5;
      lantern.rotation.y += 0.3 * delta;

      if (lantern.position.y > 90) {
        lantern.position.y = 12;
        lantern.position.x = (Math.random() - 0.5) * 160;
        lantern.userData.baseX = lantern.position.x;
      }
    }

    // 3. Update Ascending Rockets
    for (let r = this.rockets.length - 1; r >= 0; r--) {
      const rocket = this.rockets[r];
      rocket.y += rocket.vy * delta;
      rocket.vy -= 9.8 * delta * 0.4;
      rocket.mesh.position.y = rocket.y;

      const tPos = rocket.trailPositions;
      for (let i = tPos.length - 3; i >= 3; i -= 3) {
        tPos[i] = tPos[i - 3];
        tPos[i + 1] = tPos[i - 2] - 0.3;
        tPos[i + 2] = tPos[i - 1];
      }
      tPos[0] = rocket.x;
      tPos[1] = rocket.y;
      tPos[2] = rocket.z;
      rocket.trail.geometry.attributes.position.needsUpdate = true;

      if (rocket.y >= rocket.targetY || rocket.vy <= 2.0) {
        this.detonateRocket(rocket);
        this.scene.remove(rocket.mesh);
        this.scene.remove(rocket.trail);
        rocket.mesh.geometry.dispose();
        rocket.trail.geometry.dispose();
        this.rockets.splice(r, 1);
      }
    }

    // 4. Update Dazzling Burst Fireworks with Sparkle Physics
    for (let i = this.fireworkBursts.length - 1; i >= 0; i--) {
      const fb = this.fireworkBursts[i];
      fb.life -= fb.decay * delta;
      fb.elapsed = (fb.elapsed || 0) + delta;
      const positions = fb.mesh.geometry.attributes.position.array;
      const pts = fb.particles;

      for (let p = 0; p < pts.length; p++) {
        const pt = pts[p];

        positions[p * 3]     += pt.vx * delta;
        positions[p * 3 + 1] += pt.vy * delta;
        positions[p * 3 + 2] += pt.vz * delta;

        // Drag & gravity per particle
        pt.vx *= pt.drag;
        pt.vz *= pt.drag;
        pt.vy -= 9.8 * delta * pt.gravity;
        // Extra downward pull for willow/cascade secondaries
        if (pt.secondary) pt.vy -= 4.0 * delta;
      }

      fb.mesh.geometry.attributes.position.needsUpdate = true;

      // Shimmer & strobe opacity for diamond/strobe particles
      const baseShimmer  = 0.80 + Math.sin(elapsed * 28 + i * 1.7) * 0.20;
      const strobeFlash  = Math.abs(Math.sin(elapsed * 45 + i * 3.1)) > 0.5 ? 1.4 : 0.6;
      const lifeRatio    = Math.max(0, fb.life / (fb.maxLife || 1.0));

      // Size pulses outward then fades
      const scalePulse   = 1.0 + (1.0 - lifeRatio) * 0.6;
      fb.mesh.material.size    = 4.5 * scalePulse * baseShimmer;
      fb.mesh.material.opacity = Math.max(0, lifeRatio * baseShimmer * (fb.type === 'strobe' ? strobeFlash : 1.0));

      if (fb.light) {
        fb.light.intensity = Math.max(0, fb.life * 8.0 * Math.abs(Math.sin(elapsed * 20)));
      }

      if (fb.life <= 0) {
        this.scene.remove(fb.mesh);
        if (fb.light) this.scene.remove(fb.light);
        fb.mesh.geometry.dispose();
        fb.mesh.material.dispose();
        this.fireworkBursts.splice(i, 1);
      }
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }
}
