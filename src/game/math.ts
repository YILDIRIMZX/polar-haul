import type { Vector3 } from 'three'

// Distance on the ground plane, ignoring height.
export function flatDistance(a: Vector3, b: { x: number; z: number }): number {
  return Math.hypot(a.x - b.x, a.z - b.z)
}

// Rotates an angle toward a target by at most maxStep, taking the short way round.
export function turnTowards(from: number, to: number, maxStep: number): number {
  const diff = Math.atan2(Math.sin(to - from), Math.cos(to - from))
  if (Math.abs(diff) <= maxStep) return to
  return from + Math.sign(diff) * maxStep
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// Whether `target` stands inside a fan (a slice of a circle) on the ground: the fan starts at `origin`,
// reaches `radius` and is `angle` radians wide, centred on `facing`. Facing uses the same angle as everything
// that turns in this game: facing = Math.atan2(dx, dz), so the direction it points to is (sin facing, cos facing).
// Yaşlı Ayı's sweep hits the player only when this returns true.
export function inFan(origin: Vector3, facing: number, target: Vector3, radius: number, angle: number): boolean {
  const PlayerFromBoss = flatDistance(origin,target)
  
  if (PlayerFromBoss > radius   ){
    return false
  }
  const dx = target.x - origin.x
  const dz = target.z - origin.z
  if (dx === 0 && dz === 0) return true
  
  const PlayerFromBossAngle = Math.atan2(dx,dz)
  const diff = Math.atan2(Math.sin(PlayerFromBossAngle - facing), Math.cos(PlayerFromBossAngle -  facing))
  return Math.abs(diff) <= angle / 2
}
