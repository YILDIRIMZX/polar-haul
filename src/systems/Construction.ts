import {
  Group,
  Mesh,
  MeshBasicMaterial,
  type Scene,
} from 'three'
import { audio } from '../audio/Audio.ts'
import { BUILD, PAD, STORES } from '../config/balance.ts'
import { LAYOUT } from '../config/world.ts'
import type { Player } from '../entities/Player.ts'
import { floatingText } from '../fx/FloatingText.ts'
import { addObstacle, removeObstacle, type Box } from '../world/bounds.ts'
import type { Progress } from './progression.ts'
import { UnlockPad } from './UnlockPad.ts'
import { dustPuff } from '../looks/effects.ts'
import { pine } from '../looks/defense.ts'
import { dryingRack, huntersLodge, iceCellar, scaffold, siteMarks } from '../looks/camp.ts'
import type { Wallet } from './Wallet.ts'

type Spot = { x: number; z: number }

interface SiteDef {
  title: string
  at: Spot
  width: number
  depth: number
  padAt: Spot
  price: number
  baseLevel: number // the base level that opens this site
  ready?: (progress: Progress) => boolean // something else that must happen first, such as trees being cleared
  build: () => Group // makes the finished building (already in the scene)
}

type SiteState = 'closed' | 'open' | 'building' | 'done'

const HAMMER_EVERY = 0.13
const POP_SECONDS = 0.45

interface Puff {
  mesh: Mesh
  age: number
}

// A place in the base where something will be built. The base level opens it: snow is cleared, stakes and
// a rope mark it out, and a pad in front shows the building's name and price. Paying raises a scaffold with
// hammering and dust, and then the building pops up.
class Site {
  state: SiteState = 'closed'
  private def: SiteDef
  private scene: Scene
  private marks = new Group()
  private scaffold: Group | null = null
  private building: Group | null = null
  private pad: UnlockPad
  private t = 0
  private hammer = 0
  private puffs: Puff[] = []

  constructor(scene: Scene, def: SiteDef) {
    this.scene = scene
    this.def = def
    this.pad = new UnlockPad(scene, {
      at: def.padAt,
      title: def.title,
      reward: () => 'İNŞA ET',
      pricing: { baseCost: def.price, costGrowth: 1, maxLevel: 1, size: PAD.size, drainSeconds: 1.5, minDrainPerSec: 40 },
      apply: () => this.startBuilding(),
      hidden: true,
      vanishWhenMaxed: true,
    })
  }

  update(dt: number, player: Player, wallet: Wallet, progress: Progress): void {
    if (this.state === 'closed' && progress.baseLevel >= this.def.baseLevel && (this.def.ready?.(progress) ?? true)) this.open()
    this.pad.update(dt, player, wallet)
    if (this.state === 'open') this.grow(this.marks, dt)
    if (this.state === 'building') this.build(dt)
    if (this.state === 'done' && this.building) this.grow(this.building, dt)
    this.updateDust(dt)
  }

  // Test panel: paid for and built at once.
  finishNow(): void {
    if (this.state === 'closed') this.open()
    if (this.state === 'open') this.pad.buyNow()
    if (this.state === 'building') this.t = BUILD.buildSeconds
  }

  // Snow cleared, stakes and a rope around the plot, and the price pad in front.
  private open(): void {
    this.state = 'open'
    this.t = 0
    const { at, width, depth } = this.def
    this.marks.add(siteMarks(width, depth))
    this.marks.position.set(at.x, 0, at.z)
    this.marks.scale.setScalar(0.01)
    this.scene.add(this.marks)
    this.pad.show()
    floatingText.spawn(`Yeni inşa alanı: ${this.def.title}`, this.marks.position.clone().setY(2))
  }

  private startBuilding(): void {
    this.state = 'building'
    this.t = 0
    this.hammer = 0
    this.scaffold = scaffold(this.def.width, this.def.depth)
    this.scaffold.position.set(this.def.at.x, -3, this.def.at.z)
    this.scene.add(this.scaffold)
  }

  // The scaffold rises with hammering and dust; at the end the building pops up in its place.
  private build(dt: number): void {
    const scaffold = this.scaffold
    if (!scaffold) return
    this.t += dt
    const k = Math.min(1, this.t / BUILD.buildSeconds)
    scaffold.position.y = -3 * (1 - k) * (1 - k)
    this.hammer -= dt
    if (this.hammer <= 0) {
      this.hammer = HAMMER_EVERY
      audio.play('hammer')
      this.puff()
    }
    if (k < 1) return
    scaffold.removeFromParent()
    this.scaffold = null
    this.marks.removeFromParent()
    for (let i = 0; i < 6; i++) this.puff()
    this.building = this.def.build()
    this.building.scale.setScalar(0.01)
    this.t = 0
    this.state = 'done'
    audio.play('purchase')
    floatingText.spawn(`${this.def.title}!`, this.building.position.clone().setY(3.2))
  }

  // Pops into view with a small overshoot.
  private grow(group: Group, dt: number): void {
    if (this.t >= POP_SECONDS) {
      group.scale.setScalar(1)
      return
    }
    this.t += dt
    const k = Math.min(1, this.t / POP_SECONDS) - 1
    group.scale.setScalar(Math.max(0.01, 1 + 2.7 * k * k * k + 1.7 * k * k))
  }

  private puff(): void {
    const mesh = dustPuff()
    const { at, width, depth } = this.def
    mesh.position.set(at.x + (Math.random() - 0.5) * width, 0.3, at.z + (Math.random() - 0.5) * depth)
    this.scene.add(mesh)
    this.puffs.push({ mesh, age: 0 })
  }

