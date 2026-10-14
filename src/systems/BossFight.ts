import { Vector3, type Camera, type Scene } from 'three'
import { audio } from '../audio/Audio.ts'
import { BEAR, BOSS_FIGHT, BOSS_SCHEDULE, BOSSES, type BossKind } from '../config/balance.ts'
import { Bear } from '../entities/Bear.ts'
import type { Player } from '../entities/Player.ts'
import { flatDistance } from '../game/math.ts'
import { clampToWorld, getBaseRadius, keepOutsideBase } from '../world/bounds.ts'
import type { BearHerd } from './BearHerd.ts'
import type { HuntLevel } from './HuntLevel.ts'
import type { Storm } from './Storm.ts'

const toTarget = new Vector3()

// What the screen shows about the fight in progress.
export interface BossView {
  name: string
  hpRatio: number
  timeLeft: number
}

interface Events {
  onDefeated: (kind: BossKind, at: Vector3) => void
  announce: (text: string) => void
}

type Phase = 'waiting' | 'warning' | 'fighting'

// Bosses arrive by hunt level, one at a time. Each fight has a time limit; a boss that is not beaten in time,
// or that knocks the player out, backs off into the field, a blizzard falls on the base, and the same boss
// comes back later. Its reward is never lost.
export class BossFight {
  boss: Bear | null = null
  private kind: BossKind | null = null
  private pending: BossKind[] = [] // bosses whose hunt level was reached, oldest first
  private phase: Phase = 'waiting'
  private timer = 0 // warning countdown, then fight countdown
  private returnTimer = 0 // after a lost fight, time until the boss tries again
  private home = new Vector3()
  private attackTimer = 0
  private scene: Scene
  private hunt: HuntLevel
  private herd: BearHerd
  private storm: Storm
  private events: Events

  constructor(scene: Scene, hunt: HuntLevel, herd: BearHerd, storm: Storm, events: Events) {
    this.scene = scene
    this.hunt = hunt
    this.herd = herd
    this.storm = storm
    this.events = events
  }

  get fighting(): boolean {
    return this.phase === 'fighting' && this.boss !== null
  }

  get view(): BossView | null {
    if (!this.fighting || !this.boss || !this.kind) return null
    return { name: BOSSES[this.kind].name, hpRatio: this.boss.hp / this.boss.maxHp, timeLeft: this.timer }
  }

  // Called when the hunt level rises: queues the bosses scheduled for that level.
  levelReached(level: number): void {
    for (const entry of BOSS_SCHEDULE) if (entry.huntLevel === level) this.pending.push(entry.kind)
  }

  hit(damage: number): void {
    const boss = this.boss
    if (!boss || !this.kind || boss.dead || !this.fighting) return
    if (!boss.hit(damage)) return
    const kind = this.kind
    audio.play('bossDie')
    this.removeBoss()
    this.pending.shift()
    this.phase = 'waiting'
    this.events.onDefeated(kind, boss.position.clone())
  }

  // Being knocked out during a fight loses it.
  playerKnockedOut(): void {
    if (this.fighting) this.lose()
  }

  // Test panel: brings this boss next, right away, even during a blizzard's wait.
  summon(kind: BossKind): void {
    if (this.phase !== 'waiting') return
    const at = this.pending.indexOf(kind)
    if (at > 0) this.pending.splice(at, 1)
    if (at !== 0) this.pending.unshift(kind)
    this.returnTimer = 0
    this.storm.stop()
  }

  // Test panel: beats the boss in the fight, as if the last hit landed.
  win(): void {
    if (this.boss) this.hit(this.boss.hp)
  }

  // Test panel: leaves a few seconds on the clock, to see the blizzard.
  expireSoon(seconds: number): void {
    if (this.fighting) this.timer = Math.min(this.timer, seconds)
  }

  update(dt: number, player: Player, camera: Camera): void {
    if (this.phase === 'waiting') this.wait(dt)
    else if (this.phase === 'warning') this.warn(dt)
    else this.fight(dt, player, camera)
  }

  private wait(dt: number): void {
    this.returnTimer = Math.max(0, this.returnTimer - dt)
    const next = this.pending[0]
    if (!next || this.returnTimer > 0 || this.storm.active) return
    this.kind = next
    this.phase = 'warning'
    this.timer = BOSS_FIGHT.warningSeconds
    this.events.announce(`${BOSSES[next].name} geliyor!`)
    audio.play('bossWarn')
  }

  private warn(dt: number): void {
    this.timer -= dt
    if (this.timer > 0 || !this.kind) return
    const def = BOSSES[this.kind]
    const boss = new Bear({ scale: def.scale, color: def.color })
    // Just outside the front gate, where the player walks out to hunt.
    this.home.set(0, 0, -(getBaseRadius() + BOSS_FIGHT.spawnBeyondGate))
    boss.spawn(this.home.x, this.home.z, Math.round(this.hunt.bearHp * def.hpMultiplier))
    boss.facing = 0
    this.scene.add(boss.root, boss.hpBar.root)
    this.boss = boss
    this.attackTimer = 0
    this.phase = 'fighting'
    this.timer = BOSS_FIGHT.timeLimit
  }

  private fight(dt: number, player: Player, camera: Camera): void {
    const boss = this.boss
    if (!boss || !this.kind) return
    this.timer -= dt
    if (this.timer <= 0) {
      this.lose()
      return
    }
    const def = BOSSES[this.kind]
    boss.aggro = Math.max(0, boss.aggro - dt)
    this.attackTimer -= dt

    // It charges when hit or when the player comes close, but never follows them into the base.
    const near = flatDistance(player.position, boss.position) < BOSS_FIGHT.aggroRadius
    const charging = !player.inBase && (near || boss.aggro > 0)
    const goal = charging ? player.position : this.home
    toTarget.subVectors(goal, boss.position).setY(0)
    const dist = toTarget.length()
    const reach = BEAR.attackRange * def.scale
    if (charging) boss.facing = Math.atan2(toTarget.x, toTarget.z)
    const stopAt = charging ? reach * 0.8 : 0.3
    if (dist > stopAt) {
      if (!charging) boss.facing = Math.atan2(toTarget.x, toTarget.z)
      boss.position.addScaledVector(toTarget.divideScalar(dist), BEAR.chaseSpeed * def.speedMultiplier * dt)
    }
    if (charging && dist <= reach && this.attackTimer <= 0) {
      this.attackTimer = def.attackCooldown
      player.damage(this.hunt.bearDamage * def.damageMultiplier)
      audio.play('bossHit')
    }

    keepOutsideBase(boss.position, boss.radius)
    clampToWorld(boss.position)
    this.herd.pushAway(boss.position, boss.radius)
    boss.updateLook(dt)
    boss.hpBar.update(boss.hp / boss.maxHp, boss.position, 2.6 * def.scale, camera)
  }

  // The boss backs off, the blizzard falls, and the same boss returns later with its reward intact.
  private lose(): void {
    const name = this.kind ? BOSSES[this.kind].name : ''
    this.removeBoss()
    this.phase = 'waiting'
    this.returnTimer = BOSS_FIGHT.returnSeconds
    audio.play('bossRoar')
    this.storm.start()
    this.events.announce(`${name} kaçtı! Kar fırtınası!`)
  }

  private removeBoss(): void {
    if (!this.boss) return
    this.boss.root.removeFromParent()
    this.boss.hpBar.root.removeFromParent()
    this.boss = null
  }
}
