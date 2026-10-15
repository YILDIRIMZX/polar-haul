import { BoxGeometry, Mesh, MeshBasicMaterial, MeshLambertMaterial, SphereGeometry } from 'three'
import { COLORS } from '../config/world.ts'

// LOOKS: small passing effects. Their movement stays in the systems; only the look is here.

const dustGeo = new SphereGeometry(0.5, 8, 6)
const dustMat = new MeshBasicMaterial({ color: 0xf2efe8, transparent: true, opacity: 0.8, depthWrite: false })

// A puff of building dust. Each has its own material, because it fades on its own.
export function dustPuff(): Mesh {
  return new Mesh(dustGeo, dustMat.clone())
}

const iceGeo = new BoxGeometry(0.75, 0.75, 0.75)
const iceMat = new MeshLambertMaterial({ color: 0xbfe6ff, emissive: 0x5a8fb0, emissiveIntensity: 0.3 })

// A chunk of ice a boss throws over the fence.
export function iceChunk(): Mesh {
  const mesh = new Mesh(iceGeo, iceMat)
  mesh.castShadow = true
  return mesh
}

const arrowGeo = new BoxGeometry(0.06, 0.06, 0.9)
const arrowMat = new MeshLambertMaterial({ color: COLORS.trunk })

// A watchman's arrow; it points along +z.
export function arrow(): Mesh {
  return new Mesh(arrowGeo, arrowMat)
}
