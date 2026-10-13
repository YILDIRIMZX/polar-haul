import { MathUtils, Vector3, type Camera, type Scene } from 'three'
import { audio } from '../audio/Audio.ts'
import { BEAR } from '../config/balance.ts'
import { LAYOUT } from '../config/world.ts'
import { Bear } from '../entities/Bear.ts'
import type { Player } from '../entities/Player.ts'
import { clamp, flatDistance } from '../game/math.ts'
import { clampToWorld, keepOutsideBase } from '../world/bounds.ts'

const toTarget = new Vector3()

// Owns every bear: wandering, chasing the player after being hit, attacking, dying and respawning.
export class BearHerd {
  readonly bears: Bear[] = []
  private onKilled: (at: Vector3) => void

  constructor(scene: Scene, onKilled: (at: Vector3) => void) {
    this.onKilled = onKilled
    for (let i = 0; i < BEAR.count; i++) {
      const bear = new Bear()
      const p = randomFieldPoint()
      bear.spawn(p.x, p.z)
      bear.facing = Math.random() * Math.PI * 2
      scene.add(bear.root, bear.hpBar.root)
      this.bears.push(bear)
    }
  }

  hit(bear: Bear, damage: number): void {
    if (bear.dead) return
    if (!bear.hit(damage)) return
    audio.play('bearDie')
    this.onKilled(bear.position.clone())
  }

  update(dt: number, player: Player, camera: Camera): void {
    for (const bear of this.bears) {
      if (bear.dead) this.respawnWhenReady(bear, dt, player)
      else if (bear.aggro > 0) this.chase(bear, dt, player)
      else this.wander(bear, dt)
    }
    this.separate()
    for (const bear of this.bears) {
      if (bear.dead) continue
      keepOutsideBase(bear.position, BEAR.radius)
      clampToWorld(bear.position)
      bear.updateLook(dt)
      bear.hpBar.update(bear.hp / BEAR.maxHp, bear.position, 2.4, camera)
    }
  }

  private respawnWhenReady(bear: Bear, dt: number, player: Player): void {
    bear.respawnTimer -= dt
    if (bear.respawnTimer > 0) return
    // Respawn away from the player, so a bear never pops into view right next to them.
    let p = randomFieldPoint()
    for (let tries = 0; tries < 10 && flatDistance(player.position, p) < BEAR.spawnMinDistance; tries++) {
      p = randomFieldPoint()
    }
    bear.spawn(p.x, p.z)
  }

  private chase(bear: Bear, dt: number, player: Player): void {
    bear.aggro -= dt
    bear.attackTimer -= dt
    toTarget.subVectors(player.position, bear.position).setY(0)
    const dist = toTarget.length()
    if (dist < 0.001) return
    bear.facing = Math.atan2(toTarget.x, toTarget.z)
    if (dist > BEAR.attackRange) {
      bear.position.addScaledVector(toTarget.divideScalar(dist), BEAR.chaseSpeed * dt)
      return
    }
    if (bear.attackTimer <= 0) {
      bear.attackTimer = BEAR.attackCooldown
      player.damage(BEAR.attackDamage)
      audio.play('hurt')
    }
  }

  private wander(bear: Bear, dt: number): void {
    bear.goalTimer -= dt
    toTarget.subVectors(bear.goal, bear.position).setY(0)
    const dist = toTarget.length()
    if (bear.goalTimer <= 0 || dist < 0.5) {
      // A new goal near the bear, kept inside the field, so bears that chased the player drift back.
      const f = LAYOUT.bearField
      const reach = BEAR.wanderReach
      bear.goal.set(
        clamp(bear.position.x + MathUtils.randFloat(-reach, reach), f.minX, f.maxX),
        0,
        clamp(bear.position.z + MathUtils.randFloat(-reach, reach), f.minZ, f.maxZ),
      )
      bear.goalTimer = MathUtils.randFloat(BEAR.goalSecondsMin, BEAR.goalSecondsMax)
      return
    }
    bear.facing = Math.atan2(toTarget.x, toTarget.z)
    bear.position.addScaledVector(toTarget.divideScalar(dist), BEAR.wanderSpeed * dt)
  }

  // Pushes overlapping bears apart. 28 bears means ~400 pairs per frame, which is cheap.
  private separate(): void {
    const min = BEAR.radius * 2
    for (let i = 0; i < this.bears.length; i++) {
      const a = this.bears[i]
      if (a.dead) continue
      for (let j = i + 1; j < this.bears.length; j++) {
        const b = this.bears[j]
        if (b.dead) continue
        const dx = b.position.x - a.position.x
        const dz = b.position.z - a.position.z
        const d = Math.hypot(dx, dz)
        if (d >= min || d < 0.0001) continue
        const push = (min - d) / 2 / d
        a.position.x -= dx * push
        a.position.z -= dz * push
        b.position.x += dx * push
        b.position.z += dz * push
      }
    }
  }
}

function randomFieldPoint(): { x: number; z: number } {
  const f = LAYOUT.bearField
  return { x: MathUtils.randFloat(f.minX, f.maxX), z: MathUtils.randFloat(f.minZ, f.maxZ) }
}
