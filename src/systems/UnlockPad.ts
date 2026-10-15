import { CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, type Scene } from 'three'
import { audio } from '../audio/Audio.ts'
import { PAD } from '../config/balance.ts'
import type { Player } from '../entities/Player.ts'
import type { Requirement } from './progression.ts'
import type { Wallet } from './Wallet.ts'

export interface PadPricing {
  baseCost: number
  costGrowth: number
  drainSeconds: number
  minDrainPerSec: number
  size: number
  maxLevel?: number // no limit when left out
}

export interface PadOptions {
  at: { x: number; z: number }
  title: string
  reward: (level: number) => string // the text for the next purchase; `level` is how many were bought so far
  pricing: PadPricing
  apply: (level: number) => void // called with the new level after each purchase
  hidden?: boolean // starts out of sight until show() is called
  vanishWhenMaxed?: boolean // leaves the base after its last level instead of showing MAKS
  // Something besides cash the next level needs. While it is not met the pad is grey, takes no cash
  // and shows the label ("Müşteri 6/10") instead of the price.
  requirement?: () => Requirement
}

const TEX = 256
const APPEAR_SECONDS = 0.35

// A square on the ground: stand on it and cash flows in until the price is paid, then the reward applies.
// Right after a purchase cash stops once for a moment, so the money left over is not spent on the next
// level by accident; stepping off and on again carries on straight away.
export class UnlockPad {
  level = 0
  private paid = 0
  private pause = 0 // seconds left of the stop after a purchase
  private tickTimer = 0
  private drawnKey = ''
  private appear = 1 // 0 → 1 while the pad pops into view
  private options: PadOptions
  private at: { x: number; z: number }
  private plane: Mesh
  private ctx: CanvasRenderingContext2D
  private texture: CanvasTexture

  constructor(scene: Scene, options: PadOptions) {
    this.options = options
    this.at = { ...options.at }

    const canvas = document.createElement('canvas')
    canvas.width = TEX
    canvas.height = TEX
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2D canvas is not available')
    this.ctx = ctx
    this.texture = new CanvasTexture(canvas)
    this.texture.colorSpace = SRGBColorSpace

    const size = options.pricing.size
    this.plane = new Mesh(
      new PlaneGeometry(size, size).rotateX(-Math.PI / 2),
      new MeshBasicMaterial({ map: this.texture, transparent: true, depthWrite: false }),
    )
    this.plane.position.set(options.at.x, 0.04, options.at.z)
    this.plane.visible = !options.hidden
    scene.add(this.plane)
    this.draw()
  }

  get price(): number {
    const p = this.options.pricing
    return Math.round(p.baseCost * p.costGrowth ** this.level)
  }

  // Test panel: the next level at once, free.
  buyNow(): void {
    if (this.maxed) return
    this.level++
    this.options.apply(this.level)
    if (this.maxed && this.options.vanishWhenMaxed) this.hide()
    else this.draw()
  }

  get maxed(): boolean {
    const max = this.options.pricing.maxLevel
    return max !== undefined && this.level >= max
  }

  get shown(): boolean {
    return this.plane.visible
  }

  // Brings a hidden pad into the base with a short pop.
  show(): void {
    if (this.plane.visible) return
    this.plane.visible = true
    this.appear = 0
    audio.play('appear')
  }

  hide(): void {
    this.plane.visible = false
    this.pause = 0
  }

  // Moves the pad to another spot next to its station, when a pad before it has left.
  moveTo(at: { x: number; z: number }): void {
    this.at = { ...at }
    this.plane.position.set(at.x, 0.04, at.z)
  }

