import { BoxGeometry, CapsuleGeometry, Group, Mesh, MeshBasicMaterial, MeshLambertMaterial, RingGeometry, Vector3 } from 'three'
import { PLAYER } from '../config/balance.ts'
import { COLORS, LAYOUT } from '../config/world.ts'
import { turnTowards } from '../game/math.ts'
import type { Joystick } from '../input/Joystick.ts'
import { clampToWorld, constrainToFence, isInsideBase } from '../world/bounds.ts'

// Placeholder look until a real character model arrives in 0.4.0.
export class Player {
  readonly root = new Group()
  readonly velocity = new Vector3()
  hp: number = PLAYER.maxHp
  private body = new Group()
  private facing = 0
  private punch = 0

  constructor() {
    const torso = new Mesh(new CapsuleGeometry(0.45, 0.8, 4, 12), new MeshLambertMaterial({ color: COLORS.player }))
    torso.position.y = 0.85
    torso.castShadow = true
    // A club held in front shows which way the player faces.
    const club = new Mesh(new BoxGeometry(0.16, 0.16, 0.9), new MeshLambertMaterial({ color: COLORS.fenceWood }))
    club.position.set(0.45, 0.9, 0.45)
    club.castShadow = true
    this.body.add(torso, club)

    const ring = new Mesh(
      new RingGeometry(0.75, 0.9, 32),
      new MeshBasicMaterial({ color: COLORS.playerRing, transparent: true, opacity: 0.85 }),
    )
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.03

    this.root.add(this.body, ring)
    this.respawn()
  }

  get position(): Vector3 {
    return this.root.position
  }

  get inBase(): boolean {
    return isInsideBase(this.position.x, this.position.z)
  }

  update(dt: number, input: Joystick): void {
    const p = this.position
    const prevX = p.x
    const prevZ = p.z
    p.x += input.x * PLAYER.speed * dt
    p.z += input.z * PLAYER.speed * dt
    constrainToFence(prevX, prevZ, p, PLAYER.radius)
    clampToWorld(p)
    // The real velocity after collisions, so the stack only sways when the player actually moves.
    this.velocity.set((p.x - prevX) / dt, 0, (p.z - prevZ) / dt)

    if (this.velocity.lengthSq() > 0.01) {
      this.facing = turnTowards(this.facing, Math.atan2(this.velocity.x, this.velocity.z), PLAYER.turnSpeed * dt)
    }
    this.body.rotation.y = this.facing

    if (this.inBase) this.hp = Math.min(PLAYER.maxHp, this.hp + PLAYER.regenPerSec * dt)

    this.punch = Math.max(0, this.punch - dt * 6)
    const s = 1 + this.punch * 0.15
    this.body.scale.set(s, 1 - this.punch * 0.08, s)
  }

  // Turns toward the target when standing still; while walking the player keeps facing the way it moves.
  faceTowards(target: Vector3): void {
    if (this.velocity.lengthSq() > 0.01) return
    this.facing = Math.atan2(target.x - this.position.x, target.z - this.position.z)
    this.body.rotation.y = this.facing
  }

  swing(): void {
    this.punch = 1
  }

  damage(amount: number): void {
    this.hp -= amount
  }

  respawn(): void {
    this.position.set(LAYOUT.playerSpawn.x, 0, LAYOUT.playerSpawn.z)
    this.velocity.set(0, 0, 0)
    this.hp = PLAYER.maxHp
  }
}
