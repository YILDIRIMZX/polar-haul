import {
  BoxGeometry,
  CapsuleGeometry,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  RingGeometry,
  SphereGeometry,
} from 'three'
import { COLORS } from '../config/world.ts'

// LOOKS: everyone who moves — bears and bosses, the player, customers and workers. Each model has its origin
// on the ground and faces +z; the parts that animate are handed back by name. To change how someone looks,
// change it here only.

const bearBody = new BoxGeometry(1.5, 1.0, 2.2)
const bearHead = new BoxGeometry(0.9, 0.8, 0.85)
const bearEar = new BoxGeometry(0.22, 0.22, 0.12)
const bearNose = new BoxGeometry(0.3, 0.22, 0.12)
const noseMat = new MeshLambertMaterial({ color: COLORS.bearNose })

export interface BearModel {
  model: Group
  skin: MeshLambertMaterial // its own per bear: it flashes when hit and glows when a boss is angry
}

// A blocky bear, head toward +z. Bosses are the same bear, scaled up and in another colour.
export function bear(color: number): BearModel {
  const skin = new MeshLambertMaterial({ color })
  const model = new Group()
  const body = new Mesh(bearBody, skin)
  body.position.y = 0.8
  const head = new Mesh(bearHead, skin)
  head.position.set(0, 1.1, 1.35)
  const nose = new Mesh(bearNose, noseMat)
  nose.position.set(0, 1.0, 1.82)
  const earL = new Mesh(bearEar, skin)
  earL.position.set(-0.3, 1.58, 1.2)
  const earR = new Mesh(bearEar, skin)
  earR.position.set(0.3, 1.58, 1.2)
  body.castShadow = true
  head.castShadow = true
  model.add(body, head, nose, earL, earR)
  return { model, skin }
}

export interface PlayerModel {
  body: Group // turns to face the way it walks and squashes on each swing
  ring: Mesh // the circle on the ground that marks the player
}

// The player: a blue figure with a club held in front, which shows which way they face.
export function player(): PlayerModel {
  const body = new Group()
  const torso = new Mesh(new CapsuleGeometry(0.45, 0.8, 4, 12), new MeshLambertMaterial({ color: COLORS.player }))
  torso.position.y = 0.85
  torso.castShadow = true
  const club = new Mesh(new BoxGeometry(0.16, 0.16, 0.9), new MeshLambertMaterial({ color: COLORS.fenceWood }))
  club.position.set(0.45, 0.9, 0.45)
  club.castShadow = true
  body.add(torso, club)
  const ring = new Mesh(new RingGeometry(0.75, 0.9, 32), new MeshBasicMaterial({ color: COLORS.playerRing, transparent: true, opacity: 0.85 }))
  ring.rotation.x = -Math.PI / 2
  ring.position.y = 0.03
  return { body, ring }
}

const personBody = new CapsuleGeometry(0.38, 0.7, 4, 10)
const personHead = new SphereGeometry(0.28, 12, 8)
const skinMat = new MeshLambertMaterial({ color: COLORS.skin })
const coatMats = COLORS.coats.map((color) => new MeshLambertMaterial({ color }))

// A cold survivor in a coat of a random colour. The body turns as a whole.
export function customer(): Group {
  const body = new Group()
  const coat = new Mesh(personBody, coatMats[Math.floor(Math.random() * coatMats.length)])
  coat.position.y = 0.75
  coat.castShadow = true
  const head = new Mesh(personHead, skinMat)
  head.position.y = 1.55
  body.add(coat, head)
  return body
}

const workerBody = new CapsuleGeometry(0.36, 0.65, 4, 10)
const workerHead = new SphereGeometry(0.26, 12, 8)
const workerHat = new BoxGeometry(0.5, 0.18, 0.5)

export const WORKER_HEAD_TOP = 1.95 // where a worker's carried pile starts

// A worker in its job's colour, with a darker cap. The body turns as a whole.
export function worker(color: number): Group {
  const body = new Group()
  const torso = new Mesh(workerBody, new MeshLambertMaterial({ color }))
  torso.position.y = 0.72
  torso.castShadow = true
  const head = new Mesh(workerHead, skinMat)
  head.position.y = 1.5
  const cap = new Mesh(workerHat, new MeshLambertMaterial({ color: new Color(color).multiplyScalar(0.7) }))
  cap.position.y = 1.72
  body.add(torso, head, cap)
  return body
}
