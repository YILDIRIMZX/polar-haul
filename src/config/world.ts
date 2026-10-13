// Every number that shapes the world lives here, so tuning never means hunting through code.

export const WORLD = {
  groundSize: 220,
  baseRadius: 12,
  gateWidth: 4.5,
  fencePostSpacing: 1.6,
  fenceHeight: 1.1,
  snowMounds: 140,
} as const

export const CAMERA = {
  fov: 40,
  near: 0.5,
  far: 400,
  maxPixelRatio: 2,
  pitchDeg: 43, 
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
} as const
