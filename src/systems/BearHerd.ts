import { MathUtils, Vector3, type Camera, type Scene } from 'three'
import { audio } from '../audio/Audio.ts'
import { BEAR } from '../config/balance.ts'
import { LAYOUT } from '../config/world.ts'
import { Bear } from '../entities/Bear.ts'
import type { Fighter } from '../entities/Fighter.ts'
import type { Player } from '../entities/Player.ts'
import { clamp, flatDistance } from '../game/math.ts'
import { clampToWorld, keepOutsideBase, wallNorthmost } from '../world/bounds.ts'
import type { HuntLevel } from './HuntLevel.ts'

const toTarget = new Vector3()

// Owns every bear: wandering, chasing the player after being hit, attacking, dying and respawning.
// The hunt level decides how many there are and how tough they are.
export class BearHerd {
  readonly bears: Bear[] = []
  private scene: Scene
  private hunt: HuntLevel
  private onKilled: (at: Vector3, by: Fighter | null) => void

  constructor(scene: Scene, hunt: HuntLevel, onKilled: (at: Vector3, by: Fighter | null) => void) {
    this.scene = scene
    this.hunt = hunt
    this.onKilled = onKilled
    this.grow()
  }

  // `by` is a hunter, or null for the player. The bear turns on whoever hit it last.
  hit(bear: Bear, damage: number, by: Fighter | null = null): void {
    if (bear.dead) return
    bear.target = by
    if (!bear.hit(damage)) return
    audio.play('bearDie')
    this.onKilled(bear.position.clone(), by)
  }

  update(dt: number, player: Player, camera: Camera): void {
    this.grow()
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
      bear.hpBar.update(bear.hp / bear.maxHp, bear.position, 2.4, camera)
    }
  }

  // Shoves bears out of a circle, so they never stand inside the boss.
  pushAway(center: Vector3, radius: number): void {
    for (const bear of this.bears) {
      if (bear.dead) continue
      const dx = bear.position.x - center.x
      const dz = bear.position.z - center.z
      const d = Math.hypot(dx, dz)
      const min = radius + BEAR.radius
      if (d >= min || d < 0.0001) continue
      bear.position.x = center.x + (dx / d) * min
      bear.position.z = center.z + (dz / d) * min
    }
  }

  // New bears join the herd when the hunt level rises. They come from the far side of the field.
  private grow(): void {
    while (this.bears.length < this.hunt.bearCount) {
      const bear = new Bear()
      const p = randomFieldPoint()
      bear.spawn(p.x, p.z, this.hunt.bearHp)
      bear.facing = Math.random() * Math.PI * 2
      this.scene.add(bear.root, bear.hpBar.root)
      this.bears.push(bear)
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
    // A respawned bear has the health of the current hunt level.
    bear.spawn(p.x, p.z, this.hunt.bearHp)
  }

  private chase(bear: Bear, dt: number, player: Player): void {
    const foe: Fighter = bear.target ?? player
    if (!foe.alive) {
      bear.aggro = 0
      return
    }
    bear.aggro -= dt
    bear.attackTimer -= dt
    toTarget.subVectors(foe.position, bear.position).setY(0)
    const dist = toTarget.length()
    if (dist < 0.001) return
    bear.facing = Math.atan2(toTarget.x, toTarget.z)
    if (dist > BEAR.attackRange) {
      bear.position.addScaledVector(toTarget.divideScalar(dist), BEAR.chaseSpeed * dt)
      return
    }
    if (bear.attackTimer <= 0) {
      bear.attackTimer = BEAR.attackCooldown
      foe.damage(this.hunt.bearDamage)
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
        clamp(bear.position.z + MathUtils.randFloat(-reach, reach), f.minZ, fieldMaxZ()),
      )
      bear.goalTimer = MathUtils.randFloat(BEAR.goalSecondsMin, BEAR.goalSecondsMax)
      return
    }
    bear.facing = Math.atan2(toTarget.x, toTarget.z)
    bear.position.addScaledVector(toTarget.divideScalar(dist), BEAR.wanderSpeed * dt)
  }

  // Pushes overlapping bears apart. 50 bears means ~1200 pairs per frame, which is still cheap.
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
  return { x: MathUtils.randFloat(f.minX, f.maxX), z: MathUtils.randFloat(f.minZ, fieldMaxZ()) }
}

// The field's edge nearest the base moves back as the fence grows, so bears never roam inside it.
export function fieldMaxZ(): number {
  return Math.min(LAYOUT.bearField.maxZ, wallNorthmost() - 3)
}
