import type { Vector3 } from 'three'
import { LAYOUT, WORLD } from '../config/world.ts'
import { clamp } from '../game/math.ts'

const R = WORLD.baseRadius

export function isInsideBase(x: number, z: number): boolean {
  return Math.hypot(x, z) < R
}

// Both gates sit on the z axis: the front one toward the bears, the back one toward the customers.
function inGate(x: number, _z: number, radius: number): boolean {
  return Math.abs(x) < WORLD.gateWidth / 2 - radius
}

// Keeps a circle on the side of the fence it came from, unless it is passing through the gate.
export function constrainToFence(prevX: number, prevZ: number, pos: Vector3, radius: number): void {
  if (inGate(pos.x, pos.z, radius)) return
  const d = Math.hypot(pos.x, pos.z)
  if (d === 0) return
  const wasInside = Math.hypot(prevX, prevZ) < R
  const limit = wasInside ? Math.min(d, R - radius) : Math.max(d, R + radius)
  pos.x *= limit / d
  pos.z *= limit / d
}

// Bears never come in, not even through the gate; they crowd at the fence instead.
export function keepOutsideBase(pos: Vector3, radius: number): void {
  const d = Math.hypot(pos.x, pos.z)
  const min = R + radius
  if (d > 0 && d < min) {
    pos.x *= min / d
    pos.z *= min / d
  }
}

// Keeps everything inside the play area, a little short of the first row of trees.
export function clampToWorld(pos: Vector3): void {
  const a = LAYOUT.playArea
  pos.x = clamp(pos.x, a.minX, a.maxX)
  pos.z = clamp(pos.z, a.minZ, a.maxZ)
}
