import type { Stats } from '../game/Stats.ts'
import { isSweepUnlocked, type Progress } from '../systems/progression.ts'
import type { PadPricing } from '../systems/UnlockPad.ts'
import { PAD } from './balance.ts'

// One upgrade pad: what it is called, what it costs, what it changes and when it appears.
// Adding an upgrade to the game means adding one entry here.
export interface UpgradeDef {
  id: string
  title: string
  at: { x: number; z: number }
  reward: (level: number) => string // text for the next purchase; level = purchases so far
  pricing: PadPricing
  apply: (stats: Stats, level: number) => void // level = the new level after buying
  unlocked: (progress: Progress) => boolean // once true, the pad stays
}

function pricing(baseCost: number, costGrowth: number, maxLevel?: number): PadPricing {
  return { baseCost, costGrowth, maxLevel, size: PAD.size, drainSeconds: PAD.drainSeconds, minDrainPerSec: PAD.minDrainPerSec }
}

export const UPGRADES: UpgradeDef[] = [
  {
    id: 'capacity',
    title: 'KAPASİTE',
    at: { x: 4.4, z: -1 },
    reward: () => '+5',
    pricing: pricing(50, 1.25),
    apply: (s) => s.add('carryCapacity', 5),
    unlocked: () => true,
  },
  {
    id: 'sweep',
    title: 'GENİŞ SAVURUŞ',
    at: { x: -4.4, z: -1 },
    // The first purchase jumps from 1 to 3 bears per swing; each next one adds a bear, up to 6.
    reward: (level) => (level === 0 ? '3 AYI' : '+1 AYI'),
    pricing: pricing(120, 1.6, 4),
    apply: (s, level) => s.add('attackTargets', level === 1 ? 2 : 1),
    unlocked: isSweepUnlocked,
  },
  {
    id: 'furnaceSlots',
    title: 'OCAK YUVASI',
    at: { x: -4.4, z: -4.6 },
    reward: () => '+1 YUVA',
    pricing: pricing(80, 2.0, 3),
    apply: (s) => s.add('furnaceSlots', 1),
    unlocked: (p) => p.customersServed >= 3,
  },
  {
    id: 'counter',
    title: 'TEZGÂH',
    at: { x: 4.4, z: -4.6 },
    reward: () => '+4',
    pricing: pricing(60, 1.5, 5),
    apply: (s) => s.add('counterCapacity', 4),
    unlocked: (p) => p.customersServed >= 6,
  },
  {
    id: 'price',
    title: 'ET FİYATI',
    at: { x: 4.4, z: 2.8 },
    reward: () => '+$1',
    pricing: pricing(100, 1.45, 8),
    apply: (s) => s.add('meatPrice', 1),
    unlocked: (p) => p.customersServed >= 10,
  },
]
