import * as THREE from 'three';

export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Camera target (lookAt center point)
    this.target = new THREE.Vector3(0, -1.8, -32); // Centered on Pier & Riverfront
    this.desiredTarget = this.target.clone();

    // Orbit parameters
    this.angleY = 0; // Face towards river (-Z)
    this.pitch = 0.16; // Level eye view taking in river, moon, and temple
    this.distance = 14.0;

    this.desiredAngleY = this.angleY;
    this.desiredPitch = this.pitch;
    this.desiredDistance = this.distance;

    // Mouse drag state
    this.isMouseDown = false;
    this.prevMouse = { x: 0, y: 0 };

    this.setupListeners();
  }

  setupListeners() {
    // Mouse drag orbit
    this.domElement.addEventListener('mousedown', (e) => {
      if (e.button === 0 || e.button === 2) {
        this.isMouseDown = true;
        this.prevMouse.x = e.clientX;
        this.prevMouse.y = e.clientY;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isMouseDown) {
        const dx = e.clientX - this.prevMouse.x;
        const dy = e.clientY - this.prevMouse.y;
        this.desiredAngleY -= dx * 0.0055;
        this.desiredPitch = Math.max(0.04, Math.min(1.15, this.desiredPitch + dy * 0.0045));
        this.prevMouse.x = e.clientX;
        this.prevMouse.y = e.clientY;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    window.addEventListener('blur', () => {
      this.isMouseDown = false;
    });

    // Mouse wheel zoom
    this.domElement.addEventListener('wheel', (e) => {
      this.desiredDistance = Math.max(4.0, Math.min(48.0, this.desiredDistance + e.deltaY * 0.015));
    }, { passive: true });
  }

  // Switch to specific scenic vantage points
  setPreset(name) {
    if (name === 'pier') {
      // 🌊 Pier & Riverfront (Prime Krathong floating spot in front of pier)
      this.desiredTarget.set(0, -2.4, -54);
      this.desiredAngleY = 0;
      this.desiredPitch = 0.22;
      this.desiredDistance = 10.5;
    } else if (name === 'market') {
      // 🏮 Temple Fair Walking Street (Stalls, food & hanging lanterns)
      this.desiredTarget.set(0, 1.8, 18);
      this.desiredAngleY = 0;
      this.desiredPitch = 0.18;
      this.desiredDistance = 15.0;
    } else if (name === 'temple') {
      // 🏛️ Golden Pagoda & Thai Ubosot
      this.desiredTarget.set(8, 5.0, -4);
      this.desiredAngleY = -0.35;
      this.desiredPitch = 0.28;
      this.desiredDistance = 24.0;
    } else if (name === 'panoramic') {
      // 🌕 High-angle Panoramic Festival View
      this.desiredTarget.set(0, 0, -8);
      this.desiredAngleY = 0;
      this.desiredPitch = 0.45;
      this.desiredDistance = 38.0;
    }
  }

  // Cinematic close up focus on player's released Krathong
  focusOnPlayerKrathong(krathongMesh) {
    if (!krathongMesh) {
      this.setPreset('pier');
      return;
    }
    this.desiredTarget.set(krathongMesh.position.x, -2.45, krathongMesh.position.z);
    this.desiredAngleY = 0;
    this.desiredPitch = 0.24;
    this.desiredDistance = 8.0;
  }

  update(delta) {
    // 1. Smooth Lerp
    this.target.lerp(this.desiredTarget, 0.08);
    this.angleY += (this.desiredAngleY - this.angleY) * 0.1;
    this.pitch += (this.desiredPitch - this.pitch) * 0.1;
    this.distance += (this.desiredDistance - this.distance) * 0.1;

    // 3. Compute camera eye position
    const camX = this.target.x + Math.sin(this.angleY) * Math.cos(this.pitch) * this.distance;
    const camY = this.target.y + Math.sin(this.pitch) * this.distance;
    const camZ = this.target.z + Math.cos(this.angleY) * Math.cos(this.pitch) * this.distance;

    this.camera.position.set(camX, Math.max(-0.5, camY), camZ);
    this.camera.lookAt(this.target);
  }
}
