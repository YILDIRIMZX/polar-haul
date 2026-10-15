import { Color, Mesh, Vector3, type Camera, type Group, type Scene } from 'three'
import { audio } from '../audio/Audio.ts'
import { BEAR, BOSS_FIGHT, BOSS_MOVES, BOSS_SCHEDULE, BOSSES, SIEGE, type BossKind } from '../config/balance.ts'
import { WORLD } from '../config/world.ts'
import { Bear } from '../entities/Bear.ts'
import type { Player } from '../entities/Player.ts'
import { floatingText } from '../fx/FloatingText.ts'
import { clawMarks, GroundWarning } from '../fx/GroundWarning.ts'
import { Shockwave } from '../fx/Shockwave.ts'
import { iceChunk } from '../looks/effects.ts'
import { flatDistance, inFan } from '../game/math.ts'
import { clampToWorld, constrainToFence, frontGateZ, isInsideBase, keepOutsideBase, pushOutOfObstacles } from '../world/bounds.ts'
import type { Gate } from '../world/Gate.ts'
import type { BearHerd } from './BearHerd.ts'
import type { HuntLevel } from './HuntLevel.ts'
import type { Storm } from './Storm.ts'

const toTarget = new Vector3()
const before = new Vector3()
const focus = new Vector3()
const glowColor = new Color()
const goal = new Vector3()

// A chunk of ice a boss throws over the fence at a player hiding in the base.
interface Shard {
  mesh: Mesh
  from: Vector3
  to: Vector3
  t: number
  warning: GroundWarning
}
const HEARTBEAT = 0.85 // seconds between heartbeats while a boss is on its way
const SLAM_RING = 12 // how far the shockwave of a slam spreads

const easeOut = (k: number): number => 1 - (1 - k) * (1 - k)
const smooth = (k: number): number => k * k * (3 - 2 * k)

// What the screen adds for drama: cinema bars during the intro, and red at the edges while danger is near.
export interface Drama {
  bars: boolean
  dread: number // 0–1
}

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
  onRampage: () => void // the boss broke into the base
  canArrive: (kind: BossKind) => boolean // something in the world must draw it in first
  announce: (text: string) => void
  nameCard: (name: string, title: string) => void
  hideNameCard: () => void
}

type Phase = 'waiting' | 'warning' | 'intro' | 'fighting'

// What the boss is doing right now. Each special move is a wind-up (the red area fills) followed by the move.
type Move = 'chase' | 'chargeWindup' | 'charge' | 'stunned' | 'sweepWindup' | 'stompWindup' | 'recover' | 'roar'

// Bosses arrive by hunt level, one at a time, and each one is a stage to remember rather than a bigger bear:
// a heartbeat announces it, it runs in from the forest and roars while the camera watches, its special moves
// are marked on the ground before they land, Yaşlı Ayı flies into a rage at half health, and the fight leaves
// marks behind. Each fight has a time limit; a boss
// that is not beaten in time, or that knocks the player out, backs off into the field, a blizzard falls on
// the base, and the same boss comes back later. Its reward is never lost.
export class BossFight {
  boss: Bear | null = null
  private kind: BossKind | null = null
  private pending: BossKind[] = [] // bosses whose hunt level was reached, oldest first
  private forced: BossKind | null = null // test panel: this one comes next regardless
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
  private introT = 0 // seconds since the intro began
  private entry = new Vector3() // where the boss runs in from
  private beat = 0 // time until the next stride or heartbeat sound
  private slammed = false
  private roarT = 0 // seconds into Yaşlı Ayı's angry roar
  private pulse = 0 // clock for the angry red pulse
  private shakeLevel = 0
  private slowLeft = 0 // seconds of slow motion left, in real time
  private dread = 0
  private shockwaves: Shockwave[] = []
  private hideTime = 0 // how long the player has been hiding in the base during the fight
  private iceTimer = 0
  private poundTimer = 0
  private inside = false // the boss broke in and is loose in the base
  private shards: Shard[] = []
  private gate: Gate
  private closeTime = 0 // how long the player has been hugging the boss
  private stompReady = 0 // time until the next stomp is allowed
  private lane: GroundWarning
  private fan: GroundWarning
  private ring: GroundWarning
  private scene: Scene
  private hunt: HuntLevel
  private herd: BearHerd
  private storm: Storm
  private events: Events

