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
export function placeCamera(camera: PerspectiveCamera, target: Vector3): void {
  camera.position.set(target.x, target.y + up, target.z + back)
  camera.lookAt(target)
}
