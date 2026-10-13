import {
  CanvasTexture,
  CapsuleGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector3,
} from 'three'
import { COLORS } from '../config/world.ts'
import { turnTowards } from '../game/math.ts'

const bodyGeo = new CapsuleGeometry(0.38, 0.7, 4, 10)
const headGeo = new SphereGeometry(0.28, 12, 8)
const headMat = new MeshLambertMaterial({ color: COLORS.skin })
const coatMats = COLORS.coats.map((color) => new MeshLambertMaterial({ color }))

const BUBBLE_W = 128
const BUBBLE_H = 72
const toTarget = new Vector3()

export type CustomerState = 'arriving' | 'waiting' | 'leaving'

// A cold survivor who queues at the counter, waits for an order of cooked meat, pays and leaves.
// A bubble above the head shows how many pieces are still wanted and how much patience is left.
export class Customer {
  readonly root = new Group()
  state: CustomerState = 'arriving'
  slot = 0 // place in the queue; 0 is at the counter
  readonly want: number
  got = 0
  incoming = 0 // pieces flying toward this customer right now
  patience: number
  readonly patienceMax: number
  private body = new Group()
  private bubble: Sprite
  private ctx: CanvasRenderingContext2D
  private texture: CanvasTexture
  private drawnKey = ''
  private facing = Math.PI

  constructor(want: number, patience: number) {
    this.want = want
    this.patience = patience
    this.patienceMax = patience

    const coat = new Mesh(bodyGeo, coatMats[Math.floor(Math.random() * coatMats.length)])
    coat.position.y = 0.75
    coat.castShadow = true
    const head = new Mesh(headGeo, headMat)
    head.position.y = 1.55
    this.body.add(coat, head)

    const canvas = document.createElement('canvas')
    canvas.width = BUBBLE_W
    canvas.height = BUBBLE_H
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2D canvas is not available')
    this.ctx = ctx
    this.texture = new CanvasTexture(canvas)
    this.texture.colorSpace = SRGBColorSpace
    this.bubble = new Sprite(new SpriteMaterial({ map: this.texture, depthTest: false }))
    this.bubble.scale.set(1.5, 0.84, 1)
    this.bubble.position.y = 2.5
    this.bubble.renderOrder = 12

    this.root.add(this.body, this.bubble)
  }

  get position(): Vector3 {
    return this.root.position
  }

  get waitingFor(): number {
    return this.want - this.got - this.incoming
  }

  get cold(): boolean {
    return this.patience <= 0
  }

  // Walks toward a point; returns true once there.
  walkTo(target: { x: number; z: number }, speed: number, dt: number): boolean {
    toTarget.set(target.x - this.position.x, 0, target.z - this.position.z)
    const dist = toTarget.length()
    if (dist < 0.05) return true
    const step = Math.min(dist, speed * dt)
    this.position.addScaledVector(toTarget.divideScalar(dist), step)
    this.facing = turnTowards(this.facing, Math.atan2(toTarget.x, toTarget.z), 10 * dt)
    return dist - step < 0.05
  }

  // Faces the counter (toward -z) while waiting.
  faceCounter(dt: number): void {
    this.facing = turnTowards(this.facing, Math.PI, 10 * dt)
  }

  updateLook(time: number): void {
    this.body.rotation.y = this.facing
    // A cold customer shivers.
    this.body.position.x = this.cold && this.state === 'waiting' ? Math.sin(time * 70) * 0.04 : 0
    this.bubble.visible = this.state !== 'leaving'
    this.drawBubble()
  }

  dispose(): void {
    this.texture.dispose()
    this.bubble.material.dispose()
  }

  private drawBubble(): void {
    const left = this.want - this.got
    const ratio = Math.max(0, this.patience / this.patienceMax)
    // Redraw only when something visible changed: the count, or the bar by a few percent.
    const key = `${left}:${Math.ceil(ratio * 20)}`
    if (key === this.drawnKey) return
    this.drawnKey = key

    const c = this.ctx
    c.clearRect(0, 0, BUBBLE_W, BUBBLE_H)
    c.fillStyle = 'rgba(255, 255, 255, 0.92)'
    c.beginPath()
    c.roundRect(4, 4, BUBBLE_W - 8, BUBBLE_H - 8, 16)
    c.fill()

    // A small cooked steak and the count still wanted.
    c.fillStyle = '#8a4a28'
    c.beginPath()
    c.ellipse(36, 30, 17, 12, 0, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = '#1f3a4d'
    c.font = 'bold 30px system-ui, sans-serif'
    c.textAlign = 'left'
    c.textBaseline = 'middle'
    c.fillText(`×${left}`, 60, 31)

    // Patience: green → orange → red; empty and grey once it has run out.
    c.fillStyle = '#d5dde3'
    c.fillRect(14, 52, BUBBLE_W - 28, 8)
    c.fillStyle = ratio > 0.5 ? '#4cd964' : ratio > 0.2 ? '#ffb347' : '#e0453a'
    c.fillRect(14, 52, (BUBBLE_W - 28) * ratio, 8)
    this.texture.needsUpdate = true
  }
}