  constructor(scene: Scene, hunt: HuntLevel, herd: BearHerd, storm: Storm, gate: Gate, events: Events) {
    this.scene = scene
    this.gate = gate
    this.hunt = hunt
    this.herd = herd
    this.storm = storm
    this.events = events
    const c = BOSS_MOVES.charge
    const s = BOSS_MOVES.sweep
    this.lane = new GroundWarning(scene, { kind: 'lane', length: c.length, width: c.width })
    this.fan = new GroundWarning(scene, { kind: 'fan', radius: s.radius, angle: s.angle })
    this.ring = new GroundWarning(scene, { kind: 'circle', radius: 1 })
  }

  get fighting(): boolean {
    return this.phase === 'fighting' && this.boss !== null
  }

  // A boss is on its way or in the fight: hunters hide in their lodge until it is over.
  get threat(): boolean {
    return this.phase !== 'waiting'
  }

  // The boss broke through the gate and is in the base: no customers come in.
  get inBase(): boolean {
    return this.inside && this.fighting
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

  // Where the camera should look: the player, or during the intro the boss, following it as it runs in.
  cameraTarget(player: Vector3): Vector3 {
    if (this.phase !== 'intro' || !this.boss) return player
    return focus.lerpVectors(player, this.boss.position, this.introBlend())
  }

  // Closer than usual while the camera watches the boss arrive.
  get zoom(): number {
    if (this.phase !== 'intro') return 1
    return 1 - (1 - BOSS_MOVES.intro.zoom) * this.introBlend()
  }

  get shake(): number {
    return this.shakeLevel
  }

  // The world runs slower for a moment while Yaşlı Ayı roars in anger.
  get timeScale(): number {
    return this.slowLeft > 0 ? BOSS_MOVES.anger.slowMotion : 1
  }

  get drama(): Drama {
    return { bars: this.phase === 'intro', dread: this.dread }
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

  // Test panel: brings this boss next, right away, even during a blizzard's wait or before it would be drawn in.
  summon(kind: BossKind): void {
    if (this.phase !== 'waiting') return
    if (!this.pending.includes(kind)) this.pending.unshift(kind)
    this.forced = kind
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

  // The arrival runs on its own clock, because the rest of the world waits while it plays:
  // the boss runs in from the forest shaking the ground, rears up on its hind legs, slams down and roars.
  updateIntro(dt: number, camera: Camera): void {
    const boss = this.boss
    if (this.phase !== 'intro' || !boss || !this.kind) return
    const I = BOSS_MOVES.intro
    this.introT += dt
    const t = this.introT
    this.updateEffects(dt)

    if (t < I.runSeconds) {
      boss.position.lerpVectors(this.entry, this.home, easeOut(t / I.runSeconds))
      boss.root.position.y = Math.abs(Math.sin(t * 11)) * 0.25 * boss.scale // bounding strides
      this.herd.pushAway(boss.position, boss.radius + 2.5) // bears scatter out of its way
      this.beat -= dt
      if (this.beat <= 0) {
        this.beat = I.stride
        this.shakeLevel = Math.max(this.shakeLevel, 0.35)
        audio.play('stomp')
      }
    } else if (t < I.roarAt) {
      const k = easeOut((t - I.runSeconds) / (I.roarAt - I.runSeconds))
      if (boss.root.rotation.x === 0) audio.play('growl')
      boss.position.copy(this.home)
      boss.root.position.y = 0.5 * boss.scale * k
      boss.root.rotation.x = -0.65 * k - 0.001 // rears up on its hind legs
      this.dread = Math.max(this.dread, 0.55 + 0.25 * k)
    } else {
      if (!this.slammed) {
        this.slam(0xffffff)
        this.events.nameCard(BOSSES[this.kind].name, BOSSES[this.kind].title)
      }
      this.settle(dt)
      this.herd.pushAway(boss.position, Math.min(SLAM_RING * 0.8, boss.radius + (t - I.roarAt) * 30)) // the roar throws bears back
    }
    boss.updateLook(dt)
    boss.hpBar.update(1, boss.position, 0, camera)
    if (t < I.seconds) return
    boss.root.position.y = 0
    boss.root.rotation.x = 0
    this.events.hideNameCard()
    this.phase = 'fighting'
    this.timer = BOSS_FIGHT.timeLimit
  }

  update(dt: number, player: Player, camera: Camera): void {
    this.updateEffects(dt / this.timeScale)
    if (this.phase === 'waiting') this.wait(dt)
    else if (this.phase === 'warning') this.warn(dt)
    else if (this.phase === 'fighting') this.fight(dt, player, camera)
  }

  // The oldest boss that is drawn in comes next; one that is not (Yaşlı Ayı before there is a meat store to
  // smell) keeps waiting and lets the ones behind it come first.
  private wait(dt: number): void {
    this.returnTimer = Math.max(0, this.returnTimer - dt)
    if (this.returnTimer > 0 || this.storm.active) return
    const next = this.forced ?? this.pending.find((kind) => this.events.canArrive(kind))
    this.forced = null
    if (!next) return
    this.kind = next
    this.phase = 'warning'
    this.timer = BOSS_FIGHT.warningSeconds
    this.events.announce(`${BOSSES[next].name} geliyor!`)
    this.beat = 0
    audio.play('bossWarn')
  }

  // A heartbeat and red creeping in at the edges while the boss is on its way. Then it appears deep in the
  // field, the claw marks of an earlier escape go, and the intro starts.
  private warn(dt: number): void {
    this.timer -= dt
    this.dread = Math.min(0.5, this.dread + dt * 0.3)
    this.beat -= dt
    if (this.beat <= 0) {
      this.beat = HEARTBEAT
      audio.play('heartbeat')
    }
    if (this.timer > 0 || !this.kind) return
    const def = BOSSES[this.kind]
    const boss = new Bear({ scale: def.scale, color: def.color })
    // It stops just outside the front gate, where the player walks out to hunt, after running in from the forest.
    this.home.set(0, 0, frontGateZ() - BOSS_FIGHT.spawnBeyondGate)
    this.entry.set(this.home.x, 0, this.home.z - BOSS_MOVES.intro.entryDistance)
    clampToWorld(this.entry)
    boss.spawn(this.entry.x, this.entry.z, Math.round(this.hunt.bearHp * def.hpMultiplier))
    boss.facing = 0
    this.scene.add(boss.root, boss.hpBar.root)
    this.boss = boss
    this.attackTimer = 0
    this.move = 'chase'
    this.special = 1.5
    this.angry = false
    this.closeTime = 0
    this.stompReady = 0
    this.hideTime = 0
    this.iceTimer = SIEGE.iceEvery
    this.inside = false
    this.marks?.removeFromParent()
    this.marks = null
    this.phase = 'intro'
    this.introT = 0
    this.beat = 0
    this.slammed = false
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
    this.dread = Math.max(this.angry ? 0.2 + 0.1 * Math.sin(this.pulse * 7) : 0, this.dread - dt * 0.6)
    boss.aggro = Math.max(0, boss.aggro - dt)
    this.attackTimer -= dt
    this.special -= dt
    this.moveTimer -= dt
    this.stompReady -= dt
    const prevX = boss.position.x
    const prevZ = boss.position.z
    // Hiding in the base: ice over the fence at once, and after a while the boss goes for the gate.
    const hiding = player.inBase && !this.inside
    this.hideTime = hiding ? this.hideTime + dt : 0
    if (hiding && this.move !== 'roar') this.throwIceWhenReady(dt, player)
    this.updateShards(dt, player)
    // Time spent hugging the boss builds up, and drains away again once the player keeps their distance.
    const close = !player.inBase && flatDistance(player.position, boss.position) < boss.radius + BOSS_MOVES.stomp.closeRange
    this.closeTime = close ? this.closeTime + dt : Math.max(0, this.closeTime - dt * 2)
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
      case 'stompWindup': {
        const windup = this.angry ? BOSS_MOVES.stomp.angryWindup : BOSS_MOVES.stomp.windup
        this.ring.setProgress(1 - this.moveTimer / windup)
        boss.root.position.y = 0.4 * boss.scale * (1 - this.moveTimer / windup) // rising up before the pound
        if (this.moveTimer <= 0) this.stomp(player)
        break
      }
      case 'sweepWindup': {
        const windup = this.angry ? BOSS_MOVES.sweep.angryWindup : BOSS_MOVES.sweep.windup
        this.fan.setProgress(1 - this.moveTimer / windup)
        if (this.moveTimer <= 0) this.sweep(player)
        break
      }
      case 'recover':
        if (this.moveTimer <= 0) this.move = 'chase'
        break
      case 'roar':
        this.roarStep(dt)
        break
    }
    if (this.angry) this.angryPulse(dt)

    this.contain(prevX, prevZ)
    this.herd.pushAway(boss.position, boss.radius)
    this.updateCubs(dt, player, camera)
    boss.updateLook(dt)
    boss.hpBar.update(boss.hp / boss.maxHp, boss.position, 2.6 * boss.scale, camera)
  }

  // Walks at the player when they are close or have hit it; otherwise goes home. A player hiding in the base
  // is besieged; once the gate is broken the boss follows them in. From close enough it starts its special move.
  private chase(dt: number, player: Player): void {
    const boss = this.boss
    if (!boss || !this.kind) return
    const def = BOSSES[this.kind]
    if (player.inBase && !this.gate.broken) {
      this.besiege(dt)
      return
    }
    const engaged = player.inBase || flatDistance(player.position, boss.position) < BOSS_FIGHT.aggroRadius || boss.aggro > 0
    goal.copy(engaged ? player.position : this.home)
    // Into the base through the broken gate: line up in front of it first, then walk through.
    if (engaged && player.inBase && !this.inside) {
      const gate = frontGateZ()
      const front = gate - boss.radius - 1
      const lined = Math.abs(boss.position.x) < 1 && boss.position.z > front - 1
      goal.set(0, 0, lined ? gate + 3 : front)
    }
    toTarget.subVectors(goal, boss.position).setY(0)
    const dist = toTarget.length()
    if (dist > 0.001) boss.facing = Math.atan2(toTarget.x, toTarget.z)
    const reach = BEAR.attackRange * def.scale
    const stopAt = engaged && this.canReach(player) ? reach * 0.8 : 0.3
    if (dist > stopAt) boss.position.addScaledVector(toTarget.divideScalar(dist), BEAR.chaseSpeed * def.speedMultiplier * dt)
    if (!engaged || !this.canReach(player)) return

    // Too close for too long: it pounds the ground all around itself, whichever way it faces.
    const st = BOSS_MOVES.stomp
    if (this.closeTime >= st.triggerSeconds && this.stompReady <= 0) {
      this.ring.show(boss.position.x, boss.position.z, 0, boss.radius + st.reach)
      this.move = 'stompWindup'
      this.moveTimer = this.angry ? st.angryWindup : st.windup
      audio.play('growl')
      return
    }

    if (this.kind === 'mini') {
      const c = BOSS_MOVES.charge
      if (this.special <= 0 && dist <= c.maxDistance) {
        this.chargeDir.set(Math.sin(boss.facing), 0, Math.cos(boss.facing))
        this.lane.show(boss.position.x, boss.position.z, boss.facing)
        this.move = 'chargeWindup'
        this.moveTimer = c.windup
        audio.play('growl')
      }
      // No unwarned swipe: everything a boss does is marked on the ground first, so skill decides the fight.
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
    const px = boss.position.x
    const pz = boss.position.z
    boss.position.addScaledVector(this.chargeDir, step)
    before.copy(boss.position)
    this.contain(px, pz)
    this.chargeLeft -= step
    if (!this.chargeHit && this.canReach(player) && flatDistance(player.position, boss.position) < boss.radius + 0.8) {
      this.chargeHit = true
      player.damage(this.damage() * c.damage)
      player.knockback(this.chargeDir.x, this.chargeDir.z, 12)
      this.shakeLevel = Math.max(this.shakeLevel, 0.5)
      audio.play('bossHit')
    }
    // The fence, a station or the edge of the field pushed it back: it ran into something, even at a glancing angle.
    // Only a charge with a run-up stuns it; a short bump just ends the charge.
    const bumped = flatDistance(before, boss.position) > 0.01
    if (bumped && c.length - this.chargeLeft < c.stunAfter) {
      this.move = 'recover'
      this.moveTimer = c.recover
      this.special = c.cooldown
      return
    }
    if (bumped) {
      this.move = 'stunned'
      this.moveTimer = c.stunSeconds
      this.special = c.cooldown
      audio.play('bonk')
      this.shakeLevel = Math.max(this.shakeLevel, 0.6)
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
    this.shakeLevel = Math.max(this.shakeLevel, 0.4)
    this.shockwaves.push(new Shockwave(this.scene, boss.position.x, boss.position.z, s.radius, 0xe0453a, 0.35))
    if (this.canReach(player) && inFan(boss.position, boss.facing, player.position, s.radius, s.angle)) {
      player.damage(this.damage() * s.damage)
      // Thrown back, away from the paw.
      player.knockback(player.position.x - boss.position.x, player.position.z - boss.position.z, s.knockback)
      this.shakeLevel = 0.8
      audio.play('bossHit')
    }
    this.move = 'recover'
    this.moveTimer = this.angry ? s.angryRecover : s.recover
    this.special = this.angry ? s.angryCooldown : s.cooldown
  }

  // Pounds the ground: everyone inside the circle is hurt and thrown outward.
  private stomp(player: Player): void {
    const boss = this.boss
    if (!boss) return
    const st = BOSS_MOVES.stomp
    this.ring.hide()
    boss.root.position.y = 0
    const reach = boss.radius + st.reach
    this.shakeLevel = Math.max(this.shakeLevel, 0.7)
    this.shockwaves.push(new Shockwave(this.scene, boss.position.x, boss.position.z, reach, 0xe0453a, 0.4))
    audio.play('boom')
    if (this.canReach(player) && flatDistance(player.position, boss.position) <= reach) {
      player.damage(this.damage() * st.damage)
      player.knockback(player.position.x - boss.position.x, player.position.z - boss.position.z, st.knockback)
      audio.play('bossHit')
    }
    this.closeTime = 0
    this.stompReady = this.angry ? st.angryCooldown : st.cooldown
    this.move = 'recover'
    this.moveTimer = st.recover
  }

  // Yaşlı Ayı at half health. It rears up, trembling, swells and glows red; then it slams down and roars
  // in slow motion, and young bears come running out of the forest.
  private roar(): void {
    if (!this.boss) return
    this.angry = true
    this.fan.hide()
    this.ring.hide()
    this.move = 'roar'
    this.roarT = 0
    this.slammed = false
    audio.play('growl')
  }

  private roarStep(dt: number): void {
    const boss = this.boss
    if (!boss || !this.kind) return
    const a = BOSS_MOVES.anger
    this.roarT += dt
    if (this.roarT < a.roarAt) {
      const k = easeOut(this.roarT / a.roarAt)
      boss.root.rotation.x = -0.7 * k
      boss.root.rotation.z = Math.sin(this.roarT * 60) * 0.04 // trembling with rage
      boss.root.position.y = 0.5 * boss.scale * k
      boss.root.scale.setScalar(boss.scale * (1 + (a.swell - 1) * k))
      this.shakeLevel = Math.max(this.shakeLevel, 0.3 * k)
    } else if (!this.slammed) {
      boss.root.rotation.z = 0
      this.slam(a.color)
      this.slowLeft = a.slowSeconds
      this.dread = 0.9
      this.events.announce(`${BOSSES[this.kind].name} öfkelendi!`)
      this.callCubs()
    } else {
      this.settle(dt)
    }
    if (this.roarT < a.roarSeconds) return
    boss.root.rotation.x = 0
    boss.root.position.y = 0
    this.move = 'chase'
  }

  // Young bears come running in from the forest behind and beside the boss.
  private callCubs(): void {
    const boss = this.boss
    if (!boss || !this.kind) return
    const a = BOSS_MOVES.anger
    for (let i = 0; i < a.cubs; i++) {
      const cub = new Bear({ scale: a.cubScale, color: BOSSES[this.kind].color })
      const spread = a.cubs > 1 ? (i / (a.cubs - 1) - 0.5) * 2 : 0 // -1 … 1
      const dir = boss.facing + Math.PI + spread * 1.1
      const at = new Vector3(boss.position.x + Math.sin(dir) * a.cubsFrom, 0, boss.position.z + Math.cos(dir) * a.cubsFrom)
      clampToWorld(at)
      cub.spawn(at.x, at.z, Math.round(this.hunt.bearHp * a.cubHp))
      cub.aggro = Infinity
      this.scene.add(cub.root, cub.hpBar.root)
      this.cubs.push(cub)
    }
  }

  // An angry boss glows a beating red.
  private angryPulse(dt: number): void {
    const boss = this.boss
    if (!boss) return
    this.pulse += dt
    const ramp = this.move === 'roar' && !this.slammed ? this.roarT / BOSS_MOVES.anger.roarAt : 1
    const k = ramp * (0.6 + 0.4 * Math.sin(this.pulse * 7))
    boss.glow = glowColor.setHex(BOSS_MOVES.anger.color).multiplyScalar(k).getHex()
  }

  // Comes down hard: the ground shakes and a shockwave rolls out.
  private slam(color: number): void {
    const boss = this.boss
    if (!boss) return
    this.slammed = true
    boss.root.rotation.x = 0.15
    boss.root.position.y = 0
    this.shakeLevel = 1
    this.dread = Math.max(this.dread, 0.85)
    this.shockwaves.push(new Shockwave(this.scene, boss.position.x, boss.position.z, SLAM_RING, color, 0.8))
    audio.play('boom')
    audio.play('bossRoar')
  }

  // After a slam the boss eases back onto all fours.
  private settle(dt: number): void {
    const boss = this.boss
    if (!boss) return
    const k = Math.exp(-8 * dt)
    boss.root.rotation.x *= k
    boss.root.position.y *= k
  }

  // Shakes die out, shockwaves spread and fade, slow motion runs down. `realDt` ignores slow motion.
  private updateEffects(realDt: number): void {
    this.shakeLevel *= Math.exp(-5 * realDt)
    if (this.shakeLevel < 0.01) this.shakeLevel = 0
    this.slowLeft = Math.max(0, this.slowLeft - realDt)
    this.shockwaves = this.shockwaves.filter((w) => w.update(realDt))
    if (this.phase === 'waiting') this.dread = Math.max(0, this.dread - realDt * 0.6)
  }

  // From 0 (looking at the player) to 1 (looking at the boss) and back during the intro.
  private introBlend(): number {
    const I = BOSS_MOVES.intro
    const t = this.introT
    const glide = 0.5
    if (t < glide) return smooth(t / glide)
    if (t > I.returnAt) return smooth(Math.max(0, 1 - (t - I.returnAt) / (I.seconds - I.returnAt)))
    return 1
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
        player.damage(this.hunt.bearDamage * BOSS_MOVES.anger.cubDamage) // young bears hit softer
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
    this.slowLeft = 0
    this.removeBoss()
    this.pending.splice(this.pending.indexOf(kind), 1)
    this.phase = 'waiting'
    this.events.onDefeated(kind, boss.position.clone())
  }

  // A player in the base is out of reach, unless the boss has broken in too.
  private canReach(player: Player): boolean {
    return !player.inBase || this.inside
  }

  // Keeps the boss out of the base while the gate stands. Through a broken gate it may come in, but not
  // through the fence, and inside it bumps into the stations like everyone else. Entering is a rampage.
  private contain(prevX: number, prevZ: number): void {
    const boss = this.boss
    if (!boss) return
    const pos = boss.position
    if (!this.gate.broken) keepOutsideBase(pos, boss.radius)
    else {
      if (Math.abs(pos.x) >= WORLD.gateWidth / 2) constrainToFence(prevX, prevZ, pos, boss.radius)
      pushOutOfObstacles(pos, boss.radius * 0.7)
      if (!this.inside && isInsideBase(pos.x, pos.z)) {
        this.inside = true
        this.shakeLevel = 1
        audio.play('bossRoar')
        this.events.onRampage()
      }
    }
    clampToWorld(pos)
  }

  // The player is hiding: the boss stands off for a moment, then walks up to the gate and pounds it.
  private besiege(dt: number): void {
    const boss = this.boss
    if (!boss || !this.kind) return
    const atGate = this.hideTime >= SIEGE.hideSeconds
    goal.set(0, 0, frontGateZ() - boss.radius - (atGate ? 0.4 : 4))
    toTarget.subVectors(goal, boss.position).setY(0)
    const dist = toTarget.length()
    if (dist > 0.3) {
      boss.facing = Math.atan2(toTarget.x, toTarget.z)
      boss.position.addScaledVector(toTarget.divideScalar(dist), BEAR.chaseSpeed * BOSSES[this.kind].speedMultiplier * dt)
      return
    }
    boss.facing = 0 // toward the base
    this.settle(dt)
    if (!atGate) return
    this.poundTimer -= dt
    if (this.poundTimer > 0) return
    this.poundTimer = SIEGE.poundEvery
    boss.root.rotation.x = 0.3 // throws its weight against the gate
    this.shakeLevel = Math.max(this.shakeLevel, 0.5)
    this.shockwaves.push(new Shockwave(this.scene, 0, frontGateZ(), 3, 0xffffff, 0.35))
    audio.play('bonk')
    if (this.gate.pound(SIEGE.poundDamage)) this.events.announce(`${BOSSES[this.kind].name} kapıyı kırdı!`)
  }

  // Every few seconds a chunk of ice arcs over the fence at where the player stands; a red circle shows where.
  private throwIceWhenReady(dt: number, player: Player): void {
    const boss = this.boss
    if (!boss) return
    this.iceTimer -= dt
    if (this.iceTimer > 0) return
    this.iceTimer = SIEGE.iceEvery
    const warning = new GroundWarning(this.scene, { kind: 'circle', radius: SIEGE.iceRadius })
    const to = new Vector3(player.position.x, 0, player.position.z)
    warning.show(to.x, to.z, 0)
    const mesh = iceChunk()
    const from = boss.position.clone().setY(2.5 * boss.scale)
    mesh.position.copy(from)
    this.scene.add(mesh)
    this.shards.push({ mesh, from, to, t: 0, warning })
    audio.play('whoosh')
  }

  private updateShards(dt: number, player: Player): void {
    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i]
      s.t += dt / SIEGE.iceFlight
      const k = Math.min(1, s.t)
      s.mesh.position.lerpVectors(s.from, s.to, k)
      s.mesh.position.y = s.from.y * (1 - k) + Math.sin(Math.PI * k) * 7
      s.mesh.rotation.set(k * 6, k * 4, 0)
      s.warning.setProgress(k)
      if (k < 1) continue
      s.mesh.removeFromParent()
      s.warning.dispose()
      this.shards.splice(i, 1)
      this.shockwaves.push(new Shockwave(this.scene, s.to.x, s.to.z, SIEGE.iceRadius + 0.6, 0xdff4ff, 0.4))
      audio.play('bonk')
      if (flatDistance(player.position, s.to) <= SIEGE.iceRadius + 0.3) {
        player.damage(this.damage() * SIEGE.iceDamage)
        audio.play('hurt')
      }
    }
  }

  private clearShards(): void {
    for (const s of this.shards) {
      s.mesh.removeFromParent()
      s.warning.dispose()
    }
    this.shards = []
  }

  // An angry boss hits harder.
  private damage(): number {
    if (!this.kind) return 0
    return this.hunt.bearDamage * BOSSES[this.kind].damageMultiplier * (this.angry ? BOSS_MOVES.anger.damage : 1)
  }

  // The boss backs off leaving claw marks where it will come back, the blizzard falls, and the same boss
  // returns later with its reward intact.
  private lose(): void {
    const name = this.kind ? BOSSES[this.kind].name : ''
    this.slowLeft = 0
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
    this.ring.hide()
    this.clearShards()
    this.inside = false
    if (!this.boss) return
    this.boss.root.removeFromParent()
    this.boss.hpBar.root.removeFromParent()
    this.boss = null
  }
}
