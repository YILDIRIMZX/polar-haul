import { MathUtils, type Camera, type Object3D, type Scene, type Vector3 } from 'three'
import { audio } from '../audio/Audio.ts'
import { BEAR, WORKER } from '../config/balance.ts'
import type { WorkerKind } from '../config/upgrades.ts'
import { COLORS, LAYOUT } from '../config/world.ts'
import type { Bear } from '../entities/Bear.ts'
import type { Fighter } from '../entities/Fighter.ts'
import { createMeat } from '../looks/meat.ts'
import { Worker } from '../entities/Worker.ts'
import { HpBar } from '../fx/HpBar.ts'
import { flatDistance } from '../game/math.ts'
import type { Stats } from '../game/Stats.ts'
import { frontGateZ, isInsideBase } from '../world/bounds.ts'
import type { BearHerd } from './BearHerd.ts'
import type { Depot } from './Depot.ts'
import type { Furnace } from './Furnace.ts'
import { hunterShouldReturn } from './hunting.ts'
import type { Progress } from './progression.ts'
import type { Shop } from './Shop.ts'

type Spot = { x: number; z: number }

// Where a courier takes from and gives to, and how much it carries per trip.
interface Route {
  pickup: Spot
  drop: Spot
  take: () => Object3D | null
  canGive: () => boolean
  give: (piece: Object3D) => void
  load: () => number
}

const WAIT_FOR_MORE = 0.6 // seconds a courier with a part load waits at the pickup for more before leaving

// A worker that shuttles pieces between two places: the carrier (gate depot → furnace tray) and the waiter
// (furnace shelf → counter). It fills up at one end, walks over, empties at the other end and walks back.
class Courier {
  readonly worker: Worker
  private route: Route
  private state: 'toPickup' | 'loading' | 'toDrop' | 'unloading' = 'toPickup'
  private timer = 0
  private waited = 0

  constructor(worker: Worker, route: Route) {
    this.worker = worker
    this.route = route
  }

  update(dt: number, speed: number): void {
    const w = this.worker
    const r = this.route
    this.timer -= dt
    switch (this.state) {
      case 'toPickup':
        if (w.walkTo(r.pickup, speed, dt)) {
          this.state = 'loading'
          this.waited = 0
        }
        break
      case 'loading': {
        if (this.timer <= 0 && w.carried.length < r.load()) {
          const piece = r.take()
          if (piece) {
            w.hold(piece)
            this.timer = WORKER.handInterval
            this.waited = 0
            audio.play('pickup', { rising: true, volume: 0.4 })
          }
        }
        this.waited += dt
        const full = w.carried.length >= r.load()
        if (w.carried.length > 0 && (full || this.waited > WAIT_FOR_MORE)) this.state = 'toDrop'
        break
      }
      case 'toDrop':
        if (w.walkTo(r.drop, speed, dt)) this.state = 'unloading'
        break
      case 'unloading':
        w.setWaiting(w.carried.length > 0 && !r.canGive(), dt)
        if (this.timer <= 0 && w.carried.length > 0 && r.canGive()) {
          const piece = w.drop()
          if (piece) r.give(piece)
          this.timer = WORKER.handInterval
          audio.play('place', { volume: 0.5 })
        }
        if (w.carried.length === 0) {
          this.state = 'toPickup'
          w.setWaiting(false, dt)
        }
        break
    }
    w.updateLook()
  }
}

type HunterState = 'resting' | 'goingOut' | 'hunting' | 'goingHome' | 'unloading' | 'hurt' | 'fleeing' | 'sheltering'

// A hunter from the lodge: walks out through the front gate, kills bears, carries the meat back to the
// gate depot and goes out again. Bears fight back; a hunter knocked down walks to the lodge to rest.
class Hunter implements Fighter {
  readonly worker: Worker
  readonly bar = new HpBar(COLORS.hpPlayer, 1)
  hp: number
  maxHp: number
  state: HunterState = 'goingOut'
  private path: Spot[] = []
  private target: Bear | null = null
  private attackTimer = 0
  private restTimer = 0
  private handTimer = 0

  constructor(worker: Worker, maxHp: number) {
    this.worker = worker
    this.maxHp = maxHp
    this.hp = maxHp
    this.path = pathOut()
  }

  get position(): Vector3 {
    return this.worker.position
  }

  get inBase(): boolean {
    return isInsideBase(this.position.x, this.position.z)
  }

  get alive(): boolean {
    return this.hp > 0 && (this.state === 'hunting' || this.state === 'goingOut' || this.state === 'goingHome')
  }

  damage(amount: number): void {
    this.hp -= amount
  }

