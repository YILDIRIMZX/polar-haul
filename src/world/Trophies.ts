import { BoxGeometry, Group, Mesh, MeshLambertMaterial, type Scene } from 'three'
import { BOSSES } from '../config/balance.ts'
import { COLORS, LAYOUT } from '../config/world.ts'
import { floatingText } from '../fx/FloatingText.ts'
import type { Progress } from '../systems/progression.ts'

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
      this.pelt = buildPelt()
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

// A flat bear rug: body, head with ears and four paws, in Yaşlı Ayı's grey.
function buildPelt(): Group {
  const fur = new MeshLambertMaterial({ color: BOSSES.elder.color })
  const nose = new MeshLambertMaterial({ color: COLORS.bearNose })
  const group = new Group()
  const add = (w: number, h: number, d: number, x: number, y: number, z: number, mat = fur): void => {
    const m = new Mesh(new BoxGeometry(w, h, d), mat)
    m.position.set(x, y, z)
    m.receiveShadow = true
    group.add(m)
  }
  add(2.0, 0.06, 1.5, 0, 0.03, 0) // body; the head points to the middle of the base
  add(0.7, 0.3, 0.8, 1.25, 0.15, 0) // head
  add(0.16, 0.12, 0.3, 1.62, 0.12, 0, nose)
  add(0.18, 0.18, 0.18, 1.1, 0.34, -0.3) // ears
  add(0.18, 0.18, 0.18, 1.1, 0.34, 0.3)
  for (const [x, z] of [
    [0.75, 0.95],
    [0.75, -0.95],
    [-0.75, 0.95],
    [-0.75, -0.95],
  ]) {
    add(0.45, 0.05, 0.5, x, 0.025, z)
  }
  add(0.4, 0.05, 0.3, -1.15, 0.025, 0) // tail
  group.position.set(LAYOUT.trophy.x, 0, LAYOUT.trophy.z)
  return group
}
