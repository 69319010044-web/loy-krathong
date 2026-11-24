import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { WorldScene } from './scene.js';
import { TempleBuilder } from './temple.js';
import { MarketManager } from './stalls.js';
import { KrathongSystem } from './krathong.js';
import { CameraController } from './camera.js';
import { CrowdManager } from './crowd.js';
import { sound } from './audio.js';

class LoyKrathongApp3D {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.world = new WorldScene(this.container);
    this.temple = new TempleBuilder(this.world.scene);
    this.market = new MarketManager(this.world.scene);
    this.crowd = new CrowdManager(this.world.scene);
    this.krathong = new KrathongSystem(this.world.scene, this.world.camera);
    this.cameraCtrl = new CameraController(this.world.camera, this.world.renderer.domElement);

    this.defaultWish = 'ขอขมาพระแม่คงคา และขอให้มีแต่ความสุขความเจริญ สุขภาพแข็งแรง 🪷';
    this.init();
  }

  init() {
    // 1. Build 3D World (Temple, Chedi, Ubosot, Pier, Market Stalls)
    this.temple.buildAll();
    this.market.buildAllStalls();

    // 2. Setup Events and UI Handlers
    this.setupUI();
    this.setupKeyboardShortcuts();

    // 3. Start Animation Loop
    this.clock = new THREE.Clock();
    this.animate();
  }

  setupUI() {
    // Welcome / Start Button
    const welcomeOverlay = document.getElementById('welcome-overlay');
    const startBtn = document.getElementById('btn-start-game');
    const onStart = () => {
      if (welcomeOverlay) {
        welcomeOverlay.classList.add('hidden');
        welcomeOverlay.style.display = 'none';
      }
      try {
        sound.startBGM();
      } catch (err) {
        console.warn('Audio start error:', err);
      }
      this.showToast('ยินดีต้อนรับสู่งานวัดลอยกระทงริมน้ำ ๒๕๖๙!', '🌕');
    };

    if (startBtn) {
      startBtn.addEventListener('click', onStart);
      startBtn.addEventListener('touchstart', onStart, { passive: true });
    }

    // Keyboard enter shortcut to start
    window.addEventListener('keydown', (e) => {
      if (welcomeOverlay && !welcomeOverlay.classList.contains('hidden') && welcomeOverlay.style.display !== 'none') {
        if (e.code === 'Enter' || e.code === 'Space') {
          onStart();
        }
      }
    });

    // Audio Toggle
    const audioBtn = document.getElementById('btn-audio');
    audioBtn.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      document.getElementById('audio-icon').textContent = isMuted ? '🔇' : '🔊';
      this.showToast(isMuted ? 'ปิดเสียง' : 'เปิดเสียงดนตรีงานวัด', isMuted ? '🔇' : '🔊');
    });

    // Scenic Camera Presets Switcher
    const presetBtns = document.querySelectorAll('.btn-preset');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.cameraCtrl.setPreset(btn.dataset.preset);
        this.showToast(`เปลี่ยนมุมมอง: ${btn.innerText}`, '🎥');
      });
    });

    // Fireworks Button (ปุ่มจุดพลุ - ยิงชุดพลุหลากสีสมจริง 5 นัด)
    const btnFireworks = document.getElementById('btn-fireworks');
    btnFireworks.addEventListener('click', () => {
      this.triggerFireworks();
    });

    // Krathong Button (ปุ่มลอยกระทง)
    const btnKrathong = document.getElementById('btn-krathong');
    btnKrathong.addEventListener('click', () => {
      document.getElementById('krathong-modal').classList.remove('hidden');
    });

    // Close Krathong Modal
    document.getElementById('btn-close-krathong').addEventListener('click', () => {
      document.getElementById('krathong-modal').classList.add('hidden');
    });

    // Quick Wish Buttons
    const quickWishBtns = document.querySelectorAll('.btn-quick-wish');
    const wishTextarea = document.getElementById('wish-input');
    wishTextarea.value = this.defaultWish;

    quickWishBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        wishTextarea.value = btn.dataset.wish;
      });
    });

    // Confirm Launch Krathong
    document.getElementById('btn-confirm-launch').addEventListener('click', () => {
      const wish = wishTextarea.value.trim() || this.defaultWish;
      // ปิด modal ก่อน
      document.getElementById('krathong-modal').classList.add('hidden');
      // ซ่อนปุ่ม Action Bar เพื่อไม่ให้ทับกับ Cinematic Wish Banner
      const actionPanel = document.querySelector('.main-action-panel');
      if (actionPanel) actionPanel.classList.add('hidden');
      setTimeout(() => this.launchKrathong(wish), 80);
    });

    // Exit Wish Banner
    document.getElementById('btn-exit-cinematic').addEventListener('click', () => {
      document.getElementById('cinematic-banner').classList.add('hidden');
      // แสดงปุ่ม Action Bar กลับมา
      const actionPanel = document.querySelector('.main-action-panel');
      if (actionPanel) actionPanel.classList.remove('hidden');
    });
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

      if (e.code === 'KeyF') {
        this.triggerFireworks();
      } else if (e.code === 'KeyL') {
        document.getElementById('krathong-modal').classList.remove('hidden');
      } else if (e.code === 'Digit1') {
        this.cameraCtrl.setPreset('pier');
      } else if (e.code === 'Digit2') {
        this.cameraCtrl.setPreset('market');
      } else if (e.code === 'Digit3') {
        this.cameraCtrl.setPreset('temple');
      } else if (e.code === 'Digit4') {
        this.cameraCtrl.setPreset('panoramic');
      }
    });
  }

  // Trigger Realistic Multi-Color Fireworks Barrage in 3D
  triggerFireworks() {
    this.world.launchBarrage(5);
    confetti({ particleCount: 35, spread: 70 });
    this.showToast('จุดชุดพลุหลากสีเฉลิมฉลองงานวัด! 🎆✨', '🎆');
  }

  // Launch 3D Krathong onto river
  launchKrathong(wishText) {
    sound.playSplash();
    sound.playWishChime();
    sound.playLoyKrathongSong();

    // Release player's 3D Krathong into the river
    const playerKrathong = this.krathong.launchPlayerKrathong(wishText);

    // Focus camera directly on the player's glowing Krathong floating on the water
    this.cameraCtrl.focusOnPlayerKrathong(playerKrathong);

    // Launch celebration fireworks barrage over the river
    setTimeout(() => {
      this.world.launchBarrage(5);
    }, 450);

    // Show wish banner after modal is fully gone
    setTimeout(() => {
      document.getElementById('cinematic-wish-text').textContent = `"${wishText}"`;
      document.getElementById('cinematic-banner').classList.remove('hidden');
    }, 200);

    confetti({ particleCount: 50, spread: 80 });
    this.showToast('ปล่อยกระทงสู่สายน้ำแล้ว ขอขมาพระแม่คงคา 🙏✨', '🌊');
  }

  showToast(msg, icon = '✨') {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').textContent = msg;
    document.getElementById('toast-icon').textContent = icon;
    toast.classList.remove('hidden');

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3500);
  }

  startFromButton() {
    try {
      sound.startBGM();
    } catch (e) {
      console.warn('Audio error:', e);
    }
    this.showToast('ยินดีต้อนรับสู่งานวัดลอยกระทงริมน้ำ ๒๕๖๙!', '🌕');
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();

    // 1. Update 3D World Scene (rockets, burst particles, water waves, sky lanterns)
    this.world.update(delta);

    // 2. Update Scenic Camera Controller
    this.cameraCtrl.update(delta);

    // 3. Update Krathongs physics on river
    this.krathong.update(delta, elapsed);

    // 4. Update Festival Crowd (breathing, swaying, candle flickers)
    this.crowd.update(delta, elapsed);

    // 5. Render Scene
    this.world.render();
  }
}

// Start app immediately or on DOMContentLoaded
function startApp() {
  if (!window.app) {
    try {
      window.app = new LoyKrathongApp3D();
    } catch (err) {
      console.error('Failed to init LoyKrathongApp3D:', err);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
