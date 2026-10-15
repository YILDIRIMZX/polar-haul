import { Vector3, type Camera, type Group, type Scene } from 'three'
import { audio } from '../audio/Audio.ts'
import { BEAR, BOSS_FIGHT, BOSS_MOVES, BOSS_SCHEDULE, BOSSES, type BossKind } from '../config/balance.ts'
import { Bear } from '../entities/Bear.ts'
import type { Player } from '../entities/Player.ts'
import { floatingText } from '../fx/FloatingText.ts'
import { clawMarks, GroundWarning } from '../fx/GroundWarning.ts'
import { flatDistance, inFan } from '../game/math.ts'
import { clampToWorld, getBaseRadius, keepOutsideBase } from '../world/bounds.ts'
import type { BearHerd } from './BearHerd.ts'
import type { HuntLevel } from './HuntLevel.ts'
import type { Storm } from './Storm.ts'

const toTarget = new Vector3()
const before = new Vector3()
const focus = new Vector3()

// What the screen shows about the fight in progress.
export interface BossView {
  name: string
  hpRatio: number
  timeLeft: number
  angry: boolean
}

interface Events {
  onDefeated: (kind: BossKind, at: Vector3) => void
  onCubKilled: (at: Vector3) => void
  announce: (text: string) => void
  nameCard: (name: string, title: string) => void
  hideNameCard: () => void
}

type Phase = 'waiting' | 'warning' | 'intro' | 'fighting'

// What the boss is doing right now. Each special move is a wind-up (the red area fills) followed by the move.
type Move = 'chase' | 'chargeWindup' | 'charge' | 'stunned' | 'sweepWindup' | 'recover' | 'roar'

