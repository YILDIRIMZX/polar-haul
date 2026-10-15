import {
  Group,
  Sprite,
  Vector3,
  type Object3D,
  type Scene,
} from 'three'
import { audio } from '../audio/Audio.ts'
import { FURNACE } from '../config/balance.ts'
import { LAYOUT } from '../config/world.ts'
import { createMeat } from '../looks/meat.ts'
import type { Player } from '../entities/Player.ts'
import { Flights } from '../fx/Flights.ts'
import { dashedRing } from '../fx/markers.ts'
import { flatDistance } from '../game/math.ts'
import type { Stats } from '../game/Stats.ts'
import { addObstacle } from '../world/bounds.ts'
import { DEPOT_FLOOR, depotShed } from '../looks/camp.ts'
import { warningSign } from '../looks/signs.ts'
import type { Stack } from './Stack.ts'

const PIECE_HEIGHT = 0.26
const PER_ROW = 3 // pieces lie 3 × 3 on each layer

// The gate depot: a raised store just inside the front gate where raw meat piles up. It stands on splayed
// legs because the smell of stored meat draws bears, and a bear cannot climb legs that lean outward. Hunters unload on it, the player
// can drop raw meat in the dashed circle beside it, and the carrier takes it from here to the furnace.
// It is built at base level 2; until then it does not exist.
export class Depot {
  built = false
  private scene: Scene
  private pile: Object3D[] = []
  private incoming = 0 // pieces flying onto the pile
  private flights = new Flights()
  private dropTimer = 0
  private zone: Group | null = null
  private sign: Sprite | null = null
  private wasFull = false
  private clock = 0

  constructor(scene: Scene) {
    this.scene = scene
  }

  get count(): number {
    return this.pile.length
  }

  hasRoom(stats: Stats): boolean {
    return this.pile.length + this.incoming < stats.count('depotCapacity')
  }

  // The shed appears; called when its building site is finished.
  build(): Group {
    this.built = true
    const shed = depotShed()
    shed.position.set(LAYOUT.depot.x, 0, LAYOUT.depot.z)
    this.sign = warningSign('DEPO DOLU')
    this.sign.position.set(LAYOUT.depot.x, 5.2, LAYOUT.depot.z)
    this.scene.add(shed, this.sign)
    addObstacle(LAYOUT.depot, 2.6, 2.4)
    return shed
  }

  // The player's drop circle is shown only once someone takes the meat on to the furnace.
  showZone(): void {
    if (this.zone) return
    this.zone = dashedRing(LAYOUT.depotZone.x, LAYOUT.depotZone.z, FURNACE.zoneRadius)
    this.scene.add(this.zone)
  }

  // A piece already in the scene flies onto the pile.
  receive(mesh: Object3D): void {
    const target = pilePosition(this.pile.length + this.incoming)
    this.incoming++
    this.flights.add(mesh, () => target, FURNACE.flightSeconds, 0.7, () => {
      this.incoming--
      this.pile.push(mesh)
      this.layout()
    })
  }

  // Test panel: raw pieces appear on the pile at once, up to its capacity.
  fill(count: number, stats: Stats): void {
    for (let i = 0; i < count && this.hasRoom(stats); i++) {
      const piece = createMeat('raw')
      piece.position.set(LAYOUT.depot.x, 3, LAYOUT.depot.z)
      this.scene.add(piece)
      this.receive(piece)
    }
  }

  // The top piece, for the carrier; null when the pile is empty.
  take(): Object3D | null {
    return this.pile.pop() ?? null
  }

  update(dt: number, player: Player, stack: Stack, stats: Stats): void {
    this.flights.update(dt)
    this.showFull(dt, stats)
    if (!this.zone || flatDistance(player.position, LAYOUT.depotZone) > FURNACE.zoneRadius) {
      this.dropTimer = 0
      return
    }
    this.dropTimer -= dt
    while (this.dropTimer <= 0 && this.hasRoom(stats)) {
      const piece = stack.takeTop('raw')
      if (!piece) break
      this.receive(piece)
      audio.play('pour')
      this.dropTimer += FURNACE.unloadInterval
    }
  }

  // While the depot is full a red sign pulses over it, so the player sees why the hunters are waiting
  // and what the depot upgrade is for.
  private showFull(dt: number, stats: Stats): void {
    if (!this.sign) return
    const full = !this.hasRoom(stats)
    if (full && !this.wasFull) audio.play('full')
    this.wasFull = full
    this.sign.visible = full
    if (!full) return
    this.clock += dt
    const s = 1 + Math.sin(this.clock * 5) * 0.06
    this.sign.scale.set(3.8 * s, 0.95 * s, 1)
  }

  private layout(): void {
    this.pile.forEach((piece, i) => piece.position.copy(pilePosition(i)))
  }
}

function pilePosition(index: number): Vector3 {
  const inLayer = index % (PER_ROW * PER_ROW)
  return new Vector3(
    LAYOUT.depot.x - 0.62 + (inLayer % PER_ROW) * 0.62,
    DEPOT_FLOOR + 0.13 + Math.floor(index / (PER_ROW * PER_ROW)) * PIECE_HEIGHT,
    LAYOUT.depot.z - 0.55 + Math.floor(inLayer / PER_ROW) * 0.55,
  )
}

