import * as THREE from 'three';

// Shared Resources Cache to eliminate memory waste and draw call overhead
class KrathongResourceCache {
  constructor() {
    // 1. Shared Geometries
    this.baseGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.28, 12);
    this.petalRingGeo = new THREE.TorusGeometry(0.72, 0.14, 4, 12);
    this.flowerRingGeo = new THREE.TorusGeometry(0.45, 0.12, 5, 10);
    this.candleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.48, 6);
    this.flameGeo = new THREE.ConeGeometry(0.08, 0.22, 6);
    this.incenseGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.55, 4);

    // 2. Shared Materials — use MeshLambertMaterial so they're visible under ambient light
    this.bananaMat  = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
    this.leafPetalMat = new THREE.MeshLambertMaterial({ color: 0x1b5e20 });
    this.breadMat   = new THREE.MeshLambertMaterial({ color: 0xd97706 });

    this.lotusMat   = new THREE.MeshLambertMaterial({ color: 0xf43f5e, emissive: 0x7a1f30, emissiveIntensity: 0.4 });
    this.marigoldMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, emissive: 0x7a4d00, emissiveIntensity: 0.4 });
    this.orchidMat  = new THREE.MeshLambertMaterial({ color: 0xc026d3, emissive: 0x601368, emissiveIntensity: 0.4 });

    this.candleMat  = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });
    this.flameMat   = new THREE.MeshBasicMaterial({ color: 0xff6600 });
    this.incenseMat = new THREE.MeshBasicMaterial({ color: 0x996633 });

    // 3. Glowing Candle Halo Sprite Texture (Generates once on canvas, 0 runtime lighting cost!)
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 230, 140, 1.0)');
    grad.addColorStop(0.35, 'rgba(255, 140, 20, 0.6)');
    grad.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    this.haloTexture = new THREE.CanvasTexture(canvas);
    this.haloMat = new THREE.SpriteMaterial({
      map: this.haloTexture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.85
    });
  }
}

let cache = null;
function getCache() {
  if (!cache) cache = new KrathongResourceCache();
  return cache;
}

export class KrathongSystem {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.floatingKrathongs = [];
    this.cache = getCache();

