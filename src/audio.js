// Web Audio API Procedural Synthesizer for Loy Krathong Experience
// High-Fidelity Audio: Authentic Loy Krathong Song + Ching-Chap & Drum + Fireworks + Water

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.songTimer = null;
    this.ambientNoise = null;
    this.ambientGain = null;
    this.masterGain = null;
    this.isMuted = false;
    this.songPlaying = false;
    this.songStep = 0;

    // === เพลงลอยกระทง (Official Loy Krathong Melody) ===
    // ทำนองเพลงวันเพ็ญเดือนสิบสอง น้ำก็นองเต็มตลิ่ง...
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88;
    const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99;

    this.loyKrathongMelody = [
      // 1. วันเพ็ญเดือนสิบสอง (G4 G4 A4 G4 E4)
      {n:G4, d:0.5}, {n:G4, d:0.5}, {n:A4, d:0.5}, {n:G4, d:0.5}, {n:E4, d:1.0},
      // น้ำก็นองเต็มตลิ่ง (D4 E4 F4 A4 G4)
      {n:D4, d:0.5}, {n:E4, d:0.5}, {n:F4, d:0.5}, {n:A4, d:0.5}, {n:G4, d:1.0},
      // เราทั้งหลายชายหญิง (G4 G4 A4 G4 E4)
      {n:G4, d:0.5}, {n:G4, d:0.5}, {n:A4, d:0.5}, {n:G4, d:0.5}, {n:E4, d:1.0},
      // สนุกกันจริงวันลอยกระทง (D4 E4 F4 G4 E4 D4 C4)
      {n:D4, d:0.5}, {n:E4, d:0.5}, {n:F4, d:0.5}, {n:G4, d:0.5}, {n:E4, d:0.5}, {n:D4, d:0.5}, {n:C4, d:1.0},
      // พักจังหวะสั้น
      {n:0,  d:0.5},

      // 2. ลอย ลอย กระทง (G4 G4 A4 G4 E4 G4)
      {n:G4, d:0.5}, {n:G4, d:0.5}, {n:A4, d:0.5}, {n:G4, d:0.5}, {n:E4, d:0.5}, {n:G4, d:1.0},
      // ลอย ลอย กระทง (G4 G4 A4 G4 E4 G4)
      {n:G4, d:0.5}, {n:G4, d:0.5}, {n:A4, d:0.5}, {n:G4, d:0.5}, {n:E4, d:0.5}, {n:G4, d:1.0},
      // ลอยกระทงกันแล้ว (G4 A4 C5 D5 C5)
      {n:G4, d:0.5}, {n:A4, d:0.5}, {n:C5, d:0.5}, {n:D5, d:0.5}, {n:C5, d:1.0},
      // ขอเชิญน้องแก้วออกมารำวง (A4 G4 E4 G4 A4 G4)
      {n:A4, d:0.5}, {n:G4, d:0.5}, {n:E4, d:0.5}, {n:G4, d:0.5}, {n:A4, d:0.5}, {n:G4, d:1.0},

      // 3. รำวงวันลอยกระทง (C5 A4 G4 E4 G4)
      {n:C5, d:0.5}, {n:A4, d:0.5}, {n:G4, d:0.5}, {n:E4, d:0.5}, {n:G4, d:1.0},
      // รำวงวันลอยกระทง (C5 A4 G4 E4 G4)
      {n:C5, d:0.5}, {n:A4, d:0.5}, {n:G4, d:0.5}, {n:E4, d:0.5}, {n:G4, d:1.0},
      // บุญจะส่งให้เราสุขใจ (G4 A4 C5 D5 C5 A4 G4)
      {n:G4, d:0.5}, {n:A4, d:0.5}, {n:C5, d:0.5}, {n:D5, d:0.5}, {n:C5, d:0.5}, {n:A4, d:0.5}, {n:G4, d:1.0},
      // บุญจะส่งให้เราสุขใจ (G4 A4 C5 D5 C5)
      {n:G4, d:0.5}, {n:A4, d:0.5}, {n:C5, d:0.5}, {n:D5, d:0.5}, {n:C5, d:1.5},
      // พักท้ายท่อน
      {n:0,  d:1.0}
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  startBGM() {
    this.init();
    if (this.bgmPlaying) return;
    this.bgmPlaying = true;

    this.startAmbience();
    this.startLoyKrathongSong();
  }

  stopBGM() {
    this.bgmPlaying = false;
    this.stopLoyKrathongSong();
    if (this.ambientNoise) {
      try { this.ambientNoise.stop(); } catch(e) {}
      this.ambientNoise = null;
    }
  }

  // ====================================================
  // เพลงลอยกระทง (Loy Krathong Traditional Song System)
  // ระนาดเอก + ขลุ่ยเพียงออ + เสียงฉิ่งฉับ + กลองรำวง
  // ====================================================
  startLoyKrathongSong() {
    this.init();
    if (!this.ctx) return;
    this.songPlaying = true;
    this.songStep = 0;
    if (this.songTimer) clearTimeout(this.songTimer);
    this._scheduleSongNote();
  }

  stopLoyKrathongSong() {
    this.songPlaying = false;
    if (this.songTimer) clearTimeout(this.songTimer);
  }

  playLoyKrathongSong() {
    this.init();
    if (!this.ctx) return;
    this.stopLoyKrathongSong();
    this.startLoyKrathongSong();
  }

  _scheduleSongNote() {
    if (!this.songPlaying || !this.ctx) return;

    const melody = this.loyKrathongMelody;
    const note   = melody[this.songStep % melody.length];
    const bpm    = 112; // จังหวะรำวงงานวัดที่สนุกสนานกำลังดี
    const beatMs = (60 / bpm) * 1000;
    const durationMs = note.d * beatMs;

    // เล่นโน้ตระนาดและขลุ่ย
    if (note.n > 0) {
      this._playRanatNote(note.n, 0.32, note.d * (60 / bpm));
      this._playKhluiNote(note.n, 0.14, note.d * (60 / bpm));
    }

    // เสียงฉิ่ง-ฉับ ตามจังหวะไทย (ฉิ่งบนจังหวะคี่, ฉับบนจังหวะคู่)
    const isChing = (this.songStep % 2 === 0);
    this._playChing(isChing);

    // เสียงกลองรำวง / โทน
    if (this.songStep % 2 === 0) {
      this._playRamwongDrum('tung', 0.22);
    } else {
      this._playRamwongDrum('ta', 0.14);
    }

    this.songStep++;
    this.songTimer = setTimeout(() => this._scheduleSongNote(), durationMs);
  }

  // เสียงระนาดเอก (Ranat Ek)
  _playRanatNote(freq, vol = 0.32, duration = 0.5) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);

    // Harmonic shimmer (คู่แปดอ่อนๆ ให้เสียงใสแบบไม้ระนาด)
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.0, now);

    const mix1 = this.ctx.createGain();
    const mix2 = this.ctx.createGain();
    mix1.gain.setValueAtTime(0.78, now);
    mix2.gain.setValueAtTime(0.22, now);

    osc1.connect(mix1); mix1.connect(gain);
    osc2.connect(mix2); mix2.connect(gain);

    // Envelope ระนาด: หัวเสียงคม กังวานกลมกล่อม
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.012);
    gain.gain.setValueAtTime(vol * 0.85, now + duration * 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration * 1.05);

    gain.connect(this.masterGain);
    osc1.start(now); osc1.stop(now + duration * 1.1);
    osc2.start(now); osc2.stop(now + duration * 1.1);
  }

  // เสียงขลุ่ยไทย (Thai Bamboo Flute - Khlui)
  _playKhluiNote(freq, vol = 0.14, duration = 0.5) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Subtle breath vibrato
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(5.5, now);
    lfoGain.gain.setValueAtTime(2.5, now);
    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.04);
    gain.gain.setValueAtTime(vol * 0.9, now + duration * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration * 1.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    lfo.start(now); lfo.stop(now + duration * 1.2);
    osc.start(now); osc.stop(now + duration * 1.2);
  }

  // เสียงฉิ่ง (Ching) และ ฉับ (Chap)
  _playChing(isChing) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    if (isChing) {
      // ฉิ่ง: เสียงแหลมกังวานลอยยาว
      osc.frequency.setValueAtTime(2450, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.7);
    } else {
      // ฉับ: เสียงตัดสั้นแน่น
      osc.frequency.setValueAtTime(2150, now);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.09);
    }
  }

  // เสียงกลองรำวง / โทน (Ramwong Festival Drum)
  _playRamwongDrum(type = 'tung', vol = 0.2) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    if (type === 'tung') {
      // ทั่ง (เสียงทุ้มกังวาน)
      osc.frequency.setValueAtTime(125, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.22);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    } else {
      // ต๊ะ (เสียงเคาะกระชับ)
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.1);
      gain.gain.setValueAtTime(vol * 0.85, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  // Play song once (for krathong launch moment)
  playLoyKrathongSong() {
    this.init();
    if (!this.ctx) return;
    this.stopLoyKrathongSong();
    this.startLoyKrathongSong();
  }

  playBellTone(freq, vol = 0.15, duration = 1.0) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.1);
  }

  playGongTone(freq, vol = 0.2, duration = 3.0) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.1);
  }

  startAmbience() {
    if (!this.ctx || this.ambientNoise) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.95 * b1 + white * 0.03;
      b2 = 0.85 * b2 + white * 0.01;
      data[i] = (b0 + b1 + b2) * 0.1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.masterGain);

    noise.start(0);
    this.ambientNoise = noise;
  }

  // Realistic Rocket Launch Whistle
  playFireworkLaunch() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280 + Math.random() * 80, now);
    osc.frequency.exponentialRampToValueAtTime(1400 + Math.random() * 200, now + 0.55);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  // Deep Sub-Bass Explosion Boom + Burst Crack
  playFireworkExplosion() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Deep Sub-Bass Boom
    const boom = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(150 + Math.random() * 25, now);
    boom.frequency.exponentialRampToValueAtTime(32, now + 0.7);

    boomGain.gain.setValueAtTime(0.7, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

    boom.connect(boomGain);
    boomGain.connect(this.masterGain);
    boom.start(now);
    boom.stop(now + 0.8);

    // Mid-range burst crack
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.35, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(550, now);
    filter.Q.setValueAtTime(1.8, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.45, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    whiteNoise.start(now);

    // Dazzling Crackles & Sizzling Sparkles as fireworks sparkle
    for (let c = 0; c < 8; c++) {
      const delay = 0.18 + c * 0.055 + Math.random() * 0.03;
      const t = now + delay;
      const crackleOsc = this.ctx.createOscillator();
      const crackleGain = this.ctx.createGain();
      crackleOsc.type = 'triangle';
      crackleOsc.frequency.setValueAtTime(1400 + Math.random() * 900, t);

      crackleGain.gain.setValueAtTime(0.14, t);
      crackleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

      crackleOsc.connect(crackleGain);
      crackleGain.connect(this.masterGain);
      crackleOsc.start(t);
      crackleOsc.stop(t + 0.05);
    }
  }

  // Combined firework trigger
  playFirework() {
    this.playFireworkLaunch();
    setTimeout(() => {
      this.playFireworkExplosion();
    }, 480);
  }

  // Gentle river water splash for releasing Krathong
  playSplash() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.4);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  // Magical chime for Krathong wish
  playWishChime() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    notes.forEach((f, idx) => {
      setTimeout(() => {
        this.playBellTone(f, 0.22, 1.8);
      }, idx * 110);
    });
  }
}

export const sound = new SoundEngine();
