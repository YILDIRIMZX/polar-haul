import { Mesh, MeshBasicMaterial, RingGeometry, type Scene } from 'three'

const ringGeo = new RingGeometry(0.82, 1, 56).rotateX(-Math.PI / 2)

// A ring that bursts out over the ground and fades: a boss slamming down or roaring.
export class Shockwave {
  private mesh: Mesh
  private material: MeshBasicMaterial
  private age = 0
  private seconds: number
  private reach: number

  constructor(scene: Scene, x: number, z: number, reach: number, color: number, seconds = 0.7) {
    this.reach = reach
    this.seconds = seconds
    this.material = new MeshBasicMaterial({ color, transparent: true, opacity: 0.8, depthWrite: false })
    this.mesh = new Mesh(ringGeo, this.material)
    this.mesh.position.set(x, 0.06, z)
    this.mesh.renderOrder = 3
    scene.add(this.mesh)
  }

  // Returns false once it has faded out and left the scene.
  update(dt: number): boolean {
    this.age += dt
    const k = Math.min(1, this.age / this.seconds)
    const grow = 1 - (1 - k) ** 3 // fast at first, then slowing
    this.mesh.scale.setScalar(Math.max(0.01, this.reach * grow))
    this.material.opacity = 0.8 * (1 - k)
    if (k < 1) return true
    this.mesh.removeFromParent()
    this.material.dispose()
    return false
  }
}
