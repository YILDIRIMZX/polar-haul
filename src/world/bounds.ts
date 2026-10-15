import type { Vector3 } from 'three'
import { LAYOUT, WALL_OUTLINES, WORLD, type Outline } from '../config/world.ts'
import { clamp } from '../game/math.ts'

// The camp's wall, as its corners in order. It changes with the base level; BaseArea sets it.
let wall: Outline = WALL_OUTLINES[1]
let inwardSign = 1 // turns an edge's left-hand normal toward the inside, whichever way the corners run
let frontZ = 0
let backZ = 0
let northmost = 0
setBaseOutline(wall)

export function setBaseOutline(outline: Outline): void {
  wall = outline
  let area = 0
  outline.forEach((a, i) => {
    const b = outline[(i + 1) % outline.length]
    area += a.x * b.z - b.x * a.z
  })
  inwardSign = area > 0 ? 1 : -1
  const crossings: number[] = []
  outline.forEach((a, i) => {
    const b = outline[(i + 1) % outline.length]
    if (a.x <= 0 !== b.x <= 0) crossings.push(a.z + ((b.z - a.z) * -a.x) / (b.x - a.x))
  })
  frontZ = Math.min(...crossings)
  backZ = Math.max(...crossings)
  northmost = Math.min(...outline.map((p) => p.z))
}

// Where the wall crosses the road: the front gate (toward the bears, -z) and the back gate (customers, +z).
export function frontGateZ(): number {
  return frontZ
}

export function backGateZ(): number {
  return backZ
}

// The wall's farthest point toward the bears.
export function wallNorthmost(): number {
  return northmost
}

export function isInsideBase(x: number, z: number): boolean {
  let inside = false
  for (let i = 0, j = wall.length - 1; i < wall.length; j = i++) {
    const a = wall[i]
    const b = wall[j]
    if (a.z > z !== b.z > z && x < ((b.x - a.x) * (z - a.z)) / (b.z - a.z) + a.x) inside = !inside
  }
  return inside
}

const near = { x: 0, z: 0, nx: 0, nz: 0, d: 0 }

// The closest point on the wall, how far it is, and the way into the base from there.
function nearestOnWall(x: number, z: number): typeof near {
  near.d = Infinity
  wall.forEach((a, i) => {
    const b = wall[(i + 1) % wall.length]
    const ex = b.x - a.x
    const ez = b.z - a.z
    const t = clamp(((x - a.x) * ex + (z - a.z) * ez) / (ex * ex + ez * ez), 0, 1)
    const px = a.x + t * ex
    const pz = a.z + t * ez
    const d = Math.hypot(x - px, z - pz)
    if (d >= near.d) return
    const len = Math.hypot(ex, ez)
    near.x = px
    near.z = pz
    near.d = d
    near.nx = (-ez / len) * inwardSign
    near.nz = (ex / len) * inwardSign
  })
  return near
}

// Puts a circle `radius` away from the wall, on the inside or the outside. Near a corner it is pushed
// straight away from the corner, so it slides round it.
function keepSide(pos: Vector3, radius: number, wantInside: boolean): void {
  for (let pass = 0; pass < 2; pass++) {
    const inside = isInsideBase(pos.x, pos.z)
    const n = nearestOnWall(pos.x, pos.z)
    if (inside === wantInside && n.d >= radius) return
    let ix = n.nx
    let iz = n.nz
    if (n.d > 1e-6) {
      const s = inside ? 1 : -1
      ix = (s * (pos.x - n.x)) / n.d
      iz = (s * (pos.z - n.z)) / n.d
    }
    const side = wantInside ? radius : -radius
    pos.x = n.x + ix * side
    pos.z = n.z + iz * side
  }
}

// Both gates sit on the z axis: the front one toward the bears, the back one toward the customers.
function inGate(x: number, radius: number): boolean {
  return Math.abs(x) < WORLD.gateWidth / 2 - radius
}

// Keeps a circle on the side of the wall it came from, unless it is passing through a gate.
export function constrainToFence(prevX: number, prevZ: number, pos: Vector3, radius: number): void {
  if (inGate(pos.x, radius)) return
  keepSide(pos, radius, isInsideBase(prevX, prevZ))
}

// Bears never come in, not even through the gate; they crowd at the wall instead.
export function keepOutsideBase(pos: Vector3, radius: number): void {
  keepSide(pos, radius, false)
}

// Solid buildings and tables, as rectangles on the ground. The player is pushed back out of them.
export interface Box {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

const obstacles: Box[] = []

export function addObstacle(center: { x: number; z: number }, width: number, depth: number): Box {
  const box = {
    minX: center.x - width / 2,
    maxX: center.x + width / 2,
    minZ: center.z - depth / 2,
    maxZ: center.z + depth / 2,
  }
  obstacles.push(box)
  return box
}

// For things that go away, such as trees cut down when the base grows.
export function removeObstacle(box: Box): void {
  const i = obstacles.indexOf(box)
  if (i >= 0) obstacles.splice(i, 1)
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
