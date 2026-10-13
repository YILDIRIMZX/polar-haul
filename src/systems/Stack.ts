import { Group, Vector3, type Object3D, type Scene } from 'three'
import { audio } from '../audio/Audio.ts'
import { BASE_STATS, STACK } from '../config/balance.ts'
import { meatKind, type MeatKind } from '../entities/Meat.ts'
import type { Player } from '../entities/Player.ts'

interface Incoming {
  mesh: Object3D
  from: Vector3
  t: number
}

const top = new Vector3()

// The tower of meat carried above the player's head: the visual star of the ads.
export class Stack {
  readonly root = new Group()
  capacity: number = BASE_STATS.carryCapacity // kept in step with Stats every frame
  private items: Object3D[] = []
  private incoming: Incoming[] = []
  private sway = new Vector3()
  private wasFull = false
  private scene: Scene

  constructor(scene: Scene) {
    this.scene = scene
    scene.add(this.root)
  }

  get count(): number {
    return this.items.length + this.incoming.length
  }

  get hasRoom(): boolean {
    return this.count < this.capacity
  }

  // The mesh must already be in the scene; it flies from where it lies to the top of the stack.
  receive(mesh: Object3D): void {
    this.incoming.push({ mesh, from: mesh.position.clone(), t: 0 })
  }

  // Removes the highest item of the given kind and hands it back as a free object in the scene,
  // at the same world position. The items above it drop down to fill the gap.
  takeTop(kind: MeatKind): Object3D | null {
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (meatKind(this.items[i]) !== kind) continue
      const [item] = this.items.splice(i, 1)
      this.scene.attach(item)
      return item
    }
    return null
  }

  clear(): void {
    for (const item of this.items) item.removeFromParent()
    for (const f of this.incoming) f.mesh.removeFromParent()
    this.items.length = 0
    this.incoming.length = 0
  }

  update(dt: number, player: Player): void {
    const p = player.position
    this.root.position.set(p.x, p.y + STACK.headHeight, p.z)

    // Arrivals first, so an item that lands this frame is placed by the loop below in the same frame.
    for (let i = this.incoming.length - 1; i >= 0; i--) {
      const f = this.incoming[i]
      f.t += dt / STACK.pickupSeconds
      if (f.t >= 1) {
        this.incoming.splice(i, 1)
        this.root.add(f.mesh)
        this.items.push(f.mesh)
        audio.play('pickup', { rising: true })
        continue
      }
      top.copy(this.root.position)
      top.y += this.items.length * STACK.itemHeight
      const eased = f.t * (2 - f.t)
      f.mesh.position.lerpVectors(f.from, top, eased)
      f.mesh.position.y += Math.sin(Math.PI * f.t) * 1.5
    }

    // One warning tone when the stack fills up; silent again until there is room.
    const full = !this.hasRoom
    if (full && !this.wasFull) audio.play('full')
    this.wasFull = full

    // The tower bends against the direction of travel, more at the top, and springs back when the player stops.
    this.sway.lerp(player.velocity, 1 - Math.exp(-STACK.swayFollow * dt))
    this.items.forEach((item, i) => {
      const bend = i * i * STACK.sway
      item.position.set(-this.sway.x * bend, i * STACK.itemHeight, -this.sway.z * bend)
    })
  }
}
