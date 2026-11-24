import * as THREE from 'three';

export class TempleBuilder {
  constructor(scene) {
    this.scene = scene;
  }

  buildAll() {
    this.buildGoldenChedi(26, 0, 2);
    this.buildUbosot(-26, 0, -8);
    this.buildEntranceArch(0, 0, 48);
    this.buildTempleWall();
    this.buildFestiveStringLights();
    this.buildBodhiTrees();
    this.buildRiverPier(0, 0, -28);
    this.buildStreetLampPosts();
  }

  // 1. Golden Chedi (พระเจดีย์ทองคำส่องประกายสีทองสว่างไสว)
  buildGoldenChedi(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.85,
      roughness: 0.16,
      emissive: 0x996d00,
      emissiveIntensity: 0.72
    });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xe8e6e0, roughness: 0.8 });

    // Tiered square base
    const baseTiers = [
      { w: 18, h: 1.2 },
      { w: 15, h: 1.0 },
      { w: 12.5, h: 0.9 },
      { w: 10.5, h: 0.8 }
    ];
    let curY = 0;
    baseTiers.forEach(tier => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(tier.w, tier.h, tier.w), stoneMat);
      b.position.y = curY + tier.h / 2;
      group.add(b);
      curY += tier.h;
    });

    // Plinth
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.8, 1.8, 8), goldMat);
    plinth.position.y = curY + 0.9;
    group.add(plinth);
    curY += 1.8;

    // Bell shape
    const bell = new THREE.Mesh(new THREE.SphereGeometry(4.8, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.65), goldMat);
    bell.position.y = curY + 2.5;
    bell.scale.set(1, 1.2, 1);
    group.add(bell);
    curY += 4.5;

    // Spire rings
    const spireRings = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 2.2, 5.5, 14), goldMat);
    spireRings.position.y = curY + 2.75;
    group.add(spireRings);
    curY += 5.5;

    // Needle
    const spireNeedle = new THREE.Mesh(new THREE.ConeGeometry(0.7, 8, 14), goldMat);
    spireNeedle.position.y = curY + 4;
    group.add(spireNeedle);

    // 4 Upward Architectural Floodlights focusing on the Chedi
    const spotCoords = [
      { dx: 13, dz: 13 },
      { dx: -13, dz: 13 },
      { dx: 13, dz: -13 },
      { dx: -13, dz: -13 }
    ];
    spotCoords.forEach(c => {
      const sp = new THREE.SpotLight(0xffea77, 3.8, 65, Math.PI / 3.8, 0.4);
      sp.position.set(x + c.dx, 1.2, z + c.dz);
      sp.target = group;
      sp.castShadow = false;
      this.scene.add(sp);
    });

    this.scene.add(group);

    // Spire radiant golden halo PointLight
    const stupaGlow = new THREE.PointLight(0xffea66, 4.2, 90);
    stupaGlow.position.set(x, curY + 6, z);
    stupaGlow.castShadow = false;
    this.scene.add(stupaGlow);

    // Radiant Gold Jewel Sprite at Spire Tip
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.3, 'rgba(255, 235, 100, 0.85)');
    grad.addColorStop(0.65, 'rgba(245, 158, 11, 0.45)');
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const jewelTex = new THREE.CanvasTexture(canvas);
    const jewelSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: jewelTex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95
    }));
    jewelSprite.position.set(x, curY + 5.5, z);
    jewelSprite.scale.set(7.5, 7.5, 1);
    this.scene.add(jewelSprite);
  }

  // 2. Thai Ubosot with Glowing Windows & Verandah Lanterns
  buildUbosot(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf6f4ed, roughness: 0.9 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xba3c1e, roughness: 0.45 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf5c324, metalness: 0.82, roughness: 0.28 });
    const windowMat = new THREE.MeshBasicMaterial({ color: 0xffcc44 });

    // Base podium & steps
    const podium = new THREE.Mesh(new THREE.BoxGeometry(22, 1.8, 30), wallMat);
    podium.position.y = 0.9;
    group.add(podium);

    for (let s = 0; s < 4; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(7, 0.45, 1.2), wallMat);
      step.position.set(0, s * 0.45 + 0.22, 15 + (4 - s) * 1.1);
      group.add(step);
    }

    // Main Hall Walls
    const hall = new THREE.Mesh(new THREE.BoxGeometry(16, 7.5, 24), wallMat);
    hall.position.y = 1.8 + 3.75;
    group.add(hall);

    // Glowing Windows
    for (let pz of [-7, 0, 7]) {
      [-8.05, 8.05].forEach(px => {
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.2, 1.8), windowMat);
        win.position.set(px, 1.8 + 4.2, pz);
        group.add(win);

        const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.6, 2.2), goldMat);
        winFrame.position.set(px, 1.8 + 4.2, pz);
        group.add(winFrame);
      });
    }

    // Pillars
    for (let pz of [-13, -6.5, 0, 6.5, 13]) {
      for (let px of [-9, 9]) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 7.5, 8), wallMat);
        pillar.position.set(px, 1.8 + 3.75, pz);
        group.add(pillar);

        const pillarCap = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.45, 0.6, 8), goldMat);
        pillarCap.position.set(px, 1.8 + 7.5, pz);
        group.add(pillarCap);
      }
    }

    // Tiered Gable Roof
    const roofTiers = [
      { y: 1.8 + 7.5, w: 23, len: 32, h: 4.8 },
      { y: 1.8 + 10.5, w: 17, len: 26, h: 4.0 }
    ];

    roofTiers.forEach(tier => {
      const roofGeo = new THREE.ConeGeometry(tier.w / 1.7, tier.h, 4);
      roofGeo.rotateY(Math.PI / 4);
      roofGeo.scale(1, 1, tier.len / tier.w);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = tier.y + tier.h / 2;
      group.add(roof);

      const chofah1 = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2.2, 8), goldMat);
      chofah1.position.set(0, tier.y + tier.h + 0.8, tier.len / 2 - 1);
      chofah1.rotation.x = 0.4;
      group.add(chofah1);

      const chofah2 = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2.2, 8), goldMat);
      chofah2.position.set(0, tier.y + tier.h + 0.8, -tier.len / 2 + 1);
      chofah2.rotation.x = -0.4;
      group.add(chofah2);
    });

    // Glowing Door
    const door = new THREE.Mesh(new THREE.BoxGeometry(2.8, 5.2, 0.3), new THREE.MeshBasicMaterial({ color: 0xffcc44 }));
    door.position.set(0, 1.8 + 2.6, 12.1);
    group.add(door);

    // Beautiful Hanging Lanterns under verandah
    [-4, 4].forEach(lx => {
      this.createHangingSilkLantern(group, lx, 1.8 + 6.5, 12.8, 0xff7722);
    });

    this.scene.add(group);
  }

  // 3. Entrance Arch
  buildEntranceArch(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xeae6dc });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf5c324, metalness: 0.7, roughness: 0.3 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xba3c1e });

    const pLeft = new THREE.Mesh(new THREE.BoxGeometry(1.6, 8, 1.6), pillarMat);
    pLeft.position.set(-6, 4, 0);
    group.add(pLeft);

    const pRight = new THREE.Mesh(new THREE.BoxGeometry(1.6, 8, 1.6), pillarMat);
    pRight.position.set(6, 4, 0);
    group.add(pRight);

    const beam = new THREE.Mesh(new THREE.BoxGeometry(15, 1.4, 2.0), pillarMat);
    beam.position.set(0, 7.8, 0);
    group.add(beam);

    const archRoof = new THREE.Mesh(new THREE.ConeGeometry(8, 3.2, 4), roofMat);
    archRoof.position.set(0, 10, 0);
    archRoof.rotation.y = Math.PI / 4;
    archRoof.scale.set(1.4, 1, 0.7);
    group.add(archRoof);

    const archSpire = new THREE.Mesh(new THREE.ConeGeometry(0.5, 3.5, 8), goldMat);
    archSpire.position.set(0, 12.8, 0);
    group.add(archSpire);

    // Festival banner
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#9b1b1b';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 10;
    ctx.strokeRect(8, 8, 496, 112);
    ctx.fillStyle = '#fff9d6';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('งานวัดลอยกระทง ๒๕๖๙', 256, 64);

    const signTex = new THREE.CanvasTexture(canvas);
    const signMesh = new THREE.Mesh(
      new THREE.BoxGeometry(9, 1.8, 0.2),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    signMesh.position.set(0, 6.2, 0.85);
    group.add(signMesh);

    // Hanging lanterns on arch
    [-6, 6].forEach(px => {
      this.createHangingSilkLantern(group, px, 5.5, 1.1, 0xf59e0b);
    });

    this.scene.add(group);
  }

  // 4. Temple Walls
  buildTempleWall() {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xd9d5cb, roughness: 0.9 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0x9e331b, roughness: 0.6 });

    const makeWallSegment = (x, z, length) => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(length, 2.4, 0.8), wallMat);
      w.position.set(x, 1.2, z);
      this.scene.add(w);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(length + 0.3, 0.4, 1.1), capMat);
      cap.position.set(x, 2.5, z);
      this.scene.add(cap);
    };

    makeWallSegment(-28, 48, 38);
    makeWallSegment(28, 48, 38);
  }

  // 5. Festive String Lights (สายไฟปิงปองงานวัดหลากสี)
  buildFestiveStringLights() {
    const bulbColors = [0xff3344, 0xffdd22, 0x22ee77, 0x33aaff, 0xff55cc, 0xff8800];
    const bulbMaterials = bulbColors.map(c => new THREE.MeshBasicMaterial({ color: c }));
    const bulbGeo = new THREE.SphereGeometry(0.22, 6, 6);
    const stringGroup = new THREE.Group();

    const spans = [
      { z: 42, y: 5.5 },
      { z: 30, y: 5.8 },
      { z: 18, y: 5.6 },
      { z: 6, y: 5.7 },
      { z: -6, y: 5.5 },
      { z: -18, y: 5.5 }
    ];

    spans.forEach((span, sIdx) => {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-14, span.y, span.z),
        new THREE.Vector3(0, span.y - 1.2, span.z),
        new THREE.Vector3(14, span.y, span.z)
      );

      const points = curve.getPoints(10);
      const wireGeo = new THREE.BufferGeometry().setFromPoints(points);
      const wire = new THREE.Line(wireGeo, new THREE.LineBasicMaterial({ color: 0x111111 }));
      stringGroup.add(wire);

      points.forEach((pt, i) => {
        if (i === 0 || i === points.length - 1) return;
        const mat = bulbMaterials[(i + sIdx) % bulbMaterials.length];
        const bulb = new THREE.Mesh(bulbGeo, mat);
        bulb.position.copy(pt);
        stringGroup.add(bulb);
      });
    });

    this.scene.add(stringGroup);
  }

  // 6. Bodhi Trees with Twinkling Fairy Lights
  buildBodhiTrees() {
    const treePositions = [
      { x: -18, z: 36, scale: 1.1 },
      { x: 18, z: 34, scale: 1.0 },
      { x: -20, z: 10, scale: 1.2 },
      { x: 22, z: -12, scale: 1.3 }
    ];

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2917, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x1a451e, roughness: 0.7 });

    treePositions.forEach(pos => {
      const tree = new THREE.Group();
      tree.position.set(pos.x, 0, pos.z);
      tree.scale.set(pos.scale, pos.scale, pos.scale);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.3, 7, 8), trunkMat);
      trunk.position.y = 3.5;
      tree.add(trunk);

      const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(3.6, 1), leafMat);
      c1.position.y = 7.5;
      tree.add(c1);

      const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.8, 1), leafMat);
      c2.position.set(1.4, 9.0, 0.6);
      tree.add(c2);

      // Hanging lanterns on tree branches
      this.createHangingSilkLantern(tree, 1.8, 6.5, 1.2, 0xfde047);

      this.scene.add(tree);
    });
  }

  // 7. Beautiful Krathong Floating Pier (จุดลอยกระทงริมน้ำสวยงามพร้อมโคมไฟ)
  buildRiverPier(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3e26, roughness: 0.85 });
    const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x3e2817, roughness: 0.9 });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x3a3632, roughness: 0.9 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf5c324, metalness: 0.8 });

    // Stone Steps down to river
    for (let i = 0; i < 5; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(16, 0.5, 1.8), stoneMat);
      step.position.set(0, -i * 0.45, -i * 1.4);
      group.add(step);
    }

    // Main Wooden Pier Platform extending into water
    const pier = new THREE.Mesh(new THREE.BoxGeometry(14, 0.6, 16), woodMat);
    pier.position.set(0, -2.4, -5 * 1.4 - 8);
    group.add(pier);

    // Decorative Pier Railings on left and right
    [-6.8, 6.8].forEach(rx => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.9, 15.5), darkWoodMat);
      rail.position.set(rx, -1.7, -15);
      group.add(rail);

      // Gold finials on railing corners
      [-8, -15, -22].forEach(rz => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.5, 6), darkWoodMat);
        post.position.set(rx, -1.6, rz);
        group.add(post);

        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), goldMat);
        cap.position.set(rx, -0.8, rz);
        group.add(cap);
      });
    });

    // Bamboo Torches (คบเพลิงส่องสว่างริมน้ำ)
    const torchZ = [-10, -16, -22];
    torchZ.forEach(sz => {
      [-7.2, 7.2].forEach(sx => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 3.2, 8), woodMat);
        post.position.set(sx, -0.9, sz);
        group.add(post);

        const flame = new THREE.Mesh(
          new THREE.ConeGeometry(0.32, 0.75, 8),
          new THREE.MeshBasicMaterial({ color: 0xff6600 })
        );
        flame.position.set(sx, 0.9, sz);
        group.add(flame);
      });
    });

    // Hanging Festive Lanterns on the Pier
    [-6.8, 6.8].forEach(lx => {
      this.createHangingSilkLantern(group, lx, 0.4, -12, 0xff7722);
      this.createHangingSilkLantern(group, lx, 0.4, -18, 0xf59e0b);
    });

    // Decorative Flower Offerings & Lotus Bowls on Pier Front Edge
    [-3.5, 3.5].forEach(fx => {
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.7, 8), goldMat);
      pedestal.position.set(fx, -1.8, -22.5);
      group.add(pedestal);

      const bowl = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 0), new THREE.MeshStandardMaterial({ color: 0x15803d }));
      bowl.position.set(fx, -1.4, -22.5);
      group.add(bowl);

      // Lotus Flower in bowl
      const lotus = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
      lotus.position.set(fx, -1.2, -22.5);
      group.add(lotus);
    });

    // Soft Warm Pier Illumination
    const pierLight = new THREE.PointLight(0xff8822, 2.4, 25);
    pierLight.position.set(0, 0.8, -15);
    group.add(pierLight);

    // Pier Sign: "ท่าน้ำลอยกระทง (Pier)"
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sctx = signCanvas.getContext('2d');
    sctx.fillStyle = '#1c3654';
    sctx.fillRect(0, 0, 512, 128);
    sctx.strokeStyle = '#ffd700';
    sctx.lineWidth = 8;
    sctx.strokeRect(6, 6, 500, 116);
    sctx.fillStyle = '#ffea88';
    sctx.font = 'bold 40px sans-serif';
    sctx.textAlign = 'center';
    sctx.textBaseline = 'middle';
    sctx.fillText('ท่าน้ำลอยกระทง (Pier)', 256, 64);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(
      new THREE.BoxGeometry(6, 1.5, 0.2),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    signMesh.position.set(0, 0.8, -7);
    group.add(signMesh);

    this.scene.add(group);
  }

  // Beautiful Traditional Hanging Silk Lantern (โคมแขวนผ้าไหม/โคมรังผึ้ง)
  createHangingSilkLantern(parent, x, y, z, color = 0xf59e0b) {
    const lantern = new THREE.Group();
    lantern.position.set(x, y, z);

    // Cord
    const cord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.6, 4),
      new THREE.MeshBasicMaterial({ color: 0x333333 })
    );
    cord.position.y = 0.3;
    lantern.add(cord);

    // Glowing Silk Body (Octagonal cylinder)
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.45, 0.85, 8),
      new THREE.MeshBasicMaterial({ color: color })
    );
    lantern.add(body);

    // Gold Top & Bottom Caps
    const capMat = new THREE.MeshStandardMaterial({ color: 0xf5c324, metalness: 0.8 });
    const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.36, 0.08, 8), capMat);
    topCap.position.y = 0.44;
    lantern.add(topCap);

    const btmCap = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.44, 0.08, 8), capMat);
    btmCap.position.y = -0.44;
    lantern.add(btmCap);

    // Golden Tassel (พู่ห้อย)
    const tassel = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.35, 6),
      capMat
    );
    tassel.position.y = -0.65;
    lantern.add(tassel);

    parent.add(lantern);
    return lantern;
  }

  // 8. Traditional Thai Street Lamp Posts (เสาไฟส่องสว่างงานวัดและทางเดินริมน้ำ)
  buildStreetLampPosts() {
    const postGroup = new THREE.Group();

    // Shared materials
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x2e2820, roughness: 0.6, metalness: 0.4 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf5bf18, roughness: 0.25, metalness: 0.85 });
    const lanternGlassMat = new THREE.MeshBasicMaterial({ color: 0xffea77 });
    const stoneBaseMat = new THREE.MeshStandardMaterial({ color: 0x4a453f, roughness: 0.8 });

    // Shared geometries
    const baseGeo = new THREE.BoxGeometry(0.85, 0.4, 0.85);
    const plinthGeo = new THREE.CylinderGeometry(0.28, 0.38, 0.35, 8);
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.14, 4.2, 8);
    const lotusCapitalGeo = new THREE.ConeGeometry(0.35, 0.35, 8);
    const lanternGeo = new THREE.CylinderGeometry(0.28, 0.22, 0.65, 6);
    const roofGeo = new THREE.ConeGeometry(0.48, 0.35, 6);
    const finialGeo = new THREE.ConeGeometry(0.06, 0.3, 6);

    const makeLampPost = (x, y, z) => {
      const lamp = new THREE.Group();
      lamp.position.set(x, y, z);

      // Base
      const b1 = new THREE.Mesh(baseGeo, stoneBaseMat);
      b1.position.y = 0.2;
      lamp.add(b1);

      const b2 = new THREE.Mesh(plinthGeo, goldMat);
      b2.position.y = 0.55;
      lamp.add(b2);

      // Pole
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 0.7 + 2.1;
      lamp.add(pole);

      // Lotus Capital
      const cap = new THREE.Mesh(lotusCapitalGeo, goldMat);
      cap.position.y = 4.95;
      cap.rotation.x = Math.PI; // upside down lotus
      lamp.add(cap);

      // Hexagonal Glowing Glass Lantern
      const glass = new THREE.Mesh(lanternGeo, lanternGlassMat);
      glass.position.y = 5.45;
      lamp.add(glass);

      // Lantern Roof
      const roof = new THREE.Mesh(roofGeo, goldMat);
      roof.position.y = 5.9;
      roof.rotation.y = Math.PI / 6;
      lamp.add(roof);

      // Finial needle
      const finial = new THREE.Mesh(finialGeo, goldMat);
      finial.position.y = 6.2;
      lamp.add(finial);

      postGroup.add(lamp);
    };

    // Positions flanking the central market street
    const streetZ = [42, 28, 14, 0, -14];
    streetZ.forEach(pz => {
      makeLampPost(-5.8, 0, pz);
      makeLampPost(5.8, 0, pz);
    });

    // Positions along the river pier approach and stairs
    makeLampPost(-5.2, -0.6, -28);
    makeLampPost(5.2, -0.6, -28);
    makeLampPost(-4.8, -2.1, -36);
    makeLampPost(4.8, -2.1, -36);
    makeLampPost(-4.8, -2.1, -41);
    makeLampPost(4.8, -2.1, -41);

    // Positions around the Golden Chedi perimeter
    makeLampPost(15.5, 0, 14);
    makeLampPost(36.5, 0, 14);
    makeLampPost(15.5, 0, -10);
    makeLampPost(36.5, 0, -10);

    this.scene.add(postGroup);
  }
}
