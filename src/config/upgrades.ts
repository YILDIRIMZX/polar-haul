import type { Stats } from '../game/Stats.ts'
import { isSweepUnlocked, type Progress } from '../systems/progression.ts'
import type { PadPricing } from '../systems/UnlockPad.ts'
import { PAD } from './balance.ts'

// Shared by both kinds of upgrade.
interface UpgradeBase {
  id: string
  title: string
  reward: (level: number) => string // text for the next purchase; level = purchases so far
  baseCost: number
  costGrowth: number
  maxLevel?: number
  apply: (stats: Stats, level: number) => void // level = the new level after buying
  unlocked: (progress: Progress) => boolean // once true, it stays available
}

// Bought from the character menu, anywhere.
export interface CharacterUpgradeDef extends UpgradeBase {
  lockedText?: string // shown in the menu while `unlocked` is false
}

export type StationId = 'furnace' | 'counter' | 'shop'

// Bought on a pad next to its station. Up to two pads stand by a station at once.
export interface StationUpgradeDef extends UpgradeBase {
  station: StationId
}

export function priceFor(def: UpgradeBase, level: number): number {
  return Math.round(def.baseCost * def.costGrowth ** level)
}

export function padPricing(def: UpgradeBase): PadPricing {
  return {
    baseCost: def.baseCost,
    costGrowth: def.costGrowth,
    maxLevel: def.maxLevel,
    size: PAD.size,
    drainSeconds: PAD.drainSeconds,
    minDrainPerSec: PAD.minDrainPerSec,
  }
}

const always = (): boolean => true

export const CHARACTER_UPGRADES: CharacterUpgradeDef[] = [
  {
    id: 'capacity',
    title: 'Taşıma kapasitesi',
    reward: () => '+5 parça',
    baseCost: 50,
    costGrowth: 1.25,
    maxLevel: 10,
    apply: (s) => s.add('carryCapacity', 5),
    unlocked: always,
  },
  {
    id: 'damage',
    title: 'Hasar',
    reward: () => '+4 hasar',
    baseCost: 80,
    costGrowth: 1.35,
    maxLevel: 10,
    apply: (s) => s.add('attackDamage', 4),
    unlocked: always,
  },
  {
    id: 'speed',
    title: 'Hareket hızı',
    reward: () => '+%7 hız',
    baseCost: 60,
    costGrowth: 1.4,
    maxLevel: 6,
    apply: (s) => s.add('moveSpeed', 0.5),
    unlocked: always,
  },
  {
    id: 'hp',
    title: 'Can',
    reward: () => '+20 can',
    baseCost: 70,
    costGrowth: 1.3,
    maxLevel: 8,
    apply: (s) => s.add('maxHp', 20),
    unlocked: always,
  },
  {
    id: 'pickup',
    title: 'Toplama yarıçapı',
    reward: () => '+0,4 birim',
    baseCost: 50,
    costGrowth: 1.3,
    maxLevel: 5,
    apply: (s) => s.add('pickupRadius', 0.4),
    unlocked: always,
  },
  {
    // Moves to the first main boss in 0.7.0; until then it is bought here once unlocked.
    id: 'sweep',
    title: 'Geniş savuruş',
    reward: (level) => (level === 0 ? 'Aynı anda 3 ayı' : '+1 ayı'),
    baseCost: 120,
    costGrowth: 1.6,
    maxLevel: 4,
    apply: (s, level) => s.add('attackTargets', level === 1 ? 2 : 1),
    unlocked: isSweepUnlocked,
    lockedText: '$100 kazan ve 20 ayı avla',
  },
]

export const STATION_UPGRADES: StationUpgradeDef[] = [
  {
    id: 'furnaceSlots',
    station: 'furnace',
    title: 'OCAK YUVASI',
    reward: () => '+1 YUVA',
    baseCost: 80,
    costGrowth: 2.0,
    maxLevel: 3,
    apply: (s) => s.add('furnaceSlots', 1),
    unlocked: (p) => p.customersServed >= 3,
  },
  {
    id: 'cookSpeed',
    station: 'furnace',
    title: 'PİŞİRME HIZI',
    reward: () => '+%12',
    baseCost: 100,
    costGrowth: 1.6,
    maxLevel: 5,
    apply: (s) => s.multiply('cookSeconds', -0.12),
    unlocked: (p) => p.baseLevel >= 2,
  },
  {
    id: 'shelf',
    station: 'furnace',
    title: 'OCAK RAFI',
    reward: () => '+6',
    baseCost: 60,
    costGrowth: 1.5,
    maxLevel: 4,
    apply: (s) => s.add('shelfCapacity', 6),
    unlocked: (p) => p.baseLevel >= 2,
  },
  {
    id: 'counter',
    station: 'counter',
    title: 'TEZGÂH',
    reward: () => '+4',
    baseCost: 60,
    costGrowth: 1.5,
    maxLevel: 5,
    apply: (s) => s.add('counterCapacity', 4),
    unlocked: (p) => p.customersServed >= 6,
  },
  {
    id: 'price',
    station: 'shop',
    title: 'ET FİYATI',
    reward: () => '+$1',
    baseCost: 100,
    costGrowth: 1.45,
    maxLevel: 8,
    apply: (s) => s.add('meatPrice', 1),
    unlocked: (p) => p.customersServed >= 10,
  },
  {
    id: 'queue',
    station: 'shop',
    title: 'SIRA',
    reward: () => '+1 KİŞİ',
    baseCost: 120,
    costGrowth: 1.6,
    maxLevel: 4,
    apply: (s) => s.add('queueLength', 1),
    unlocked: (p) => p.baseLevel >= 2,
  },
  {
    id: 'customerRate',
    station: 'shop',
    title: 'MÜŞTERİ SIKLIĞI',
    reward: () => '+%10',
    baseCost: 150,
    costGrowth: 1.6,
    maxLevel: 4,
    apply: (s) => s.multiply('customerInterval', -0.1),
    unlocked: (p) => p.baseLevel >= 3,
  },
]
