import { BoxGeometry, Mesh, MeshLambertMaterial, Vector3, type Camera, type Object3D, type Scene } from 'three'
import { audio } from '../audio/Audio.ts'
import { FURNACE } from '../config/balance.ts'
import { COLORS, LAYOUT } from '../config/world.ts'
import { createMeat } from '../entities/Meat.ts'
import type { Player } from '../entities/Player.ts'
import { Flights } from '../fx/Flights.ts'
import { HpBar } from '../fx/HpBar.ts'
import { dashedRing } from '../fx/markers.ts'
import { flatDistance } from '../game/math.ts'
import type { Stats } from '../game/Stats.ts'
import { addObstacle } from '../world/bounds.ts'
import type { Stack } from './Stack.ts'

const PALLET_TOP = 0.3
const PIECE_HEIGHT = 0.26
const PER_LAYER = 4 // pieces lie 2 × 2 on each layer of the tray and the shelf

interface Slot {
  cooking: boolean
  t: number // 0 → 1 while cooking; stays at 1 while the shelf is full
  bar: HpBar
}

// The furnace station. One dashed circle does both jobs: standing in it pours the raw meat from the
// stack onto the tray and picks the cooked meat up from the shelf. Carrying it to the counter is the
// player's job until a waiter is hired.
export class Furnace {
  private scene: Scene
  private flights = new Flights()
  private tray: Object3D[] = [] // raw pieces waiting; the last one is on top
  private shelf: Object3D[] = [] // cooked pieces waiting to be picked up
  private toTray = 0 // pieces flying onto the tray
  private toShelf = 0 // pieces flying onto the shelf
  private unloadTimer = 0
  private pickupTimer = 0
  private slots: Slot[] = []
  private body: Mesh
  private fireMat: MeshLambertMaterial
  private out = new Vector3(LAYOUT.furnace.x, 1.9, LAYOUT.furnace.z)
  private spot = new Vector3()

  constructor(scene: Scene) {
    this.scene = scene
    this.fireMat = new MeshLambertMaterial({ color: COLORS.furnaceFire, emissive: COLORS.furnaceFire, emissiveIntensity: 0.2 })
    this.body = this.build()
  }

  // `cookRate` is 1 normally; the blizzard slows the fire down.
  update(dt: number, player: Player, stack: Stack, stats: Stats, camera: Camera, time: number, cookRate: number): void {
    const inZone = flatDistance(player.position, LAYOUT.furnaceZone) <= FURNACE.zoneRadius
    this.unload(dt, inZone, stack, stats)
    this.pickUp(dt, inZone, stack)
    this.cook(dt * cookRate, stats)

    const busy = this.slots.some((s) => s.cooking && s.t < 1)
    this.body.position.x = LAYOUT.furnace.x + (busy ? Math.sin(time * 50) * 0.025 : 0)
    this.fireMat.emissiveIntensity = busy ? 0.9 + Math.sin(time * 12) * 0.2 : 0.2
    this.slots.forEach((s, i) => {
      this.spot.set(LAYOUT.furnace.x + (i - (this.slots.length - 1) / 2) * 0.55, 0, LAYOUT.furnace.z)
      s.bar.update(s.cooking ? s.t : 0, this.spot, 2.1, camera)
    })
    this.flights.update(dt)
  }

  // Pours the raw part of the stack onto the tray, one piece every few hundredths of a second.
  private unload(dt: number, inZone: boolean, stack: Stack, stats: Stats): void {
    if (!inZone) {
      this.unloadTimer = 0
      return
    }
    this.unloadTimer -= dt
    while (this.unloadTimer <= 0) {
      if (this.tray.length + this.toTray >= stats.count('rackCapacity')) break
      const item = stack.takeTop('raw')
      if (!item) break
      const target = pilePosition(LAYOUT.rack, this.tray.length + this.toTray)
      this.toTray++
      this.flights.add(item, () => target, FURNACE.flightSeconds, 0.7, () => {
        this.toTray--
        this.tray.push(item)
        layoutPile(this.tray, LAYOUT.rack)
      })
      audio.play('pour')
      this.unloadTimer += FURNACE.unloadInterval
    }
  }

