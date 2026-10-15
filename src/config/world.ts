// Every number that shapes the world lives here, so tuning never means hunting through code.

export const WORLD = {
  groundSize: 220,
  startBaseRadius: 12, // the fence grows with the base level (BASE_LEVELS in balance.ts)
  maxBaseRadius: 22,
  gateWidth: 4.5, // both gates: the front one toward the bears (-z), the back one for customers (+z)
  fencePostSpacing: 1.6,
  fenceHeight: 1.1,
  snowMounds: 140,
  treeSpacing: 2.3, // distance between pines along the forest edge
  treeRows: 3, // rows of pines outside the play area
} as const

// Where things stand. The base is centred on (0, 0); the front gate and the bears are toward -z,
// the back gate and the customers toward +z. Stations stay within about ±5 on x to fit a portrait screen.
export const LAYOUT = {
  playerSpawn: { x: 1.5, z: 1.5 },
  furnace: { x: -4, z: 2.6 },
  // Raw meat comes in from the front gate side, cooked meat leaves on the counter side.
  rack: { x: -4, z: 0.4 }, // the furnace's input tray, where raw meat waits
  shelf: { x: -4, z: 4.8 }, // cooked meat waits here until the player picks it up
  furnaceZone: { x: -1.7, z: 2.6 }, // standing here pours raw meat in and picks cooked meat up
  counter: { x: 0, z: 7.4 },
  serviceSpot: { x: 0, z: 5.9 },
  till: { x: 3.1, z: 7.4 },
  queueFront: { x: 0, z: 8.7 }, // first customer; the queue runs toward +z through the back gate
  customerSpawn: { x: 0, z: 21.5 },
  greatFurnace: { x: -4.6, z: -4.2 }, // the base level building
  trophy: { x: -1.4, z: -4.4 }, // the beaten bosses' keepsakes lie beside the Great Furnace
  // Beside the building, not behind it: the camera looks from +z, so anything at a lower z hides behind it.
  // Away from the path between the front gate and the stations, so nobody walks onto it by accident.
  greatFurnacePad: { x: -7.6, z: -4.2 },
  // Gate depot (base level 2): raw meat waits here just inside the front gate. Hunters drop their meat on
  // it, the player can drop theirs while walking in, and the carrier takes it to the furnace.
  depot: { x: 5, z: -8.6 },
  depotZone: { x: 2.6, z: -8.6 }, // standing here drops the raw meat you carry onto the depot
  // Hunters' lodge (base level 3), in the west, where trees stand until the base grows.
  lodge: { x: -11, z: 4.5 },
  lodgeDoor: { x: -8.6, z: 4.5 },
  westTrees: [
    { x: -10.4, z: 2.6 },
    { x: -12.2, z: 4.4 },
    { x: -10.2, z: 6.4 },
    { x: -12.4, z: 6.9 },
    { x: -11.6, z: 1.6 },
  ],
  // Where each worker stands at either end of its round trip.
  carrierPickup: { x: 3.2, z: -7.2 }, // by the depot
  carrierDrop: { x: -2.4, z: 0.4 }, // by the furnace's raw tray
  waiterPickup: { x: -2.6, z: 4.8 }, // by the furnace's cooked shelf
  waiterDrop: { x: -2.3, z: 7.4 }, // at the end of the counter
  cashierSpot: { x: 1.1, z: 6.1 }, // behind the counter, serving
  hunterDrop: { x: 3, z: -9.4 }, // where hunters unload onto the depot: beside the shed, where the camera sees them
  // Up to two upgrade pads stand next to each station; a maxed pad leaves and the next track takes its place.
  stationSlots: {
    furnace: [
      { x: -7.2, z: 1.4 },
      { x: -7.2, z: 4.0 },
    ],
    counter: [
      { x: -3.2, z: 9.0 },
      { x: -5.8, z: 8.2 },
    ],
    shop: [
      { x: 5.9, z: 5.6 },
      { x: 5.9, z: 8.2 },
    ],
    depot: [
      { x: 8.2, z: -7.6 },
      { x: 8.2, z: -10.2 },
    ],
    lodge: [
      { x: -8.6, z: 8.2 },
      { x: -11.2, z: 9.4 },
    ],
    gate: [
      { x: -4.4, z: -9.4 },
      { x: -6.8, z: -8.2 },
    ],
  },
  // Bears roam just outside the front gate, so the hunt starts a few steps from the base.
  bearField: { minX: -26, maxX: 26, minZ: -46, maxZ: -15 },
  // Nothing walks past this rectangle; a forest edge marks it.
  playArea: { minX: -32, maxX: 32, minZ: -56, maxZ: 22 },
  home: { x: 0, z: 0 },
} as const

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
  rope: 0xe8d9b0,
  dirt: 0xb98d63,
  carrier: 0xe08a2e,
  waiter: 0xf4f4f0,
  cashier: 0x3c9c6a,
  hunter: 0x6b5a3a,
  skin: 0xf1c7a4,
  coats: [0x8a6fc9, 0xd98c3f, 0x4f9d8f, 0xc2556b, 0x6c8fd1],
} as const