  // `danger` is true while a boss is on its way or fighting: the hunter runs to the lodge and stays in.
  update(dt: number, stats: Stats, herd: BearHerd, depot: Depot, camera: Camera, danger: boolean): void {
    const speed = stats.get('workerSpeed')
    this.attackTimer -= dt
    this.handTimer -= dt
    const working = this.state === 'goingOut' || this.state === 'hunting' || this.state === 'goingHome' || this.state === 'unloading'
    if (danger && working && this.hp > 0) {
      this.state = 'fleeing'
      this.target = null
      this.worker.setWaiting(false, dt)
      this.path = this.inBase ? [GAP, WEST, LAYOUT.lodgeDoor] : [outer(), ...pathToLodge()]
      audio.play('angry', { volume: 0.4 })
    }
    if (this.hp <= 0 && this.state !== 'hurt' && this.state !== 'resting') {
      // Knocked down: limps home to the lodge; the meat it carried is lost in the snow.
      for (const piece of this.worker.carried.splice(0)) piece.removeFromParent()
      this.state = 'hurt'
      this.target = null
      this.path = this.inBase ? pathToLodge() : [...pathIn(), ...pathToLodge()]
      audio.play('hurt')
    }
    switch (this.state) {
      case 'goingOut':
        if (this.follow(speed * 1.2, dt)) this.state = 'hunting'
        break
      case 'hunting':
        this.hunt(dt, speed, stats, herd)
        break
      case 'goingHome':
        // Heading home it hurries, a little faster than a chasing bear, so it can get away.
        if (this.follow(speed * WORKER.hunterFleeSpeed, dt)) this.state = 'unloading'
        break
      case 'unloading':
        // A full depot: the hunter waits by it with its load until the carrier makes room.
        this.worker.setWaiting(this.worker.carried.length > 0 && !depot.hasRoom(stats), dt)
        if (this.handTimer <= 0 && this.worker.carried.length > 0 && depot.hasRoom(stats)) {
          const piece = this.worker.drop()
          if (piece) depot.receive(piece)
          this.handTimer = WORKER.handInterval
          audio.play('pour', { volume: 0.6 })
        }
        if (this.worker.carried.length === 0) {
          this.state = 'goingOut'
          this.path = [inner(), outer()]
          this.worker.setWaiting(false, dt)
        }
        break
      case 'hurt':
        if (this.follow(speed * 0.7, dt)) {
          this.state = 'resting'
          this.restTimer = WORKER.hunterRestSeconds
        }
        break
      case 'fleeing':
        if (this.follow(speed * WORKER.hunterFleeSpeed, dt)) this.state = 'sheltering'
        break
      case 'sheltering':
        // Hidden in the lodge with whatever it carried, until the boss is gone.
        this.worker.root.visible = false
        if (danger) break
        this.worker.root.visible = true
        if (this.worker.carried.length > 0) {
          this.state = 'goingHome'
          this.path = [WEST, GAP, LAYOUT.hunterDrop]
        } else {
          this.state = 'goingOut'
          this.path = pathOut()
        }
        break
      case 'resting':
        this.worker.root.visible = false // inside the lodge
        this.restTimer -= dt
        this.hp = Math.min(this.maxHp, this.hp + WORKER.hunterRegenPerSec * dt)
        if (this.restTimer <= 0) {
          this.hp = this.maxHp
          this.worker.root.visible = true
          this.state = 'goingOut'
          this.path = pathOut()
        }
        break
    }
    // Like the player, a hunter heals inside the base, so a trip home to unload also patches it up.
    if (this.hp > 0 && this.inBase) this.hp = Math.min(this.maxHp, this.hp + WORKER.hunterRegenPerSec * dt)
    this.worker.updateLook()
    this.bar.update(this.hp / this.maxHp, this.position, 2.3, camera)
    if (!this.worker.root.visible) this.bar.hide()
  }

  // Takes the meat of a bear it killed, as much as it can carry. Returns what did not fit.
  collect(count: number, capacity: number): number {
    let left = count
    while (left > 0 && this.worker.carried.length < capacity) {
      const piece = createMeat('raw')
      this.worker.root.parent?.add(piece)
      this.worker.hold(piece)
      left--
    }
    return left
  }

  private hunt(dt: number, speed: number, stats: Stats, herd: BearHerd): void {
    const capacity = stats.count('hunterLoad')
    const bearsLeft = herd.bears.filter((b) => !b.dead).length
    if (hunterShouldReturn({ carried: this.worker.carried.length, capacity, hp: this.hp, maxHp: this.maxHp, bearsLeft })) {
      this.state = 'goingHome'
      this.target = null
      this.path = pathIn()
      return
    }
    if (!this.target || this.target.dead) this.target = nearestBear(this.position, herd.bears)
    const bear = this.target
    if (!bear) return
    const dist = flatDistance(this.position, bear.position)
    if (dist > WORKER.hunterAttackRange) {
      this.worker.walkTo(bear.position, speed, dt)
      return
    }
    this.worker.face(Math.atan2(bear.position.x - this.position.x, bear.position.z - this.position.z), dt)
    if (this.attackTimer > 0) return
    this.attackTimer = WORKER.hunterAttackCooldown
    herd.hit(bear, stats.get('hunterDamage'), this)
    audio.play('hit', { volume: 0.5 })
  }

  // Walks the waypoints in order; returns true when the last one is reached.
  private follow(speed: number, dt: number): boolean {
    while (this.path.length > 0) {
      if (!this.worker.walkTo(this.path[0], speed, dt)) return false
      this.path.shift()
    }
    return true
  }
}

