import { Group, Vector3 } from 'three'
import { BASE_STATS, PLAYER } from '../config/balance.ts'
import { LAYOUT } from '../config/world.ts'
import { turnTowards } from '../game/math.ts'
import type { Joystick } from '../input/Joystick.ts'
import { clampToWorld, constrainToFence, isInsideBase, pushOutOfObstacles } from '../world/bounds.ts'
import { player as playerLook } from '../looks/creatures.ts'

const PUSH_FADE = 6 // how quickly a knockback dies out

// The player. Its look comes from looks/creatures.ts.
export class Player {
  readonly root = new Group()
  readonly velocity = new Vector3()
  private push = new Vector3() // a shove from a heavy hit, fading fast
  maxHp: number = BASE_STATS.maxHp // kept in step with Stats every frame
  regenScale = 1 // healing in the base is slower during a boss fight
  hp: number = BASE_STATS.maxHp
  private body: Group
  private facing = 0
  private punch = 0

  constructor() {
    const look = playerLook()
    this.body = look.body
    this.root.add(look.body, look.ring)
    this.respawn()
  }

  get position(): Vector3 {
    return this.root.position
  }

  get alive(): boolean {
    return this.hp > 0
  }

  get inBase(): boolean {
    return isInsideBase(this.position.x, this.position.z)
  }

  update(dt: number, input: Joystick, speed: number): void {
    const p = this.position
    const prevX = p.x
    const prevZ = p.z
    p.x += (input.x * speed + this.push.x) * dt
    p.z += (input.z * speed + this.push.z) * dt
    this.push.multiplyScalar(Math.exp(-PUSH_FADE * dt))
    constrainToFence(prevX, prevZ, p, PLAYER.radius)
    pushOutOfObstacles(p, PLAYER.radius)
    clampToWorld(p)
    // The real velocity after collisions, so the stack only sways when the player actually moves.
    this.velocity.set((p.x - prevX) / dt, 0, (p.z - prevZ) / dt)

    if (this.velocity.lengthSq() > 0.01) {
      this.facing = turnTowards(this.facing, Math.atan2(this.velocity.x, this.velocity.z), PLAYER.turnSpeed * dt)
    }
    this.body.rotation.y = this.facing

    if (this.inBase) this.hp = Math.min(this.maxHp, this.hp + PLAYER.regenPerSec * this.regenScale * dt)

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

  // Throws the player along (x, z) at `speed`; the fence and solid objects still stop them.
  knockback(x: number, z: number, speed: number): void {
    const length = Math.hypot(x, z)
    if (length < 1e-6) return
    this.push.set((x / length) * speed, 0, (z / length) * speed)
  }

  respawn(): void {
    this.position.set(LAYOUT.playerSpawn.x, 0, LAYOUT.playerSpawn.z)
    this.velocity.set(0, 0, 0)
    this.push.set(0, 0, 0)
    this.hp = this.maxHp
  }
}
