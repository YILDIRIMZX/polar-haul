import {
  CanvasTexture,
  CylinderGeometry,
  Mesh,
  MeshLambertMaterial,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector3,
  type Scene,
} from 'three'
import { BASE_LEVELS } from '../config/balance.ts'
import { COLORS, LAYOUT } from '../config/world.ts'
import type { Player } from '../entities/Player.ts'
import { floatingText } from '../fx/FloatingText.ts'
import type { BaseArea } from '../world/BaseArea.ts'
import { addObstacle } from '../world/bounds.ts'
import { baseRequirement, type Progress } from './progression.ts'
import { UnlockPad } from './UnlockPad.ts'
import type { Wallet } from './Wallet.ts'

const LABEL_W = 128
const LABEL_H = 64

// The Great Furnace in the middle of the base. Its level is the base level: raising it grows the fence
// and unlocks new upgrades. Its pad takes cash only once baseRequirement says the prerequisite is met.
export class GreatFurnace {
  private pad: UnlockPad
  private progress: Progress
  private base: BaseArea
  private ctx: CanvasRenderingContext2D
  private texture: CanvasTexture
  private fireMat: MeshLambertMaterial
  private top = new Vector3(LAYOUT.greatFurnace.x, 3.6, LAYOUT.greatFurnace.z)

  constructor(scene: Scene, progress: Progress, base: BaseArea) {
    this.progress = progress
    this.base = base

    const stone = new MeshLambertMaterial({ color: COLORS.machine })
    this.fireMat = new MeshLambertMaterial({ color: COLORS.furnaceFire, emissive: COLORS.furnaceFire, emissiveIntensity: 0.6 })
    const body = new Mesh(new CylinderGeometry(1.1, 1.4, 2.2, 10), stone)
    body.position.set(LAYOUT.greatFurnace.x, 1.1, LAYOUT.greatFurnace.z)
    body.castShadow = true
    const fire = new Mesh(new CylinderGeometry(0.9, 0.9, 0.3, 10), this.fireMat)
    fire.position.y = 1.2
    body.add(fire)

    const canvas = document.createElement('canvas')
    canvas.width = LABEL_W
    canvas.height = LABEL_H
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2D canvas is not available')
    this.ctx = ctx
    this.texture = new CanvasTexture(canvas)
    this.texture.colorSpace = SRGBColorSpace
    const label = new Sprite(new SpriteMaterial({ map: this.texture, depthTest: false }))
    label.scale.set(2, 1, 1)
    label.position.copy(this.top)
    label.renderOrder = 12

    scene.add(body, label)
    addObstacle(LAYOUT.greatFurnace, 2.6, 2.6)

    const last = BASE_LEVELS[BASE_LEVELS.length - 1]
    this.pad = new UnlockPad(scene, {
      at: LAYOUT.greatFurnacePad,
      title: 'BÜYÜK OCAK',
      reward: (bought) => `ÜS ${bought + 2}`,
      // Prices come from BASE_LEVELS: the pad's n-th purchase raises the base to level n + 1.
      pricing: {
        baseCost: BASE_LEVELS[1].price,
        costGrowth: BASE_LEVELS.length > 2 ? BASE_LEVELS[2].price / BASE_LEVELS[1].price : 1,
        maxLevel: last.level - 1,
        size: 2.6,
        drainSeconds: 1.6,
        minDrainPerSec: 40,
      },
      requirement: () => baseRequirement(this.progress.baseLevel + 1, this.progress),
      apply: (bought) => this.raiseTo(bought + 1),
    })
    this.drawLabel()
  }

  update(dt: number, player: Player, wallet: Wallet, time: number): void {
    this.fireMat.emissiveIntensity = 0.6 + Math.sin(time * 3) * 0.15
    this.pad.update(dt, player, wallet)
  }

  // Test panel: raises the base one level at once, free and without its requirement.
  skipLevel(): void {
    if (this.progress.baseLevel >= BASE_LEVELS[BASE_LEVELS.length - 1].level) return
    this.pad.level++
    this.raiseTo(this.pad.level + 1)
  }

  private raiseTo(level: number): void {
    const info = BASE_LEVELS.find((l) => l.level === level)
    if (!info) return
    this.progress.baseLevel = level
    this.base.setRadius(info.fenceRadius)
    floatingText.spawn(`ÜS ${level}!`, this.top)
    this.drawLabel()
  }

  private drawLabel(): void {
    const c = this.ctx
    c.clearRect(0, 0, LABEL_W, LABEL_H)
    c.fillStyle = 'rgba(31, 58, 77, 0.85)'
    c.beginPath()
    c.roundRect(4, 4, LABEL_W - 8, LABEL_H - 8, 14)
    c.fill()
    c.fillStyle = '#ffd38a'
    c.font = 'bold 30px system-ui, sans-serif'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.fillText(`ÜS ${this.progress.baseLevel}`, LABEL_W / 2, LABEL_H / 2 + 1)
    this.texture.needsUpdate = true
  }
}
