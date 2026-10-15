import {
  Group,
  Sprite,
  SpriteMaterial,
  Vector3,
  type Object3D,
  type Scene,
} from 'three'
import { WORKER } from '../config/balance.ts'
import { turnTowards } from '../game/math.ts'
import { pushOutOfObstacles } from '../world/bounds.ts'
import { worker as workerLook, WORKER_HEAD_TOP } from '../looks/creatures.ts'
import { waitingBubble } from '../looks/bubbles.ts'

const PIECE_HEIGHT = 0.26
const toTarget = new Vector3()

// A worker in the base: a figure in its job's colour that walks between two places with a pile on its head.
// Carriers, waiters, the cashier and the hunters are all one of these.
export class Worker {
  readonly root = new Group()
  readonly carried: Object3D[] = []
  facing = Math.PI
  private body: Group
  private scene: Scene
  private bob = 0
  private moving = false
  private bubble = new Sprite(new SpriteMaterial({ map: waitingBubble(), depthTest: false }))
  private waitClock = 0

  constructor(scene: Scene, color: number) {
    this.scene = scene
    this.body = workerLook(color)
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
    this.bubble.position.y = WORKER_HEAD_TOP + this.carried.length * PIECE_HEIGHT + 0.45 + Math.sin(this.waitClock * 4) * 0.06
  }

  face(angle: number, dt: number): void {
    this.facing = turnTowards(this.facing, angle, 10 * dt)
  }

  // Puts a piece (already in the scene) on top of the pile on the worker's head.
  hold(piece: Object3D): void {
    this.root.add(piece)
    piece.position.set(0, WORKER_HEAD_TOP + this.carried.length * PIECE_HEIGHT, 0)
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

