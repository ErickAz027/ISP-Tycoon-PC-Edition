// Web Audio API Synthesizer for NOC Tycoon SFX & Ambient Drone

class SoundEngine {
  private ctx: AudioContext | null = null
  private isMuted: boolean = false
  private ambientGain: GainNode | null = null
  private isAmbientPlaying: boolean = false

  constructor() {}

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(muted ? 0 : 0.015, this.ctx.currentTime)
    }
  }

  public getMuted(): boolean {
    return this.isMuted
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted
    this.setMuted(this.isMuted)
    return this.isMuted
  }

  // Futuristic digital UI beep
  public playClick() {
    if (this.isMuted) return
    this.initCtx()
    if (!this.ctx) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.04)

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start()
    osc.stop(this.ctx.currentTime + 0.04)
  }

  // Cable connected chime
  public playConnect() {
    if (this.isMuted) return
    this.initCtx()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(523.25, now)
    osc.frequency.setValueAtTime(659.25, now + 0.08)
    osc.frequency.setValueAtTime(783.99, now + 0.16)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start()
    osc.stop(now + 0.3)
  }

  // Cash settlement cha-ching chime
  public playCash() {
    if (this.isMuted) return
    this.initCtx()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(987.77, now)
    osc.frequency.setValueAtTime(1318.51, now + 0.08)

    gain.gain.setValueAtTime(0.05, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start()
    osc.stop(now + 0.35)
  }

  // Emergency alarm siren
  public playAlarm() {
    if (this.isMuted) return
    this.initCtx()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.linearRampToValueAtTime(440, now + 0.15)
    osc.frequency.linearRampToValueAtTime(880, now + 0.3)

    gain.gain.setValueAtTime(0.06, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start()
    osc.stop(now + 0.35)
  }

  // Hardware purchase thud
  public playDeploy() {
    if (this.isMuted) return
    this.initCtx()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.15)

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start()
    osc.stop(now + 0.2)
  }

  // Research Tech Complete Chime
  public playResearchComplete() {
    if (this.isMuted) return
    this.initCtx()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, now)
    osc.frequency.setValueAtTime(554.37, now + 0.1)
    osc.frequency.setValueAtTime(659.25, now + 0.2)
    osc.frequency.setValueAtTime(880, now + 0.3)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start()
    osc.stop(now + 0.6)
  }

  // Milestone Unlocked Victory Fanfare
  public playMilestoneAchieved() {
    if (this.isMuted) return
    this.initCtx()
    if (!this.ctx) return

    const notes = [523.25, 659.25, 783.99, 1046.5]
    const now = this.ctx.currentTime
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator()
      const gain = this.ctx!.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + idx * 0.12)
      gain.gain.setValueAtTime(0.08, now + idx * 0.12)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4)

      osc.connect(gain)
      gain.connect(this.ctx!.destination)

      osc.start(now + idx * 0.12)
      osc.stop(now + idx * 0.12 + 0.4)
    })
  }

  // Ambient Server Room Cooling Drone
  public toggleAmbientDrone(): boolean {
    this.initCtx()
    if (!this.ctx) return false

    if (this.isAmbientPlaying) {
      if (this.ambientGain) {
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5)
      }
      this.isAmbientPlaying = false
      return false
    } else {
      const osc1 = this.ctx.createOscillator()
      const osc2 = this.ctx.createOscillator()
      const filter = this.ctx.createBiquadFilter()
      this.ambientGain = this.ctx.createGain()

      osc1.type = 'sawtooth'
      osc1.frequency.setValueAtTime(55, this.ctx.currentTime) // Low A1 hum
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(110, this.ctx.currentTime) // A2 harmonic

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(180, this.ctx.currentTime)

      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.015, this.ctx.currentTime)

      osc1.connect(filter)
      osc2.connect(filter)
      filter.connect(this.ambientGain)
      this.ambientGain.connect(this.ctx.destination)

      osc1.start()
      osc2.start()

      this.isAmbientPlaying = true
      return true
    }
  }

  public getIsAmbientPlaying(): boolean {
    return this.isAmbientPlaying
  }
}

export const sound = new SoundEngine()
