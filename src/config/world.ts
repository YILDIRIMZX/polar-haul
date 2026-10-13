// Every number that shapes the world lives here, so tuning never means hunting through code.

export const WORLD = {
  groundSize: 220,
  baseRadius: 12,
  gateWidth: 4.5,
  fencePostSpacing: 1.6,
  fenceHeight: 1.1,
  snowMounds: 140,
} as const

// Where things stand. The base is centred on (0, 0); the gate and the bears are toward -z.
export const LAYOUT = {
  playerSpawn: { x: 0, z: 3 },
  // Kept within about ±5 on x so everything fits a portrait phone screen at once.
  dropZone: { x: 4.4, z: 6.5 },
  conveyorStart: { x: 2.8, z: 6.5 },
  conveyorEnd: { x: -2.4, z: 6.5 },
  machine: { x: -3.9, z: 6.5 },
  cashPile: { x: -3.9, z: 9.3 },
  capacityPad: { x: 4.4, z: 0 },
  sweepPad: { x: -4.4, z: 0 },
  bearField: { minX: -48, maxX: 48, minZ: -80, maxZ: -16 },
  worldLimit: 95,
} as const

export const CAMERA = {
  fov: 40,
  near: 0.5,
  far: 400,
  maxPixelRatio: 2,
  pitchDeg: 43, // how steeply the camera looks down (90 = straight down)
  distance: 37, // how far the camera sits from the player
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
  bone: 0xf3e9d6,
  machine: 0x5b6670,
  machineTop: 0x2f6fd6,
  belt: 0x3d4650,
  cash: 0x3cb371,
  hpBear: 0xe0453a,
  hpPlayer: 0x4cd964,
} as const
