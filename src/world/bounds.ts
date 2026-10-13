import type { Vector3 } from 'three'
import { LAYOUT, WORLD } from '../config/world.ts'
import { clamp } from '../game/math.ts'

// The fence's current radius. It grows with the base level; BaseArea sets it.
let baseRadius: number = WORLD.startBaseRadius

export function setBaseRadius(radius: number): void {
  baseRadius = radius
}

export function getBaseRadius(): number {
  return baseRadius
}

export function isInsideBase(x: number, z: number): boolean {
  return Math.hypot(x, z) < baseRadius
}

// Both gates sit on the z axis: the front one toward the bears, the back one toward the customers.
function inGate(x: number, radius: number): boolean {
  return Math.abs(x) < WORLD.gateWidth / 2 - radius
}

// Keeps a circle on the side of the fence it came from, unless it is passing through a gate.
export function constrainToFence(prevX: number, prevZ: number, pos: Vector3, radius: number): void {
  if (inGate(pos.x, radius)) return
  const d = Math.hypot(pos.x, pos.z)
  if (d === 0) return
  const wasInside = Math.hypot(prevX, prevZ) < baseRadius
  const limit = wasInside ? Math.min(d, baseRadius - radius) : Math.max(d, baseRadius + radius)
  pos.x *= limit / d
  pos.z *= limit / d
}

// Bears never come in, not even through the gate; they crowd at the fence instead.
export function keepOutsideBase(pos: Vector3, radius: number): void {
  const d = Math.hypot(pos.x, pos.z)
  const min = baseRadius + radius
  if (d > 0 && d < min) {
    pos.x *= min / d
    pos.z *= min / d
  }
}

// Solid buildings and tables, as rectangles on the ground. The player is pushed back out of them.
interface Box {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

const obstacles: Box[] = []

export function addObstacle(center: { x: number; z: number }, width: number, depth: number): void {
  obstacles.push({
    minX: center.x - width / 2,
    maxX: center.x + width / 2,
    minZ: center.z - depth / 2,
    maxZ: center.z + depth / 2,
  })
}

// Moves a circle out of every obstacle it overlaps, to the nearest edge, so it slides along walls.
export function pushOutOfObstacles(pos: Vector3, radius: number): void {
  for (const b of obstacles) {
    const nearX = clamp(pos.x, b.minX, b.maxX)
    const nearZ = clamp(pos.z, b.minZ, b.maxZ)
    const dx = pos.x - nearX
    const dz = pos.z - nearZ
    const d = Math.hypot(dx, dz)
    if (d >= radius) continue
    if (d > 1e-6) {
      pos.x = nearX + (dx / d) * radius
      pos.z = nearZ + (dz / d) * radius
      continue
    }
    // The centre is inside the box: leave by the shortest way out.
    const left = pos.x - b.minX
    const right = b.maxX - pos.x
    const back = pos.z - b.minZ
    const front = b.maxZ - pos.z
    const least = Math.min(left, right, back, front)
    if (least === left) pos.x = b.minX - radius
    else if (least === right) pos.x = b.maxX + radius
    else if (least === back) pos.z = b.minZ - radius
    else pos.z = b.maxZ + radius
  }
}

// Keeps everything inside the play area, a little short of the first row of trees.
export function clampToWorld(pos: Vector3): void {
  const a = LAYOUT.playArea
  pos.x = clamp(pos.x, a.minX, a.maxX)
  pos.z = clamp(pos.z, a.minZ, a.maxZ)
}
