import { Group, Mesh, MeshBasicMaterial, PlaneGeometry, type Camera, type Vector3 } from 'three'

const HEIGHT = 0.18
const bgGeo = new PlaneGeometry(1, HEIGHT)
// Shifted so the fill grows from its left edge when scaled.
const fillGeo = new PlaneGeometry(1, HEIGHT).translate(0.5, 0, 0)
const bgMat = new MeshBasicMaterial({ color: 0x2b2b2b, transparent: true, opacity: 0.55, depthTest: false })
const fillMats = new Map<number, MeshBasicMaterial>()

// A health bar that always faces the camera and only shows while it is neither full nor empty.
export class HpBar {
  readonly root = new Group()
  private fill: Mesh

  constructor(color: number, width: number) {
    let mat = fillMats.get(color)
    if (!mat) {
      mat = new MeshBasicMaterial({ color, depthTest: false })
      fillMats.set(color, mat)
    }
    const bg = new Mesh(bgGeo, bgMat)
    this.fill = new Mesh(fillGeo, mat)
    this.fill.position.x = -0.5
    bg.renderOrder = 10
    this.fill.renderOrder = 11
    this.root.add(bg, this.fill)
    this.root.scale.x = width
    this.root.visible = false
  }

  update(ratio: number, pos: Vector3, height: number, camera: Camera): void {
    const r = Math.max(0, Math.min(1, ratio))
    this.root.visible = r > 0 && r < 1
    if (!this.root.visible) return
    this.fill.scale.x = r
    this.root.position.set(pos.x, pos.y + height, pos.z)
    this.root.quaternion.copy(camera.quaternion)
  }

  hide(): void {
    this.root.visible = false
  }
}
