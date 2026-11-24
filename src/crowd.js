import * as THREE from 'three';

export class CrowdManager {
  constructor(scene) {
    this.scene = scene;
    this.people = [];
    this.walkers = [];
    this.candles = [];
    this.init();
  }

  init() {
    this.buildCrowd();
  }

  buildCrowd() {
    const crowdGroup = new THREE.Group();

    // Shared Materials
    const skinMats = [
      new THREE.MeshLambertMaterial({ color: 0xf5cda4 }),
      new THREE.MeshLambertMaterial({ color: 0xedd0b0 }),
      new THREE.MeshLambertMaterial({ color: 0xdca87c })
    ];

    const hairMats = [
      new THREE.MeshLambertMaterial({ color: 0x18181b }),
      new THREE.MeshLambertMaterial({ color: 0x27272a }),
      new THREE.MeshLambertMaterial({ color: 0x3f3f46 })
    ];

    const shirtColors = [
      0xef4444, // แดงชาด
      0xf59e0b, // เหลืองทอง
      0x10b981, // เขียวมรกต
      0x3b82f6, // น้ำเงินคราม
      0xec4899, // ชมพูดอกบัว
      0x8b5cf6, // ม่วงดอกรัก
      0x06b6d4, // ฟ้าคราม
      0xffffff  // ขาวสะอาด
    ];
    const clothMats = shirtColors.map(c => new THREE.MeshLambertMaterial({ color: c }));

    const pantsColors = [0x1e293b, 0x334155, 0x475569, 0x7c2d12, 0x1e3a8a, 0x064e3b];
    const pantsMats = pantsColors.map(c => new THREE.MeshLambertMaterial({ color: c }));

    const goldSashMat = new THREE.MeshStandardMaterial({
      color: 0xf5bf18,
      metalness: 0.8,
      roughness: 0.3,
      emissive: 0x664400,
      emissiveIntensity: 0.3
    });

    // Krathong & Flame Materials
    const krathongBaseMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
    const lotusMat = new THREE.MeshLambertMaterial({ color: 0xf43f5e, emissive: 0x501020, emissiveIntensity: 0.5 });
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

    // Helper: Build a stylized Thai person model
    const createPerson = (options) => {
      const {
        x = 0, y = 0, z = 0,
        rotY = 0,
        scale = 1.0,
        shirtIndex = 0,
        pantsIndex = 0,
        skinIndex = 0,
        hairType = 'short',
        pose = 'standing',
        hasKrathong = false,
        hasBalloon = false,
        balloonColor = 0xff3366,
        isWalker = false,
        walkerConfig = null
      } = options;

      const person = new THREE.Group();
      person.position.set(x, y, z);
      person.rotation.y = rotY;
      person.scale.set(scale, scale, scale);

      const skinMat = skinMats[skinIndex % skinMats.length];
      const shirtMat = clothMats[shirtIndex % clothMats.length];
      const pantsMat = pantsMats[pantsIndex % pantsMats.length];
      const hairMat = hairMats[skinIndex % hairMats.length];

      let leftLeg = null, rightLeg = null;
      let leftArm = null, rightArm = null;

      if (pose === 'kneeling') {
        // Kneeling person at pier (คุกเข่าลอยกระทง)
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.35), shirtMat);
        torso.position.y = 0.65;
        person.add(torso);

        const sash = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.75, 0.38), goldSashMat);
        sash.rotation.z = 0.35;
        sash.position.set(0, 0.65, 0.01);
        person.add(sash);

        const legs = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.28, 0.65), pantsMat);
        legs.position.set(0, 0.14, 0.05);
        person.add(legs);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), skinMat);
        head.position.y = 1.18;
        person.add(head);

        const hair = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.6), hairMat);
        hair.position.y = 1.22;
        person.add(hair);
        if (hairType === 'bun') {
          const bun = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), hairMat);
          bun.position.set(0, 1.44, -0.1);
          person.add(bun);
        }

        leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6), skinMat);
        leftArm.position.set(-0.25, 0.65, 0.22);
        leftArm.rotation.x = Math.PI / 3;
        leftArm.rotation.z = -0.2;
        person.add(leftArm);

        rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6), skinMat);
        rightArm.position.set(0.25, 0.65, 0.22);
        rightArm.rotation.x = Math.PI / 3;
        rightArm.rotation.z = 0.2;
        person.add(rightArm);

        if (hasKrathong) {
          const kGroup = new THREE.Group();
          kGroup.position.set(0, 0.55, 0.45);
          const kBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 8), krathongBaseMat);
          kGroup.add(kBase);
          const kFlower = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.06, 4, 8), lotusMat);
          kFlower.rotation.x = Math.PI / 2;
          kFlower.position.y = 0.06;
          kGroup.add(kFlower);
          const flame = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.1, 5), flameMat);
          flame.position.y = 0.16;
          kGroup.add(flame);

          const candleLight = new THREE.PointLight(0xffaa22, 0.8, 4);
          candleLight.position.set(0, 0.2, 0);
          candleLight.castShadow = false;
          kGroup.add(candleLight);
          this.candles.push(candleLight);
          person.add(kGroup);
        }

      } else {
        // Standing & Walking Person (ยืนหรือเดินเที่ยวงานวัด)
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.35), shirtMat);
        torso.position.y = 1.15;
        person.add(torso);

        const sash = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.38), goldSashMat);
        sash.rotation.z = 0.35;
        sash.position.set(0, 1.15, 0.01);
        person.add(sash);

        // Legs with pivot at hip (y: 0.78) for swinging
        const makeLeg = (px) => {
          const legGroup = new THREE.Group();
          legGroup.position.set(px, 0.78, 0);
          const legMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.76, 6), pantsMat);
          legMesh.position.y = -0.38;
          legGroup.add(legMesh);
          return legGroup;
        };
        leftLeg = makeLeg(-0.16);
        rightLeg = makeLeg(0.16);
        person.add(leftLeg);
        person.add(rightLeg);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), skinMat);
        head.position.y = 1.72;
        person.add(head);

        const hair = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.6), hairMat);
        hair.position.y = 1.76;
        person.add(hair);
        if (hairType === 'bun') {
          const bun = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), hairMat);
          bun.position.set(0, 1.98, -0.1);
          person.add(bun);
        }

        // Arms with pivot at shoulder (y: 1.45)
        const makeArm = (px) => {
          const armGroup = new THREE.Group();
          armGroup.position.set(px, 1.45, 0);
          const armMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.58, 6), skinMat);
          armMesh.position.y = -0.29;
          armGroup.add(armMesh);
          return armGroup;
        };

        if (pose === 'praying') {
          // พนมมือไหว้ / ถือกระทงไหว้
          leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6), skinMat);
          leftArm.position.set(-0.18, 1.15, 0.18);
          leftArm.rotation.x = Math.PI / 2.8;
          leftArm.rotation.z = -0.55;
          person.add(leftArm);

          rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6), skinMat);
          rightArm.position.set(0.18, 1.15, 0.18);
          rightArm.rotation.x = Math.PI / 2.8;
          rightArm.rotation.z = 0.55;
          person.add(rightArm);

          if (hasKrathong) {
            const kGroup = new THREE.Group();
            kGroup.position.set(0, 1.05, 0.32);
            const kBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.07, 8), krathongBaseMat);
            kGroup.add(kBase);
            const kFlower = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.05, 4, 8), lotusMat);
            kFlower.rotation.x = Math.PI / 2;
            kFlower.position.y = 0.05;
            kGroup.add(kFlower);
            const flame = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 5), flameMat);
            flame.position.y = 0.15;
            kGroup.add(flame);

            const candleLight = new THREE.PointLight(0xffaa22, 0.8, 4);
            candleLight.position.set(0, 0.2, 0);
            candleLight.castShadow = false;
            kGroup.add(candleLight);
            this.candles.push(candleLight);
            person.add(kGroup);
          }
        } else if (hasBalloon) {
          leftArm = makeArm(-0.35);
          person.add(leftArm);

          rightArm = makeArm(0.35);
          rightArm.rotation.z = -Math.PI / 3.2;
          person.add(rightArm);

          // Balloon
          const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.2, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }));
          cord.position.set(0.65, 2.2, 0.1);
          person.add(cord);

          const balloon = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 10, 10),
            new THREE.MeshLambertMaterial({ color: balloonColor, emissive: balloonColor, emissiveIntensity: 0.35 })
          );
          balloon.position.set(0.65, 2.85, 0.1);
          person.add(balloon);
        } else {
          leftArm = makeArm(-0.35);
          rightArm = makeArm(0.35);
          person.add(leftArm);
          person.add(rightArm);

          if (hasKrathong) {
            // ถือกระทงเดินชิลๆ
            const kGroup = new THREE.Group();
            kGroup.position.set(0, 0.95, 0.35);
            const kBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.07, 8), krathongBaseMat);
            kGroup.add(kBase);
            const kFlower = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.05, 4, 8), lotusMat);
            kFlower.rotation.x = Math.PI / 2;
            kFlower.position.y = 0.05;
            kGroup.add(kFlower);
            const flame = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 5), flameMat);
            flame.position.y = 0.15;
            kGroup.add(flame);
            person.add(kGroup);

            leftArm.rotation.x = Math.PI / 4;
            rightArm.rotation.x = Math.PI / 4;
          }
        }
      }

      person.userData = {
        baseY: y,
        swaySpeed: 1.2 + Math.random() * 0.8,
        swayOffset: Math.random() * Math.PI * 2,
        leftLeg: leftLeg,
        rightLeg: rightLeg,
        leftArm: leftArm,
        rightArm: rightArm,
        isWalker: isWalker,
        walkerConfig: walkerConfig,
        walkStep: Math.random() * Math.PI * 2
      };

      crowdGroup.add(person);

      if (isWalker && walkerConfig) {
        this.walkers.push(person);
      } else {
        this.people.push(person);
      }
      return person;
    };

    // ========================================================
    // 1. ANIMATED WALKING PEOPLE (คนเดินเล่นรอบงานวัด)
    // ========================================================
    // A. คนเดินเล่นบนถนนคนเดินตลาดงานวัด (Street Walkers)
    // Walker 1: เดินถือกระทงมุ่งหน้าสู่ท่าน้ำ
    createPerson({
      x: -1.8, y: 0, z: 38,
      rotY: Math.PI,
      scale: 1.0,
      shirtIndex: 0, pantsIndex: 0, hairType: 'bun',
      hasKrathong: true,
      isWalker: true,
      walkerConfig: { type: 'street', x: -1.8, minZ: -24, maxZ: 42, speed: 2.2, dir: -1 }
    });

    // Walker 2: สาวงามชุดไทยสีชมพูเดินเที่ยวชมตลาด
    createPerson({
      x: 1.6, y: 0, z: 12,
      rotY: Math.PI,
      scale: 0.95,
      shirtIndex: 4, pantsIndex: 1, hairType: 'bun',
      isWalker: true,
      walkerConfig: { type: 'street', x: 1.6, minZ: -20, maxZ: 40, speed: 1.8, dir: -1 }
    });

    // Walker 3: ชายหนุ่มถือลูกโป่งสีฟ้าเดินกลับจากท่าน้ำ
    createPerson({
      x: 2.2, y: 0, z: -15,
      rotY: 0,
      scale: 0.98,
      shirtIndex: 6, pantsIndex: 2, hairType: 'short',
      hasBalloon: true, balloonColor: 0x38bdf8,
      isWalker: true,
      walkerConfig: { type: 'street', x: 2.2, minZ: -22, maxZ: 42, speed: 2.4, dir: 1 }
    });

    // Walker 4: หนุ่มสาวเดินเล่นเคียงข้างกัน (คู่รักเดินงานวัด)
    createPerson({
      x: -0.6, y: 0, z: -5,
      rotY: 0,
      scale: 1.02,
      shirtIndex: 3, pantsIndex: 3, hairType: 'short',
      isWalker: true,
      walkerConfig: { type: 'street', x: -0.6, minZ: -25, maxZ: 38, speed: 1.7, dir: 1 }
    });
    createPerson({
      x: 0.35, y: 0, z: -5,
      rotY: 0,
      scale: 0.94,
      shirtIndex: 1, pantsIndex: 4, hairType: 'bun',
      isWalker: true,
      walkerConfig: { type: 'street', x: 0.35, minZ: -25, maxZ: 38, speed: 1.7, dir: 1 }
    });

    // Walker 5: เด็กวิ่งถือลูกโป่งสีชมพู
    createPerson({
      x: -2.4, y: 0, z: 25,
      rotY: Math.PI,
      scale: 0.85,
      shirtIndex: 5, pantsIndex: 1, hairType: 'short',
      hasBalloon: true, balloonColor: 0xf43f5e,
      isWalker: true,
      walkerConfig: { type: 'street', x: -2.4, minZ: -18, maxZ: 44, speed: 3.2, dir: -1 }
    });

    // B. คนเดินเวียนเทียนรอบพระเจดีย์ทองคำ (Chedi Circumambulation Walkers)
    // 4 คนเดินวนรอบฐานพระเจดีย์ทองคำ ถือกระทง/ดอกไม้ธูปเทียน
    const chediCenterX = 26;
    const chediCenterZ = 2;
    const chediRadius = 14;

    [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].forEach((startAngle, idx) => {
      const shirtIdx = (idx * 2) % shirtColors.length;
      createPerson({
        x: chediCenterX + Math.cos(startAngle) * chediRadius,
        y: 0,
        z: chediCenterZ + Math.sin(startAngle) * chediRadius,
        rotY: startAngle + Math.PI / 2,
        scale: 0.96,
        shirtIndex: shirtIdx, pantsIndex: idx, hairType: idx % 2 === 0 ? 'bun' : 'short',
        hasKrathong: true,
        isWalker: true,
        walkerConfig: {
          type: 'circle',
          cx: chediCenterX,
          cz: chediCenterZ,
          radius: chediRadius,
          angle: startAngle,
          angularSpeed: 0.16 + (idx % 2) * 0.02
        }
      });
    });

    // ========================================================
    // 2. PEOPLE AT THE RIVER PIER (ท่าน้ำลอยกระทง)
    // ========================================================
    createPerson({ x: -2.8, y: -2.1, z: -39.5, rotY: 0, scale: 0.95, shirtIndex: 0, pantsIndex: 0, hairType: 'bun', pose: 'kneeling', hasKrathong: true });
    createPerson({ x: -1.6, y: -2.1, z: -40.0, rotY: -0.15, scale: 1.0, shirtIndex: 3, pantsIndex: 1, hairType: 'short', pose: 'kneeling', hasKrathong: true });
    createPerson({ x: 1.8, y: -2.1, z: -39.8, rotY: 0.1, scale: 0.95, shirtIndex: 4, pantsIndex: 2, hairType: 'bun', pose: 'kneeling', hasKrathong: true });
    createPerson({ x: 3.0, y: -2.1, z: -39.2, rotY: -0.2, scale: 1.0, shirtIndex: 1, pantsIndex: 3, hairType: 'short', pose: 'kneeling', hasKrathong: true });

    createPerson({ x: -3.5, y: -2.1, z: -36.5, rotY: 0.25, scale: 1.0, shirtIndex: 2, pantsIndex: 1, hairType: 'bun', pose: 'praying', hasKrathong: true });
    createPerson({ x: 3.5, y: -2.1, z: -36.5, rotY: -0.25, scale: 0.95, shirtIndex: 5, pantsIndex: 4, hairType: 'short', pose: 'praying', hasKrathong: true });

    createPerson({ x: -5.2, y: -0.8, z: -32.5, rotY: 0.35, scale: 0.98, shirtIndex: 6, pantsIndex: 2, hairType: 'bun', pose: 'standing' });
    createPerson({ x: 4.8, y: -0.8, z: -32.5, rotY: -0.3, scale: 0.96, shirtIndex: 0, pantsIndex: 3, hairType: 'bun', pose: 'holding_balloon', hasBalloon: true, balloonColor: 0xf59e0b });

    // ========================================================
    // 3. PEOPLE SHOPPING AT STALLS (คนซื้อของหน้าร้านค้า)
    // ========================================================
    createPerson({ x: -6.8, y: 0, z: 34.5, rotY: -Math.PI / 2.2, scale: 0.96, shirtIndex: 1, pantsIndex: 1, hairType: 'short', pose: 'standing' });
    createPerson({ x: -6.8, y: 0, z: 20.2, rotY: -Math.PI / 2, scale: 0.88, shirtIndex: 0, pantsIndex: 2, hairType: 'short', hasBalloon: true, balloonColor: 0xec4899 });
    createPerson({ x: -6.8, y: 0, z: 6.5, rotY: -Math.PI / 2, scale: 0.95, shirtIndex: 2, pantsIndex: 3, hairType: 'short', pose: 'standing' });

    createPerson({ x: 6.8, y: 0, z: 34.2, rotY: Math.PI / 2, scale: 1.0, shirtIndex: 3, pantsIndex: 1, hairType: 'short', pose: 'standing' });
    createPerson({ x: 6.8, y: 0, z: 20.5, rotY: Math.PI / 2, scale: 0.95, shirtIndex: 5, pantsIndex: 2, hairType: 'bun', pose: 'praying', hasKrathong: false });
    createPerson({ x: 6.8, y: 0, z: 6.0, rotY: Math.PI / 2, scale: 0.97, shirtIndex: 1, pantsIndex: 0, hairType: 'bun', pose: 'praying', hasKrathong: true });

    // ========================================================
    // 4. PEOPLE AT THE GOLDEN CHEDI & UBOSOT (คนไหว้พระ)
    // ========================================================
    createPerson({ x: 17.5, y: 0, z: 3.5, rotY: -Math.PI / 2.5, scale: 0.95, shirtIndex: 7, pantsIndex: 0, hairType: 'bun', pose: 'praying', hasKrathong: true });
    createPerson({ x: -24.0, y: 0, z: 6.5, rotY: Math.PI * 0.1, scale: 1.0, shirtIndex: 7, pantsIndex: 3, hairType: 'bun', pose: 'praying', hasKrathong: false });

    this.scene.add(crowdGroup);
  }

  update(delta, elapsed) {
    // 1. Update Walking Pedestrians (เดินจริง + แกว่งแขน-ขา + โยกตัวตามจังหวะก้าว)
    for (let i = 0; i < this.walkers.length; i++) {
      const w = this.walkers[i];
      const cfg = w.userData.walkerConfig;

      if (cfg.type === 'street') {
        // เดินตามแกน Z ของถนนคนเดิน
        w.position.z += cfg.speed * cfg.dir * delta;
        w.userData.walkStep += cfg.speed * delta * 4.2;

        // กลับทิศเมื่อถึงหัว-ท้ายถนน
        if (cfg.dir < 0 && w.position.z <= cfg.minZ) {
          cfg.dir = 1;
          w.rotation.y = 0; // หันหน้ากลับขึ้น
        } else if (cfg.dir > 0 && w.position.z >= cfg.maxZ) {
          cfg.dir = -1;
          w.rotation.y = Math.PI; // หันหน้ามุ่งหน้าลงท่าน้ำ
        }

      } else if (cfg.type === 'circle') {
        // เดินเวียนเทียนวนรอบพระเจดีย์ทองคำ
        cfg.angle += cfg.angularSpeed * delta;
        w.position.x = cfg.cx + Math.cos(cfg.angle) * cfg.radius;
        w.position.z = cfg.cz + Math.sin(cfg.angle) * cfg.radius;
        w.rotation.y = -cfg.angle; // หันตามทิศทางเส้นสัมผัสวงกลม
        w.userData.walkStep += cfg.angularSpeed * cfg.radius * delta * 4.0;
      }

      // Walking Leg & Arm Swing Animation
      const swing = Math.sin(w.userData.walkStep) * 0.55;
      if (w.userData.leftLeg && w.userData.rightLeg) {
        w.userData.leftLeg.rotation.x = swing;
        w.userData.rightLeg.rotation.x = -swing;
      }

      if (w.userData.leftArm && w.userData.rightArm) {
        // ถ้ากำลังถือลูกโป่งหรือพนมมือ ไม่แกว่งแขนข้างนั้น
        w.userData.leftArm.rotation.x = -swing * 0.55;
        w.userData.rightArm.rotation.x = swing * 0.55;
      }

      // Natural vertical walking bob
      w.position.y = w.userData.baseY + Math.abs(Math.sin(w.userData.walkStep * 2)) * 0.05;
    }

    // 2. Idle Swaying for Standing & Kneeling People
    for (let i = 0; i < this.people.length; i++) {
      const p = this.people[i];
      const u = p.userData;
      p.position.y = u.baseY + Math.sin(elapsed * u.swaySpeed + u.swayOffset) * 0.025;
    }

    // 3. Candle Flame Glow Flicker
    for (let c = 0; c < this.candles.length; c++) {
      const light = this.candles[c];
      light.intensity = 0.7 + Math.sin(elapsed * 12 + c * 1.5) * 0.25;
    }
  }
}
