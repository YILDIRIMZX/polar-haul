import { Fog, type Scene } from 'three'
import { audio } from '../audio/Audio.ts'
import { STORM } from '../config/balance.ts'

const STORM_FOG = { near: 30, far: 80 } // the fog closes in this far at full strength

// The blizzard that falls on the base after a lost boss fight. While it blows, customers lose patience
// twice as fast and the furnace cooks slower. It hurts, but it never ends the game.
export class Storm {
  remaining = 0
  private strength = 0 // 0–1, fades in and out for the screen; the gameplay penalty is all or nothing
  private fog: Fog | null
  private clearFog = { near: 0, far: 0 }
  private overlay = document.createElement('div')

  constructor(scene: Scene) {
    this.fog = scene.fog instanceof Fog ? scene.fog : null
    if (this.fog) this.clearFog = { near: this.fog.near, far: this.fog.far }
    this.overlay.className = 'storm'
    document.body.append(this.overlay)
  }

  get active(): boolean {
    return this.remaining > 0
  }

  // How fast customers lose patience: 1 normally.
  get patienceRate(): number {
    return this.active ? STORM.patienceRate : 1
  }

  // How fast the furnace cooks: 1 normally.
  get cookRate(): number {
    return this.active ? STORM.cookRate : 1
  }

  start(): void {
    this.remaining = STORM.seconds
    audio.play('storm')
  }

  stop(): void {
    this.remaining = 0
  }

  update(dt: number): void {
    this.remaining = Math.max(0, this.remaining - dt)
    const target = this.active ? 1 : 0
    const step = dt / STORM.fadeSeconds
    this.strength = target > this.strength ? Math.min(target, this.strength + step) : Math.max(target, this.strength - step)

    this.overlay.style.opacity = String(this.strength)
    if (this.fog) {
      this.fog.near = this.clearFog.near + (STORM_FOG.near - this.clearFog.near) * this.strength
      this.fog.far = this.clearFog.far + (STORM_FOG.far - this.clearFog.far) * this.strength
    }
  }
}
