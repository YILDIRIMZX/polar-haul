// Gameplay numbers. Tune the game here; no other file needs to change.

// Every value that upgrades, cards or perks can change. The game reads these through Stats,
// which adds what has been bought on top of these starting values.
export const BASE_STATS = {
  carryCapacity: 10,
  maxHp: 100,
  moveSpeed: 7,
  attackDamage: 10,
  attackTargets: 1,
  attackRange: 3, // how far a swing reaches
  attackCooldown: 0.4, // seconds between swings; lower is faster
  pickupRadius: 2.4,
  rackCapacity: 30, // raw meat the furnace's input tray holds
  furnaceSlots: 1, // pieces cooked at the same time
  cookSeconds: 1.6,
  shelfCapacity: 12, // cooked pieces waiting next to the furnace
  counterCapacity: 8, // cooked pieces the counter holds
  meatPrice: 5,
  queueLength: 6, // customers waiting at once
  customerInterval: 2, // seconds between new customers
  patienceSeconds: 20,
  serveInterval: 0.25, // seconds per piece handed over while serving
} as const

export type StatId = keyof typeof BASE_STATS

// Base levels, raised at the Great Furnace. Level 1 is where the game starts.
// What each level needs besides cash is decided in systems/progression.ts (baseRequirement).
export const BASE_LEVELS = [
  { level: 1, price: 0, fenceRadius: 12 },
  { level: 2, price: 250, fenceRadius: 14 },
  { level: 3, price: 800, fenceRadius: 16 },
] as const

// Fixed numbers that no upgrade changes.
export const PLAYER = {
  radius: 0.5,
  turnSpeed: 12,
  regenPerSec: 35,
} as const

// A normal bear at hunt level 1. HUNT makes them more, tougher and harder-hitting as the level rises.
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

// Hunt level: every kill counts toward it, and each level makes the herd bigger and stronger.
export const HUNT = {
  killsBase: 15, // kills needed to leave level n: killsBase + killsPerLevel × n
  killsPerLevel: 5,
  bearsPerLevel: 2,
  maxBears: 50,
  hpGrowth: 1.12, // bear health × this per level
  damageGrowth: 1.08,
  meatEveryLevels: 2, // +1 meat per bear every this many levels
} as const

// The bosses. Health and damage are multiples of a normal bear at the hunt level the boss arrives on.
export type BossKind = 'mini' | 'elder'

export const BOSSES: Record<BossKind, {
  name: string
  title: string // shown under the name when the boss arrives
  scale: number
  color: number
  hpMultiplier: number
  damageMultiplier: number
  speedMultiplier: number
  attackCooldown: number
  meat: number
}> = {
  mini: { name: 'Dev Ayı', title: 'Hücumcu', scale: 1.6, color: 0xeadfca, hpMultiplier: 10, damageMultiplier: 2.5, speedMultiplier: 0.75, attackCooldown: 1.6, meat: 8 },
  elder: { name: 'Yaşlı Ayı', title: 'Sürünün Lideri', scale: 2.0, color: 0xb8b2a6, hpMultiplier: 16, damageMultiplier: 3, speedMultiplier: 0.7, attackCooldown: 1.8, meat: 14 },
}

// Which boss comes at which hunt level. Hunt levels 6 and 10 get their bosses in 0.8.0.
export const BOSS_SCHEDULE: readonly { huntLevel: number; kind: BossKind }[] = [
  { huntLevel: 2, kind: 'mini' },
  { huntLevel: 3, kind: 'elder' },
  { huntLevel: 4, kind: 'mini' },
  { huntLevel: 7, kind: 'mini' },
  { huntLevel: 9, kind: 'mini' },
]

export const BOSS_FIGHT = {
  timeLimit: 90, // seconds to beat a boss before the blizzard
  returnSeconds: 120, // a boss that got away comes back after this long
  warningSeconds: 2.5, // "Dev Ayı geliyor!" stays on screen this long
  spawnBeyondGate: 9, // the boss appears this far outside the front gate
  aggroRadius: 9, // it charges once the player is this close
} as const

// The bosses' special moves. Every one is marked on the ground before it lands, so it can be dodged.
// Damage values multiply the boss's normal hit.
export const BOSS_MOVES = {
  introSeconds: 2.2, // the camera visits the boss while its name card shows; the world waits
  // Dev Ayı lowers its head, a red lane appears, then it runs down the lane, even from close by, so standing
  // next to it is never safe. Hitting the fence or the edge of the field stuns it, and a stunned boss takes
  // extra damage.
  charge: { maxDistance: 16, windup: 1, speed: 15, length: 16, width: 3, damage: 1.5, stunSeconds: 2, stunDamage: 1.5, recover: 0.6, cooldown: 5 },
  // Yaşlı Ayı sweeps a wide fan in front of it. Once angry it sweeps faster and more often.
  sweep: { radius: 5.5, angle: (120 * Math.PI) / 180, windup: 0.9, angryWindup: 0.65, damage: 1.4, recover: 0.5, cooldown: 3, angryCooldown: 2 },
  // At half health Yaşlı Ayı roars and calls young bears to its side.
  anger: { atHealth: 0.5, roarSeconds: 1.2, cubs: 2, cubScale: 0.8, cubHp: 1.5, color: 0x5a1a10 },
} as const

// The blizzard after a lost boss fight.
export const STORM = {
  seconds: 60,
  patienceRate: 2, // customers lose patience this many times faster
  cookRate: 0.7, // the furnace cooks at this fraction of its speed
  fadeSeconds: 2,
} as const

export const STACK = {
  headHeight: 2.0,
  itemHeight: 0.3,
  sway: 0.0004, // how far the top leans per unit of speed; grows with the square of the height
  swayFollow: 6,
  pickupSeconds: 0.22,
} as const

// The station around the furnace: one circle where raw meat goes in and cooked meat comes out.
export const FURNACE = {
  zoneRadius: 1.4,
  unloadInterval: 0.03, // the raw part of the stack pours onto the tray quickly
  pickupInterval: 0.06, // cooked pieces jump from the shelf onto the stack
  flightSeconds: 0.16,
} as const

export const SHOP = {
  serviceRadius: 1.1,
  counterDropInterval: 0.05, // cooked pieces the player carries move onto the counter
  cashPickupRadius: 1.7,
  cashPickupInterval: 0.03,
  cashPerBundle: 10, // one green bundle on the till stands for this much
  maxVisibleCash: 60,
  walkSpeed: 3,
  queueSpacing: 1.25,
  urgentFromBaseLevel: 3, // urgent customers start coming at this base level
  urgentChance: 0.15, // share of new customers who are urgent
  urgentPay: 2.5, // they pay this many times the normal price…
  urgentPatience: 0.6, // …have this share of the normal patience, and leave without paying when it runs out
} as const

// Shared by every upgrade pad.
export const PAD = {
  size: 2.4,
  drainSeconds: 1.3,
  minDrainPerSec: 25,
  afterPurchasePause: 1, // seconds cash stops after a purchase, so the rest is not spent on the next level by accident
  tickInterval: 0.08, // how often the rising tick sounds while cash flows
} as const