// Bosses arrive by hunt level, one at a time, and each one is a stage to remember rather than a bigger bear:
// the camera visits it and its name shows, its special moves are marked on the ground before they land,
// Yaşlı Ayı changes at half health, and the fight leaves marks behind. Each fight has a time limit; a boss
// that is not beaten in time, or that knocks the player out, backs off into the field, a blizzard falls on
// the base, and the same boss comes back later. Its reward is never lost.
export class BossFight {
  boss: Bear | null = null
  private kind: BossKind | null = null
  private pending: BossKind[] = [] // bosses whose hunt level was reached, oldest first
  private phase: Phase = 'waiting'
  private timer = 0 // warning countdown, then intro, then fight countdown
  private returnTimer = 0 // after a lost fight, time until the boss tries again
  private home = new Vector3()
  private attackTimer = 0
  private move: Move = 'chase'
  private moveTimer = 0
  private special = 0 // time until the next special move
  private chargeDir = new Vector3()
  private chargeLeft = 0
  private chargeHit = false
  private angry = false
  private cubs: Bear[] = []
  private marks: Group | null = null
  private lane: GroundWarning
  private fan: GroundWarning
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
    const c = BOSS_MOVES.charge
    const s = BOSS_MOVES.sweep
    this.lane = new GroundWarning(scene, { kind: 'lane', length: c.length, width: c.width })
    this.fan = new GroundWarning(scene, { kind: 'fan', radius: s.radius, angle: s.angle })
  }

  get fighting(): boolean {
    return this.phase === 'fighting' && this.boss !== null
  }

  // While true the world waits and the camera looks at the boss.
  get inIntro(): boolean {
    return this.phase === 'intro'
  }

  get view(): BossView | null {
    if (!this.fighting || !this.boss || !this.kind) return null
    return { name: BOSSES[this.kind].name, hpRatio: this.boss.hp / this.boss.maxHp, timeLeft: this.timer, angry: this.angry }
  }

  // Everything in the fight a swing can hit: the boss and the young bears it called.
  get bears(): Bear[] {
    return this.boss ? [this.boss, ...this.cubs] : []
  }

  owns(bear: Bear): boolean {
    return bear === this.boss || this.cubs.includes(bear)
  }

  // Where the camera should look: the player, or during the intro a point gliding to the boss and back.
  cameraTarget(player: Vector3): Vector3 {
    if (this.phase !== 'intro' || !this.boss) return player
    const total = BOSS_MOVES.introSeconds
    const t = total - this.timer
    const glide = 0.5
    const k = t < glide ? t / glide : t > total - glide ? (total - t) / glide : 1
    const ease = k * k * (3 - 2 * k)
    return focus.lerpVectors(player, this.boss.position, ease)
  }

  // Called when the hunt level rises: queues the bosses scheduled for that level.
  levelReached(level: number): void {
    for (const entry of BOSS_SCHEDULE) if (entry.huntLevel === level) this.pending.push(entry.kind)
  }

  hit(bear: Bear, damage: number): void {
    if (!this.fighting) return
    if (bear === this.boss) this.hitBoss(damage)
    else if (this.cubs.includes(bear) && bear.hit(damage)) {
      audio.play('bearDie')
      this.removeCub(bear)
      this.events.onCubKilled(bear.position.clone())
    }
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
    if (this.boss) this.hitBoss(this.boss.hp * 2)
  }

  // Test panel: leaves a few seconds on the clock, to see the blizzard.
  expireSoon(seconds: number): void {
    if (this.fighting) this.timer = Math.min(this.timer, seconds)
  }

  // Test panel: takes the boss down to half health, where Yaşlı Ayı gets angry.
  halveHealth(): void {
    if (this.boss && this.fighting) this.boss.hp = Math.min(this.boss.hp, this.boss.maxHp * 0.5)
  }

  // The intro runs on its own clock, because the rest of the world is paused while it plays.
  updateIntro(dt: number, camera: Camera): void {
    if (this.phase !== 'intro' || !this.boss) return
    this.timer -= dt
    this.boss.updateLook(dt)
    this.boss.hpBar.update(1, this.boss.position, 0, camera)
    if (this.timer > 0) return
    this.events.hideNameCard()
    this.phase = 'fighting'
    this.timer = BOSS_FIGHT.timeLimit
  }

  update(dt: number, player: Player, camera: Camera): void {
    if (this.phase === 'waiting') this.wait(dt)
    else if (this.phase === 'warning') this.warn(dt)
    else if (this.phase === 'fighting') this.fight(dt, player, camera)
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

  // The boss appears, the claw marks of an earlier escape go, and the camera goes to look at it.
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
    this.move = 'chase'
    this.special = 1.5
    this.angry = false
    this.marks?.removeFromParent()
    this.marks = null
    this.phase = 'intro'
    this.timer = BOSS_MOVES.introSeconds
    this.events.nameCard(def.name, def.title)
    audio.play('bossIntro')
  }

  private fight(dt: number, player: Player, camera: Camera): void {
    const boss = this.boss
    if (!boss || !this.kind) return
    this.timer -= dt
    if (this.timer <= 0) {
      this.lose()
      return
    }
    boss.aggro = Math.max(0, boss.aggro - dt)
    this.attackTimer -= dt
    this.special -= dt
    this.moveTimer -= dt
    if (this.kind === 'elder' && !this.angry && boss.hp <= boss.maxHp * BOSS_MOVES.anger.atHealth) this.roar()

    switch (this.move) {
      case 'chase':
        this.chase(dt, player)
        break
      case 'chargeWindup':
        this.lane.setProgress(1 - this.moveTimer / BOSS_MOVES.charge.windup)
        boss.root.position.y = Math.abs(Math.sin(this.moveTimer * 30)) * 0.08 // pawing the ground
        if (this.moveTimer <= 0) this.startCharge()
        break
      case 'charge':
        this.charge(dt, player)
        break
      case 'stunned':
        boss.root.rotation.z = Math.sin(this.moveTimer * 18) * 0.12
        if (this.moveTimer <= 0) {
          boss.root.rotation.z = 0
          this.move = 'chase'
        }
        break
      case 'sweepWindup': {
        const windup = this.angry ? BOSS_MOVES.sweep.angryWindup : BOSS_MOVES.sweep.windup
        this.fan.setProgress(1 - this.moveTimer / windup)
        if (this.moveTimer <= 0) this.sweep(player)
        break
      }
      case 'recover':
      case 'roar':
        if (this.moveTimer <= 0) this.move = 'chase'
        break
    }

    keepOutsideBase(boss.position, boss.radius)
    clampToWorld(boss.position)
    this.herd.pushAway(boss.position, boss.radius)
    this.updateCubs(dt, player, camera)
    boss.updateLook(dt)
    boss.hpBar.update(boss.hp / boss.maxHp, boss.position, 2.6 * boss.scale, camera)
  }

  // Walks at the player when they are close or have hit it, never into the base; otherwise goes home.
  // From close enough it starts its special move.
  private chase(dt: number, player: Player): void {
    const boss = this.boss
    if (!boss || !this.kind) return
    const def = BOSSES[this.kind]
    const engaged = !player.inBase && (flatDistance(player.position, boss.position) < BOSS_FIGHT.aggroRadius || boss.aggro > 0)
    const goal = engaged ? player.position : this.home
    toTarget.subVectors(goal, boss.position).setY(0)
    const dist = toTarget.length()
    if (dist > 0.001) boss.facing = Math.atan2(toTarget.x, toTarget.z)
    const reach = BEAR.attackRange * def.scale
    const stopAt = engaged ? reach * 0.8 : 0.3
    if (dist > stopAt) boss.position.addScaledVector(toTarget.divideScalar(dist), BEAR.chaseSpeed * def.speedMultiplier * dt)
    if (!engaged) return

    if (this.kind === 'mini') {
      const c = BOSS_MOVES.charge
      if (this.special <= 0 && dist <= c.maxDistance) {
        this.chargeDir.set(Math.sin(boss.facing), 0, Math.cos(boss.facing))
        this.lane.show(boss.position.x, boss.position.z, boss.facing)
        this.move = 'chargeWindup'
        this.moveTimer = c.windup
        audio.play('growl')
        return
      }
      if (dist <= reach && this.attackTimer <= 0) {
        this.attackTimer = def.attackCooldown
        player.damage(this.damage())
        audio.play('bossHit')
      }
      return
    }

    // Yaşlı Ayı fights only with its sweep: a wide fan the player can step out of while it fills.
    const s = BOSS_MOVES.sweep
    if (this.special <= 0 && dist <= s.radius * 0.9) {
      this.fan.show(boss.position.x, boss.position.z, boss.facing)
      this.move = 'sweepWindup'
      this.moveTimer = this.angry ? s.angryWindup : s.windup
      audio.play('growl')
    }
  }

  private startCharge(): void {
    const boss = this.boss
    if (!boss) return
    boss.root.position.y = 0
    this.lane.hide()
    this.move = 'charge'
    this.chargeLeft = BOSS_MOVES.charge.length
    this.chargeHit = false
    audio.play('whoosh')
  }

  // Runs straight down the lane. Hitting the player hurts once; running into the fence or the edge of the
  // field stops it dead and stuns it.
  private charge(dt: number, player: Player): void {
    const boss = this.boss
    if (!boss) return
    const c = BOSS_MOVES.charge
    const step = Math.min(this.chargeLeft, c.speed * dt)
    boss.position.addScaledVector(this.chargeDir, step)
    before.copy(boss.position)
    keepOutsideBase(boss.position, boss.radius)
    clampToWorld(boss.position)
    this.chargeLeft -= step
    if (!this.chargeHit && !player.inBase && flatDistance(player.position, boss.position) < boss.radius + 0.8) {
      this.chargeHit = true
      player.damage(this.damage() * c.damage)
      audio.play('bossHit')
    }
    // The fence or the edge of the field pushed it back: it ran into something, even at a glancing angle.
    if (flatDistance(before, boss.position) > 0.01) {
      this.move = 'stunned'
      this.moveTimer = c.stunSeconds
      this.special = c.cooldown
      audio.play('bonk')
      floatingText.spawn('SERSEM!', boss.position.clone().setY(2.8 * boss.scale))
      return
    }
    if (this.chargeLeft <= 0) {
      this.move = 'recover'
      this.moveTimer = c.recover
      this.special = c.cooldown
    }
  }

  private sweep(player: Player): void {
    const boss = this.boss
    if (!boss) return
    const s = BOSS_MOVES.sweep
    this.fan.hide()
    audio.play('whoosh')
    if (!player.inBase && inFan(boss.position, boss.facing, player.position, s.radius, s.angle)) {
      player.damage(this.damage() * s.damage)
      audio.play('bossHit')
    }
    this.move = 'recover'
    this.moveTimer = s.recover
    this.special = this.angry ? s.angryCooldown : s.cooldown
  }

  // Yaşlı Ayı at half health: it roars, turns red and calls young bears to its side.
  private roar(): void {
    const boss = this.boss
    if (!boss || !this.kind) return
    const a = BOSS_MOVES.anger
    this.angry = true
    this.fan.hide()
    boss.glow = a.color
    this.move = 'roar'
    this.moveTimer = a.roarSeconds
    audio.play('bossRoar')
    this.events.announce(`${BOSSES[this.kind].name} öfkelendi!`)
    for (let i = 0; i < a.cubs; i++) {
      const cub = new Bear({ scale: a.cubScale, color: BOSSES[this.kind].color })
      const side = i % 2 === 0 ? 1 : -1
      cub.spawn(boss.position.x + side * 3, boss.position.z - 1, Math.round(this.hunt.bearHp * a.cubHp))
      cub.aggro = Infinity
      this.scene.add(cub.root, cub.hpBar.root)
      this.cubs.push(cub)
    }
  }

  // The young bears go for the player like any angry bear, but stay outside the base.
  private updateCubs(dt: number, player: Player, camera: Camera): void {
    for (const cub of this.cubs) {
      cub.attackTimer -= dt
      const goal = player.inBase ? this.home : player.position
      toTarget.subVectors(goal, cub.position).setY(0)
      const dist = toTarget.length()
      if (dist > 0.001) cub.facing = Math.atan2(toTarget.x, toTarget.z)
      if (dist > BEAR.attackRange * 0.9) cub.position.addScaledVector(toTarget.divideScalar(dist), BEAR.chaseSpeed * dt)
      else if (!player.inBase && cub.attackTimer <= 0) {
        cub.attackTimer = BEAR.attackCooldown
        player.damage(this.hunt.bearDamage)
        audio.play('hurt')
      }
      keepOutsideBase(cub.position, cub.radius)
      clampToWorld(cub.position)
      cub.updateLook(dt)
      cub.hpBar.update(cub.hp / cub.maxHp, cub.position, 2.4 * cub.scale, camera)
    }
  }

  private hitBoss(damage: number): void {
    const boss = this.boss
    if (!boss || !this.kind || boss.dead) return
    // A stunned Dev Ayı is wide open.
    const taken = this.move === 'stunned' ? damage * BOSS_MOVES.charge.stunDamage : damage
    if (!boss.hit(taken)) return
    const kind = this.kind
    audio.play('bossDie')
    this.removeBoss()
    this.pending.shift()
    this.phase = 'waiting'
    this.events.onDefeated(kind, boss.position.clone())
  }

  private damage(): number {
    return this.kind ? this.hunt.bearDamage * BOSSES[this.kind].damageMultiplier : 0
  }

  // The boss backs off leaving claw marks where it will come back, the blizzard falls, and the same boss
  // returns later with its reward intact.
  private lose(): void {
    const name = this.kind ? BOSSES[this.kind].name : ''
    this.removeBoss()
    this.marks = clawMarks(this.home.x, this.home.z)
    this.scene.add(this.marks)
    this.phase = 'waiting'
    this.returnTimer = BOSS_FIGHT.returnSeconds
    audio.play('bossRoar')
    this.storm.start()
    this.events.announce(`${name} kaçtı! Kar fırtınası!`)
  }

  private removeCub(cub: Bear): void {
    cub.root.removeFromParent()
    cub.hpBar.root.removeFromParent()
    this.cubs.splice(this.cubs.indexOf(cub), 1)
  }

  private removeBoss(): void {
    for (const cub of [...this.cubs]) this.removeCub(cub)
    this.lane.hide()
    this.fan.hide()
    if (!this.boss) return
    this.boss.root.removeFromParent()
    this.boss.hpBar.root.removeFromParent()
    this.boss = null
  }
}
