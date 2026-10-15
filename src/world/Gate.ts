import { Group, Vector3, type Camera, type Scene } from 'three'
import type { WallKind } from '../config/balance.ts'
import { audio } from '../audio/Audio.ts'
import { COLORS } from '../config/world.ts'
import { HpBar } from '../fx/HpBar.ts'
import { dashedRing } from '../fx/markers.ts'
import { frontGateZ } from './bounds.ts'
import { gate as gateLook, GATE_HEIGHT, type GateLook } from '../looks/defense.ts'

const REPAIR_INSIDE = 2.4 // the repair circle sits this far inside the gate
const barAt = new Vector3()

// The front gate: two posts and a beam over the opening toward the bear field. Bears never come through it,
// but a boss can pound it down when the player hides in the base. A broken gate stays broken until the player
// repairs it, so the next boss walks straight in.
export class Gate {
  hp = 1
  maxHp = 1
  private root: Group
  private look: GateLook
  private bar = new HpBar(COLORS.hpBear, 2.4)
  private z = 1 // where the gate stands; it moves out with the wall
  private fallen = 0 // 0 standing … 1 collapsed
  private ring = dashedRing(0, 0, 1.4)
  private kind: WallKind | null = null

  constructor(scene: Scene) {
    this.look = gateLook()
    this.root = this.look.root
    this.ring.position.set(0, 0.03, REPAIR_INSIDE)
    this.ring.visible = false
    this.root.add(this.ring)
    scene.add(this.root, this.bar.root)
  }


  // Where the player stands to repair it.
  get repairSpot(): { x: number; z: number } {
    return { x: 0, z: frontGateZ() + REPAIR_INSIDE }
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

  // Snow blocks are piled into short pillars with no beam; stakes make posts and a beam; the log wall adds
  // thicker posts and a lookout tower.
  private restyle(kind: WallKind): void {
    this.kind = kind
    const look = this.look
    const shape = look.postShape[kind]
    for (const post of [look.left, look.right]) {
      post.material = look.materials[kind]
      post.scale.set(shape.thick, shape.tall, shape.thick)
      post.position.y = (GATE_HEIGHT * shape.tall) / 2
    }
    look.beam.material = look.materials[kind]
    look.beam.visible = shape.beam
    look.lookout.visible = shape.lookout
  }


  // Test panel and repairs.
  setBroken(): void {
    this.hp = 0
  }

  repair(): void {
    this.hp = this.maxHp
    audio.play('purchase')
  }

  update(dt: number, maxHp: number, camera: Camera, kind: WallKind): void {
    if (kind !== this.kind) this.restyle(kind)
    // The gate moves out with the wall as the base grows, and gets stronger with its upgrade.
    const z = frontGateZ()
    if (z !== this.z) {
      this.z = z
      this.root.position.set(0, 0, z)
    }
    if (maxHp !== this.maxHp) {
      this.hp = this.broken ? 0 : Math.min(maxHp, this.hp + (maxHp - this.maxHp))
      this.maxHp = maxHp
    }
    // A broken gate: the beam drops and the posts lean; a repaired one stands up again.
    const target = this.broken ? 1 : 0
    this.fallen += Math.sign(target - this.fallen) * Math.min(Math.abs(target - this.fallen), dt * 3)
    this.look.beam.position.y = GATE_HEIGHT - this.fallen * (GATE_HEIGHT - 0.2)
    this.look.beam.rotation.z = this.fallen * 0.35
    this.look.left.rotation.z = this.fallen * 0.5
    this.look.right.rotation.z = -this.fallen * 0.4
    barAt.set(0, 0, z)
    this.bar.update(this.hp / this.maxHp, barAt, GATE_HEIGHT + 0.8, camera)
  }
}