// The way out of the base and back through the front gate. From the lodge door it turns onto the path between
// the depot's pads and the furnace's, follows it east to the road and takes the road to the gate.
const inner = (): Spot => ({ x: 0, z: frontGateZ() + 1.5 })
const outer = (): Spot => ({ x: 0, z: frontGateZ() - 2.5 })
const WEST: Spot = { x: -9.8, z: -2.4 }
const GAP: Spot = { x: -1.8, z: -2.4 }
function pathOut(): Spot[] {
  return [LAYOUT.lodgeDoor, WEST, GAP, inner(), outer()]
}
function pathIn(): Spot[] {
  return [outer(), inner(), LAYOUT.hunterDrop]
}
function pathToLodge(): Spot[] {
  return [inner(), GAP, WEST, LAYOUT.lodgeDoor]
}

function nearestBear(from: { x: number; z: number }, bears: readonly Bear[]): Bear | null {
  let best: Bear | null = null
  let bestD = Infinity
  for (const b of bears) {
    if (b.dead) continue
    const d = Math.hypot(b.position.x - from.x, b.position.z - from.z)
    if (d < bestD) {
      bestD = d
      best = b
    }
  }
  return best
}

// Everyone hired to run the base: the carrier, the waiter, the cashier and the hunters.
export class Workers {
  readonly hunters: Hunter[] = []
  private couriers: Courier[] = []
  private cashier: Worker | null = null
  private scene: Scene
  private progress: Progress
  private stats: Stats
  private depot: Depot
  private furnace: Furnace
  private shop: Shop

  constructor(scene: Scene, progress: Progress, stats: Stats, depot: Depot, furnace: Furnace, shop: Shop) {
    this.scene = scene
    this.progress = progress
    this.stats = stats
    this.depot = depot
    this.furnace = furnace
    this.shop = shop
  }

  // How many of each job are working, for the test panel.
  get counts(): string {
    const p = this.progress
    return `${p.carriers} / ${p.waiters} / ${p.cashiers} / ${p.hunters}`
  }

  hire(kind: WorkerKind): void {
    const s = this.stats
    if (kind === 'carrier') {
      const w = new Worker(this.scene, COLORS.carrier)
      w.position.set(LAYOUT.carrierPickup.x, 0, LAYOUT.carrierPickup.z)
      this.couriers.push(
        new Courier(w, {
          pickup: LAYOUT.carrierPickup,
          drop: LAYOUT.carrierDrop,
          take: () => this.depot.take(),
          canGive: () => this.furnace.trayHasRoom(s),
          give: (piece) => this.furnace.receiveRaw(piece),
          load: () => s.count('carrierLoad'),
        }),
      )
      this.depot.showZone()
      this.progress.carriers++
    } else if (kind === 'waiter') {
      const w = new Worker(this.scene, COLORS.waiter)
      w.position.set(LAYOUT.waiterPickup.x, 0, LAYOUT.waiterPickup.z)
      this.couriers.push(
        new Courier(w, {
          pickup: LAYOUT.waiterPickup,
          drop: LAYOUT.waiterDrop,
          take: () => this.furnace.takeCooked(),
          canGive: () => this.shop.counterHasRoom(s),
          give: (piece) => this.shop.receiveCooked(piece),
          load: () => s.count('waiterLoad'),
        }),
      )
      this.progress.waiters++
    } else if (kind === 'cashier') {
      this.cashier = new Worker(this.scene, COLORS.cashier)
      this.cashier.position.set(LAYOUT.cashierSpot.x, 0, LAYOUT.cashierSpot.z)
      this.cashier.facing = 0 // toward the customers
      this.shop.cashier = true
      this.progress.cashiers++
    } else {
      const w = new Worker(this.scene, COLORS.hunter)
      w.position.set(LAYOUT.lodgeDoor.x, 0, LAYOUT.lodgeDoor.z)
      const hunter = new Hunter(w, s.get('hunterHp'))
      this.scene.add(hunter.bar.root)
      this.hunters.push(hunter)
      this.depot.showZone()
      this.progress.hunters++
    }
    audio.play('appear')
  }

  // A bear a hunter killed: the hunter takes the meat it can carry. Returns how many pieces fell to the ground.
  hunterKill(by: Fighter, meat: number): number {
    const hunter = this.hunters.find((h) => h === by)
    return hunter ? hunter.collect(meat, this.stats.count('hunterLoad')) : meat
  }

  isHunter(f: Fighter | null): boolean {
    return f !== null && this.hunters.some((h) => h === f)
  }

  update(dt: number, herd: BearHerd, camera: Camera, danger: boolean): void {
    const speed = this.stats.get('workerSpeed')
    for (const c of this.couriers) c.update(dt, speed)
    for (const h of this.hunters) h.update(dt, this.stats, herd, this.depot, camera, danger)
    this.cashier?.updateLook()
  }
}

// How much meat a bear drops, for hunters and the player alike.
export function bearMeat(bonus: number): number {
  return MathUtils.randInt(BEAR.meatMin, BEAR.meatMax) + bonus
}
