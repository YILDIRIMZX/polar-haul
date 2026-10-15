import type { DecorKind } from '../looks/decor.ts'

// The camp's clutter: where each piece stands and when it shows up. Nothing here changes the rules; it only
// fills the free ground between the walking paths so the camp looks lived in, and grows with it.
//
// Each spot keeps to the layout rules in world.ts: off the road, 0.4 from anything else (players walk around
// it), never on a pad or a worker's path, and inside the wall at the level it shows up. A spot can wait for a
// building, so the crates by the depot only come once the depot stands.

export type DecorAfter = 'depot' | 'lodge' | 'dryingRack' | 'iceCellar'

export interface DecorSpot {
  look: DecorKind
  at: { x: number; z: number }
  quarterTurns?: 0 | 1 | 2 | 3 // turned this many times by 90°, so its footprint stays a box
  level: number // the base level it shows up at
  after?: DecorAfter // and only once this building stands
}

export const DECOR: readonly DecorSpot[] = [
  // Base level 1: a camp just pitched.
  { look: 'sled', at: { x: 3.6, z: 1.4 }, level: 1 }, // left by the road, the day the camp was pitched
  { look: 'crates', at: { x: 3.4, z: 9.6 }, level: 1 }, // goods waiting by the till
  { look: 'barrel', at: { x: -2.4, z: 9.4 }, level: 1 }, // at the end of the counter
  // Base level 2: the camp stays for the winter.
  { look: 'logStack', at: { x: -12.2, z: 6.4 }, level: 2 }, // logs for the stockade
  { look: 'snowPile', at: { x: 12.4, z: 5.6 }, level: 2 }, // shovelled off the paths
  { look: 'sled', at: { x: 5.4, z: -12.6 }, level: 2 }, // by the front gate, for hauling meat
  // Base level 3: the hunters settle in.
  { look: 'firewood', at: { x: -15, z: -1.8 }, level: 3, after: 'lodge' },
]
