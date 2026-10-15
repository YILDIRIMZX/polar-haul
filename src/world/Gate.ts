import { BoxGeometry, Group, Mesh, MeshLambertMaterial, Vector3, type Camera, type Scene } from 'three'
import { audio } from '../audio/Audio.ts'
import { COLORS, WORLD } from '../config/world.ts'
import { HpBar } from '../fx/HpBar.ts'
import { dashedRing } from '../fx/markers.ts'
import { getBaseRadius } from './bounds.ts'

const POST_H = 2.6
const REPAIR_INSIDE = 2.4 // the repair circle sits this far inside the gate
const barAt = new Vector3()

// The front gate: two posts and a beam over the opening toward the bear field. Bears never come through it,
// but a boss can pound it down when the player hides in the base. A broken gate stays broken until the player
// repairs it, so the next boss walks straight in.
export class Gate {
  hp = 1
  maxHp = 1
  private root = new Group()
  private left: Mesh
  private right: Mesh
  private beam: Mesh
  private bar = new HpBar(COLORS.hpBear, 2.4)
  private radius = -1
  private fallen = 0 // 0 standing … 1 collapsed
  private ring = dashedRing(0, 0, 1.4)

  constructor(scene: Scene) {
    const wood = new MeshLambertMaterial({ color: COLORS.fenceWood })
    const half = WORLD.gateWidth / 2 + 0.2
    this.left = new Mesh(new BoxGeometry(0.35, POST_H, 0.35), wood)
    this.left.position.set(-half, POST_H / 2, 0)
    this.right = new Mesh(new BoxGeometry(0.35, POST_H, 0.35), wood)
    this.right.position.set(half, POST_H / 2, 0)
    this.beam = new Mesh(new BoxGeometry(half * 2 + 0.6, 0.35, 0.4), wood)
    this.beam.position.set(0, POST_H, 0)
    for (const m of [this.left, this.right, this.beam]) {
      m.castShadow = true
      this.root.add(m)
    }
    this.ring.position.set(0, 0.03, REPAIR_INSIDE)
    this.ring.visible = false
    this.root.add(this.ring)
    scene.add(this.root, this.bar.root)
  }

  // Where the player stands to repair it.
  get repairSpot(): { x: number; z: number } {
    return { x: 0, z: -getBaseRadius() + REPAIR_INSIDE }
  }

  // The circle shows once the gate is broken and no boss is around to break it again.
  showRepairSpot(show: boolean): void {
    this.ring.visible = show
  }

  get broken(): boolean {
    return this.hp <= 0
  }

  get position(): Vector3 {
    return this.root.position
  }

  // Returns true when this blow broke it.
  pound(damage: number): boolean {
    if (this.broken) return false
    this.hp = Math.max(0, this.hp - damage)
    if (!this.broken) return false
    audio.play('boom')
    return true
  }

  // Test panel and repairs.
  setBroken(): void {
    this.hp = 0
  }

  repair(): void {
    this.hp = this.maxHp
    audio.play('purchase')
  }

  update(dt: number, maxHp: number, camera: Camera): void {
    // The gate moves out with the fence as the base grows, and gets stronger with its upgrade.
    const r = getBaseRadius()
    if (r !== this.radius) {
      this.radius = r
      this.root.position.set(0, 0, -r)
    }
    if (maxHp !== this.maxHp) {
      this.hp = this.broken ? 0 : Math.min(maxHp, this.hp + (maxHp - this.maxHp))
      this.maxHp = maxHp
    }
    // A broken gate: the beam drops and the posts lean; a repaired one stands up again.
    const target = this.broken ? 1 : 0
    this.fallen += Math.sign(target - this.fallen) * Math.min(Math.abs(target - this.fallen), dt * 3)
    this.beam.position.y = POST_H - this.fallen * (POST_H - 0.2)
    this.beam.rotation.z = this.fallen * 0.35
    this.left.rotation.z = this.fallen * 0.5
    this.right.rotation.z = -this.fallen * 0.4
    barAt.set(0, 0, -r)
    this.bar.update(this.hp / this.maxHp, barAt, POST_H + 0.8, camera)
  }
}
