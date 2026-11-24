import * as THREE from 'three';

export class MarketManager {
  constructor(scene) {
    this.scene = scene;
  }

  buildAllStalls() {
    this.createFoodStall({
      name: 'ร้านลูกชิ้นปิ้งลุงทอง',
      x: -9.5, z: 34, rotY: Math.PI / 2,
      awningColor: 0xcc2222, stripeColor: 0xffffff,
      type: 'meatball'
    });

    this.createFoodStall({
      name: 'ร้านสายไหมน้องชมพู',
      x: -9.5, z: 20, rotY: Math.PI / 2,
      awningColor: 0xff66aa, stripeColor: 0xffffff,
      type: 'cotton_candy'
    });

    this.createFoodStall({
      name: 'ร้านน้ำจรวด & ชาไทยโบราณ',
      x: -9.5, z: 6, rotY: Math.PI / 2,
      awningColor: 0xee7700, stripeColor: 0x11aa44,
      type: 'drinks'
    });

    this.createStallBase(9.5, 34, -Math.PI / 2, 0x7c3aed, 0xfbbf24, 'ซุ้มเกมงานวัด & ของเล่น');
    this.createStallBase(9.5, 20, -Math.PI / 2, 0xb91c1c, 0xf59e0b, 'ศาลาเสี่ยงเซียมซี');
    this.createStallBase(9.5, 6, -Math.PI / 2, 0x059669, 0xfef08a, 'โต๊ะประดิษฐ์กระทง (DIY)');
  }

  createStallBase(x, z, rotY, awningColor, stripeColor, stallName) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    const counterMat = new THREE.MeshStandardMaterial({ color: 0xd2a679, roughness: 0.7 });
    const postMat = new THREE.MeshStandardMaterial({ color: 0x4a321d });

    // Table / Counter
    const counter = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 2.0), counterMat);
    counter.position.y = 0.6;
    group.add(counter);

    // Awning Support Posts (2 posts instead of 4)
    [-1.9, 1.9].forEach(px => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.8, 6), postMat);
      post.position.set(px, 1.4, 0.8);
      group.add(post);
    });

    // Striped Awning Roof
    const roofGroup = new THREE.Group();
    roofGroup.position.set(0, 2.7, 0);

    const stripeCount = 6;
    const stripeWidth = 4.4 / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      const color = (i % 2 === 0) ? awningColor : stripeColor;
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(stripeWidth, 0.1, 2.4),
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.6 })
      );
      stripe.position.set(-2.2 + stripeWidth * (i + 0.5), 0, 0);
      stripe.rotation.x = 0.15;
      roofGroup.add(stripe);
    }
    group.add(roofGroup);

    // Glowing Lantern Bulb (MeshBasicMaterial - 0 light calculation cost!)
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffe082 })
    );
    bulb.position.set(0, 2.3, 0);
    group.add(bulb);

    // NPC Vendor
    this.createNPCVendor(group);

    // Stall Banner
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sctx = signCanvas.getContext('2d');
    sctx.fillStyle = '#1e293b';
    sctx.fillRect(0, 0, 512, 128);
    sctx.strokeStyle = '#f59e0b';
    sctx.lineWidth = 6;
    sctx.strokeRect(6, 6, 500, 116);
    sctx.fillStyle = '#ffffff';
    sctx.font = 'bold 36px sans-serif';
    sctx.textAlign = 'center';
    sctx.textBaseline = 'middle';
    sctx.fillText(stallName, 256, 64);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.9, 0.1),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    sign.position.set(0, 2.9, 1.25);
    group.add(sign);

    this.scene.add(group);
    return group;
  }

  createNPCVendor(parentGroup) {
    const npc = new THREE.Group();
    npc.position.set(0, 0, -0.6);

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5cda4 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 1.1, 8), shirtMat);
    body.position.y = 0.9;
    npc.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), skinMat);
    head.position.y = 1.65;
    npc.add(head);

    parentGroup.add(npc);
  }

  createFoodStall(config) {
    const group = this.createStallBase(config.x, config.z, config.rotY, config.awningColor, config.stripeColor, config.name);

    if (config.type === 'meatball') {
      const grill = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.15, 1.0),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
      );
      grill.position.set(-0.6, 1.25, 0);
      group.add(grill);

      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.2, 0.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x991b1b })
      );
      pot.position.set(0.8, 1.38, 0);
      group.add(pot);
    } else if (config.type === 'cotton_candy') {
      const colors = [0xff66aa, 0x60a5fa, 0xfde047];
      colors.forEach((c, idx) => {
        const cloud = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.24, 0),
          new THREE.MeshStandardMaterial({ color: c })
        );
        cloud.position.set(-0.8 + idx * 0.8, 1.6, 0.2);
        group.add(cloud);
      });
    }
  }
}