  // Cooked pieces jump from the shelf onto the stack while there is room on it.
  private pickUp(dt: number, inZone: boolean, stack: Stack): void {
    if (!inZone) {
      this.pickupTimer = 0
      return
    }
    this.pickupTimer -= dt
    while (this.pickupTimer <= 0 && stack.hasRoom) {
      const item = this.shelf.pop()
      if (!item) break
      stack.receive(item)
      this.pickupTimer += FURNACE.pickupInterval
    }
  }

  private cook(dt: number, stats: Stats): void {
    const want = stats.count('furnaceSlots')
    while (this.slots.length < want) {
      const bar = new HpBar(COLORS.progress, 0.45)
      this.scene.add(bar.root)
      this.slots.push({ cooking: false, t: 0, bar })
    }

    for (const slot of this.slots) {
      if (!slot.cooking) {
        const raw = this.tray.pop()
        if (!raw) continue
        raw.removeFromParent()
        slot.cooking = true
        slot.t = 0
        continue
      }
      slot.t = Math.min(1, slot.t + dt / stats.get('cookSeconds'))
      // Done, but it waits inside while the shelf is full.
      if (slot.t < 1 || this.shelf.length + this.toShelf >= stats.count('shelfCapacity')) continue
      const cooked = createMeat('cooked')
      cooked.position.copy(this.out)
      this.scene.add(cooked)
      const target = pilePosition(LAYOUT.shelf, this.shelf.length + this.toShelf)
      this.toShelf++
      this.flights.add(cooked, () => target, 0.3, 0.8, () => {
        this.toShelf--
        this.shelf.push(cooked)
        layoutPile(this.shelf, LAYOUT.shelf)
      })
      audio.play('cooked')
      slot.cooking = false
    }
  }

  private build(): Mesh {
    const metal = new MeshLambertMaterial({ color: COLORS.machine })
    const body = new Mesh(new BoxGeometry(2, 1.7, 1.8), metal)
    body.position.set(LAYOUT.furnace.x, 0.85, LAYOUT.furnace.z)
    body.castShadow = true
    // The glowing mouth faces the camera (+z), so the fire is visible while cooking.
    const mouth = new Mesh(new BoxGeometry(1.2, 0.6, 0.1), this.fireMat)
    mouth.position.set(0, -0.2, 0.91)
    const chimney = new Mesh(new BoxGeometry(0.4, 0.8, 0.4), metal)
    chimney.position.set(0.55, 1.2, -0.45)
    body.add(mouth, chimney)

    const wood = new MeshLambertMaterial({ color: COLORS.counter })
    for (const at of [LAYOUT.rack, LAYOUT.shelf]) {
      const pallet = new Mesh(new BoxGeometry(1.5, PALLET_TOP, 1.4), wood)
      pallet.position.set(at.x, PALLET_TOP / 2, at.z)
      pallet.receiveShadow = true
      this.scene.add(pallet)
    }

    this.scene.add(body, dashedRing(LAYOUT.furnaceZone.x, LAYOUT.furnaceZone.z, FURNACE.zoneRadius))
    addObstacle(LAYOUT.furnace, 2, 1.8)
    addObstacle(LAYOUT.rack, 1.5, 1.4)
    addObstacle(LAYOUT.shelf, 1.5, 1.4)
    return body
  }
}

// Where the n-th piece of a pile sits on a pallet: 2 × 2 per layer, layers stacking up.
function pilePosition(at: { x: number; z: number }, index: number): Vector3 {
  const inLayer = index % PER_LAYER
  return new Vector3(
    at.x - 0.32 + (inLayer % 2) * 0.64,
    PALLET_TOP + 0.13 + Math.floor(index / PER_LAYER) * PIECE_HEIGHT,
    at.z - 0.3 + Math.floor(inLayer / 2) * 0.6,
  )
}

function layoutPile(items: Object3D[], at: { x: number; z: number }): void {
  items.forEach((item, i) => item.position.copy(pilePosition(at, i)))
}
