// Enhanced 2D Canvas Scene Engine for Loy Krathong & Temple Fair
// Features: Realistic Multi-color Fireworks with trails, 85+ River Krathongs with Candle Shimmers
import { sound } from './audio.js';

export class Scene2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // World Dimensions (Panoramic Street & River)
    this.worldWidth = 3600;
    this.worldHeight = 1000;

    // Viewport & Camera
    this.cameraX = 500;
    this.targetCameraX = 500;

    // Player position
    this.player = {
      x: 750,
      y: 0,
      vx: 0,
      speed: 5.5,
      direction: 1,
      isMoving: false,
      walkCycle: 0
    };

    // Keys state
    this.keys = { left: false, right: false, shift: false };

    // Mouse drag state
    this.isDragging = false;
    this.lastMouseX = 0;

    // Particle & Entity collections
    this.stars = [];
    this.skyLanterns = [];
    this.riverKrathongs = [];
    this.rockets = [];
    this.fireworkParticles = [];
    this.smokeParticles = [];
    this.skyFlashes = [];

    this.time = 0;

    // Color palettes for realistic multi-color fireworks
    this.fireworkThemes = [
      {
        name: 'Rainbow Jewel',
        colors: ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899'],
        trail: true,
        strobe: false
      },
      {
        name: 'Gold Willow & Cyan',
        colors: ['#fbbf24', '#f59e0b', '#d97706', '#38bdf8', '#e0f2fe'],
        trail: true,
        strobe: true
      },
      {
        name: 'Royal Purple & Hot Pink',
        colors: ['#a855f7', '#ec4899', '#f43f5e', '#fde047', '#ffffff'],
        trail: true,
        strobe: true
      },
      {
        name: 'Emerald & Gold Crown',
        colors: ['#10b981', '#34d399', '#f59e0b', '#fef08a', '#ffffff'],
        trail: true,
        strobe: false
      },
      {
        name: 'Electric Blue & Strobe White',
        colors: ['#3b82f6', '#60a5fa', '#93c5fd', '#ffffff'],
        trail: true,
        strobe: true
      }
    ];

    this.initWorld();
    this.setupInputs();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.groundY = this.height * 0.72;
    this.player.y = this.groundY;
  }

  initWorld() {
    // Generate twinkling stars
    for (let i = 0; i < 220; i++) {
      this.stars.push({
        x: Math.random() * this.worldWidth,
        y: Math.random() * 480,
        radius: 0.8 + Math.random() * 1.8,
        alpha: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 1.5 + Math.random() * 3.5
      });
    }

    // Sky lanterns (โคมลอย)
    for (let i = 0; i < 45; i++) {
      this.skyLanterns.push({
        x: Math.random() * this.worldWidth,
        y: 40 + Math.random() * 450,
        speedY: 0.25 + Math.random() * 0.45,
        swaySpeed: 1 + Math.random() * 1.5,
        swayRange: 15 + Math.random() * 25,
        phase: Math.random() * Math.PI * 2,
        scale: 0.6 + Math.random() * 0.7
      });
    }

    // Populate River with 85+ Krathongs! (X: 2020 to 3600)
    const baseColors = ['#15803d', '#166534', '#d97706', '#b45309', '#ec4899', '#059669'];
    const flowerColors = ['#f43f5e', '#fbbf24', '#a855f7', '#ffffff', '#f97316'];

    for (let i = 0; i < 88; i++) {
      // Depth layering: 0 = far (small/darker), 1 = near (large/detailed)
      const depth = Math.random();
      const scale = 0.45 + depth * 0.85;

      this.riverKrathongs.push({
        x: 2060 + Math.random() * 1480,
        yOffset: depth * 140 - 15,
        speedX: 0.25 + depth * 0.35 + Math.random() * 0.2,
        bobSpeed: 1.2 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
        baseColor: baseColors[Math.floor(Math.random() * baseColors.length)],
        flowerColor: flowerColors[Math.floor(Math.random() * flowerColors.length)],
        candleColor: Math.random() > 0.3 ? '#fef08a' : '#f97316',
        scale: scale,
        depth: depth
      });
    }

    // Sort by depth so distant krathongs render behind foreground ones
    this.riverKrathongs.sort((a, b) => a.depth - b.depth);
  }

  setupInputs() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.keys.shift = true;
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.keys.shift = false;
    });

    // Mouse drag to pan camera
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastMouseX;
        this.targetCameraX -= dx * 1.4;
        this.lastMouseX = e.clientX;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Click to move player
    this.canvas.addEventListener('click', (e) => {
      if (Math.abs(e.clientX - this.lastMouseX) < 5) {
        const clickWorldX = e.clientX + this.cameraX;
        this.playerTargetX = Math.max(100, Math.min(this.worldWidth - 200, clickWorldX));
      }
    });
  }

  // Launch a new custom Krathong into the river
  launchKrathong() {
    sound.playSplash();
    sound.playWishChime();

    // Spawn new player krathong at the pier front
    const newKrathong = {
      x: 2150,
      yOffset: 35 + Math.random() * 30,
      speedX: 0.62,
      bobSpeed: 1.8,
      phase: 0,
      baseColor: '#22c55e',
      flowerColor: '#f43f5e',
      candleColor: '#fef08a',
      scale: 1.35,
      depth: 0.8,
      isPlayer: true
    };
    this.riverKrathongs.push(newKrathong);
    this.riverKrathongs.sort((a, b) => a.depth - b.depth);

    // Smoothly pan camera towards the river pier
    this.targetCameraX = 2150 - this.width / 2;

    // Launch celebratory fireworks salvo over the river!
    this.launchBarrage(4, 2150);
  }

  // Launch a realistic Rocket Firework that ascends and explodes
  launchRocket(targetWorldX, targetY, themeIndex) {
    sound.playFireworkLaunch();

    const startX = targetWorldX !== undefined ? targetWorldX : (this.cameraX + 250 + Math.random() * (this.width - 500));
    const burstY = targetY || (100 + Math.random() * 180);
    const theme = this.fireworkThemes[themeIndex !== undefined ? themeIndex : Math.floor(Math.random() * this.fireworkThemes.length)];

    this.rockets.push({
      x: startX,
      y: this.groundY - 10,
      targetY: burstY,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -11 - Math.random() * 3,
      theme: theme,
      trailParticles: []
    });
  }

  // Launch multiple fireworks in a rhythmic barrage
  launchBarrage(count = 4, centerX) {
    const center = centerX || (this.cameraX + this.width / 2);
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const offset = (i - (count - 1) / 2) * 220 + (Math.random() - 0.5) * 90;
        const targetX = center + offset;
        const targetY = 90 + Math.random() * 160;
        this.launchRocket(targetX, targetY, i % this.fireworkThemes.length);
      }, i * 260);
    }
  }

  // Detonate a rocket into a stunning multi-color burst
  detonateRocket(rocket) {
    sound.playFireworkExplosion();

    const theme = rocket.theme;
    const colors = theme.colors;
    const particleCount = 85;

    // Flash illumination over the sky
    this.skyFlashes.push({
      x: rocket.x,
      y: rocket.y,
      color: colors[0],
      alpha: 0.45
    });

    // Generate burst particles with physical velocities and trailing sparks
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
      const speed = 3.0 + Math.random() * 6.5;
      const color = colors[i % colors.length];

      this.fireworkParticles.push({
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color,
        alpha: 1.0,
        decay: 0.011 + Math.random() * 0.012,
        radius: 2.0 + Math.random() * 1.8,
        hasTrail: theme.trail,
        trail: [],
        strobe: theme.strobe && Math.random() > 0.6,
        strobePhase: Math.random() * Math.PI * 2
      });
    }

    // Golden center core sparks
    for (let c = 0; c < 18; c++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 2.2;
      this.fireworkParticles.push({
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#ffffff',
        alpha: 1.0,
        decay: 0.025,
        radius: 2.2,
        hasTrail: false,
        trail: []
      });
    }
  }

  update(delta) {
    this.time += delta;

    // 1. Player movement
    let moveDir = 0;
    if (this.keys.left) moveDir -= 1;
    if (this.keys.right) moveDir += 1;

    if (this.playerTargetX !== undefined) {
      const dist = this.playerTargetX - this.player.x;
      if (Math.abs(dist) > 8) {
        moveDir = Math.sign(dist);
      } else {
        this.playerTargetX = undefined;
      }
    }

    if (moveDir !== 0) {
      this.player.isMoving = true;
      this.player.direction = moveDir;
      const curSpeed = this.player.speed * (this.keys.shift ? 1.6 : 1.0);
      this.player.x += moveDir * curSpeed;
      this.player.walkCycle += delta * 12;

      this.player.x = Math.max(120, Math.min(2350, this.player.x));

      if (!this.isDragging) {
        this.targetCameraX = this.player.x - this.width * 0.45;
      }
    } else {
      this.player.isMoving = false;
      this.player.walkCycle = 0;
    }

    const maxCam = Math.max(0, this.worldWidth - this.width);
    this.targetCameraX = Math.max(0, Math.min(maxCam, this.targetCameraX));
    this.cameraX += (this.targetCameraX - this.cameraX) * 0.08;

    // 2. Sky Lanterns floating
    for (const l of this.skyLanterns) {
      l.y -= l.speedY;
      l.x += Math.sin(this.time * l.swaySpeed + l.phase) * 0.4;
      if (l.y < -30) {
        l.y = 480;
        l.x = Math.random() * this.worldWidth;
      }
    }

    // 3. Floating Krathongs on the River (85+ krathongs drift downstream)
    for (const k of this.riverKrathongs) {
      k.x += k.speedX;
      if (k.x > this.worldWidth + 80) {
        k.x = 2050 - Math.random() * 50;
      }
    }

    // 4. Update Rockets (Ascending phase)
    for (let r = this.rockets.length - 1; r >= 0; r--) {
      const rocket = this.rockets[r];
      rocket.x += rocket.vx;
      rocket.y += rocket.vy;
      rocket.vy += 0.12; // Slowing down as it climbs

      // Add rocket sparks
      if (Math.random() > 0.2) {
        rocket.trailParticles.push({
          x: rocket.x + (Math.random() - 0.5) * 3,
          y: rocket.y,
          alpha: 0.9,
          color: '#fbbf24',
          radius: 1.8
        });
      }

      // Update rocket trail
      for (let t = rocket.trailParticles.length - 1; t >= 0; t--) {
        const tp = rocket.trailParticles[t];
        tp.y += 0.8;
        tp.alpha -= 0.04;
        if (tp.alpha <= 0) rocket.trailParticles.splice(t, 1);
      }

      // Detonate when reaching target height or peaking
      if (rocket.y <= rocket.targetY || rocket.vy >= -1.0) {
        this.detonateRocket(rocket);
        this.rockets.splice(r, 1);
      }
    }

    // 5. Update Firework Burst Particles
    for (let i = this.fireworkParticles.length - 1; i >= 0; i--) {
      const p = this.fireworkParticles[i];

      // Save position for trailing tail
      if (p.hasTrail) {
        p.trail.unshift({ x: p.x, y: p.y, alpha: p.alpha });
        if (p.trail.length > 5) p.trail.pop();
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.075; // Gravity
      p.vx *= 0.975; // Air drag
      p.vy *= 0.975;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.fireworkParticles.splice(i, 1);
      }
    }

    // 6. Sky Flashes decay
    for (let f = this.skyFlashes.length - 1; f >= 0; f--) {
      const sf = this.skyFlashes[f];
      sf.alpha -= 0.035;
      if (sf.alpha <= 0) this.skyFlashes.splice(f, 1);
    }

    // 7. Smoke from meatball grill
    if (Math.random() < 0.25) {
      this.smokeParticles.push({
        x: 620 + (Math.random() - 0.5) * 20,
        y: this.groundY - 55,
        vx: (Math.random() - 0.5) * 0.5 + 0.2,
        vy: -0.8 - Math.random() * 0.8,
        radius: 4 + Math.random() * 4,
        alpha: 0.6
      });
    }

    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const sp = this.smokeParticles[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.radius += 0.15;
      sp.alpha -= 0.01;
      if (sp.alpha <= 0) {
        this.smokeParticles.splice(i, 1);
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const cam = this.cameraX;
    const gy = this.groundY;

    ctx.clearRect(0, 0, w, h);

    // 1. SKY GRADIENT
    const skyGrad = ctx.createLinearGradient(0, 0, 0, gy);
    skyGrad.addColorStop(0, '#060a17');
    skyGrad.addColorStop(0.5, '#0b132b');
    skyGrad.addColorStop(1, '#1c2541');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Sky Flashes from Fireworks detonations
    for (const sf of this.skyFlashes) {
      const screenX = sf.x - cam;
      const flashGrad = ctx.createRadialGradient(screenX, sf.y, 10, screenX, sf.y, 420);
      flashGrad.addColorStop(0, sf.color);
      flashGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save();
      ctx.globalAlpha = sf.alpha;
      ctx.fillStyle = flashGrad;
      ctx.fillRect(0, 0, w, gy);
      ctx.restore();
    }

    // 2. STARS
    ctx.save();
    for (const s of this.stars) {
      const sx = s.x - cam * 0.4;
      if (sx >= -10 && sx <= w + 10) {
        const twinkle = s.alpha + Math.sin(this.time * s.twinkleSpeed) * 0.25;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, twinkle)})`;
        ctx.beginPath();
        ctx.arc(sx, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // 3. FULL MOON (พระจันทร์เต็มดวง)
    const moonScreenX = 1750 - cam * 0.25;
    const moonY = 120;
    if (moonScreenX >= -100 && moonScreenX <= w + 100) {
      const glowGrad = ctx.createRadialGradient(moonScreenX, moonY, 15, moonScreenX, moonY, 130);
      glowGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      glowGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
      glowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(moonScreenX, moonY, 130, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fffbeb';
      ctx.beginPath();
      ctx.arc(moonScreenX, moonY, 44, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(moonScreenX - 12, moonY - 10, 10, 0, Math.PI * 2);
      ctx.arc(moonScreenX + 16, moonY + 8, 14, 0, Math.PI * 2);
      ctx.arc(moonScreenX - 6, moonY + 16, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. SKY LANTERNS (โคมลอย)
    for (const l of this.skyLanterns) {
      const lx = l.x - cam * 0.6;
      if (lx >= -30 && lx <= w + 30) {
        ctx.save();
        ctx.translate(lx, l.y);
        ctx.scale(l.scale, l.scale);

        const lg = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
        lg.addColorStop(0, 'rgba(255, 170, 50, 0.6)');
        lg.addColorStop(1, 'rgba(255, 100, 20, 0)');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(-7, -12, 14, 20, 3);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 5. DISTANT TEMPLE SILHOUETTE & FOLIAGE
    ctx.save();
    ctx.fillStyle = '#0f172a';
    for (let i = 0; i < 22; i++) {
      const tx = i * 220 - cam * 0.5;
      ctx.beginPath();
      ctx.arc(tx, gy - 20, 90, Math.PI, 0);
      ctx.fill();
    }
    ctx.restore();

    // 6. MAIN GROUND (Lawn & walkway)
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, gy, w, h - gy);

    ctx.fillStyle = '#292524';
    ctx.fillRect(0, gy + 10, w, 70);

    ctx.strokeStyle = '#44403c';
    ctx.lineWidth = 1.5;
    for (let x = - (cam % 40); x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, gy + 10);
      ctx.lineTo(x, gy + 80);
      ctx.stroke();
    }

    // 7. DRAW SCENERY OBJECTS
    ctx.save();
    ctx.translate(-cam, 0);

    // Temple Gate
    this.drawEntranceGate(260, gy);

    // Market Stalls
    this.drawMarketStalls(gy);

    // Temple Ground, Ubosot & Golden Chedi
    this.drawUbosot(1620, gy);
    this.drawGoldenChedi(1900, gy);
    this.drawBodhiTree(1480, gy);

    // Pier & River with 85+ Krathongs
    this.drawRiverAndPier(gy);

    // Smoke Particles
    for (const sp of this.smokeParticles) {
      ctx.fillStyle = `rgba(220, 220, 220, ${sp.alpha})`;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player Avatar
    this.drawPlayer(this.player.x, gy);

    ctx.restore();

    // 8. RIVER FOREGROUND WATER WAVES & CANDLE REFLECTIONS
    this.drawWaterWaves(gy);

    // 9. DRAW ROCKET TRAILS & BURST FIREWORKS (Screen Space)
    this.drawFireworks();
  }

  // Draw Realistic Fireworks Particles & Rocket Trails
  drawFireworks() {
    const ctx = this.ctx;
    const cam = this.cameraX;

    // A. Draw Ascending Rockets
    for (const r of this.rockets) {
      const rx = r.x - cam;

      // Rocket trail particles
      for (const tp of r.trailParticles) {
        ctx.fillStyle = tp.color;
        ctx.globalAlpha = tp.alpha;
        ctx.beginPath();
        ctx.arc(tp.x - cam, tp.y, tp.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Rocket head spark
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 1.0;
      ctx.beginPath();
      ctx.arc(rx, r.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // B. Draw Burst Particles & Sparkling Willow Trails
    for (const p of this.fireworkParticles) {
      const px = p.x - cam;

      // Draw trailing tail
      if (p.hasTrail && p.trail.length > 0) {
        for (let t = 0; t < p.trail.length; t++) {
          const tp = p.trail[t];
          const tAlpha = (tp.alpha * (1 - t / p.trail.length)) * 0.7;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, tAlpha);
          ctx.beginPath();
          ctx.arc(tp.x - cam, tp.y, p.radius * (1 - t / p.trail.length * 0.6), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Spark Strobe twinkle
      let currentAlpha = p.alpha;
      if (p.strobe) {
        currentAlpha *= (0.3 + 0.7 * Math.sin(this.time * 25 + p.strobePhase));
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, currentAlpha);
      ctx.beginPath();
      ctx.arc(px, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Soft glow aura around bright particles
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = Math.max(0, currentAlpha * 0.5);
      ctx.beginPath();
      ctx.arc(px, p.y, p.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  // Draw Grand Thai Temple Entrance Arch
  drawEntranceGate(x, gy) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, gy);

    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-70, -180, 26, 180);
    ctx.fillRect(44, -180, 26, 180);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-74, -185, 34, 12);
    ctx.fillRect(40, -185, 34, 12);
    ctx.fillRect(-74, -10, 34, 10);
    ctx.fillRect(40, -10, 34, 10);

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-85, -200, 170, 22);

    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(-110, -200);
    ctx.lineTo(0, -265);
    ctx.lineTo(110, -200);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(0, -265);
    ctx.lineTo(0, -305);
    ctx.lineTo(12, -280);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(-65, -165, 130, 48);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.strokeRect(-65, -165, 130, 48);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('งานวัดลอยกระทง', 0, -145);
    ctx.font = '11px sans-serif';
    ctx.fillText('วัดพระงามบวรวิหาร', 0, -127);

    [-57, 57].forEach(lx => {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(lx, -100, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(lx, -100, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  // Draw Market Stalls
  drawMarketStalls(gy) {
    this.drawFestiveLights(gy);

    this.drawStall({
      x: 580, gy: gy,
      name: 'ร้านลูกชิ้นปิ้งลุงทอง',
      sub: '🍢 ลูกชิ้นหมู-เนื้อแท้ น้ำจิ้มเด็ด',
      roofColor1: '#dc2626', roofColor2: '#ffffff',
      vendorColor: '#3b82f6',
      props: 'meatballs'
    });

    this.drawStall({
      x: 780, gy: gy,
      name: 'ร้านสายไหมน้องชมพู',
      sub: '🍭 สายไหมฟูๆ หลากสี',
      roofColor1: '#ec4899', roofColor2: '#ffffff',
      vendorColor: '#f43f5e',
      props: 'cotton_candy'
    });

    this.drawStall({
      x: 980, gy: gy,
      name: 'ร้านน้ำจรวด & ชาไทยโบราณ',
      sub: '🧋 ชาไทยหอมมัน ซ่าชื่นใจ',
      roofColor1: '#f97316', roofColor2: '#16a34a',
      vendorColor: '#059669',
      props: 'drinks'
    });

    this.drawStall({
      x: 1180, gy: gy,
      name: 'ร้านขนมถังแตกชาววัง',
      sub: '🥞 มะพร้าวแน่น ไส้หวาน-เค็ม',
      roofColor1: '#eab308', roofColor2: '#ffffff',
      vendorColor: '#d97706',
      props: 'pancake'
    });

    this.drawStall({
      x: 1360, gy: gy,
      name: 'ซุ้มเกมงานวัด & ของเล่น',
      sub: '🎯 ลูกโป่งสีสด & ตุ๊กตาหมี',
      roofColor1: '#8b5cf6', roofColor2: '#fbbf24',
      vendorColor: '#7c3aed',
      props: 'carnival'
    });
  }

  drawStall({ x, gy, name, sub, roofColor1, roofColor2, vendorColor, props }) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, gy);

    ctx.fillStyle = '#78350f';
    ctx.fillRect(-65, -60, 130, 60);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-70, -68, 140, 12);

    ctx.fillStyle = '#451a03';
    ctx.fillRect(-62, -140, 5, 80);
    ctx.fillRect(57, -140, 5, 80);

    const stripes = 6;
    const sWidth = 144 / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? roofColor1 : roofColor2;
      ctx.fillRect(-72 + i * sWidth, -145, sWidth, 32);
    }
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? roofColor1 : roofColor2;
      ctx.beginPath();
      ctx.arc(-72 + i * sWidth + sWidth / 2, -113, sWidth / 2, 0, Math.PI);
      ctx.fill();
    }

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, -125, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = vendorColor;
    ctx.beginPath();
    ctx.arc(0, -82, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -100, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(0, -105, 12, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-58, -172, 116, 24);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-58, -172, 116, 24);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, 0, -156);

    if (props === 'meatballs') {
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(-45, -74, 50, 8);
      ctx.fillStyle = '#854d0e';
      [-35, -20, -5].forEach(sx => {
        ctx.beginPath();
        ctx.arc(sx, -76, 4, 0, Math.PI * 2);
        ctx.arc(sx, -84, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.arc(30, -74, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (props === 'cotton_candy') {
      const cColors = ['#f472b6', '#38bdf8', '#facc15'];
      cColors.forEach((cc, idx) => {
        ctx.fillStyle = cc;
        ctx.beginPath();
        ctx.arc(-30 + idx * 28, -82, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillRect(-31 + idx * 28, -72, 2, 10);
      });
    } else if (props === 'drinks') {
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-35, -84, 16, 18);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(-10, -84, 16, 18);
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(15, -84, 16, 18);
    } else if (props === 'carnival') {
      const bColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
      bColors.forEach((bc, idx) => {
        ctx.fillStyle = bc;
        ctx.beginPath();
        ctx.arc(-40 + idx * 20, -100, 8, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.restore();
  }

  drawFestiveLights(gy) {
    const ctx = this.ctx;
    const bulbColors = ['#ef4444', '#facc15', '#22c55e', '#38bdf8', '#ec4899', '#f97316'];
    ctx.save();

    for (let poleX = 480; poleX <= 1450; poleX += 160) {
      ctx.fillStyle = '#573a24';
      ctx.fillRect(poleX, gy - 195, 6, 195);

      const nextX = poleX + 160;
      ctx.beginPath();
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1.5;
      ctx.moveTo(poleX + 3, gy - 190);
      ctx.quadraticCurveTo(poleX + 80, gy - 165, nextX + 3, gy - 190);
      ctx.stroke();

      for (let b = 1; b <= 5; b++) {
        const t = b / 6;
        const bx = poleX + 3 + (nextX - poleX) * t;
        const by = gy - 190 + Math.sin(t * Math.PI) * 24;
        const color = bulbColors[(Math.floor(poleX / 10) + b) % bulbColors.length];

        const bg = ctx.createRadialGradient(bx, by, 1, bx, by, 12);
        bg.addColorStop(0, color);
        bg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(bx, by, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawUbosot(x, gy) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, gy);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-110, -150, 220, 150);

    ctx.fillStyle = '#e2e8f0';
    [-90, -45, 0, 45, 90].forEach(px => {
      ctx.fillRect(px - 7, -150, 14, 150);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px - 9, -155, 18, 8);
      ctx.fillStyle = '#e2e8f0';
    });

    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-22, -100, 44, 100);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-20, -96, 40, 96);

    const doorGlow = ctx.createRadialGradient(0, 0, 5, 0, 0, 70);
    doorGlow.addColorStop(0, 'rgba(254, 240, 138, 0.5)');
    doorGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = doorGlow;
    ctx.fillRect(-60, -30, 120, 40);

    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(-145, -150);
    ctx.lineTo(0, -225);
    ctx.lineTo(145, -150);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-115, -205);
    ctx.lineTo(0, -270);
    ctx.lineTo(115, -205);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-75, -150);
    ctx.lineTo(0, -205);
    ctx.lineTo(75, -150);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(0, -270);
    ctx.lineTo(0, -305);
    ctx.lineTo(14, -285);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawGoldenChedi(x, gy) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, gy);

    const tiers = [
      { w: 140, h: 18, y: -18 },
      { w: 115, h: 16, y: -34 },
      { w: 90, h: 14, y: -48 }
    ];
    ctx.fillStyle = '#d97706';
    tiers.forEach(t => {
      ctx.fillRect(-t.w / 2, t.y, t.w, t.h);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-t.w / 2, t.y, t.w, 4);
      ctx.fillStyle = '#d97706';
    });

    const bellGrad = ctx.createLinearGradient(-45, -120, 45, -48);
    bellGrad.addColorStop(0, '#fde047');
    bellGrad.addColorStop(0.5, '#f59e0b');
    bellGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = bellGrad;

    ctx.beginPath();
    ctx.arc(0, -85, 42, Math.PI, 0);
    ctx.lineTo(42, -48);
    ctx.lineTo(-42, -48);
    ctx.closePath();
    ctx.fill();

    for (let r = 0; r < 8; r++) {
      const rw = 32 - r * 3.5;
      const ry = -128 - r * 9;
      ctx.fillStyle = r % 2 === 0 ? '#fde047' : '#f59e0b';
      ctx.fillRect(-rw / 2, ry, rw, 7);
    }

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(-6, -200);
    ctx.lineTo(0, -275);
    ctx.lineTo(6, -200);
    ctx.closePath();
    ctx.fill();

    const aura = ctx.createRadialGradient(0, -130, 20, 0, -130, 150);
    aura.addColorStop(0, 'rgba(254, 240, 138, 0.25)');
    aura.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, -130, 150, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawBodhiTree(x, gy) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, gy);

    ctx.fillStyle = '#3f2212';
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(-10, -140);
    ctx.lineTo(10, -140);
    ctx.lineTo(18, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.arc(-35, -165, 55, 0, Math.PI * 2);
    ctx.arc(35, -170, 50, 0, Math.PI * 2);
    ctx.arc(0, -210, 60, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 28; i++) {
      const lx = (Math.sin(i * 3.7) * 55);
      const ly = -140 - (Math.cos(i * 2.1) * 60);
      const color = i % 2 === 0 ? '#fde047' : '#38bdf8';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Pier & 85+ Floating Krathongs with Candle Light Shimmer Reflections
  drawRiverAndPier(gy) {
    const ctx = this.ctx;
    const pierStartX = 2050;

    // Wooden Pier Platform
    ctx.fillStyle = '#573a24';
    ctx.fillRect(pierStartX, gy + 15, 320, 24);

    for (let sx = pierStartX + 40; sx < pierStartX + 320; sx += 65) {
      ctx.fillStyle = '#3e2716';
      ctx.fillRect(sx, gy + 35, 12, 140);
    }

    // Torches on Pier
    [pierStartX + 60, pierStartX + 180, pierStartX + 290].forEach(tx => {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(tx - 3, gy - 45, 6, 60);

      const flameGrad = ctx.createRadialGradient(tx, gy - 55, 2, tx, gy - 55, 18);
      flameGrad.addColorStop(0, '#ffffff');
      flameGrad.addColorStop(0.3, '#f59e0b');
      flameGrad.addColorStop(0.7, '#ea580c');
      flameGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.arc(tx, gy - 55, 18, 0, Math.PI * 2);
      ctx.fill();
    });

    // Pier Sign
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(pierStartX + 90, gy - 35, 120, 26);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pierStartX + 90, gy - 35, 120, 26);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ท่าน้ำลอยกระทง (Pier)', pierStartX + 150, gy - 18);

    // Draw ALL 85+ Floating Krathongs on the River!
    for (const k of this.riverKrathongs) {
      this.drawSingleKrathong(k.x, gy + 45 + k.yOffset, k);
    }
  }

  // Draw 2D Krathong with Realistic Water Candle Shimmers
  drawSingleKrathong(x, y, k) {
    const ctx = this.ctx;
    const bob = Math.sin(this.time * k.bobSpeed + k.phase) * (2.5 * k.scale);
    const curY = y + bob;

    ctx.save();
    ctx.translate(x, curY);
    ctx.scale(k.scale, k.scale);

    // Vertical Water Candle Reflection Ribbon (เงาสะท้อนแสงเทียนพริ้วไหวบนผิวน้ำ)
    const shimmerLength = 28 + k.scale * 16;
    const reflGrad = ctx.createLinearGradient(0, 4, 0, shimmerLength);
    reflGrad.addColorStop(0, 'rgba(254, 240, 138, 0.65)');
    reflGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.35)');
    reflGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

    ctx.fillStyle = reflGrad;
    for (let r = 0; r < 5; r++) {
      const rw = 14 - r * 2.2;
      const ry = 4 + r * 6;
      const rxOffset = Math.sin(this.time * 6 + k.phase + r) * 2.5;
      ctx.fillRect(rxOffset - rw / 2, ry, rw, 5);
    }

    // Outer Candle Halo
    const rg = ctx.createRadialGradient(0, -6, 2, 0, 4, 30);
    rg.addColorStop(0, 'rgba(254, 240, 138, 0.75)');
    rg.addColorStop(0.5, 'rgba(245, 158, 11, 0.3)');
    rg.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.ellipse(0, 4, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Base (Banana trunk / folded leaf)
    ctx.fillStyle = k.baseColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 19, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Folded Border Leaf Tips
    ctx.fillStyle = '#14532d';
    for (let p = 0; p < 10; p++) {
      const angle = (p / 10) * Math.PI * 2;
      const px = Math.cos(angle) * 19;
      const py = Math.sin(angle) * 7;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lotus Flower Petals
    ctx.fillStyle = k.flowerColor || '#f43f5e';
    for (let p = 0; p < 8; p++) {
      const angle = (p / 8) * Math.PI * 2;
      const px = Math.cos(angle) * 13;
      const py = Math.sin(angle) * 5 - 2;
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Candle
    ctx.fillStyle = k.candleColor;
    ctx.fillRect(-2.5, -15, 5, 13);

    // Flickering Candle Flame with warm white core
    const flameFlicker = Math.sin(this.time * 18 + k.phase) * 1.0;
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.ellipse(0, -18 + flameFlicker, 3.5, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, -18 + flameFlicker, 1.6, 3.0, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3 Incense Sticks with glowing tips
    ctx.strokeStyle = '#a16207';
    ctx.lineWidth = 1.2;
    [-4, 0, 4].forEach(sx => {
      ctx.beginPath();
      ctx.moveTo(sx, -2);
      ctx.lineTo(sx - 1.2, -18);
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(sx - 2, -19, 1.8, 1.8);
    });

    // Special Player Label badge
    if (k.isPlayer) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(-42, -38, 84, 16, 8);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨ กระทงของคุณ ✨', 0, -26);
    }

    ctx.restore();
  }

  // Draw Foreground Animated Water Waves
  drawWaterWaves(gy) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    const waterGrad = ctx.createLinearGradient(0, gy + 30, 0, h);
    waterGrad.addColorStop(0, '#0c2340');
    waterGrad.addColorStop(0.5, '#07162c');
    waterGrad.addColorStop(1, '#030a16');
    ctx.fillStyle = waterGrad;

    ctx.beginPath();
    ctx.moveTo(0, gy + 35);
    for (let x = 0; x <= w; x += 30) {
      const wave = Math.sin((x + this.cameraX * 0.5) * 0.03 + this.time * 2.2) * 5;
      ctx.lineTo(x, gy + 35 + wave);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Moonlight shimmer ribbons across water
    ctx.fillStyle = 'rgba(254, 240, 138, 0.12)';
    for (let y = gy + 45; y < h; y += 20) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 35) {
        const shim = Math.sin((x + this.time * 30) * 0.05) * 2.5;
        ctx.arc(x, y + shim, 1.8, 0, Math.PI * 2);
      }
      ctx.fill();
    }
  }

  // Draw 2D Player Avatar
  drawPlayer(x, gy) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, gy);

    ctx.scale(this.player.direction, 1);

    const legSwing = this.player.isMoving ? Math.sin(this.player.walkCycle) * 12 : 0;
    const armSwing = this.player.isMoving ? Math.sin(this.player.walkCycle) * 14 : 0;
    const bodyBob = this.player.isMoving ? Math.abs(Math.sin(this.player.walkCycle)) * 3 : 0;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(0, -bodyBob);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-5, -20);
    ctx.lineTo(-5 + legSwing, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(5, -20);
    ctx.lineTo(5 - legSwing, 0);
    ctx.stroke();

    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.roundRect(-10, -48, 20, 28, 4);
    ctx.fill();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-9, -46);
    ctx.lineTo(9, -22);
    ctx.stroke();

    ctx.strokeStyle = '#fed7aa';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -42);
    ctx.lineTo(armSwing, -25);
    ctx.stroke();

    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -60, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, -64, 11, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -73, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.scale(this.player.direction, 1);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.beginPath();
    ctx.roundRect(-30, -96, 60, 16, 8);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('คุณ (You) 🪷', 0, -84);

    ctx.restore();
  }
}
