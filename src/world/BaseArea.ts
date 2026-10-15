import {
  Group,
  InstancedMesh,
  Mesh,
  Object3D,
  type Scene,
} from 'three'
import { audio } from '../audio/Audio.ts'
import type { WallKind } from '../config/balance.ts'
import { WORLD, type Outline } from '../config/world.ts'
import { backGateZ, frontGateZ, setBaseOutline } from './bounds.ts'
import { WALL_PIECES, type WallPiece } from '../looks/defense.ts'
import { campGround } from '../looks/environment.ts'

const RISE_SECONDS = 1.1 // a new wall rises from the ground, the old one sinks into it
const HAMMER_EVERY = 0.16

// The ground of the base and the wall around it. Both change when the base grows: the wall is put up around
// what the camp has become (WALL_OUTLINES in world.ts), and when the kind of wall changes the old one sinks
// away while the new one rises in its place.
// The wall has two gates: the front one toward -z (the bears), the back one toward +z (the customers).
export class BaseArea {
  private scene: Scene
  private ground: Mesh | null = null
  private wall: Group | null = null
  private oldWall: Group | null = null
  private rise = 1 // 0 → 1 while a new wall goes up
  private hammer = 0
  kind: WallKind = 'snow'

  constructor(scene: Scene, outline: Outline, kind: WallKind) {
    this.scene = scene
    this.kind = kind
    this.build(outline, kind, false)
  }

  // Grows the base; a new kind of wall is put up with hammering, replacing the old one.
  setLevel(outline: Outline, kind: WallKind): void {
    this.build(outline, kind, kind !== this.kind)
    this.kind = kind
  }

  update(dt: number): void {
    if (this.rise >= 1) return
    this.rise = Math.min(1, this.rise + dt / RISE_SECONDS)
    const k = 1 - (1 - this.rise) * (1 - this.rise)
    if (this.wall) this.wall.position.y = -2.4 * (1 - k)
    if (this.oldWall) this.oldWall.position.y = -2.4 * k
    this.hammer -= dt
    if (this.hammer <= 0 && this.rise < 1) {
      this.hammer = HAMMER_EVERY
      audio.play('hammer', { volume: 0.5 })
    }
    if (this.rise < 1) return
    this.removeOld()
  }

  private build(outline: Outline, kind: WallKind, animate: boolean): void {
    setBaseOutline(outline)
    if (this.ground) {
      this.ground.removeFromParent()
      this.ground.geometry.dispose()
    }
    this.ground = campGround(outline)
    this.scene.add(this.ground)

    this.removeOld()
    if (animate) {
      this.oldWall = this.wall
      this.rise = 0
      this.hammer = 0
    } else if (this.wall) {
      disposeWall(this.wall)
    }
    this.wall = buildWall(outline, WALL_PIECES[kind])
    if (animate) this.wall.position.y = -2.4
    this.scene.add(this.wall)
  }

  private removeOld(): void {
    if (!this.oldWall) return
    disposeWall(this.oldWall)
    this.oldWall = null
  }
}

// Places the pieces along each straight run of the wall, leaving the two gates open.
function buildWall(outline: Outline, piece: WallPiece): Group {
  const group = new Group()
  const gateHalf = WORLD.gateWidth / 2 + 0.3
  const gates = [frontGateZ(), backGateZ()]
  const inGate = (x: number, z: number): boolean => Math.abs(x) < gateHalf && gates.some((g) => Math.abs(z - g) < 0.6)
  // Every spot along the wall: where it is, which way its run goes, and half a step along the run.
  const spots: { x: number; z: number; angle: number; halfX: number; halfZ: number }[] = []
  outline.forEach((a, i) => {
    const b = outline[(i + 1) % outline.length]
    const count = Math.max(1, Math.round(Math.hypot(b.x - a.x, b.z - a.z) / piece.spacing))
    const stepX = (b.x - a.x) / count
    const stepZ = (b.z - a.z) / count
    const angle = -Math.atan2(b.z - a.z, b.x - a.x)
    for (let k = 0; k < count; k++) {
      const x = a.x + stepX * (k + 0.5)
      const z = a.z + stepZ * (k + 0.5)
      if (!inGate(x, z)) spots.push({ x, z, angle, halfX: stepX / 2, halfZ: stepZ / 2 })
    }
  })

  const bodies = new InstancedMesh(piece.geometry, piece.material, spots.length * piece.layers.length)
  const tips = piece.tip ? new InstancedMesh(piece.tip.geometry, piece.material, spots.length) : null
  const dummy = new Object3D()
  let n = 0
  spots.forEach((spot, i) => {
    piece.layers.forEach((y, layer) => {
      // Logs and blocks lie along the run; every other layer of logs is shifted, like a real log wall.
      const shift = piece.layers.length > 1 && layer % 2 === 1 ? 1 : 0
      dummy.position.set(spot.x + spot.halfX * shift, y, spot.z + spot.halfZ * shift)
      dummy.rotation.set(0, piece.tangent ? spot.angle : 0, 0)
      dummy.updateMatrix()
      bodies.setMatrixAt(n++, dummy.matrix)
    })
    if (tips && piece.tip) {
      dummy.position.set(spot.x, piece.tip.y, spot.z)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      tips.setMatrixAt(i, dummy.matrix)
    }
  })
  bodies.count = n
  for (const m of [bodies, tips]) {
    if (!m) continue
    m.castShadow = true
    group.add(m)
  }
  return group
}

function disposeWall(wall: Group): void {
  wall.removeFromParent()
  wall.traverse((o) => {
    if (o instanceof InstancedMesh) o.dispose()
  })
}
