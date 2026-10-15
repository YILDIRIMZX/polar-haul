import type { Group, Scene } from 'three'
import { DECOR, type DecorAfter, type DecorSpot } from '../config/decor.ts'
import { DECOR_FOOTPRINT, DECOR_LOOKS } from '../looks/decor.ts'
import type { Progress } from '../systems/progression.ts'
import { addObstacle } from './bounds.ts'

const POP_SECONDS = 0.4

interface Piece {
  spot: DecorSpot
  group: Group | null // null until it shows up
  pop: number // 0 → 1 while it pops up out of the snow
}

// The camp's clutter (config/decor.ts): each piece pops up once its base level is reached and its building
// stands, and stays. Pieces that block the ground become obstacles, so nobody walks through a crate.
export class Decor {
  private pieces: Piece[]
  private scene: Scene

  constructor(scene: Scene) {
    this.scene = scene
    this.pieces = DECOR.map((spot) => ({ spot, group: null, pop: 0 }))
  }

  update(dt: number, progress: Progress): void {
    for (const piece of this.pieces) {
      if (!piece.group && decorShown(piece.spot, progress)) this.place(piece)
      if (piece.group && piece.pop < 1) {
        piece.pop = Math.min(1, piece.pop + dt / POP_SECONDS)
        const k = piece.pop - 1
        piece.group.scale.setScalar(1 + 2.7 * k * k * k + 1.7 * k * k) // with a small overshoot
      }
    }
  }

  private place(piece: Piece): void {
    const { look, at, quarterTurns = 0 } = piece.spot
    const group = DECOR_LOOKS[look]()
    group.position.set(at.x, 0, at.z)
    group.rotation.y = (quarterTurns * Math.PI) / 2
    group.scale.setScalar(0.001)
    this.scene.add(group)
    piece.group = group
    const foot = DECOR_FOOTPRINT[look]
    if (foot) {
      const across = quarterTurns % 2 === 1
      addObstacle(at, across ? foot.depth : foot.width, across ? foot.width : foot.depth)
    }
  }
}

// What "this building stands" means for each building a piece of clutter can wait for.
const BUILT: Record<DecorAfter, (p: Progress) => boolean> = {
  depot: (p) => p.depotBuilt,
  lodge: (p) => p.lodgeBuilt,
  dryingRack: (p) => p.stores >= 1,
  iceCellar: (p) => p.stores >= 2,
}

// Whether a piece of clutter should be standing, given how far the player has come: its base level is
// reached and, if it waits for a building (spot.after), that building stands.
export function decorShown(spot: DecorSpot, progress: Progress): boolean {
  if (progress.baseLevel < spot.level) return false
  return spot.after === undefined || BUILT[spot.after](progress)
}
