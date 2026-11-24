import * as THREE from 'three';

export class PlayerController {
  constructor(scene, camera, domElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;

    // Movement state
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false
    };

    // Camera orbit angles (Oriented towards -Z: looking forward at the market, temple & full moon)
    this.cameraAngleY = 0;
    this.cameraPitch = 0.22; // Natural eye level showing the magnificent moon and temple spires
    this.cameraDistance = 7.5;
    this.isMouseDown = false;
    this.prevMouse = { x: 0, y: 0 };

    // Player position & speed
    this.position = new THREE.Vector3(0, 0, 34); // Spawn on festive market pathway
    this.rotationY = Math.PI; // Face forward down the street towards the river (-Z)
    this.speed = 7.5;
    this.speedMultiplier = 1.0;
    this.speedBuffTimer = 0;

    // Build 3D Player Avatar
    this.avatar = this.buildAvatar();
    this.scene.add(this.avatar);

    // Cinematic camera override (for Krathong release)
    this.cinematicMode = false;
    this.cinematicTarget = null;

    this.setupListeners();
  }

  buildAvatar() {
    const group = new THREE.Group();
    group.position.copy(this.position);

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf6cdab });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x18181b });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x2563eb }); // Royal Blue Thai costume
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x475569 });

    // Torso / Shirt
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.45), shirtMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    group.add(torso);
    this.torso = torso;

    // Golden decorative sash (สไบทอง)
    const sash = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.95, 0.48),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.3 })
    );
    sash.rotation.z = 0.45;
    sash.position.set(0, 1.35, 0.01);
    group.add(sash);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 14), skinMat);
    head.position.y = 2.05;
    head.castShadow = true;
    group.add(head);

    // Hair
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
      hairMat
    );
    hair.position.y = 2.12;
    group.add(hair);

    // Limbs for walking animation
    this.leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8), skinMat);
    this.leftArm.position.set(-0.45, 1.3, 0);
    group.add(this.leftArm);

    this.rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8), skinMat);
    this.rightArm.position.set(0.45, 1.3, 0);
    group.add(this.rightArm);

    this.leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.9, 8), pantsMat);
    this.leftLeg.position.set(-0.2, 0.45, 0);
    this.leftLeg.castShadow = true;
    group.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.9, 8), pantsMat);
    this.rightLeg.position.set(0.2, 0.45, 0);
    this.rightLeg.castShadow = true;
    group.add(this.rightLeg);

    // Name tag above head
    const nameCanvas = document.createElement('canvas');
    nameCanvas.width = 256;
    nameCanvas.height = 64;
    const nctx = nameCanvas.getContext('2d');
    nctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    nctx.roundRect ? nctx.roundRect(10, 10, 236, 44, 12) : nctx.fillRect(10, 10, 236, 44);
    nctx.fill();
    nctx.strokeStyle = '#f59e0b';
    nctx.lineWidth = 2;
    nctx.stroke();

    nctx.fillStyle = '#fde047';
    nctx.font = 'bold 22px sans-serif';
    nctx.textAlign = 'center';
    nctx.textBaseline = 'middle';
    nctx.fillText('คุณ (Player) 🪷', 128, 32);

    const nameTex = new THREE.CanvasTexture(nameCanvas);
    const namePlate = new THREE.Sprite(new THREE.SpriteMaterial({ map: nameTex }));
    namePlate.position.set(0, 2.7, 0);
    namePlate.scale.set(2.0, 0.5, 1);
    group.add(namePlate);

    return group;
  }

  setupListeners() {
    // Keyboard down (Fix bug: Ignore input when typing in wish modal textarea)
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') this.keys.forward = true;
      if (code === 'KeyS' || code === 'ArrowDown') this.keys.backward = true;
      if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = true;
      if (code === 'ShiftLeft' || code === 'ShiftRight') this.keys.sprint = true;
    });

    // Keyboard up
    window.addEventListener('keyup', (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') this.keys.forward = false;
      if (code === 'KeyS' || code === 'ArrowDown') this.keys.backward = false;
      if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight') this.keys.sprint = false;
    });

    // Mouse drag for camera orbit
    this.domElement.addEventListener('mousedown', (e) => {
      if (e.button === 0 || e.button === 2) {
        this.isMouseDown = true;
        this.prevMouse.x = e.clientX;
        this.prevMouse.y = e.clientY;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isMouseDown) {
        const deltaX = e.clientX - this.prevMouse.x;
        const deltaY = e.clientY - this.prevMouse.y;
        this.cameraAngleY -= deltaX * 0.0055;
        this.cameraPitch = Math.max(0.05, Math.min(1.15, this.cameraPitch + deltaY * 0.0045));
        this.prevMouse.x = e.clientX;
        this.prevMouse.y = e.clientY;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    window.addEventListener('blur', () => {
      this.isMouseDown = false;
      this.keys.forward = false;
      this.keys.backward = false;
      this.keys.left = false;
      this.keys.right = false;
      this.keys.sprint = false;
    });

    // Mouse wheel zoom
    this.domElement.addEventListener('wheel', (e) => {
      this.cameraDistance = Math.max(3.5, Math.min(16.0, this.cameraDistance + e.deltaY * 0.008));
    }, { passive: true });
  }

  update(delta, elapsed) {
    if (this.cinematicMode && this.cinematicTarget) {
      // Cinematic camera following Krathong gliding across water
      const targetPos = this.cinematicTarget.position;
      const camTarget = new THREE.Vector3(targetPos.x, targetPos.y + 1.2, targetPos.z + 5.5);
      this.camera.position.lerp(camTarget, 0.05);
      this.camera.lookAt(targetPos.x, targetPos.y + 0.5, targetPos.z);
      return;
    }

    const moveVector = new THREE.Vector3();
    if (this.keys.forward) moveVector.z -= 1;
    if (this.keys.backward) moveVector.z += 1;
    if (this.keys.left) moveVector.x -= 1;
    if (this.keys.right) moveVector.x += 1;

    const isMoving = moveVector.lengthSq() > 0;
    if (isMoving) {
      moveVector.normalize();

      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraAngleY);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraAngleY);

      const moveDir = new THREE.Vector3()
        .addScaledVector(forward, -moveVector.z)
        .addScaledVector(right, moveVector.x)
        .normalize();

      const curSpeed = this.speed * (this.keys.sprint ? 1.45 : 1.0);
      this.position.addScaledVector(moveDir, curSpeed * delta);

      const targetRotation = Math.atan2(moveDir.x, moveDir.z);
      let diff = targetRotation - this.rotationY;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.rotationY += diff * 12 * delta;

      const swing = Math.sin(elapsed * 12) * 0.5;
      this.leftArm.rotation.x = swing;
      this.rightArm.rotation.x = -swing;
      this.leftLeg.rotation.x = -swing;
      this.rightLeg.rotation.x = swing;
      this.avatar.position.y = this.position.y + Math.abs(Math.sin(elapsed * 12)) * 0.08;
    } else {
      this.leftArm.rotation.x = 0;
      this.rightArm.rotation.x = 0;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.avatar.position.y = this.position.y;
    }

    this.applyBoundaries();

    this.avatar.position.x = this.position.x;
    this.avatar.position.z = this.position.z;
    this.avatar.rotation.y = this.rotationY;

    // Follow camera with soft dampening
    const camOffset = new THREE.Vector3(
      Math.sin(this.cameraAngleY) * Math.cos(this.cameraPitch) * this.cameraDistance,
      Math.sin(this.cameraPitch) * this.cameraDistance + 1.7,
      Math.cos(this.cameraAngleY) * Math.cos(this.cameraPitch) * this.cameraDistance
    );

    const desiredCamPos = this.position.clone().add(camOffset);
    this.camera.position.lerp(desiredCamPos, 0.16);
    this.camera.lookAt(this.position.x, this.position.y + 1.5, this.position.z);
  }

  applyBoundaries() {
    this.position.x = Math.max(-42, Math.min(42, this.position.x));
    this.position.z = Math.min(45, this.position.z);

    if (this.position.z < -28) {
      this.position.x = Math.max(-5.5, Math.min(5.5, this.position.x));

      const pierZ = this.position.z;
      if (pierZ > -35) {
        const t = (-28 - pierZ) / 7;
        this.position.y = -t * 2.1;
      } else {
        this.position.y = -2.1;
      }

      this.position.z = Math.max(-42.5, this.position.z);
    } else {
      this.position.y = 0;
    }
  }

  startCinematic(targetMesh) {
    this.cinematicMode = true;
    this.cinematicTarget = targetMesh;
  }

  stopCinematic() {
    this.cinematicMode = false;
    this.cinematicTarget = null;
  }
}
