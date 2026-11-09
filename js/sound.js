/**
 * Sound System - Web Audio API Synthesizer
 * Tự động tạo âm thanh bằng code, không phụ thuộc file ngoài, không lo lỗi mạng/bản quyền.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.musicEnabled = false;
    this.lofiTimer = null;
    this.currentChordIndex = 0;

    // Chuỗi hợp âm Lofi Chill đêm: Fmaj7 -> Em7 -> Dm7 -> Cmaj7
    this.chords = [
      [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
      [164.81, 196.00, 246.94, 293.66], // Em7 (E3, G3, B3, D4)
      [146.83, 174.61, 220.00, 261.63], // Dm7 (D3, F3, A3, C4)
      [130.81, 164.81, 196.00, 246.94]  // Cmaj7 (C3, E3, G3, B3)
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Tiếng Ting Ting nổ đơn ShopeeFood
  playNotification() {
    if (!this.sfxEnabled) return;
    this.init();
    const now = this.ctx.currentTime;

    const playTone = (freq, start, duration) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    // Đôi chuông nổ đơn: E6 -> G#6 -> B6
    playTone(1318.51, now, 0.18);
    playTone(1661.22, now + 0.1, 0.22);
    playTone(1975.53, now + 0.22, 0.35);
  }

  // Tiếng còi xe máy "tin tin"
  playHorn() {
    if (!this.sfxEnabled) return;
    this.init();
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(420, now);
    osc2.frequency.setValueAtTime(440, now);

    // Filter để còi nghe êm hơn
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.18);
    osc2.stop(now + 0.18);
  }

  // Tiếng mèo con "Meowww~"
  playMeow() {
    if (!this.sfxEnabled) return;
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    // Biến thiên tần số tạo âm điệu mèo kêu
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.45);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  // Tiếng nhận tiền thù lao (Coin Ting Ting)
  playCoin() {
    if (!this.sfxEnabled) return;
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Tiếng thả tim yêu đời
  playSparkle() {
    if (!this.sfxEnabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.12, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.25);
    });
  }

  // Tiếng chú Vịt Vàng gắn ghi đông kêu Quạc Quạc / Bíp Bíp
  playDuckQuack() {
    if (!this.sfxEnabled) return;
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(850, now);
    osc.frequency.linearRampToValueAtTime(620, now + 0.12);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Tiếng gõ Bàn Phím Cơ (Mechanical Keyboard Blue Switch Click)
  playKeyClick() {
    if (!this.sfxEnabled) return;
    this.init();
    const now = this.ctx.currentTime;

    // Click cao
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    const clickFreq = 2200 + Math.random() * 800;
    osc.frequency.setValueAtTime(clickFreq, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);

    // Thud trầm của switch
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(260 + Math.random() * 60, now + 0.01);
    gain2.gain.setValueAtTime(0.12, now + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.01);
    osc2.stop(now + 0.07);
  }

  // Tiếng Mưa Rào Ban Đêm (Ambient Rain ASMR)
  startRainSound() {
    if (!this.sfxEnabled || this.rainSource) return;
    this.init();
    // Tạo pink/white noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.11;
    }

    this.rainSource = this.ctx.createBufferSource();
    this.rainSource.buffer = noiseBuffer;
    this.rainSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.rainGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 1.5);

    this.rainSource.connect(filter);
    filter.connect(this.rainGain);
    this.rainGain.connect(this.ctx.destination);

    this.rainSource.start();
  }

  stopRainSound() {
    if (this.rainSource && this.rainGain) {
      this.rainGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
      setTimeout(() => {
        if (this.rainSource) {
          this.rainSource.stop();
          this.rainSource.disconnect();
          this.rainSource = null;
        }
      }, 900);
    }
  }

  // Trình phát nhạc Lofi Ban Đêm (Piano & Ambient Rhodes thư giãn)
  startLofiMusic() {
    this.init();
    this.musicEnabled = true;
    this.playNextChord();
  }

  stopLofiMusic() {
    this.musicEnabled = false;
    if (this.lofiTimer) {
      clearTimeout(this.lofiTimer);
      this.lofiTimer = null;
    }
  }

  playNextChord() {
    if (!this.musicEnabled) return;
    const now = this.ctx.currentTime;
    const chord = this.chords[this.currentChordIndex];

    // Phát 4 nốt của hợp âm với bộ lọc ấm (Lowpass Filter)
    chord.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      // Attack chậm, release dài êm dịu
      const noteDelay = i * 0.05; // Arpeggio nhẹ
      gain.gain.setValueAtTime(0.001, now + noteDelay);
      gain.gain.linearRampToValueAtTime(0.06, now + noteDelay + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + noteDelay + 2.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + noteDelay);
      osc.stop(now + noteDelay + 2.5);
    });

    // Thỉnh thoảng gõ thêm 1 nốt giai điệu piano ngọt ngào
    if (Math.random() > 0.3) {
      const melodyFreq = chord[Math.floor(Math.random() * chord.length)] * 2;
      const mOsc = this.ctx.createOscillator();
      const mGain = this.ctx.createGain();
      mOsc.type = 'sine';
      mOsc.frequency.setValueAtTime(melodyFreq, now + 1.0);

      mGain.gain.setValueAtTime(0.001, now + 1.0);
      mGain.gain.linearRampToValueAtTime(0.05, now + 1.1);
      mGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      mOsc.connect(mGain);
      mGain.connect(this.ctx.destination);
      mOsc.start(now + 1.0);
      mOsc.stop(now + 2.0);
    }

    this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;
    this.lofiTimer = setTimeout(() => this.playNextChord(), 2600);
  }
}

// Khởi tạo đối tượng sound toàn cục
window.soundEngine = new SoundEngine();
