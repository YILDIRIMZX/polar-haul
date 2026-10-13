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

const TEX = 256

// A square on the ground: stand on it and cash flows in until the price is paid, then the reward applies.
export class UnlockPad {
  level = 0
  private paid = 0
  private drawnPaid = -1
  private x: number
  private z: number
  private title: string
  private reward: string
  private pricing: PadPricing
  private apply: () => void
  private ctx: CanvasRenderingContext2D
  private texture: CanvasTexture

  constructor(
    scene: Scene,
    at: { x: number; z: number },
    title: string,
    reward: string,
    pricing: PadPricing,
    apply: () => void,
  ) {
    this.x = at.x
    this.z = at.z
    this.title = title
    this.reward = reward
    this.pricing = pricing
    this.apply = apply

    const canvas = document.createElement('canvas')
    canvas.width = TEX
    canvas.height = TEX
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2D canvas is not available')
    this.ctx = ctx
    this.texture = new CanvasTexture(canvas)
    this.texture.colorSpace = SRGBColorSpace

    const plane = new Mesh(
      new PlaneGeometry(pricing.size, pricing.size).rotateX(-Math.PI / 2),
      new MeshBasicMaterial({ map: this.texture, transparent: true, depthWrite: false }),
    )
    plane.position.set(at.x, 0.04, at.z)
    scene.add(plane)
    this.draw()
  }

  get price(): number {
    return Math.round(this.pricing.baseCost * this.pricing.costGrowth ** this.level)
  }

  get maxed(): boolean {
    return this.pricing.maxLevel !== undefined && this.level >= this.pricing.maxLevel
  }

  update(dt: number, player: Player, wallet: Wallet): void {
    if (this.maxed) return
    const half = this.pricing.size / 2
    const p = player.position
    const onPad = Math.abs(p.x - this.x) < half && Math.abs(p.z - this.z) < half
    if (onPad && wallet.amount > 0) {
      const rate = Math.max(this.price / this.pricing.drainSeconds, this.pricing.minDrainPerSec)
      const amount = Math.min(wallet.amount, this.price - this.paid, rate * dt)
      wallet.spend(amount)
      this.paid += amount
      if (this.paid >= this.price - 1e-6) {
        this.paid = 0
        this.level++
        this.apply()
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
    fitText(c, this.title, 62, 34)
    if (this.maxed) {
      fitText(c, 'MAKS', 150, 64)
    } else {
      fitText(c, this.reward, 130, 64)
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
