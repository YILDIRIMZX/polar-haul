import { CircleGeometry, Group, Mesh, MeshBasicMaterial, PlaneGeometry, type BufferGeometry, type Scene } from 'three'

const areaMat = new MeshBasicMaterial({ color: 0xe0453a, transparent: true, opacity: 0.22, depthWrite: false })
const fillMat = new MeshBasicMaterial({ color: 0xe0453a, transparent: true, opacity: 0.45, depthWrite: false })
const clawMat = new MeshBasicMaterial({ color: 0x3a2a24, transparent: true, opacity: 0.55, depthWrite: false })

export type WarningShape =
  | { kind: 'lane'; length: number; width: number }
  | { kind: 'fan'; radius: number; angle: number }
  | { kind: 'circle'; radius: number }

// A red area on the ground that shows where a boss's special move will land. It fills up from the boss
// outward while the boss winds up; when it is full, the move comes. Built pointing along +z, so turning
// the group by the boss's facing lines it up.
export class GroundWarning {
  private root = new Group()
  private fill: Mesh

  constructor(scene: Scene, shape: WarningShape) {
    const geo = shapeGeometry(shape)
    const area = new Mesh(geo, areaMat)
    this.fill = new Mesh(geo, fillMat)
    area.renderOrder = 1
    this.fill.renderOrder = 2
    this.fill.position.y = 0.01
    this.root.add(area, this.fill)
    this.root.visible = false
    scene.add(this.root)
  }

  // `size` stretches the whole shape, for a circle that has to fit bosses of different sizes.
  show(x: number, z: number, facing: number, size = 1): void {
    this.root.position.set(x, 0.04, z)
    this.root.rotation.y = facing
    this.root.scale.setScalar(size)
    this.root.visible = true
    this.setProgress(0)
  }

  // 0 when the wind-up starts, 1 when the move lands.
  setProgress(t: number): void {
    const s = Math.max(0.001, Math.min(1, t))
    this.fill.scale.set(s, 1, s)
  }

  hide(): void {
    this.root.visible = false
  }

  // For warnings made for a single throw.
  dispose(): void {
    this.root.removeFromParent()
  }
}

function shapeGeometry(shape: WarningShape): BufferGeometry {
  if (shape.kind === 'lane') {
    // A strip that starts at the boss and runs `length` ahead of it.
    return new PlaneGeometry(shape.width, shape.length).rotateX(-Math.PI / 2).translate(0, 0, shape.length / 2)
  }
  if (shape.kind === 'circle') return new CircleGeometry(shape.radius, 40).rotateX(-Math.PI / 2)
  // A slice of a circle centred on +z. After rotateX(-90°) the circle's -90° direction points along +z.
  return new CircleGeometry(shape.radius, 28, -Math.PI / 2 - shape.angle / 2, shape.angle).rotateX(-Math.PI / 2)
}

// Three parallel scratches, twice: the marks a boss leaves where it backed off into the field.
export function clawMarks(x: number, z: number): Group {
  const group = new Group()
  const scratch = new PlaneGeometry(0.16, 1.6).rotateX(-Math.PI / 2)
  for (const [ox, oz, turn] of [
    [-0.9, 0, 0.35],
    [0.9, 0.6, -0.25],
  ]) {
    for (let k = -1; k <= 1; k++) {
      const m = new Mesh(scratch, clawMat)
      m.position.set(ox + k * 0.32, 0, oz)
      m.rotation.y = turn
      group.add(m)
    }
  }
  group.position.set(x, 0.035, z)
  return group
}
