import { Group, Mesh, MeshBasicMaterial, type Scene } from 'three'
import { audio } from '../audio/Audio.ts'
import { DWELLINGS, PAD } from '../config/balance.ts'
import { LAYOUT } from '../config/world.ts'
import type { Player } from '../entities/Player.ts'
import { floatingText } from '../fx/FloatingText.ts'
import type { Stats } from '../game/Stats.ts'
import { addObstacle, removeObstacle, type Box } from '../world/bounds.ts'
import type { Progress } from './progression.ts'
import { UnlockPad } from './UnlockPad.ts'
import { dustPuff } from '../looks/effects.ts'
import { cabin as cabinLook, tent as tentLook } from '../looks/camp.ts'
import type { Wallet } from './Wallet.ts'

const SWAP_SECONDS = 0.7
const AUTO_LEVEL = 3 // the first two tents become cabins at this base level: people now stay for the winter
const PAD_LEVEL = 2 // from this base level the player can pay to turn the other two into cabins

interface Home {
  group: Group
  box: Box
  cabin: boolean
  swap: number // 0 → 1 while the tent folds away and the cabin pops up; 1 when settled
  next: Group | null
}

// The camp's dwellings. They start as tents around the fire. Once the camp has a stockade people begin to
// stay, and the player can pay to give two of the families a log cabin; at base level 3 the winter is long
// enough that the other two build theirs too. Every cabin keeps more people in the camp, and word of a
// lived-in camp draws more survivors to trade: customers come a little more often.
export class Dwellings {
  private homes: Home[] = []
  private pads: UnlockPad[] = []
  private scene: Scene
  private stats: Stats
  private progress: Progress
  private announced = false
  private puffs: { mesh: Mesh; age: number }[] = []

  constructor(scene: Scene, stats: Stats, progress: Progress) {
    this.scene = scene
    this.stats = stats
    this.progress = progress
    for (const at of LAYOUT.dwellings) {
      const group = tentLook()
      group.position.set(at.x, 0, at.z)
      scene.add(group)
      this.homes.push({ group, box: addObstacle(at, 1.8, 1.8), cabin: false, swap: 1, next: null })
    }
    // The last two homes are the player's to turn into cabins.
    LAYOUT.dwellingPads.forEach((at, i) => {
      const home = 2 + i
      this.pads.push(
        new UnlockPad(scene, {
          at,
          title: 'KULÜBE',
          reward: () => '+MÜŞTERİ',
          pricing: { baseCost: DWELLINGS.cabinPrices[i], costGrowth: 1, maxLevel: 1, size: PAD.size, drainSeconds: PAD.drainSeconds, minDrainPerSec: PAD.minDrainPerSec },
          apply: () => this.toCabin(home),
          hidden: true,
          vanishWhenMaxed: true,
        }),
      )
    })
  }

  update(dt: number, player: Player, wallet: Wallet): void {
    const level = this.progress.baseLevel
    for (const pad of this.pads) {
      if (level >= PAD_LEVEL && !pad.shown && !pad.maxed) pad.show()
      pad.update(dt, player, wallet)
    }
    if (level >= AUTO_LEVEL) {
      for (const i of [0, 1]) if (!this.homes[i].cabin) this.toCabin(i)
      if (!this.announced) {
        this.announced = true
        floatingText.spawn('Çadırlar kulübeye dönüşüyor', this.homes[0].group.position.clone().setY(2.6), 'kış uzun, insanlar kalıyor')
      }
    }
    for (const home of this.homes) this.animate(home, dt)
    this.updateDust(dt)
  }

  // Test panel: all four homes become cabins at once.
  allCabins(): void {
    for (const pad of this.pads) pad.buyNow()
    for (const i of [0, 1]) this.toCabin(i)
  }

  private toCabin(i: number): void {
    const home = this.homes[i]
    if (home.cabin) return
    home.cabin = true
    home.swap = 0
    const cabin = cabinLook()
    cabin.position.copy(home.group.position)
    cabin.scale.setScalar(0.01)
    this.scene.add(cabin)
    home.next = cabin
    removeObstacle(home.box)
    home.box = addObstacle(home.group.position, 2.3, 2.1)
    this.stats.multiply('customerInterval', -DWELLINGS.cabinCustomerRate)
    this.progress.cabins++
    audio.play('hammer')
    for (let k = 0; k < 5; k++) this.puff(home.group.position.x, home.group.position.z)
  }

  // The tent folds away and the cabin pops up in its place.
  private animate(home: Home, dt: number): void {
    if (home.swap >= 1 || !home.next) return
    home.swap = Math.min(1, home.swap + dt / SWAP_SECONDS)
    const k = home.swap
    home.group.scale.setScalar(Math.max(0.01, 1 - k * 2))
    const t = Math.max(0, k * 2 - 1) - 1 // the second half: grow with a small overshoot
    home.next.scale.setScalar(Math.max(0.01, 1 + 2.7 * t * t * t + 1.7 * t * t))
    if (k < 1) return
    home.group.removeFromParent()
    home.group = home.next
    home.next = null
  }

  private puff(x: number, z: number): void {
    const mesh = dustPuff()
    mesh.position.set(x + (Math.random() - 0.5) * 2, 0.4, z + (Math.random() - 0.5) * 2)
    this.scene.add(mesh)
    this.puffs.push({ mesh, age: 0 })
  }

  private updateDust(dt: number): void {
    for (let i = this.puffs.length - 1; i >= 0; i--) {
      const p = this.puffs[i]
      p.age += dt
      const k = p.age / 0.6
      p.mesh.scale.setScalar(0.4 + k * 1.3)
      p.mesh.position.y += dt * 1.2
      const mat = p.mesh.material as MeshBasicMaterial
      mat.opacity = 0.8 * (1 - k)
      if (k < 1) continue
      p.mesh.removeFromParent()
      mat.dispose()
      this.puffs.splice(i, 1)
    }
  }
}