  update(dt: number, player: Player, wallet: Wallet): void {
    if (!this.plane.visible) return
    if (this.appear < 1) {
      this.appear = Math.min(1, this.appear + dt / APPEAR_SECONDS)
      // easeOutBack: grows past full size a little before settling, so the new pad catches the eye.
      const u = this.appear - 1
      this.plane.scale.setScalar(1 + 2.70158 * u * u * u + 1.70158 * u * u)
    }
    if (this.maxed) return

    const half = this.options.pricing.size / 2
    const p = player.position
    const onPad = Math.abs(p.x - this.at.x) < half && Math.abs(p.z - this.at.z) < half
    // The stop after a purchase lasts while the player stays; stepping off ends it.
    this.pause = onPad ? Math.max(0, this.pause - dt) : 0
    const ready = this.options.requirement?.().met ?? true

    if (ready && onPad && this.pause <= 0 && wallet.amount > 0) {
      const pricing = this.options.pricing
      const rate = Math.max(this.price / pricing.drainSeconds, pricing.minDrainPerSec)
      const amount = Math.min(wallet.amount, this.price - this.paid, rate * dt)
      wallet.spend(amount)
      this.paid += amount
      this.tickTimer -= dt
      if (this.tickTimer <= 0) {
        audio.play('padTick', { rising: true })
        this.tickTimer = PAD.tickInterval
      }
      if (this.paid >= this.price - 1e-6) {
        this.paid = 0
        this.level++
        this.pause = PAD.afterPurchasePause
        this.options.apply(this.level)
        audio.play('purchase')
        if (this.maxed && this.options.vanishWhenMaxed) {
          this.hide()
          return
        }
        // Redraw now: once maxed, update() returns early and would never show MAKS.
        this.draw()
      }
    }
    if (this.drawKey() !== this.drawnKey) this.draw()
  }

  // What the texture currently shows; it is redrawn only when this changes.
  private drawKey(): string {
    const waiting = this.pause > 0 ? Math.ceil((this.pause / PAD.afterPurchasePause) * 12) : 0
    const req = this.options.requirement?.()
    const reqKey = req ? `${req.met}:${req.label}` : ''
    return `${this.level}:${Math.floor(this.paid)}:${waiting}:${reqKey}`
  }

  private draw(): void {
    const c = this.ctx
    const price = this.price
    const req = this.maxed ? undefined : this.options.requirement?.()
    const locked = req !== undefined && !req.met
    this.drawnKey = this.drawKey()
    c.clearRect(0, 0, TEX, TEX)

    c.fillStyle = locked ? 'rgba(90, 96, 102, 0.55)' : 'rgba(31, 58, 77, 0.55)'
    roundRect(c, 8, 8, TEX - 16, TEX - 16, 28)
    c.fill()

    // Progress fills the pad from the bottom; a maxed pad stays full.
    const filled = (TEX - 16) * (this.maxed ? 1 : this.paid / price)
    c.save()
    roundRect(c, 8, 8, TEX - 16, TEX - 16, 28)
    c.clip()
    c.fillStyle = 'rgba(60, 179, 113, 0.8)'
    c.fillRect(8, TEX - 8 - filled, TEX - 16, filled)
    c.restore()

    c.lineWidth = 8
    c.strokeStyle = locked ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.9)'
    roundRect(c, 8, 8, TEX - 16, TEX - 16, 28)
    c.stroke()

    // During the stop after a purchase, a thin line along the bottom fills up: cash flows again when it is full.
    if (!locked && !this.maxed && this.pause > 0) {
      c.fillStyle = 'rgba(255, 255, 255, 0.95)'
      c.fillRect(36, TEX - 30, (TEX - 72) * (1 - this.pause / PAD.afterPurchasePause), 8)
    }

    c.fillStyle = '#ffffff'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    fitText(c, this.options.title, 62, 34)
    if (this.maxed) {
      fitText(c, 'MAKS', 150, 64)
    } else if (locked && req) {
      // The missing prerequisite takes the price's place.
      fitText(c, this.options.reward(this.level), 125, 52)
      c.fillStyle = '#ffd38a'
      fitText(c, req.label, 195, 32)
    } else {
      fitText(c, this.options.reward(this.level), 130, 64)
      fitText(c, `$${price - Math.floor(this.paid)}`, 200, 40)
    }
    this.texture.needsUpdate = true
  }
}

// Draws centred bold text, shrinking it until it fits inside the pad's border.
function fitText(c: CanvasRenderingContext2D, text: string, y: number, size: number): void {
  const maxWidth = TEX - 48
  let px = size
  c.font = `bold ${px}px system-ui, sans-serif`
  while (c.measureText(text).width > maxWidth && px > 12) {
    px -= 2
    c.font = `bold ${px}px system-ui, sans-serif`
  }
  c.fillText(text, TEX / 2, y)
}

function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  c.beginPath()
  c.roundRect(x, y, w, h, r)
}
