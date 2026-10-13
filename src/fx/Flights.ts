import { Vector3, type Object3D } from 'three'

interface Flight {
  mesh: Object3D
  from: Vector3
  to: () => Vector3
  t: number
  duration: number
  arc: number
  done: () => void
}

// Moves objects along a short arc to a (possibly moving) target, then calls done.
export class Flights {
  private list: Flight[] = []

  get count(): number {
    return this.list.length
  }

  add(mesh: Object3D, to: () => Vector3, duration: number, arc: number, done: () => void): void {
    this.list.push({ mesh, from: mesh.position.clone(), to, t: 0, duration, arc, done })
  }

  update(dt: number): void {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const f = this.list[i]
      f.t += dt / f.duration
      const k = Math.min(1, f.t)
      const eased = k * (2 - k)
      f.mesh.position.lerpVectors(f.from, f.to(), eased)
      f.mesh.position.y += Math.sin(Math.PI * k) * f.arc
      if (f.t >= 1) {
        this.list.splice(i, 1)
        f.done()
      }
    }
  }
}
