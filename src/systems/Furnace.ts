import { BoxGeometry, Mesh, MeshLambertMaterial, Vector3, type Camera, type Object3D, type Scene } from 'three'
import { FURNACE } from '../config/balance.ts'
import { COLORS, LAYOUT } from '../config/world.ts'
import { createMeat } from '../entities/Meat.ts'
import type { Player } from '../entities/Player.ts'
import { Flights } from '../fx/Flights.ts'
import { HpBar } from '../fx/HpBar.ts'
import { dashedRing } from '../fx/markers.ts'
import { flatDistance } from '../game/math.ts'
import type { Stats } from '../game/Stats.ts'
import type { Shop } from './Shop.ts'
import type { Stack } from './Stack.ts'

const PALLET_TOP = 0.3
const PIECE_HEIGHT = 0.26
const PER_LAYER = 4 // raw pieces lie 2 × 2 on each layer of the tray

interface Slot {
  cooking: boolean
  t: number // 0 → 1 while cooking; stays at 1 while the counter is full
  bar: HpBar
}

// The furnace: the player pours the raw stack onto its tray, it cooks a piece in every slot at once
// and sends each cooked piece to the counter.
export class Furnace {
  private scene: Scene
  private flights = new Flights()
  private rack: Object3D[] = [] // raw pieces waiting on the tray; the last one is on top
  private landing = 0
  private unloadTimer = 0
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

  update(dt: number, player: Player, stack: Stack, stats: Stats, shop: Shop, camera: Camera, time: number): void {
    this.unload(dt, player, stack, stats)
    this.cook(dt, stats, shop)

    const busy = this.slots.some((s) => s.cooking)
    this.body.position.x = LAYOUT.furnace.x + (busy ? Math.sin(time * 50) * 0.025 : 0)
    this.fireMat.emissiveIntensity = busy ? 0.9 + Math.sin(time * 12) * 0.2 : 0.2
    this.slots.forEach((s, i) => {
      this.spot.set(LAYOUT.furnace.x + (i - (this.slots.length - 1) / 2) * 0.55, 0, LAYOUT.furnace.z)
      s.bar.update(s.cooking ? s.t : 0, this.spot, 2.1, camera)
    })
    this.flights.update(dt)
  }

  // Pours the player's stack onto the tray, one piece every few hundredths of a second, until the tray is full.
  private unload(dt: number, player: Player, stack: Stack, stats: Stats): void {
    if (flatDistance(player.position, LAYOUT.dropZone) > FURNACE.dropZoneRadius) {
      this.unloadTimer = 0
      return
    }
    this.unloadTimer -= dt
    while (this.unloadTimer <= 0) {
      if (this.rack.length + this.landing >= stats.count('rackCapacity')) break
      const item = stack.takeTop()
      if (!item) break
      const target = this.rackPosition(this.rack.length + this.landing)
      this.landing++
      this.flights.add(item, () => target, FURNACE.flightSeconds, 0.7, () => {
        this.landing--
        this.rack.push(item)
        this.layoutRack()
      })
      this.unloadTimer += FURNACE.unloadInterval
    }
  }

  private cook(dt: number, stats: Stats, shop: Shop): void {
    const want = stats.count('furnaceSlots')
    while (this.slots.length < want) {
      const bar = new HpBar(COLORS.progress, 0.45)
      this.scene.add(bar.root)
      this.slots.push({ cooking: false, t: 0, bar })
    }

    for (const slot of this.slots) {
      if (!slot.cooking) {
        const raw = this.rack.pop()
        if (!raw) continue
        raw.removeFromParent()
        slot.cooking = true
        slot.t = 0
        continue
      }
      slot.t = Math.min(1, slot.t + dt / stats.get('cookSeconds'))
      // Done, but it waits inside while the counter is full.
      if (slot.t < 1 || !shop.counterHasRoom(stats)) continue
      const cooked = createMeat('cooked')
      cooked.position.copy(this.out)
      this.scene.add(cooked)
      shop.receiveCooked(cooked)
      slot.cooking = false
    }
  }

  private rackPosition(index: number): Vector3 {
    const inLayer = index % PER_LAYER
    return new Vector3(
      LAYOUT.rack.x - 0.32 + (inLayer % 2) * 0.64,
      PALLET_TOP + 0.13 + Math.floor(index / PER_LAYER) * PIECE_HEIGHT,
      LAYOUT.rack.z - 0.3 + Math.floor(inLayer / 2) * 0.6,
    )
  }

  private layoutRack(): void {
    this.rack.forEach((item, i) => item.position.copy(this.rackPosition(i)))
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

    const pallet = new Mesh(new BoxGeometry(1.5, PALLET_TOP, 1.4), new MeshLambertMaterial({ color: COLORS.counter }))
    pallet.position.set(LAYOUT.rack.x, PALLET_TOP / 2, LAYOUT.rack.z)
    pallet.receiveShadow = true

    this.scene.add(body, pallet, dashedRing(LAYOUT.dropZone.x, LAYOUT.dropZone.z, FURNACE.dropZoneRadius))
    return body
  }
}
