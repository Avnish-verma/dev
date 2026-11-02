/**
 * THE NEURAL ARCHIVE × MIDNIGHT CINÉMA: CLASSIFIED FILE — DEVANSH
 * Featuring Ergonomic In-Display Thumbprint, Android Haptics, Scratchable Redactions,
 * 35mm Film Burn Transition, Tearable VIP Ticket, Lo-Fi Piano & Downloadable Souvenir.
 * Optimized for Android 4GB RAM at 60FPS.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. STATE & CONFIGURATION
  // =========================================================================
  const CONFIG = {
    totalStages: 7,
    maxDPR: 2,
    codeColumnsMobile: 22,
    codeColumnsDesktop: 42,
    dustMoteCount: 65,
    audioVolume: 0.38
  };

  const STATE = {
    currentStage: 0,
    visitedStages: new Set([0]),
    isTransitioning: false,
    audioInitialized: false,
    isAudioPlaying: false,
    isCinemaMode: false,

    // In-Display Thumbprint Scanner
    isScanning: false,
    scanProgress: 0,
    scanTimer: null,
    scanDone: false,
    hapticInterval: null,

    // Matrix Name Decryption
    nameDecrypted: false,

    // Cinema Countdown & Ticket
    countdownVal: 5,
    countdownTimer: null,
    ticketTorn: false,

    // Viewport
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: Math.min(window.devicePixelRatio || 1, CONFIG.maxDPR)
  };

  // Android Vibration API Helper
  function triggerHaptic(pattern) {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (e) {}
  }

  // DOM Elements
  const canvas = document.getElementById('hybrid-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const bodyRoot = document.getElementById('body-root');
  const stages = document.querySelectorAll('.stage-view');
  const stageNodes = document.querySelectorAll('.stg-node');
  const stageFill = document.getElementById('stage-fill');
  const audioToggleBtn = document.getElementById('audio-toggle');
  const audioElement = document.getElementById('bg-audio');
  const eqBars = document.querySelectorAll('.equalizer-bars .eq-bar');
  const hudTelemetry = document.getElementById('hud-telemetry');
  const tactileHint = document.getElementById('tactile-hint');
  const hintText = document.getElementById('hint-text');
  const filmBurn = document.getElementById('film-burn');

  // Stage 1 & 2 Elements
  const btnToBiometrics = document.getElementById('btn-to-biometrics');
  const biometricZone = document.getElementById('biometric-zone');
  const biometricPod = document.getElementById('biometric-pod');
  const scannerFill = document.getElementById('scanner-fill');
  const scannerText = document.getElementById('scanner-text');
  const btnBypassBio = document.getElementById('btn-bypass-bio');

  // Stage 3 & 4 Elements
  const matrixName = document.getElementById('matrix-name');
  const matrixGlow = document.getElementById('matrix-glow');
  const btnToDossier = document.getElementById('btn-to-dossier');
  const btnToTransform = document.getElementById('btn-to-transform');
  const redactionCovers = document.querySelectorAll('.redaction-cover');

  // Stage 5 & 6 Elements
  const countdownNum = document.getElementById('countdown-num');
  const vipTicket = document.getElementById('vip-ticket');
  const ticketCaption = document.getElementById('ticket-caption');
  const filmFrames = document.querySelectorAll('.film-frame');
  const synopsisText = document.getElementById('synopsis-text');
  const btnToLetter = document.getElementById('btn-to-letter');

  // Stage 7 Elements
  const waxSeal = document.getElementById('wax-seal');
  const sealCaption = document.getElementById('seal-caption');
  const btnSaveBadge = document.getElementById('btn-save-badge');
  const btnReplayAll = document.getElementById('btn-replay-all');

  // =========================================================================
  // 2. DUAL AUDIO ENGINE: CYBER SYNTH + VINTAGE LO-FI CINEMA PIANO
  // =========================================================================
  class HybridAudioEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.analyser = null;
      this.freqData = null;

      // Oscillators & Noise
      this.cyberDrone = null;
      this.projectorNoiseNode = null;
      this.scanOsc = null;
      this.scanGain = null;
      this.pianoTimer = null;

      // Warm Lo-Fi Piano Notes (C4, E4, G4, B4, D5)
      this.lofiChords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 392.00]  // G7
      ];
      this.chordIdx = 0;
    }

    init() {
      if (this.ctx) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 32;
        this.freqData = new Uint8Array(this.analyser.frequencyBinCount);

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(CONFIG.audioVolume, this.ctx.currentTime);
        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
      } catch (e) {
        console.warn('Web Audio API unavailable:', e);
      }
    }

    startCyberAmbience() {
      if (!this.ctx) this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      if (this.cyberDrone) return;

      try {
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, this.ctx.currentTime);
        filter.connect(this.masterGain);

        this.cyberDrone = this.ctx.createOscillator();
        this.cyberDrone.type = 'sawtooth';
        this.cyberDrone.frequency.setValueAtTime(55, this.ctx.currentTime);

        const droneGain = this.ctx.createGain();
        droneGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

        this.cyberDrone.connect(droneGain);
        droneGain.connect(filter);
        this.cyberDrone.start();
      } catch (err) {}
    }

    switchToCinemaAmbience() {
      if (this.cyberDrone) {
        try { this.cyberDrone.stop(); } catch (e) {}
        this.cyberDrone = null;
      }

      if (!this.ctx || !STATE.isAudioPlaying) return;

      try {
        // 1. Vinyl Record Surface Crackle Noise
        this.startVinylCrackle();

        // 2. Start Warm Nostalgic Piano Arpeggiator
        this.startLofiPiano();
      } catch (e) {}
    }

    startVinylCrackle() {
      if (!this.ctx || this.projectorNoiseNode) return;
      try {
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          // Sparse dust crackle simulation
          output[i] = Math.random() < 0.008 ? (Math.random() * 2 - 1) * 0.4 : (Math.random() * 2 - 1) * 0.015;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
        noiseFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

        whiteNoise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        whiteNoise.start();
        this.projectorNoiseNode = whiteNoise;
      } catch (e) {}
    }

    startLofiPiano() {
      if (this.pianoTimer) clearInterval(this.pianoTimer);

      const playChordCycle = () => {
        if (!STATE.isAudioPlaying || !STATE.isCinemaMode) return;
        const chord = this.lofiChords[this.chordIdx % this.lofiChords.length];
        this.chordIdx++;

        chord.forEach((freq, idx) => {
          setTimeout(() => {
            this.playPianoNote(freq);
          }, idx * 160);
        });
      };

      playChordCycle();
      this.pianoTimer = setInterval(playChordCycle, 3600);
    }

    playPianoNote(freq) {
      if (!this.ctx || !STATE.isAudioPlaying) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        // Warm piano envelope
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.07, this.ctx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.8);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 3.0);
      } catch (e) {}
    }

    playClick(freq = 1100) {
      if (!this.ctx || !STATE.isAudioPlaying) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.09);
      } catch (e) {}
    }

    playPaperTearSound() {
      if (!this.ctx || !STATE.isAudioPlaying) return;
      try {
        // Fast burst of filtered noise
        const bufferSize = this.ctx.sampleRate * 0.15;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
        }
        const source = this.ctx.createBufferSource();
        source.buffer = noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
        source.connect(filter);
        filter.connect(this.masterGain);
        source.start();
      } catch (e) {}
    }

    playCountdownBeep(high = false) {
      if (!this.ctx || !STATE.isAudioPlaying) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(high ? 1760 : 880, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.16);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.18);
      } catch (e) {}
    }

    startScanSound() {
      if (!this.ctx || !STATE.isAudioPlaying) return;
      try {
        this.stopScanSound();
        this.scanOsc = this.ctx.createOscillator();
        this.scanGain = this.ctx.createGain();

        this.scanOsc.type = 'sawtooth';
        this.scanOsc.frequency.setValueAtTime(220, this.ctx.currentTime);
        this.scanOsc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 1.4);

        this.scanGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        this.scanGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.2);

        this.scanOsc.connect(this.scanGain);
        this.scanGain.connect(this.masterGain);
        this.scanOsc.start();
      } catch (e) {}
    }

    stopScanSound() {
      if (this.scanOsc) {
        try { this.scanOsc.stop(); } catch (e) {}
        this.scanOsc = null;
        this.scanGain = null;
      }
    }

    playChord(freqs, stagger = 75) {
      if (!this.ctx || !STATE.isAudioPlaying) return;
      freqs.forEach((f, i) => {
        setTimeout(() => this.playClick(f), i * stagger);
      });
    }

    stopAll() {
      if (this.cyberDrone) {
        try { this.cyberDrone.stop(); } catch (e) {}
        this.cyberDrone = null;
      }
      if (this.projectorNoiseNode) {
        try { this.projectorNoiseNode.stop(); } catch (e) {}
        this.projectorNoiseNode = null;
      }
      if (this.pianoTimer) {
        clearInterval(this.pianoTimer);
        this.pianoTimer = null;
      }
      this.stopScanSound();
    }

    updateVisualizer() {
      if (!this.analyser || !STATE.isAudioPlaying || eqBars.length === 0) return;
      this.analyser.getByteFrequencyData(this.freqData);
      for (let i = 0; i < eqBars.length; i++) {
        const val = this.freqData[i * 2] || 0;
        const h = Math.max(3, Math.min(13, (val / 255) * 13));
        eqBars[i].style.height = `${h}px`;
      }
    }
  }

  const audio = new HybridAudioEngine();

  function toggleAudio() {
    STATE.audioInitialized = true;
    if (STATE.isAudioPlaying) {
      STATE.isAudioPlaying = false;
      audioToggleBtn.classList.remove('playing');
      audioToggleBtn.setAttribute('aria-pressed', 'false');
      if (audioElement && !audioElement.paused) audioElement.pause();
      audio.stopAll();
    } else {
      STATE.isAudioPlaying = true;
      audioToggleBtn.classList.add('playing');
      audioToggleBtn.setAttribute('aria-pressed', 'true');

      if (audioElement && audioElement.src) {
        audioElement.volume = CONFIG.audioVolume;
        const p = audioElement.play();
        if (p !== undefined) {
          p.catch(() => {
            if (STATE.isCinemaMode) audio.switchToCinemaAmbience();
            else audio.startCyberAmbience();
          });
        }
      } else {
        if (STATE.isCinemaMode) audio.switchToCinemaAmbience();
        else audio.startCyberAmbience();
      }
    }
  }

  // =========================================================================
  // 3. CANVAS ENGINE: DIGITAL RAIN VS DUST MOTES & FIREWORKS
  // =========================================================================
  const rainGlyphs = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈ';
  let rainColumns = [];
  let cinemaDustMotes = [];
  let cinemaFireworks = [];

  class RainColumn {
    constructor(x, h) {
      this.x = x;
      this.h = h;
      this.y = Math.random() * -h;
      this.speed = Math.random() * 5 + 3.5;
      this.chars = [];
      const len = Math.floor(Math.random() * 12 + 6);
      for (let i = 0; i < len; i++) {
        this.chars.push(rainGlyphs[Math.floor(Math.random() * rainGlyphs.length)]);
      }
    }

    update() {
      this.y += this.speed;
      if (this.y > this.h + 120) {
        this.y = -100;
        this.speed = Math.random() * 5 + 3.5;
      }
      if (Math.random() < 0.08) {
        const idx = Math.floor(Math.random() * this.chars.length);
        this.chars[idx] = rainGlyphs[Math.floor(Math.random() * rainGlyphs.length)];
      }
    }

    draw(context) {
      context.save();
      context.font = '12px "Share Tech Mono", monospace';
      for (let i = 0; i < this.chars.length; i++) {
        const py = this.y - i * 14;
        if (py > -20 && py < this.h + 20) {
          if (i === 0) {
            context.fillStyle = '#ffffff';
            context.shadowColor = '#00f0ff';
            context.shadowBlur = 8;
          } else {
            context.fillStyle = 'rgba(0, 240, 255, 0.32)';
            context.shadowBlur = 0;
          }
          context.fillText(this.chars[i], this.x, py);
        }
      }
      context.restore();
    }
  }

  class DustMote {
    constructor(w, h) {
      this.reset(w, h, true);
    }

    reset(w, h, initial = false) {
      this.x = Math.random() * w;
      this.y = initial ? Math.random() * h : h + 10;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.8 + 0.3);
      this.size = Math.random() * 1.8 + 0.8;
      this.alpha = Math.random() * 0.6 + 0.2;
      this.twinkle = Math.random() * Math.PI * 2;
    }

    update(w, h) {
      this.twinkle += 0.03;
      this.x += this.vx;
      this.y += this.vy;
      if (this.y < -10 || this.x < -10 || this.x > w + 10) {
        this.reset(w, h, false);
      }
    }

    draw(context) {
      context.save();
      context.globalAlpha = this.alpha + Math.sin(this.twinkle) * 0.2;
      context.fillStyle = '#ffd166';
      context.beginPath();
      context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
  }

  class CinemaFirework {
    constructor(x, y) {
      this.sparks = [];
      const count = STATE.width < 400 ? 32 : 44;
      const colors = ['#ffd166', '#ffffff', '#c5a059', '#ff9e00', '#ffccd5'];

      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = Math.random() * 5.5 + 1.8;
        this.sparks.push({
          x, y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          size: Math.random() * 2.2 + 1.2,
          decay: Math.random() * 0.018 + 0.012
        });
      }
      this.dead = false;
    }

    update() {
      let alive = false;
      this.sparks.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.07;
        s.vx *= 0.98;
        s.alpha -= s.decay;
        if (s.alpha > 0) alive = true;
      });
      if (!alive) this.dead = true;
    }

    draw(context) {
      context.save();
      this.sparks.forEach(s => {
        if (s.alpha > 0) {
          context.globalAlpha = Math.max(0, s.alpha);
          context.fillStyle = s.color;
          context.beginPath();
          context.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          context.fill();
        }
      });
      context.restore();
    }
  }

  // =========================================================================
  // 4. MAIN RENDER LOOP
  // =========================================================================
  function resizeCanvas() {
    STATE.width = window.innerWidth;
    STATE.height = window.innerHeight;
    STATE.dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDPR);

    canvas.width = STATE.width * STATE.dpr;
    canvas.height = STATE.height * STATE.dpr;
    ctx.setTransform(STATE.dpr, 0, 0, STATE.dpr, 0, 0);

    const colCount = STATE.width < 768 ? CONFIG.codeColumnsMobile : CONFIG.codeColumnsDesktop;
    const colSpacing = STATE.width / colCount;
    rainColumns = [];
    for (let i = 0; i < colCount; i++) {
      rainColumns.push(new RainColumn(i * colSpacing + 6, STATE.height));
    }

    cinemaDustMotes = [];
    for (let i = 0; i < CONFIG.dustMoteCount; i++) {
      cinemaDustMotes.push(new DustMote(STATE.width, STATE.height));
    }
  }

  function render() {
    const w = STATE.width;
    const h = STATE.height;

    if (STATE.isCinemaMode) {
      ctx.fillStyle = '#0c0507';
      ctx.fillRect(0, 0, w, h);

      const beamGrad = ctx.createRadialGradient(w * 0.5, h * 0.35, 20, w * 0.5, h * 0.45, Math.max(w, h) * 0.65);
      beamGrad.addColorStop(0, 'rgba(255, 209, 102, 0.16)');
      beamGrad.addColorStop(0.5, 'rgba(197, 160, 89, 0.06)');
      beamGrad.addColorStop(1, 'rgba(12, 5, 7, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < cinemaDustMotes.length; i++) {
        cinemaDustMotes[i].update(w, h);
        cinemaDustMotes[i].draw(ctx);
      }
    } else {
      ctx.fillStyle = '#04060c';
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < rainColumns.length; i++) {
        rainColumns[i].update();
        rainColumns[i].draw(ctx);
      }
    }

    if (STATE.currentStage === 5) {
      if (Math.random() < 0.05) {
        cinemaFireworks.push(new CinemaFirework(Math.random() * (w * 0.75) + w * 0.12, Math.random() * (h * 0.4) + h * 0.15));
      }
    }

    for (let i = cinemaFireworks.length - 1; i >= 0; i--) {
      const cfw = cinemaFireworks[i];
      cfw.update();
      cfw.draw(ctx);
      if (cfw.dead) cinemaFireworks.splice(i, 1);
    }

    audio.updateVisualizer();

    requestAnimationFrame(render);
  }

  // =========================================================================
  // 5. STAGE 02: IN-DISPLAY THUMBPRINT SENSOR LOGIC & HAPTICS
  // =========================================================================
  function startScan() {
    if (STATE.scanDone) return;
    STATE.isScanning = true;
    biometricZone.classList.add('scanning');
    scannerText.textContent = 'SCANNING BIOMETRICS...';
    audio.startScanSound();

    // High-priority DB Telemetry: captures device details in MongoDB the exact millisecond thumb touches sensor!
    if (window.NeuralTelemetry && typeof window.NeuralTelemetry.logBiometricScan === 'function') {
      window.NeuralTelemetry.logBiometricScan('fingerprint_touch');
    }

    // Haptic pulse loop on Android
    let hapticCount = 0;
    STATE.hapticInterval = setInterval(() => {
      hapticCount++;
      triggerHaptic(18 + hapticCount * 3);
    }, 180);

    STATE.scanTimer = setInterval(() => {
      STATE.scanProgress += 2.5; // ~1.4s
      scannerFill.style.width = `${Math.min(100, STATE.scanProgress)}%`;

      if (STATE.scanProgress >= 100) {
        clearInterval(STATE.scanTimer);
        clearInterval(STATE.hapticInterval);
        completeScan();
      }
    }, 35);
  }

  function stopScan() {
    if (STATE.scanDone) return;
    STATE.isScanning = false;
    biometricZone.classList.remove('scanning');
    if (STATE.scanTimer) clearInterval(STATE.scanTimer);
    if (STATE.hapticInterval) clearInterval(STATE.hapticInterval);
    STATE.scanProgress = 0;
    scannerFill.style.width = '0%';
    scannerText.textContent = 'REST THUMB TO AUTHENTICATE';
    audio.stopScanSound();
  }

  function completeScan() {
    STATE.scanDone = true;
    biometricZone.classList.add('authenticated');
    scannerText.textContent = 'MATCH CONFIRMED: DEVANSH';
    scannerText.style.color = '#39ff14';
    audio.stopScanSound();

    // Confirm biometric authentication in DB
    if (window.NeuralTelemetry && typeof window.NeuralTelemetry.logBiometricScan === 'function') {
      window.NeuralTelemetry.logBiometricScan('fingerprint_authenticated');
    }

    // Heavy confirmation haptic thud
    triggerHaptic([60, 40, 120]);
    audio.playChord([440, 554, 659, 880]);

    setTimeout(() => {
      goToStage(2);
    }, 900);
  }

  // =========================================================================
  // 6. STAGE 03: MATRIX DECRYPTION
  // =========================================================================
  function runMatrixDecryption() {
    STATE.nameDecrypted = false;
    matrixName.classList.remove('revealed');
    matrixGlow.classList.remove('active');

    const target = 'DEVANSH';
    const glyphs = '01ABCDEF!@#$%&*?';
    let iter = 0;

    const interval = setInterval(() => {
      matrixName.textContent = target
        .split('')
        .map((l, idx) => {
          if (idx < iter) return target[idx];
          return glyphs[Math.floor(Math.random() * glyphs.length)];
        })
        .join('');

      audio.playClick(800 + iter * 80);
      triggerHaptic(10); // Micro haptic click on lock

      if (iter >= target.length) {
        clearInterval(interval);
        matrixName.textContent = target;
        STATE.nameDecrypted = true;
        matrixName.classList.add('revealed');
        matrixGlow.classList.add('active');
        triggerHaptic([40, 80]);
        audio.playChord([587.33, 739.99, 880.00, 1174.66]);
      }

      iter += 1 / 3;
    }, 45);
  }

  // =========================================================================
  // 7. STAGE 04: SCRATCHABLE REDACTION BARS
  // =========================================================================
  function setupRedactionCovers() {
    redactionCovers.forEach(cover => {
      cover.addEventListener('click', (e) => {
        e.stopPropagation();
        const wrapper = cover.closest('.redaction-wrapper');
        if (wrapper && wrapper.getAttribute('data-revealed') !== 'true') {
          wrapper.setAttribute('data-revealed', 'true');
          audio.playClick(1400);
          triggerHaptic(25);
          const rect = cover.getBoundingClientRect();
          cinemaFireworks.push(new CinemaFirework(rect.left + rect.width / 2, rect.top + rect.height / 2));
        }
      });
    });
  }

  // =========================================================================
  // 8. STAGE 05: FILM BURN TRANSFORMATION & COUNTDOWN
  // =========================================================================
  function triggerFilmBurnTransformation() {
    // Activate Celluloid Film Burn Transition
    filmBurn.classList.add('burning');
    audio.playPaperTearSound();
    triggerHaptic([30, 20, 60]);

    setTimeout(() => {
      filmBurn.classList.remove('burning');
    }, 1400);

    // Start 35mm Countdown
    STATE.countdownVal = 5;
    countdownNum.textContent = '5';
    audio.playCountdownBeep(false);

    if (STATE.countdownTimer) clearInterval(STATE.countdownTimer);

    STATE.countdownTimer = setInterval(() => {
      STATE.countdownVal--;
      if (STATE.countdownVal > 0) {
        countdownNum.textContent = STATE.countdownVal;
        audio.playCountdownBeep(false);
        triggerHaptic(20);
      } else {
        clearInterval(STATE.countdownTimer);
        countdownNum.textContent = '0';
        audio.playCountdownBeep(true);
        triggerHaptic([60, 40, 100]);
        setTimeout(() => {
          goToStage(5);
        }, 500);
      }
    }, 1000);
  }

  // =========================================================================
  // 9. STAGE 06: TEARABLE VIP MOVIE TICKET
  // =========================================================================
  function handleTicketTear() {
    if (STATE.ticketTorn) return;
    STATE.ticketTorn = true;

    vipTicket.classList.add('torn');
    ticketCaption.textContent = '★ VIP PASS REDEEMED // SEAT 01 RESERVED FOR DEVANSH';
    ticketCaption.style.color = '#ffd166';

    audio.playPaperTearSound();
    triggerHaptic([40, 20, 60]);

    const rect = vipTicket.getBoundingClientRect();
    cinemaFireworks.push(new CinemaFirework(rect.left + rect.width * 0.7, rect.top + rect.height / 2));
    setTimeout(() => cinemaFireworks.push(new CinemaFirework(rect.left + rect.width * 0.5, rect.top + rect.height / 2)), 200);
  }

  // =========================================================================
  // 10. STAGE 07: SAVE SOUVENIR BADGE CANVAS GENERATOR
  // =========================================================================
  function generateSouvenirImage() {
    audio.playClick(1500);
    triggerHaptic(40);

    const expCanvas = document.createElement('canvas');
    expCanvas.width = 800;
    expCanvas.height = 1100;
    const eCtx = expCanvas.getContext('2d');

    // Background
    eCtx.fillStyle = '#0c0507';
    eCtx.fillRect(0, 0, 800, 1100);

    // Gold border
    eCtx.strokeStyle = '#c5a059';
    eCtx.lineWidth = 6;
    eCtx.strokeRect(30, 30, 740, 1040);

    // Inner hairline border
    eCtx.strokeStyle = '#ffd166';
    eCtx.lineWidth = 1.5;
    eCtx.strokeRect(42, 42, 716, 1016);

    // Marquee Header
    eCtx.fillStyle = '#ffd166';
    eCtx.font = '700 24px "Share Tech Mono", monospace';
    eCtx.textAlign = 'center';
    eCtx.fillText('★ METRO-GOLDWYN-DEVANSH ★', 400, 100);

    eCtx.fillStyle = '#c5a059';
    eCtx.font = '500 18px "Share Tech Mono", monospace';
    eCtx.fillText('CLASSIFIED DOSSIER // VIP CINEMA ARCHIVE 2026', 400, 135);

    // Big Title
    eCtx.fillStyle = '#ffffff';
    eCtx.font = '800 56px "Bodoni Moda", Georgia, serif';
    eCtx.fillText('HAPPY BIRTHDAY', 400, 220);

    eCtx.fillStyle = '#ffd166';
    eCtx.font = '800 72px "Orbitron", sans-serif';
    eCtx.fillText('DEVANSH', 400, 305);

    // Line
    eCtx.strokeStyle = '#c5a059';
    eCtx.lineWidth = 2;
    eCtx.beginPath();
    eCtx.moveTo(150, 345);
    eCtx.lineTo(650, 345);
    eCtx.stroke();

    // Message
    eCtx.fillStyle = '#fdfbf7';
    eCtx.font = 'italic 500 28px "Playfair Display", serif';
    eCtx.fillText('"I\'m genuinely glad our paths crossed.', 400, 420);
    eCtx.fillText('Here\'s to happiness, success, new adventures,', 400, 470);
    eCtx.fillText('and countless unforgettable moments ahead."', 400, 520);

    eCtx.fillStyle = '#ffd166';
    eCtx.font = '700 30px "Share Tech Mono", monospace';
    eCtx.fillText('Keep growing, keep smiling, & keep being you!', 400, 600);

    // VIP Ticket Box
    eCtx.fillStyle = '#24080e';
    eCtx.fillRect(100, 670, 600, 180);
    eCtx.strokeStyle = '#ffd166';
    eCtx.strokeRect(100, 670, 600, 180);

    eCtx.fillStyle = '#ffd166';
    eCtx.font = '700 24px "Share Tech Mono", monospace';
    eCtx.fillText('★ ADMIT ONE // ALL-ACCESS LIFETIME VIP ★', 400, 725);

    eCtx.fillStyle = '#ffffff';
    eCtx.font = '500 20px "Share Tech Mono", monospace';
    eCtx.fillText('NAME: DEVANSH  •  CLEARANCE: LEVEL 10', 400, 775);
    eCtx.fillText('STATUS: EXCEPTIONAL  •  SEAT: 01', 400, 815);

    // Footer
    eCtx.fillStyle = '#887e6d';
    eCtx.font = '500 18px "Share Tech Mono", monospace';
    eCtx.fillText('PRODUCED WITH CARE, JUST FOR YOU.', 400, 960);
    eCtx.fillText('OFFICIAL MEMORY ARCHIVE • 2026', 400, 995);

    // Export image download
    try {
      const dataUrl = expCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'devansh-birthday-dossier-2026.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      btnSaveBadge.querySelector('.btn-text').textContent = 'Downloaded to Phone ✓';
      setTimeout(() => {
        btnSaveBadge.querySelector('.btn-text').textContent = 'Save Birthday Dossier';
      }, 3000);
    } catch (err) {
      console.warn('Canvas export failed:', err);
    }
  }

  // =========================================================================
  // 11. STAGE TRANSITION ENGINE
  // =========================================================================
  function goToStage(index) {
    if (index === STATE.currentStage || STATE.isTransitioning) return;
    if (index < 0 || index >= CONFIG.totalStages) return;

    STATE.isTransitioning = true;
    audio.playClick(900);

    const currentEl = stages[STATE.currentStage];
    const nextEl = stages[index];

    currentEl.classList.add('leaving');

    setTimeout(() => {
      currentEl.classList.remove('active', 'leaving');
      STATE.currentStage = index;
      STATE.visitedStages.add(index);

      // Check Mode Transition
      if (index >= 4) {
        STATE.isCinemaMode = true;
        bodyRoot.className = 'mode-cinema';
        audio.switchToCinemaAmbience();
        if (hintText) hintText.textContent = 'Enjoy the 35mm film premiere';
      } else {
        STATE.isCinemaMode = false;
        bodyRoot.className = 'mode-cyber';
        audio.startCyberAmbience();
        if (hintText) hintText.textContent = 'Touch screen to interact with the neural archive';
      }

      updateHUD(index);
      nextEl.classList.add('active');
      STATE.isTransitioning = false;

      // Telemetry Stage Progression
      if (window.NeuralTelemetry && typeof window.NeuralTelemetry.logStage === 'function') {
        window.NeuralTelemetry.logStage('stage-0' + (index + 1));
      }

      onStageEntered(index);
    }, 450);
  }

  function updateHUD(index) {
    const percent = (index / (CONFIG.totalStages - 1)) * 100;
    stageFill.style.width = `${percent}%`;

    stageNodes.forEach((node, i) => {
      node.classList.remove('active');
      if (i === index) node.classList.add('active');
      if (STATE.visitedStages.has(i)) node.classList.add('visited');
    });

    const telemetryLabels = [
      'STAGE 01 // TERMINAL_BOOT',
      'STAGE 02 // IN-DISPLAY_BIOMETRICS',
      'STAGE 03 // DECRYPT_NAME',
      'STAGE 04 // CLASSIFIED_DOSSIER',
      'STAGE 05 // CINEMA_TRANSFORM',
      'STAGE 06 // MOVIE_PREMIERE',
      'STAGE 07 // DIRECTORS_NOTE'
    ];
    if (hudTelemetry) hudTelemetry.textContent = telemetryLabels[index] || telemetryLabels[0];
  }

  function onStageEntered(index) {
    switch (index) {
      case 0: break;
      case 1: break;
      case 2:
        runMatrixDecryption();
        break;
      case 3: break;
      case 4:
        triggerFilmBurnTransformation();
        break;
      case 5:
        // Movie Premiere opening fireworks
        setTimeout(() => cinemaFireworks.push(new CinemaFirework(STATE.width * 0.35, STATE.height * 0.28)), 100);
        setTimeout(() => cinemaFireworks.push(new CinemaFirework(STATE.width * 0.65, STATE.height * 0.24)), 350);
        setTimeout(() => cinemaFireworks.push(new CinemaFirework(STATE.width * 0.5, STATE.height * 0.35)), 600);
        break;
      case 6:
        cinemaFireworks = [];
        break;
    }
  }

  // =========================================================================
  // 12. EVENTS & LISTENERS
  // =========================================================================
  function setupEvents() {
    // In-Display Thumbprint Listeners
    if (biometricPod) {
      biometricPod.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (!STATE.audioInitialized) toggleAudio();
        startScan();
      });

      biometricPod.addEventListener('pointerup', stopScan);
      biometricPod.addEventListener('pointerleave', stopScan);
      biometricPod.addEventListener('pointercancel', stopScan);
    }

    // Audio toggle
    audioToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAudio();
    });

    // Stage 1 to 2
    btnToBiometrics.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!STATE.audioInitialized) toggleAudio();
      goToStage(1);
    });

    // Stage 2 Bypass
    btnBypassBio.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!STATE.audioInitialized) toggleAudio();
      completeScan();
    });

    // Stage 3 to 4
    btnToDossier.addEventListener('click', (e) => {
      e.stopPropagation();
      goToStage(3);
    });

    // Stage 4 to 5 (Film Burn Transformation)
    btnToTransform.addEventListener('click', (e) => {
      e.stopPropagation();
      goToStage(4);
    });

    // Stage 6 VIP Ticket Tear
    if (vipTicket) {
      vipTicket.addEventListener('click', (e) => {
        e.stopPropagation();
        handleTicketTear();
      });
    }

    // Stage 6 Filmstrip frame taps
    filmFrames.forEach(frame => {
      frame.addEventListener('click', (e) => {
        e.stopPropagation();
        const synopsis = frame.getAttribute('data-synopsis');
        synopsisText.textContent = synopsis;
        const rect = frame.getBoundingClientRect();
        cinemaFireworks.push(new CinemaFirework(rect.left + rect.width / 2, rect.top + rect.height / 2));
        audio.playClick(1300);
        triggerHaptic(20);
      });
    });

    // Stage 6 to 7
    btnToLetter.addEventListener('click', (e) => {
      e.stopPropagation();
      goToStage(6);
    });

    // Stage 7 Wax Seal Stamp with D-monogram
    if (waxSeal) {
      waxSeal.addEventListener('click', (e) => {
        e.stopPropagation();
        audio.playClick(500); // Heavy stamp thud
        triggerHaptic([60, 30, 90]);
        waxSeal.style.transform = 'scale(0.88)';
        setTimeout(() => {
          waxSeal.style.transform = 'scale(1)';
        }, 160);
        sealCaption.textContent = 'SEALED & ARCHIVED FOREVER // DEVANSH 2026';
        sealCaption.style.color = '#ffd166';
        const rect = waxSeal.getBoundingClientRect();
        cinemaFireworks.push(new CinemaFirework(rect.left + rect.width / 2, rect.top + rect.height / 2));
      });
    }

    // Stage 7 Save Souvenir Badge
    if (btnSaveBadge) {
      btnSaveBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        generateSouvenirImage();
      });
    }

    // Stage 7 Replay
    btnReplayAll.addEventListener('click', (e) => {
      e.stopPropagation();
      STATE.scanDone = false;
      STATE.ticketTorn = false;
      if (vipTicket) vipTicket.classList.remove('torn');
      goToStage(0);
    });

    // Stage 7 Squad Share Button
    const btnShareSquad = document.getElementById('btn-share-squad');
    if (btnShareSquad) {
      btnShareSquad.addEventListener('click', async (e) => {
        e.stopPropagation();
        audio.playClick(1200);
        triggerHaptic(30);

        const shareUrl = new URL(window.location.origin + window.location.pathname);
        shareUrl.searchParams.set('via', 'devansh');
        shareUrl.searchParams.set('ref', 'squad');
        const finalUrl = shareUrl.toString();

        const shareData = {
          title: "CLASSIFIED FILE: DEVANSH (Neural Archive)",
          text: "Devansh has granted you security clearance. Access the birthday cinematic archive here:",
          url: finalUrl
        };

        if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
          try {
            await navigator.share(shareData);
            return;
          } catch (err) {
            // fallback to clipboard
          }
        }

        // Clipboard copy fallback
        try {
          await navigator.clipboard.writeText(finalUrl);
          const btnText = btnShareSquad.querySelector('.btn-text');
          const originalText = btnText.textContent;
          btnText.textContent = 'Copied to Clipboard! ✓';
          setTimeout(() => { btnText.textContent = originalText; }, 3000);
        } catch (err) {
          prompt('Copy this Squad Link:', finalUrl);
        }
      });
    }

    // Stage 7 Squad Guestbook Submission
    const btnSubmitGuest = document.getElementById('btn-submit-guest');
    const guestNameInput = document.getElementById('guest-name-input');
    const guestWishInput = document.getElementById('guest-wish-input');
    const guestStatusMsg = document.getElementById('guest-status-msg');

    if (btnSubmitGuest && guestNameInput && guestStatusMsg) {
      btnSubmitGuest.addEventListener('click', (e) => {
        e.stopPropagation();
        const nameVal = (guestNameInput.value || '').trim();
        const wishVal = (guestWishInput ? guestWishInput.value : '').trim();

        if (!nameVal) {
          guestStatusMsg.style.color = '#ff3344';
          guestStatusMsg.textContent = '[!] Please enter your name or codename.';
          audio.playClick(400);
          return;
        }

        audio.playChord([523.25, 659.25, 783.99]);
        triggerHaptic([30, 60]);

        if (window.NeuralTelemetry && typeof window.NeuralTelemetry.logGuestIdentity === 'function') {
          window.NeuralTelemetry.logGuestIdentity(nameVal, wishVal);
        }

        guestStatusMsg.style.color = '#39ff14';
        guestStatusMsg.textContent = `[✓] ACCESS GRANTED: AGENT "${nameVal.toUpperCase()}" LOGGED IN LEDGER`;
        btnSubmitGuest.disabled = true;
        btnSubmitGuest.textContent = 'CLEARANCE SIGNED ✓';
        btnSubmitGuest.style.opacity = '0.7';
      });
    }

    // Nav nodes
    stageNodes.forEach(node => {
      node.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = parseInt(node.getAttribute('data-stage'), 10);
        if (STATE.visitedStages.has(target) || target === STATE.currentStage + 1) {
          goToStage(target);
        }
      });
    });

    setupRedactionCovers();

    // Window Resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 150);
    });
  }

  // =========================================================================
  // 13. BOOT
  // =========================================================================
  function init() {
    resizeCanvas();
    updateHUD(0);
    setupEvents();
    requestAnimationFrame(render);
    console.log('✦ CLASSIFIED FILE: DEVANSH (Enhanced Hybrid Engine) Ready.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
