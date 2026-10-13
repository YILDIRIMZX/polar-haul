import { Group, Mesh, MeshBasicMaterial, RingGeometry } from 'three'

const dashMat = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })

// A dashed circle on the ground: "stand here".
export function dashedRing(x: number, z: number, radius: number, dashes = 12): Group {
  const group = new Group()
  const arc = (Math.PI * 2) / dashes
  for (let k = 0; k < dashes; k++) {
    const dash = new Mesh(new RingGeometry(radius - 0.12, radius, 6, 1, k * arc, arc * 0.6), dashMat)
    dash.rotation.x = -Math.PI / 2
    group.add(dash)
  }
  group.position.set(x, 0.03, z)
  return group
}
