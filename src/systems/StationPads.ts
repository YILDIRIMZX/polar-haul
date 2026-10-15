import type { Scene } from 'three'
import { padPricing, STATION_UPGRADES, type StationId, type StationUpgradeDef, type WorkerKind } from '../config/upgrades.ts'
import { LAYOUT } from '../config/world.ts'
import type { Player } from '../entities/Player.ts'
import type { Stats } from '../game/Stats.ts'
import type { Progress } from './progression.ts'
import { UnlockPad } from './UnlockPad.ts'
import type { Wallet } from './Wallet.ts'

interface Track {
  def: StationUpgradeDef
  pad: UnlockPad
  unlocked: boolean
}

// The upgrade pads next to each station. A station has two spots; the first two tracks that are unlocked
// and not maxed stand on them, in the order they are listed in config/upgrades.ts. When a pad reaches its
// last level it leaves, and the next track moves into the free spot. The base never fills up with pads.
export class StationPads {
  private tracks: Track[]

  // `onHire` takes the pads that hire a worker instead of changing a value.
  constructor(scene: Scene, stats: Stats, onHire: (kind: WorkerKind) => void) {
    this.tracks = STATION_UPGRADES.map((def) => ({
      def,
      unlocked: false,
      pad: new UnlockPad(scene, {
        at: LAYOUT.stationSlots[def.station][0],
        title: def.title,
        reward: def.reward,
        pricing: padPricing(def),
        apply: (level) => (def.hire ? onHire(def.hire) : def.apply(stats, level)),
        hidden: true,
        vanishWhenMaxed: true,
      }),
    }))
  }

  level(id: string): number {
    return this.tracks.find((t) => t.def.id === id)?.pad.level ?? 0
  }

  update(dt: number, player: Player, wallet: Wallet, progress: Progress): void {
    for (const t of this.tracks) {
      if (!t.unlocked && t.def.unlocked(progress)) t.unlocked = true
    }
    for (const station of Object.keys(LAYOUT.stationSlots) as StationId[]) {
      const spots = LAYOUT.stationSlots[station]
      const active = this.tracks.filter((t) => t.def.station === station && t.unlocked && !t.pad.maxed)
      active.forEach((t, i) => {
        if (i >= spots.length) {
          if (t.pad.shown) t.pad.hide()
          return
        }
        t.pad.moveTo(spots[i])
        if (!t.pad.shown) t.pad.show()
      })
    }
    for (const t of this.tracks) t.pad.update(dt, player, wallet)
  }
}
