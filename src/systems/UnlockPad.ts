import { CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, type Scene } from 'three'
import type { Player } from '../entities/Player.ts'
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
}

const TEX = 256
const APPEAR_SECONDS = 0.35

// A square on the ground: stand on it and cash flows in until the price is paid, then the reward applies.
export class UnlockPad {
  level = 0
  private paid = 0
  private drawnPaid = -1
  private appear = 1 // 0 → 1 while the pad pops into view
  private options: PadOptions
  private plane: Mesh
  private ctx: CanvasRenderingContext2D
  private texture: CanvasTexture

  constructor(scene: Scene, options: PadOptions) {
    this.options = options

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
    const { x, z } = this.options.at
    const onPad = Math.abs(p.x - x) < half && Math.abs(p.z - z) < half
    if (onPad && wallet.amount > 0) {
      const pricing = this.options.pricing
      const rate = Math.max(this.price / pricing.drainSeconds, pricing.minDrainPerSec)
      const amount = Math.min(wallet.amount, this.price - this.paid, rate * dt)
      wallet.spend(amount)
      this.paid += amount
      if (this.paid >= this.price - 1e-6) {
        this.paid = 0
        this.level++
        this.options.apply(this.level)
        // Redraw now: once maxed, update() returns early and would never show MAKS.
        this.draw()
      }
    }
    if (Math.floor(this.paid) !== this.drawnPaid) this.draw()
  }

  private draw(): void {
    const c = this.ctx
    const price = this.price
    this.drawnPaid = Math.floor(this.paid)
    c.clearRect(0, 0, TEX, TEX)

    c.fillStyle = 'rgba(31, 58, 77, 0.55)'
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
    c.strokeStyle = 'rgba(255, 255, 255, 0.9)'
    roundRect(c, 8, 8, TEX - 16, TEX - 16, 28)
    c.stroke()

    c.fillStyle = '#ffffff'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    fitText(c, this.options.title, 62, 34)
    if (this.maxed) {
      fitText(c, 'MAKS', 150, 64)
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
