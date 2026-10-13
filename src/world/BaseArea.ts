import { BoxGeometry, CircleGeometry, InstancedMesh, Mesh, MeshLambertMaterial, Object3D, type Scene } from 'three'
import { COLORS, WORLD } from '../config/world.ts'
import { setBaseRadius } from './bounds.ts'

const groundMat = new MeshLambertMaterial({ color: COLORS.baseGround })
const woodMat = new MeshLambertMaterial({ color: COLORS.fenceWood })
const postGeo = new BoxGeometry(0.28, WORLD.fenceHeight, 0.28)
const railGeo = new BoxGeometry(1, 0.14, 0.12)

// The sandy ground of the base and the round fence around it. Both are rebuilt when the base grows.
// The fence has two gates: the front one toward -z (the bears), the back one toward +z (the customers).
export class BaseArea {
  private scene: Scene
  private ground: Mesh | null = null
  private posts: InstancedMesh | null = null
  private rails: InstancedMesh | null = null

  constructor(scene: Scene, radius: number) {
    this.scene = scene
    this.setRadius(radius)
  }

  setRadius(radius: number): void {
    this.clear()
    setBaseRadius(radius)

    this.ground = new Mesh(new CircleGeometry(radius, 64), groundMat)
    this.ground.rotation.x = -Math.PI / 2
    this.ground.position.y = 0.01
    this.ground.receiveShadow = true
    this.scene.add(this.ground)

    this.buildFence(radius)
  }

  private buildFence(r: number): void {
    const count = Math.floor((2 * Math.PI * r) / WORLD.fencePostSpacing)
    const step = (2 * Math.PI) / count
    const gateHalfAngle = WORLD.gateWidth / 2 / r
    const gateAngles = [-Math.PI / 2, Math.PI / 2]

    const angles: number[] = []
    for (let i = 0; i < count; i++) {
      const a = i * step
      const inGate = gateAngles.some((g) => Math.abs(Math.atan2(Math.sin(a - g), Math.cos(a - g))) <= gateHalfAngle)
      if (!inGate) angles.push(a)
    }

    const h = WORLD.fenceHeight
    const posts = new InstancedMesh(postGeo, woodMat, angles.length)
    const rails = new InstancedMesh(railGeo, woodMat, angles.length * 2)
    const dummy = new Object3D()
    let railCount = 0

    angles.forEach((a, i) => {
      dummy.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      posts.setMatrixAt(i, dummy.matrix)

      // A rail only joins neighbouring posts, so the gate gaps stay open.
      const next = angles[(i + 1) % angles.length]
      const gap = (next - a + 2 * Math.PI) % (2 * Math.PI)
      if (Math.abs(gap - step) > 1e-6) return
      const mid = a + step / 2
      const length = 2 * r * Math.sin(step / 2)
      for (const y of [h * 0.4, h * 0.8]) {
        dummy.position.set(Math.cos(mid) * r, y, Math.sin(mid) * r)
        dummy.rotation.set(0, -mid + Math.PI / 2, 0)
        dummy.scale.set(length, 1, 1)
        dummy.updateMatrix()
        rails.setMatrixAt(railCount++, dummy.matrix)
      }
    })
    rails.count = railCount

    for (const m of [posts, rails]) {
      m.castShadow = true
      this.scene.add(m)
    }
    this.posts = posts
    this.rails = rails
  }

  // Shared geometries and materials stay; only the per-size parts are thrown away.
  private clear(): void {
    if (this.ground) {
      this.ground.removeFromParent()
      this.ground.geometry.dispose()
    }
    for (const m of [this.posts, this.rails]) {
      if (!m) continue
      m.removeFromParent()
      m.dispose()
    }
    this.ground = null
    this.posts = null
    this.rails = null
  }
}
