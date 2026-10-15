import {
  BoxGeometry,
  CanvasTexture,
  CapsuleGeometry,
  Color,
  Group,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector3,
  type Object3D,
  type Scene,
} from 'three'
import { WORKER } from '../config/balance.ts'
import { COLORS } from '../config/world.ts'
import { turnTowards } from '../game/math.ts'
import { pushOutOfObstacles } from '../world/bounds.ts'

const bodyGeo = new CapsuleGeometry(0.36, 0.65, 4, 10)
const headGeo = new SphereGeometry(0.26, 12, 8)
const hatGeo = new BoxGeometry(0.5, 0.18, 0.5)
const headMat = new MeshLambertMaterial({ color: COLORS.skin })
const HEAD_TOP = 1.95 // where the carried pile starts
const PIECE_HEIGHT = 0.26
const toTarget = new Vector3()
let waitTexture: CanvasTexture | null = null

// A worker in the base: a figure in its job's colour that walks between two places with a pile on its head.
// Carriers, waiters, the cashier and the hunters are all one of these.
export class Worker {
  readonly root = new Group()
  readonly carried: Object3D[] = []
  facing = Math.PI
  private body = new Group()
  private scene: Scene
  private bob = 0
  private moving = false
  private bubble = new Sprite(new SpriteMaterial({ map: waitingTexture(), depthTest: false }))
  private waitClock = 0

  constructor(scene: Scene, color: number) {
    this.scene = scene
    const coat = new MeshLambertMaterial({ color })
    const hat = new MeshLambertMaterial({ color: new Color(color).multiplyScalar(0.7) })
    const torso = new Mesh(bodyGeo, coat)
    torso.position.y = 0.72
    torso.castShadow = true
    const head = new Mesh(headGeo, headMat)
    head.position.y = 1.5
    const cap = new Mesh(hatGeo, hat)
    cap.position.y = 1.72
    this.body.add(torso, head, cap)
    this.bubble.scale.set(0.9, 0.45, 1)
    this.bubble.renderOrder = 12
    this.bubble.visible = false
    this.root.add(this.body, this.bubble)
    scene.add(this.root)
  }

  get position(): Vector3 {
    return this.root.position
  }

  // Walks toward a point, sliding around solid objects; returns true once there.
  walkTo(target: { x: number; z: number }, speed: number, dt: number): boolean {
    toTarget.set(target.x - this.position.x, 0, target.z - this.position.z)
    const dist = toTarget.length()
    if (dist < 0.1) return true
    const step = Math.min(dist, speed * dt)
    this.position.addScaledVector(toTarget.divideScalar(dist), step)
    pushOutOfObstacles(this.position, WORKER.radius)
    this.facing = turnTowards(this.facing, Math.atan2(toTarget.x, toTarget.z), 10 * dt)
    this.bob += dt * 14
    this.moving = true
    return dist - step < 0.1
  }

  // A "…" bubble over the head: the worker has something to hand over but nowhere to put it.
  setWaiting(waiting: boolean, dt: number): void {
    this.bubble.visible = waiting
    if (!waiting) return
    this.waitClock += dt
    this.bubble.position.y = HEAD_TOP + this.carried.length * PIECE_HEIGHT + 0.45 + Math.sin(this.waitClock * 4) * 0.06
  }

  face(angle: number, dt: number): void {
    this.facing = turnTowards(this.facing, angle, 10 * dt)
  }

  // Puts a piece (already in the scene) on top of the pile on the worker's head.
  hold(piece: Object3D): void {
    this.root.add(piece)
    piece.position.set(0, HEAD_TOP + this.carried.length * PIECE_HEIGHT, 0)
    piece.rotation.set(0, 0, 0)
    this.carried.push(piece)
  }

  // Takes the top piece off the pile and hands it back to the scene where it is, ready to fly somewhere.
  drop(): Object3D | null {
    const piece = this.carried.pop()
    if (!piece) return null
    this.scene.attach(piece)
    return piece
  }

  updateLook(): void {
    this.body.rotation.y = this.facing
    // A little bounce in the step while walking.
    this.body.position.y = this.moving ? Math.abs(Math.sin(this.bob)) * 0.06 : 0
    this.moving = false
  }

  remove(): void {
    this.root.removeFromParent()
  }
}

// One shared picture for every waiting bubble: a white speech bubble with three dots.
function waitingTexture(): CanvasTexture {
  if (waitTexture) return waitTexture
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 64
  const c = canvas.getContext('2d')
  if (!c) throw new Error('2D canvas is not available')
  c.fillStyle = 'rgba(255, 255, 255, 0.95)'
  c.beginPath()
  c.roundRect(6, 6, 116, 44, 18)
  c.moveTo(56, 50)
  c.lineTo(64, 60)
  c.lineTo(72, 50)
  c.fill()
  c.fillStyle = '#1f3a4d'
  for (const x of [42, 64, 86]) {
    c.beginPath()
    c.arc(x, 28, 6, 0, Math.PI * 2)
    c.fill()
  }
  waitTexture = new CanvasTexture(canvas)
  waitTexture.colorSpace = SRGBColorSpace
  return waitTexture
}