  private updateDust(dt: number): void {
    for (let i = this.puffs.length - 1; i >= 0; i--) {
      const p = this.puffs[i]
      p.age += dt
      const k = p.age / 0.7
      p.mesh.scale.setScalar(0.4 + k * 1.4)
      p.mesh.position.y += dt * 1.2
      ;(p.mesh.material as MeshBasicMaterial).opacity = 0.8 * (1 - k)
      if (k < 1) continue
      p.mesh.removeFromParent()
      ;(p.mesh.material as MeshBasicMaterial).dispose()
      this.puffs.splice(i, 1)
    }
  }
}

// A pine that stands in the way until the base grows; then it is felled.
interface Tree {
  group: Group
  box: Box
  fall: number // 0 → 1 while it topples, then it sinks away
  side: number
}

// Building sites around the base and the changes the base levels bring: the gate depot at level 2; at level 3
// the trees in the west are felled and the hunters' lodge goes up where they stood.
export class Construction {
  private sites: Site[]
  private trees: Tree[] = []
  private felling = -1 // seconds since the trees began to fall, -1 before

  constructor(scene: Scene, onDepot: () => Group, onLodge: () => void, onStores: (level: number) => void) {
    for (const at of LAYOUT.westTrees) this.trees.push(plantTree(scene, at))
    this.sites = [
      new Site(scene, {
        title: 'KAPI DEPOSU',
        at: LAYOUT.depot,
        width: 3,
        depth: 2.8,
        padAt: LAYOUT.sitePads.depot,
        price: BUILD.depotPrice,
        baseLevel: 2,
        build: onDepot,
      }),
      new Site(scene, {
        title: 'AVCI KULÜBESİ',
        at: LAYOUT.lodge,
        width: 3.2,
        depth: 3,
        padAt: LAYOUT.sitePads.lodge,
        price: BUILD.lodgePrice,
        baseLevel: 3,
        ready: () => this.trees.length === 0,
        build: () => {
          const lodge = huntersLodge()
          lodge.position.set(LAYOUT.lodge.x, 0, LAYOUT.lodge.z)
          scene.add(lodge)
          addObstacle(LAYOUT.lodge, 3.2, 3)
          onLodge()
          return lodge
        },
      }),
      // Once the furnace cooks two at a time there is more meat than the camp eats, and the surplus spoils.
      // Dried on a rack over a smoky fire it keeps: winter stores.
      new Site(scene, {
        title: 'KURUTMA RAFI',
        at: LAYOUT.dryingRack,
        width: 3,
        depth: 2,
        padAt: LAYOUT.sitePads.dryingRack,
        price: STORES.dryingRackPrice,
        baseLevel: 2,
        ready: (p) => p.furnaceSlots >= 2,
        build: () => {
          const rack = dryingRack()
          rack.position.set(LAYOUT.dryingRack.x, 0, LAYOUT.dryingRack.z)
          scene.add(rack)
          addObstacle(LAYOUT.dryingRack, 3, 1.4)
          onStores(1)
          return rack
        },
      }),
      // A bigger camp needs bigger stores: a cellar dug into the frozen ground keeps meat through the winter,
      // like the Iñupiat ice cellars.
      new Site(scene, {
        title: 'BUZ MAHZENİ',
        at: LAYOUT.iceCellar,
        width: 3,
        depth: 3,
        padAt: LAYOUT.sitePads.iceCellar,
        price: STORES.iceCellarPrice,
        baseLevel: 4,
        build: () => {
          const cellar = iceCellar()
          cellar.position.set(LAYOUT.iceCellar.x, 0, LAYOUT.iceCellar.z)
          scene.add(cellar)
          addObstacle(LAYOUT.iceCellar, 2.6, 2.6)
          onStores(2)
          return cellar
        },
      }),
    ]
  }

  update(dt: number, player: Player, wallet: Wallet, progress: Progress): void {
    if (progress.baseLevel >= 3 && this.felling < 0 && this.trees.length > 0) this.felling = 0
    if (this.felling >= 0) this.fellTrees(dt)
    for (const site of this.sites) site.update(dt, player, wallet, progress)
  }

  // Test panel: every tree gone and every site built at once.
  finishAll(): void {
    for (const tree of this.trees) {
      tree.group.removeFromParent()
      removeObstacle(tree.box)
    }
    this.trees = []
    this.felling = -1
    for (const site of this.sites) site.finishNow()
  }

  // One after another the trees tip over, outward, and sink into the snow.
  private fellTrees(dt: number): void {
    this.felling += dt
    this.trees.forEach((tree, i) => {
      const start = i * 0.25
      if (this.felling < start) return
      if (tree.fall === 0) audio.play('timber')
      tree.fall = Math.min(2, (this.felling - start) / BUILD.treeFallSeconds)
      const tip = Math.min(1, tree.fall)
      tree.group.rotation.z = tree.side * (Math.PI / 2) * tip * tip
      if (tree.fall > 1) tree.group.position.y = -(tree.fall - 1) * 1.2
    })
    for (let i = this.trees.length - 1; i >= 0; i--) {
      const tree = this.trees[i]
      if (tree.fall < 2) continue
      tree.group.removeFromParent()
      removeObstacle(tree.box)
      this.trees.splice(i, 1)
    }
    if (this.trees.length === 0) this.felling = -1
  }
}

function plantTree(scene: Scene, at: Spot): Tree {
  const group = pine()
  group.position.set(at.x, 0, at.z)
  scene.add(group)
  return { group, box: addObstacle(at, 0.8, 0.8), fall: 0, side: at.x < LAYOUT.lodge.x ? 1 : -1 }
}

