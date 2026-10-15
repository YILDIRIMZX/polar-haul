import { Group, Mesh, Vector3, type Scene } from 'three'
import { audio } from '../audio/Audio.ts'
import { TOWERS, type WallKind } from '../config/balance.ts'
import type { Bear } from '../entities/Bear.ts'
import type { Fighter } from '../entities/Fighter.ts'
import { WALL_TOWERS } from '../config/world.ts'
import { addObstacle, isInsideBase } from '../world/bounds.ts'
import { arrow } from '../looks/effects.ts'
import { watchtower, WATCHTOWER_HEIGHT } from '../looks/defense.ts'

// A watchman is not someone a bear can chase: its arrows bring bears down without making them angry.
const WATCHMAN: Fighter = { position: new Vector3(), inBase: true, alive: false, damage: () => {} }

interface Arrow {
  mesh: Mesh
  target: Bear
}

interface Tower {
  group: Group
  top: Vector3
  wait: number
}

// Watchtowers on the log wall, flanking the front gate. A watchman on each shoots at bears that come close
// to the wall, a boss pounding the gate included. They go up with the log wall at base level 4.
export class Towers {
  private towers: Tower[] = []
  private arrows: Arrow[] = []
  private scene: Scene

  constructor(scene: Scene) {
    this.scene = scene
  }

  // `hit` deals an arrow's damage to a bear: the herd's or the boss fight's, whichever it belongs to.
  update(dt: number, wall: WallKind, bears: readonly Bear[], hit: (bear: Bear, damage: number, by: Fighter) => void): void {
    if (wall === 'logs' && this.towers.length === 0) this.build()
    for (const tower of this.towers) {
      tower.wait -= dt
      if (tower.wait > 0) continue
      const target = nearestOutside(tower.top, bears)
      if (!target) continue
      tower.wait = TOWERS.cooldown
      const mesh = arrow()
      mesh.position.copy(tower.top)
      this.scene.add(mesh)
      this.arrows.push({ mesh, target })
      audio.play('whoosh', { volume: 0.25 })
    }
    this.fly(dt, hit)
  }

  // Arrows home in on their bear and strike when they reach it; one whose bear is already dead just drops.
  private fly(dt: number, hit: (bear: Bear, damage: number, by: Fighter) => void): void {
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const a = this.arrows[i]
      const aim = a.target.position.clone().setY(1.2)
      const to = aim.sub(a.mesh.position)
      const dist = to.length()
      const step = TOWERS.arrowSpeed * dt
      if (!a.target.dead && dist > step) {
        a.mesh.position.addScaledVector(to.divideScalar(dist), step)
        a.mesh.lookAt(a.target.position.x, 1.2, a.target.position.z)
        continue
      }
      if (!a.target.dead) hit(a.target, TOWERS.damage, WATCHMAN)
      a.mesh.removeFromParent()
      this.arrows.splice(i, 1)
    }
  }

  private build(): void {
    // On the gatehouse's corners (WALL_TOWERS in world.ts), as castles placed them: close enough to cover
    // a boss pounding the gate.
    for (const at of WALL_TOWERS) {
      const group = watchtower()
      group.position.set(at.x, 0, at.z)
      this.scene.add(group)
      addObstacle(at, 1.6, 1.6)
      this.towers.push({ group, top: new Vector3(at.x, WATCHTOWER_HEIGHT + 0.5, at.z), wait: 0 })
    }
  }
}

// The closest living bear outside the wall within the watchman's range.
function nearestOutside(from: Vector3, bears: readonly Bear[]): Bear | null {
  let best: Bear | null = null
  let bestD: number = TOWERS.range
  for (const b of bears) {
    if (b.dead || isInsideBase(b.position.x, b.position.z)) continue
    const d = Math.hypot(b.position.x - from.x, b.position.z - from.z)
    if (d < bestD) {
      bestD = d
      best = b
    }
  }
  return best
}
