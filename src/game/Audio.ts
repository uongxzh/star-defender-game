export class AudioSystem {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private volume = 0.3;
  private bgmNodes: AudioNode[] = [];
  private bgmActive = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  playShoot() {
    if (!this.enabled) return;
    this.init();
    const t = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.1);
    gain.gain.setValueAtTime(this.volume * 0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  playExplosion() {
    if (!this.enabled) return;
    this.init();
    const t = this.ctx!.currentTime;
    const bufferSize = this.ctx!.sampleRate * 0.3;
    const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = this.ctx!.createBufferSource();
    const gain = this.ctx!.createGain();
    const filter = this.ctx!.createBiquadFilter();
    source.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.3);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx!.destination);
    gain.gain.setValueAtTime(this.volume * 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    source.start(t);
    source.stop(t + 0.3);
  }

  playHit() {
    if (!this.enabled) return;
    this.init();
    const t = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.15);
    gain.gain.setValueAtTime(this.volume * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  playPowerUp() {
    if (!this.enabled) return;
    this.init();
    const t = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.2);
    gain.gain.setValueAtTime(this.volume * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  playGameOver() {
    if (!this.enabled) return;
    this.init();
    const t = this.ctx!.currentTime;
    const notes = [300, 250, 200, 150];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.type = 'sawtooth';
      const start = t + i * 0.15;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(this.volume * 0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
      osc.start(start);
      osc.stop(start + 0.2);
    });
  }

  startBGM() {
    if (!this.enabled || this.bgmActive) return;
    this.init();
    this.bgmActive = true;

    const t = this.ctx!.currentTime;
    const masterGain = this.ctx!.createGain();
    masterGain.connect(this.ctx!.destination);
    masterGain.gain.setValueAtTime(this.volume * 0.08, t);
    this.bgmNodes.push(masterGain);

    const baseFreqs = [55, 82.5, 110];
    baseFreqs.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(1, t);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      this.bgmNodes.push(osc, gain);
    });

    const lfo = this.ctx!.createOscillator();
    const lfoGain = this.ctx!.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.1, t);
    lfoGain.gain.setValueAtTime(30, t);
    lfo.connect(lfoGain);

    const padOsc = this.ctx!.createOscillator();
    const padGain = this.ctx!.createGain();
    padOsc.type = 'triangle';
    padOsc.frequency.setValueAtTime(220, t);
    lfoGain.connect(padOsc.frequency);
    padGain.gain.setValueAtTime(0.4, t);
    padOsc.connect(padGain);
    padGain.connect(masterGain);
    padOsc.start(t);
    lfo.start(t);
    this.bgmNodes.push(lfo, lfoGain, padOsc, padGain);
  }

  stopBGM() {
    if (!this.bgmActive) return;
    const t = this.ctx!.currentTime;
    this.bgmNodes.forEach((node) => {
      if (node instanceof OscillatorNode) {
        try { node.stop(t); } catch {}
      }
      if (node instanceof GainNode) {
        node.gain.setValueAtTime(0, t);
      }
    });
    this.bgmNodes = [];
    this.bgmActive = false;
  }
}
