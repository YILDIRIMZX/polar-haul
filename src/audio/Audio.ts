import { ZZFX, ZZFXSound } from 'zzfx'
import { SOUNDS, type SoundId } from './sounds.ts'

const MASTER_VOLUME = 0.35
const BURST_WINDOW = 0.06 // seconds
const BURST_LIMIT = 3 // the same sound plays at most this many times inside one window
const RISE_RESET = 0.5 // seconds of silence before a rising sound starts low again
const RISE_STEP = 0.06 // pitch added per step: about a semitone
const RISE_STEPS = 14
const MUTE_KEY = 'polar-haul-muted'

interface PlayOptions {
  // Each quick repeat plays a little higher, like a growing pile of coins.
  rising?: boolean
  volume?: number
}

// The only place that plays sound. Game systems just name the event: audio.play('pickup').
class AudioService {
  muted = readMuted()
  private cache = new Map<SoundId, ZZFXSound>()
  private recent = new Map<SoundId, number[]>()
  private rise = new Map<SoundId, { step: number; last: number }>()

  constructor() {
    ZZFX.volume = MASTER_VOLUME
  }

  // iOS keeps audio off until the first touch; call this on every touch, it is cheap.
  unlock(): void {
    if (ZZFX.audioContext.state !== 'running') void ZZFX.audioContext.resume()
  }

  // Stops all sound while the app is in the background.
  pause(): void {
    void ZZFX.audioContext.suspend()
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
    } catch {
      // Private browsing can refuse storage; the setting then lasts until the app closes.
    }
  }

  play(id: SoundId, options: PlayOptions = {}): void {
    if (this.muted || ZZFX.audioContext.state !== 'running') return
    const now = ZZFX.audioContext.currentTime
    if (this.tooMany(id, now)) return
    const pitch = options.rising ? this.risingPitch(id, now) : 1
    this.sound(id).play(options.volume ?? 1, pitch)
  }

  private tooMany(id: SoundId, now: number): boolean {
    const times = (this.recent.get(id) ?? []).filter((t) => now - t < BURST_WINDOW)
    if (times.length >= BURST_LIMIT) return true
    times.push(now)
    this.recent.set(id, times)
    return false
  }

  private risingPitch(id: SoundId, now: number): number {
    const r = this.rise.get(id) ?? { step: 0, last: -Infinity }
    r.step = now - r.last > RISE_RESET ? 0 : Math.min(r.step + 1, RISE_STEPS)
    r.last = now
    this.rise.set(id, r)
    return 1 + r.step * RISE_STEP
  }

  // Samples are built once, on first use. ZZFXSound edits the array it is given, so it gets a copy.
  private sound(id: SoundId): ZZFXSound {
    let s = this.cache.get(id)
    if (!s) {
      s = new ZZFXSound([...SOUNDS[id]])
      this.cache.set(id, s)
    }
    return s
  }
}

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export const audio = new AudioService()
