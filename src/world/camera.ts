import { MathUtils, PerspectiveCamera, Vector3 } from 'three'
import { CAMERA } from '../config/world.ts'

export function createCamera(aspect: number): PerspectiveCamera {
  return new PerspectiveCamera(CAMERA.fov, aspect, CAMERA.near, CAMERA.far)
}

const pitch = MathUtils.degToRad(CAMERA.pitchDeg)
const up = CAMERA.distance * Math.sin(pitch)
const back = CAMERA.distance * Math.cos(pitch)

// Called every frame so the camera follows the target (the player).
// The camera sits behind (+z) and above the player, so the bears (-z) fill the top of the screen.
// `zoom` below 1 moves it closer; `shake` (0–1) jolts it, for stomps and roars.
export function placeCamera(camera: PerspectiveCamera, target: Vector3, zoom = 1, shake = 0): void {
  const jolt = shake * CAMERA.maxShake
  const jx = (Math.random() - 0.5) * jolt
  const jy = (Math.random() - 0.5) * jolt
  camera.position.set(target.x + jx, target.y + up * zoom + jy, target.z + back * zoom)
  camera.lookAt(target.x + jx * 0.5, target.y + jy * 0.5, target.z)
}
