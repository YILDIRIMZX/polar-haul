// Gameplay numbers. Tune the game here; no other file needs to change.

export const PLAYER = {
  speed: 7,
  radius: 0.5,
  turnSpeed: 12,
  maxHp: 100,
  regenPerSec: 35,
  attackRange: 3,
  attackDamage: 10,
  attackCooldown: 0.4,
  startTargets: 1, // bears hit by one swing until Wide sweep is bought
  pickupRadius: 2.4,
  startCapacity: 10,
} as const

export const BEAR = {
  count: 30,
  maxHp: 30,
  radius: 1.1,
  wanderSpeed: 1.6,
  chaseSpeed: 4.4,
  turnSpeed: 8,
  aggroSeconds: 6,
  attackRange: 2.3,
  attackDamage: 6,
  attackCooldown: 1.1,
  meatMin: 2,
  meatMax: 3,
  respawnSeconds: 4,
  spawnMinDistance: 14,
  wanderReach: 6,
  goalSecondsMin: 2,
  goalSecondsMax: 5,
} as const

export const STACK = {
  headHeight: 2.0,
  itemHeight: 0.3,
  sway: 0.0004, // how far the top leans per unit of speed; grows with the square of the height
  swayFollow: 6,
  pickupSeconds: 0.22,
} as const

export const PROCESSOR = {
  dropZoneRadius: 1.6,
  unloadInterval: 0.07,
  unloadFlightSeconds: 0.16,
  conveyorSpeed: 3.5,
  conveyorSpacing: 0.55,
  secondsPerItem: 0.3,
  cashPerItem: 5,
  cashPickupRadius: 1.8,
  cashPickupInterval: 0.03,
  maxVisibleCash: 60,
} as const

export const CAPACITY_UPGRADE = {
  step: 5,
  baseCost: 50,
  costGrowth: 1.25,
  drainSeconds: 1.2,
  minDrainPerSec: 25,
  size: 2.4,
} as const

// "Wide sweep": locked at first. The first purchase hits 3 bears per swing, each next one adds a bear.
export const SWEEP_UPGRADE = {
  firstTargets: 3,
  step: 1,
  maxLevel: 4, // 3 → 4 → 5 → 6 bears
  baseCost: 120,
  costGrowth: 1.6,
  drainSeconds: 1.5,
  minDrainPerSec: 25,
  size: 2.4,
} as const
