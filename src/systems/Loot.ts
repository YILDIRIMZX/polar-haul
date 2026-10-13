import { MathUtils, Vector3, type Group, type Scene } from 'three'
import { PLAYER } from '../config/balance.ts'
import { createMeat } from '../entities/Meat.ts'
import type { Player } from '../entities/Player.ts'
import { flatDistance } from '../game/math.ts'
import type { Stack } from './Stack.ts'

const GRAVITY = 22
const GROUND_Y = 0.13

interface Drop {
  mesh: Group
  velocity: Vector3
  spin: number
  grounded: boolean
}

// Meat that bursts out of a bear, lands on the snow and waits to be picked up.
export class Loot {
  private drops: Drop[] = []
  private scene: Scene

  constructor(scene: Scene) {
    this.scene = scene
  }

  spawn(at: Vector3, count: number): void {
    for (let i = 0; i < count; i++) {
      const mesh = createMeat()
      mesh.position.set(at.x, 1.2, at.z)
      const angle = Math.random() * Math.PI * 2
      const speed = MathUtils.randFloat(1.5, 3.5)
      const velocity = new Vector3(Math.cos(angle) * speed, MathUtils.randFloat(6, 8), Math.sin(angle) * speed)
      this.scene.add(mesh)
      this.drops.push({ mesh, velocity, spin: MathUtils.randFloat(-6, 6), grounded: false })
    }
  }

  update(dt: number, player: Player, stack: Stack): void {
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i]
      const p = d.mesh.position
      if (!d.grounded) {
        d.velocity.y -= GRAVITY * dt
        p.addScaledVector(d.velocity, dt)
        d.mesh.rotation.y += d.spin * dt
        if (p.y <= GROUND_Y) {
          p.y = GROUND_Y
          d.grounded = true
        }
        continue
      }
      if (!stack.hasRoom || flatDistance(player.position, p) > PLAYER.pickupRadius) continue
      this.drops.splice(i, 1)
      stack.receive(d.mesh)
    }
  }
}
