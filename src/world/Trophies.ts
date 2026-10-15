import { Group, type Scene } from 'three'
import { LAYOUT } from '../config/world.ts'
import { floatingText } from '../fx/FloatingText.ts'
import type { Progress } from '../systems/progression.ts'
import { bearPelt } from '../looks/camp.ts'

const GROW_SECONDS = 0.6

// Keepsakes of the beaten main bosses, laid out in the base for good: the fights leave a mark you can see.
// Yaşlı Ayı's pelt lies beside the Great Furnace. Later main bosses add theirs.
export class Trophies {
  private scene: Scene
  private pelt: Group | null = null
  private grow = 0

  constructor(scene: Scene) {
    this.scene = scene
  }

  update(dt: number, progress: Progress): void {
    if (!this.pelt && progress.bossesDefeated >= 1) {
      this.pelt = bearPelt()
      this.pelt.position.set(LAYOUT.trophy.x, 0, LAYOUT.trophy.z)
      this.scene.add(this.pelt)
      this.grow = 0
      floatingText.spawn('Yaşlı Ayı\'nın postu', this.pelt.position.clone().setY(1.5))
    }
    if (this.pelt && this.grow < 1) {
      this.grow = Math.min(1, this.grow + dt / GROW_SECONDS)
      // Unrolls onto the ground with a small overshoot.
      const t = this.grow - 1
      const s = 1 + 2.7 * t * t * t + 1.7 * t * t
      this.pelt.scale.set(s, 1, s)
    }
  }
}

