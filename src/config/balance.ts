// Gameplay numbers. Tune the game here; no other file needs to change.

// Every value that upgrades, cards or perks can change. The game reads these through Stats,
// which adds what has been bought on top of these starting values.
export const BASE_STATS = {
  carryCapacity: 10,
  moveSpeed: 7,
  attackDamage: 10,
  attackTargets: 1,
  pickupRadius: 2.4,
  rackCapacity: 30, // raw meat the furnace's input tray holds
  furnaceSlots: 1, // pieces cooked at the same time
  cookSeconds: 1.6,
  counterCapacity: 8, // cooked pieces the counter holds
  meatPrice: 5,
  queueLength: 3, // customers waiting at once
  customerInterval: 3.5, // seconds between new customers
  patienceSeconds: 20,
  serveInterval: 0.25, // seconds per piece handed over while serving
} as const

export type StatId = keyof typeof BASE_STATS

// Fixed numbers that no upgrade changes.
export const PLAYER = {
  radius: 0.5,
  turnSpeed: 12,
  maxHp: 100,
  regenPerSec: 35,
  attackRange: 3,
  attackCooldown: 0.4,
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

export const FURNACE = {
  dropZoneRadius: 1.4,
  unloadInterval: 0.03, // the whole stack pours onto the tray quickly
  flightSeconds: 0.16,
} as const

export const SHOP = {
  serviceRadius: 1.1,
  cashPickupRadius: 1.7,
  cashPickupInterval: 0.03,
  cashPerBundle: 10, // one green bundle on the till stands for this much
  maxVisibleCash: 60,
  walkSpeed: 3,
  queueSpacing: 1.25,
} as const

// Shared by every upgrade pad.
export const PAD = {
  size: 2.4,
  drainSeconds: 1.3,
  minDrainPerSec: 25,
} as const
