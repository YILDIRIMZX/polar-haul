import { BoxGeometry, Mesh, MeshBasicMaterial, MeshLambertMaterial, RingGeometry, Vector3, type Object3D, type Scene } from 'three'
import { PROCESSOR } from '../config/balance.ts'
import { COLORS, LAYOUT } from '../config/world.ts'
import type { Player } from '../entities/Player.ts'
import { Flights } from '../fx/Flights.ts'
import { flatDistance } from '../game/math.ts'
import type { Stack } from './Stack.ts'
import type { Wallet } from './Wallet.ts'

const BELT_Y = 0.75
const TABLE_TOP = 0.7
const cashGeo = new BoxGeometry(0.55, 0.14, 0.32)
const cashMat = new MeshLambertMaterial({ color: COLORS.cash })

interface BeltItem {
  mesh: Object3D
  t: number // 0 at the start of the belt, 1 at the machine
}

// Drop zone → conveyor → machine → cash on the table → the player's wallet.
export class Processor {
  private scene: Scene
  private flights = new Flights()
  private belt: BeltItem[] = [] // index 0 is the item nearest the machine
  private landing = 0
  private unloadTimer = 0
  private machineTimer = 0
  private cashTimer = 0
  private cashCount = 0
  private cashMeshes: Mesh[] = []
  private machine: Mesh
  private start = new Vector3(LAYOUT.conveyorStart.x, BELT_Y, LAYOUT.conveyorStart.z)
  private end = new Vector3(LAYOUT.conveyorEnd.x, BELT_Y, LAYOUT.conveyorEnd.z)
  private length = this.start.distanceTo(this.end)
  private playerChest = new Vector3()

  constructor(scene: Scene) {
    this.scene = scene
    this.machine = this.build()
  }

  update(dt: number, player: Player, stack: Stack, wallet: Wallet, time: number): void {
    this.playerChest.set(player.position.x, 1.2, player.position.z)
    this.unload(dt, player, stack)
    this.moveBelt(dt)
    this.runMachine(dt, time)
    this.collectCash(dt, player, wallet)
    this.flights.update(dt)
  }

  private unload(dt: number, player: Player, stack: Stack): void {
    if (flatDistance(player.position, LAYOUT.dropZone) > PROCESSOR.dropZoneRadius) {
      this.unloadTimer = 0
      return
    }
    this.unloadTimer -= dt
    while (this.unloadTimer <= 0) {
      // Wait while an item is still flying or the start of the belt is occupied.
      const last = this.belt[this.belt.length - 1]
      if (this.landing > 0 || (last && last.t * this.length < PROCESSOR.conveyorSpacing)) break
      const item = stack.takeTop()
      if (!item) break
      this.landing++
      this.flights.add(item, () => this.start, PROCESSOR.unloadFlightSeconds, 0.8, () => {
        this.landing--
        this.belt.push({ mesh: item, t: 0 })
      })
      this.unloadTimer += PROCESSOR.unloadInterval
    }
  }

  private moveBelt(dt: number): void {
    const step = (PROCESSOR.conveyorSpeed * dt) / this.length
    const gap = PROCESSOR.conveyorSpacing / this.length
    this.belt.forEach((item, i) => {
      const limit = i === 0 ? 1 : this.belt[i - 1].t - gap
      item.t = Math.max(item.t, Math.min(item.t + step, limit))
      item.mesh.position.lerpVectors(this.start, this.end, item.t)
    })
  }

  private runMachine(dt: number, time: number): void {
    if (this.machineTimer > 0) {
      this.machineTimer -= dt
      this.machine.position.x = LAYOUT.machine.x + Math.sin(time * 60) * 0.03
      if (this.machineTimer <= 0) this.addCash()
      return
    }
    this.machine.position.x = LAYOUT.machine.x
    const front = this.belt[0]
    if (!front || front.t < 1) return
    this.belt.shift()
    front.mesh.removeFromParent()
    this.machineTimer = PROCESSOR.secondsPerItem
  }

  private addCash(): void {
    this.cashCount++
    this.layoutCash()
  }

  // Shows up to maxVisibleCash bundles stacked on the table, 2 × 3 per layer.
  private layoutCash(): void {
    const visible = Math.min(this.cashCount, PROCESSOR.maxVisibleCash)
    while (this.cashMeshes.length < visible) {
      const i = this.cashMeshes.length
      const m = new Mesh(cashGeo, cashMat)
      m.castShadow = true
      m.position.set(
        LAYOUT.cashPile.x - 0.3 + (i % 2) * 0.6,
        TABLE_TOP + 0.07 + Math.floor(i / 6) * 0.14,
        LAYOUT.cashPile.z - 0.36 + (Math.floor(i / 2) % 3) * 0.36,
      )
      this.scene.add(m)
      this.cashMeshes.push(m)
    }
  }

  private collectCash(dt: number, player: Player, wallet: Wallet): void {
    if (this.cashCount === 0 || flatDistance(player.position, LAYOUT.cashPile) > PROCESSOR.cashPickupRadius) {
      this.cashTimer = 0
      return
    }
    this.cashTimer -= dt
    while (this.cashTimer <= 0 && this.cashCount > 0) {
      this.cashTimer += PROCESSOR.cashPickupInterval
      this.cashCount--
      wallet.add(PROCESSOR.cashPerItem)
      if (this.cashMeshes.length > this.cashCount) {
        const m = this.cashMeshes.pop()
        if (m) this.flights.add(m, () => this.playerChest, 0.2, 0.6, () => m.removeFromParent())
      }
    }
  }

  private build(): Mesh {
    const r = PROCESSOR.dropZoneRadius
    const dashMat = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })
    const dashes = 12
    for (let k = 0; k < dashes; k++) {
      const arc = (Math.PI * 2) / dashes
      const dash = new Mesh(new RingGeometry(r - 0.12, r, 6, 1, k * arc, arc * 0.6), dashMat)
      dash.rotation.x = -Math.PI / 2
      dash.position.set(LAYOUT.dropZone.x, 0.03, LAYOUT.dropZone.z)
      this.scene.add(dash)
    }

    const beltMat = new MeshLambertMaterial({ color: COLORS.belt })
    const belt = new Mesh(new BoxGeometry(this.length + 0.6, 0.6, 1.0), beltMat)
    belt.position.set((this.start.x + this.end.x) / 2, 0.3, this.start.z)
    belt.castShadow = true
    belt.receiveShadow = true

    const machineMat = new MeshLambertMaterial({ color: COLORS.machine })
    const machine = new Mesh(new BoxGeometry(1.8, 1.6, 1.8), machineMat)
    machine.position.set(LAYOUT.machine.x, 0.8, LAYOUT.machine.z)
    machine.castShadow = true
    const hopper = new Mesh(new BoxGeometry(1.4, 0.3, 1.4), new MeshLambertMaterial({ color: COLORS.machineTop }))
    hopper.position.y = 0.95
    machine.add(hopper)

    const table = new Mesh(new BoxGeometry(1.6, TABLE_TOP, 1.3), machineMat)
    table.position.set(LAYOUT.cashPile.x, TABLE_TOP / 2, LAYOUT.cashPile.z)
    table.castShadow = true
    table.receiveShadow = true

    this.scene.add(belt, machine, table)
    return machine
  }
}
