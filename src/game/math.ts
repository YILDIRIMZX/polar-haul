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