    // Populate river with 85+ Krathongs with 0-lag shared assets
    this.spawnRiverKrathongs(85);
  }

  createKrathongMesh(options = {}) {
    const res = this.cache;
    const {
      baseType = 'banana',
      flowerType = 'lotus',
      scale = 1.0
    } = options;

    const group = new THREE.Group();

    // 1. Base Mesh
    const baseMat = baseType === 'bread' ? res.breadMat : res.bananaMat;
    const base = new THREE.Mesh(res.baseGeo, baseMat);
    base.position.y = 0.14;
    group.add(base);

    // Leaf Border Ring
    const leafRing = new THREE.Mesh(res.petalRingGeo, res.leafPetalMat);
    leafRing.rotation.x = Math.PI / 2;
    leafRing.position.y = 0.22;
    group.add(leafRing);

    // 2. Flower Ring
    let flowerMat = res.lotusMat;
    if (flowerType === 'marigold') flowerMat = res.marigoldMat;
    if (flowerType === 'orchid') flowerMat = res.orchidMat;

    const flowers = new THREE.Mesh(res.flowerRingGeo, flowerMat);
    flowers.rotation.x = Math.PI / 2;
    flowers.position.y = 0.32;
    group.add(flowers);

    // 3. Candle
    const candle = new THREE.Mesh(res.candleGeo, res.candleMat);
    candle.position.y = 0.55;
    group.add(candle);

    // 4. Flame
    const flame = new THREE.Mesh(res.flameGeo, res.flameMat);
    flame.position.y = 0.85;
    group.add(flame);

    // 5. Glowing Candle Halo Sprite (Gives gorgeous glow with ZERO GPU light calculation!)
    const halo = new THREE.Sprite(res.haloMat);
    halo.position.set(0, 0.88, 0);
    halo.scale.set(2.2, 2.2, 1);
    group.add(halo);

    // 6. Incense Sticks
    [-0.07, 0.07].forEach((sx, idx) => {
      const stick = new THREE.Mesh(res.incenseGeo, res.incenseMat);
      stick.position.set(sx, 0.58, -0.12);
      stick.rotation.x = -0.15;
      stick.rotation.z = (idx === 0 ? -0.1 : 0.1);
      group.add(stick);
    });

    group.scale.set(scale, scale, scale);
    return { group, halo };
  }

  spawnRiverKrathongs(totalCount = 85) {
    const flowers = ['lotus', 'marigold', 'orchid'];
    const bases = ['banana', 'banana', 'bread'];

    for (let i = 0; i < totalCount; i++) {
      const flowerType = flowers[i % flowers.length];
      const baseType = bases[i % bases.length];
      const scale = 0.8 + (i % 5) * 0.1;

      const { group, halo } = this.createKrathongMesh({
        baseType,
        flowerType,
        scale
      });

      // Scatter across river beyond pier (X: -75 to 75, Z: -54 to -125)
      const posX = ((i * 1.77) % 150) - 75 + (Math.random() - 0.5) * 4;
      const posZ = -54 - ((i * 0.85) % 70);
      group.position.set(posX, -2.68, posZ);

      group.userData = {
        isKrathong: true,
        speedX: 0.35 + (i % 4) * 0.1,
        bobSpeed: 1.4 + (i % 3) * 0.3,
        bobOffset: (i * 0.7) % (Math.PI * 2),
        rotSpeed: 0.08 + (i % 3) * 0.04,
        halo: halo
      };

      this.scene.add(group);
      this.floatingKrathongs.push(group);
    }
  }

  // Launch Player's Krathong
  launchPlayerKrathong(wishText) {
    const { group, halo } = this.createKrathongMesh({
      baseType: 'banana',
      flowerType: 'lotus',
      scale: 1.6
    });

    // Spawn right on the river water in front of pier edge (Pier ends at Z: -51)
    group.position.set((Math.random() - 0.5) * 2.0, -2.68, -53.5);

    // Glowing Candle Light shining brightly on water & surrounding waves
    const candleLight = new THREE.PointLight(0xffb733, 2.8, 14);
    candleLight.position.set(0, 0.95, 0);
    candleLight.castShadow = false;
    group.add(candleLight);

    // Glowing Sprite Badge above player's krathong
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 236, 44, 12);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ กระทงของคุณ ✨', 128, 32);

    const auraTex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: auraTex }));
    sprite.position.set(0, 2.0, 0);
    sprite.scale.set(2.6, 0.65, 1);
    group.add(sprite);

    group.userData = {
      isKrathong: true,
      isPlayer: true,
      wish: wishText || 'ขอให้ชีวิตพบเจอแต่สิ่งดีๆ มีความสุขตลอดไป ✨',
      speedX: 0.22,
      speedZ: -0.65, // Glides smoothly forward into the moonlit river
      bobSpeed: 1.8,
      bobOffset: 0,
      rotSpeed: 0.12,
      halo: halo
    };

    this.scene.add(group);
    this.floatingKrathongs.push(group);
    return group;
  }

  update(delta, elapsed) {
    for (let i = 0; i < this.floatingKrathongs.length; i++) {
      const k = this.floatingKrathongs[i];
      const u = k.userData;

      k.position.x += u.speedX * delta;
      if (u.speedZ) {
        k.position.z += u.speedZ * delta;
        if (k.position.z < -95) u.speedZ *= 0.99;
      }

      // Gentle bobbing on water
      k.position.y = -2.68 + Math.sin(elapsed * u.bobSpeed + u.bobOffset) * 0.05;
      k.rotation.y += u.rotSpeed * delta;

      // Halo pulse
      if (u.halo) {
        const pulse = 2.2 + Math.sin(elapsed * 8 + u.bobOffset) * 0.2;
        u.halo.scale.set(pulse, pulse, 1);
      }

      if (k.position.x > 80) {
        k.position.x = -80;
        k.position.z = -54 - (i % 65);
      }
    }
  }
}
