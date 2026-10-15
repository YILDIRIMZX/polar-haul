// Every number that shapes the world lives here, so tuning never means hunting through code.

export const WORLD = {
  groundSize: 220,
  campClearing: 25, // no snow mounds closer than this to the middle: the camp's wall grows into this ground
  gateWidth: 4.5, // both gates: the front one toward the bears (-z), the back one for customers (+z)
  fencePostSpacing: 1.6,
  fenceHeight: 1.1,
  snowMounds: 140,
  treeSpacing: 2.3, // distance between pines along the forest edge
  treeRows: 3, // rows of pines outside the play area
} as const

// Where things stand. The base is centred on (0, 0); the front gate and the bears are toward -z,
// the back gate and the customers toward +z. A road runs from gate to gate (|x| < 1.6) and stays clear.
// The camp is laid out by what each part needs (see TASARIM.md, "Kampın yerleşimi"):
//   north, by the front gate: the gate pads, the gate depot (hunted meat comes in here) and the hunters' lodge;
//   west: the furnace, between the meat coming in and the counter;   south: the shop, by the customers' gate;
//   east: the homes around the Great Furnace, the camp's fire;   south-east: the winter stores, by the till.
// Rules, checked whenever this changes: 0.8 of free ground between any two things (a walking path), nothing
// within 0.8 of the wall at the level it appears, and no pad behind a tall building (the camera looks from +z,
// so anything at a lower z hides behind it).
export const LAYOUT = {
  playerSpawn: { x: 1.5, z: 1.5 },
  furnace: { x: -5, z: 2.4 },
  // Raw meat comes in from the front gate side, cooked meat leaves on the counter side.
  rack: { x: -5, z: 0 }, // the furnace's input tray, where raw meat waits
  shelf: { x: -5, z: 4.8 }, // cooked meat waits here until the player picks it up
  furnaceZone: { x: -2.6, z: 2.4 }, // standing here pours raw meat in and picks cooked meat up
  counter: { x: 0, z: 7.4 },
  serviceSpot: { x: 0, z: 5.9 },
  till: { x: 3.1, z: 7.4 },
  queueFront: { x: 0, z: 8.7 }, // first customer; the queue runs toward +z through the back gate
  customerSpawn: { x: 0, z: 23.5 },
  // The camp's fire: the base level building, among the homes.
  greatFurnace: { x: 6.8, z: -2 },
  greatFurnacePad: { x: 4, z: -2 }, // beside it on the road side, so it never hides behind it, even grown
  trophy: { x: 6.8, z: 1.4 }, // the beaten bosses' keepsakes lie in front of the Great Furnace
  // Gate depot (base level 2): raw meat waits here just inside the front gate. Hunters drop their meat on
  // it, the player can drop theirs while walking in, and the carrier takes it to the furnace.
  depot: { x: -5.4, z: -9 },
  depotZone: { x: -2.6, z: -9 }, // standing here drops the raw meat you carry onto the depot
  // Hunters' lodge (base level 3), between the depot and the forest. A grove stands in front of it until the
  // base grows; its door faces east, toward the path to the front gate.
  lodge: { x: -12.6, z: -4.6 },
  lodgeDoor: { x: -10.4, z: -4.6 },
  westTrees: [
    { x: -10.8, z: -2 },
    { x: -12.2, z: -1 },
    { x: -11.6, z: -3.4 },
    { x: -12, z: 0.8 },
  ],
  // Building sites: where the player pays for each (in front of it, or beside it when the front is too
  // close to the wall). The pad goes once the building stands.
  sitePads: {
    depot: { x: -5.4, z: -6 },
    lodge: { x: -12.6, z: -1.4 },
    dryingRack: { x: 9.6, z: 6 },
    iceCellar: { x: -9.4, z: -8.6 },
  },
  // Where each worker stands at either end of its round trip.
  carrierPickup: { x: -3, z: -7.2 }, // by the depot
  carrierDrop: { x: -3.4, z: 0 }, // by the furnace's raw tray
  waiterPickup: { x: -3.6, z: 4.8 }, // by the furnace's cooked shelf
  waiterDrop: { x: -2.3, z: 7.4 }, // at the end of the counter
  cashierSpot: { x: 1.1, z: 6.1 }, // behind the counter, serving
  // The camp's dwellings, around the fire. The first two become cabins at base level 3; the other two have
  // a pad where the player pays to turn them into cabins.
  dwellings: [
    { x: 6.6, z: -6 },
    { x: 10.8, z: -4 },
    { x: 11.4, z: -0.6 },
    { x: 6.6, z: -9.6 },
  ],
  dwellingPads: [
    { x: 11.4, z: 2.6 },
    { x: 9.8, z: -9.2 },
  ],
  dryingRack: { x: 10.6, z: 8.2 }, // by the till, where the cooked meat is sold
  iceCellar: { x: -9.4, z: -12.2 }, // behind the depot: meat goes from one store to the other
  hunterDrop: { x: -3.4, z: -9.8 }, // where hunters unload onto the depot: beside the shed, where the camera sees them
  // Up to two upgrade pads stand next to each station; a maxed pad leaves and the next track takes its place.
  stationSlots: {
    furnace: [
      { x: -9, z: 1 },
      { x: -9, z: 4.4 },
    ],
    counter: [
      { x: -4.4, z: 9.2 },
      { x: -7.8, z: 9.2 },
    ],
    shop: [
      { x: 6, z: 5.2 },
      { x: 6, z: 8.6 },
    ],
    depot: [
      { x: -5, z: -5.2 },
      { x: -8.4, z: -5.2 },
    ],
    lodge: [
      { x: -12.6, z: -0.6 },
      { x: -12.6, z: 2.8 },
    ],
    gate: [
      { x: 3.2, z: -10.8 },
      { x: 3.2, z: -7.4 },
    ],
  },
  // Bears roam just outside the front gate, so the hunt starts a few steps from the base.
  bearField: { minX: -26, maxX: 26, minZ: -46, maxZ: -15 },
  // Nothing walks past this rectangle; a forest edge marks it.
  playArea: { minX: -32, maxX: 32, minZ: -56, maxZ: 25 },
  home: { x: 0, z: 0 },
} as const

// The camp's wall at each base level, as its corners in order. It is not a ring that just gets bigger: the
// first camp sits behind a ring of snow blocks, and every wall after it is put up around what the camp has
// become, growing toward the buildings that need it (see TASARIM.md, "Kampın yerleşimi"):
//   2: a stockade of stakes, straight runs around the camp and the gate depot;
//   3: the same stockade with a yard pushed out to the west for the hunters' lodge;
//   4: a log fort: wider all round, the ice cellar inside, and a gatehouse jutting out at the front gate with
//      a watchtower on each corner.
// Both gates sit where the wall crosses x = 0 and need a straight run there (at least ±2.6 on x).
export type Outline = readonly { x: number; z: number }[]
const corners = (...xz: number[]): Outline => xz.flatMap((v, i) => (i % 2 ? [] : [{ x: v, z: xz[i + 1] }]))
export const WALL_OUTLINES: Record<number, Outline> = {
  1: snowRing(14),
  2: corners(-8.6, -14.8, 8.4, -14.8, 13.2, -11.6, 14.4, -5, 14.4, 8.4, 11.2, 12.4, -11, 12.4, -14.6, 8.6, -14.6, -8.4),
  3: corners(-8.6, -14.8, 8.4, -14.8, 13.2, -11.6, 14.4, -5, 14.4, 8.4, 11.2, 12.4, -11, 12.4, -14.6, 8.6, -14.6, 5.4, -17.6, 5, -17.6, -8, -14.6, -9.6),
  4: corners(-11.6, -15.6, -4.4, -15.6, -4.4, -17.8, 4.4, -17.8, 4.4, -15.6, 11.6, -15.6, 15.6, -12.4, 16.2, -4, 16.2, 9.6, 12.6, 14, -12.6, 14, -16.2, 10.4, -16.2, 6.4, -19.2, 5.6, -19.2, -9.6, -15.6, -12.4),
}
// The log fort's watchtowers, on the corners of the gatehouse.
export const WALL_TOWERS = [
  { x: -4.4, z: -17.8 },
  { x: 4.4, z: -17.8 },
] as const

// The first camp's snow blocks: a ring, with a straight run at each gate.
function snowRing(radius: number, sides = 40): Outline {
  const gate = 2.8
  const flat = Math.sqrt(radius * radius - gate * gate)
  const points = [
    { x: -gate, z: -flat },
    { x: gate, z: -flat },
    { x: gate, z: flat },
    { x: -gate, z: flat },
  ]
  for (let i = 0; i < sides; i++) {
    const a = (2 * Math.PI * (i + 0.5)) / sides
    const x = radius * Math.cos(a)
    if (Math.abs(x) > gate) points.push({ x, z: radius * Math.sin(a) })
  }
  return points.sort((p, q) => Math.atan2(p.z, p.x) - Math.atan2(q.z, q.x))
}

export const CAMERA = {
  fov: 40,
  near: 0.5,
  far: 400,
  maxPixelRatio: 2,
  pitchDeg: 43, // how steeply the camera looks down (90 = straight down)
  distance: 37, // how far the camera sits from the player
  maxShake: 0.9, // how far a full-strength shake jolts the camera
} as const

export const COLORS = {
  sky: 0xcfe0ea,
  snow: 0xeef3f6,
  snowShade: 0xdfe8ee,
  baseGround: 0xd9a774,
  fenceWood: 0xc9774f,
  player: 0x2f6fd6,
  playerRing: 0x7fe3ff,
  bear: 0xf4f2ec,
  bearNose: 0x1f2b33,
  hitFlash: 0x8a1f1f,
  meat: 0xc4533b,
  cooked: 0x8a4a28,
  bone: 0xf3e9d6,
  machine: 0x5b6670,
  furnaceFire: 0xff8a3d,
  counter: 0x8d6a4f,
  cash: 0x3cb371,
  hpBear: 0xe0453a,
  hpPlayer: 0x4cd964,
  progress: 0xffb347,
  pine: 0x2f5d50,
  pineSnow: 0xf4f8fa,
  trunk: 0x6b4a36,
  stake: 0x8a6a4a,
  snowBlock: 0xe4eef3,
  logWall: 0x7a553a,
  tent: 0xc9b38f,
  rope: 0xe8d9b0,
  dirt: 0xb98d63,
  carrier: 0xe08a2e,
  waiter: 0xf4f4f0,
  cashier: 0x3c9c6a,
  hunter: 0x6b5a3a,
  skin: 0xf1c7a4,
  coats: [0x8a6fc9, 0xd98c3f, 0x4f9d8f, 0xc2556b, 0x6c8fd1],
} as const
