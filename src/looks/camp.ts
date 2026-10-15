import { BoxGeometry, ConeGeometry, CylinderGeometry, Group, Mesh, MeshLambertMaterial, PlaneGeometry, SphereGeometry } from 'three'
import { BOSSES } from '../config/balance.ts'
import { COLORS } from '../config/world.ts'

// LOOKS: the camp's buildings. Every function returns a new model with its origin on the ground at its
// centre, facing +z; the systems place it. To change how something looks, change it here only.

const stakeMat = new MeshLambertMaterial({ color: COLORS.stake })
const tentMat = new MeshLambertMaterial({ color: COLORS.tent })
const poleMat = new MeshLambertMaterial({ color: COLORS.trunk })
const logMat = new MeshLambertMaterial({ color: COLORS.counter })
const roofMat = new MeshLambertMaterial({ color: COLORS.trunk })
const snowMat = new MeshLambertMaterial({ color: COLORS.pineSnow })
const doorMat = new MeshLambertMaterial({ color: 0x3a2a20 })

// Snow lying on the top of a four-sided roof: the top part of the same pyramid, a little wider, so it follows
// the roof's slope and leaves the eaves bare. `radius` and `height` are the roof's, `top` is the roof's tip.
function snowCap(radius: number, height: number, top: number, share = 0.55): Mesh {
  const h = height * share
  const cap = new Mesh(new ConeGeometry(radius * share * 1.06, h, 4), snowMat)
  cap.position.y = top + 0.04 - h / 2
  cap.rotation.y = Math.PI / 4
  return cap
}

// How high the gate depot's floor stands on its legs; the meat pile sits on it.
const DEPOT_RAISE = 1.4 // on legs, like Alaska's tall caches: bears cannot climb up to the meat
const DEPOT_BOARD = 0.25
export const DEPOT_FLOOR = DEPOT_RAISE + DEPOT_BOARD // where the meat pile starts

// A cone of hides over poles, like a Sámi lavvu, with the pole tips sticking out at the top.
export function tent(): Group {
  const group = new Group()
  const cover = new Mesh(new ConeGeometry(1.1, 2.3, 9), tentMat)
  cover.position.y = 1.15
  cover.castShadow = true
  const door = new Mesh(new BoxGeometry(0.5, 0.8, 0.05), doorMat)
  door.position.set(0, 0.4, 0.95)
  door.rotation.x = -0.4
  group.add(cover, door)
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4
    const pole = new Mesh(new CylinderGeometry(0.04, 0.04, 0.8, 4), poleMat)
    pole.position.set(Math.cos(a) * 0.12, 2.5, Math.sin(a) * 0.12)
    pole.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3)
    group.add(pole)
  }
  return group
}

// A small log cabin with a snowy roof and its door toward the middle of the camp.
export function cabin(): Group {
  const group = new Group()
  const walls = new Mesh(new BoxGeometry(2.1, 1.5, 1.9), logMat)
  walls.position.y = 0.75
  walls.castShadow = true
  walls.receiveShadow = true
  const roof = new Mesh(new ConeGeometry(1.75, 1, 4), roofMat)
  roof.position.y = 2
  roof.rotation.y = Math.PI / 4
  roof.castShadow = true
  const snow = snowCap(1.75, 1, 2.5)
  const door = new Mesh(new BoxGeometry(0.1, 1, 0.6), doorMat)
  door.position.set(-1.06, 0.5, 0)
  group.add(walls, roof, snow, door)
  return group
}

// An open wooden shed on four splayed legs, with a ladder: a floor, a back wall, two posts and a sloping roof.
export function depotShed(): Group {
  const wood = new MeshLambertMaterial({ color: COLORS.counter })
  const dark = new MeshLambertMaterial({ color: COLORS.trunk })
  const base = new Group()
  for (const [x, z] of [
    [-1.05, -0.95],
    [1.05, -0.95],
    [-1.05, 0.95],
    [1.05, 0.95],
  ]) {
    const leg = new Mesh(new BoxGeometry(0.2, DEPOT_RAISE + 0.3, 0.2), dark)
    leg.position.set(x * 1.12, (DEPOT_RAISE + 0.3) / 2 - 0.05, z * 1.12)
    leg.rotation.set(-Math.sign(z) * 0.14, 0, Math.sign(x) * 0.14) // leaning outward
    leg.castShadow = true
    base.add(leg)
  }
  const ladder = new Group()
  for (const side of [-0.28, 0.28]) {
    const rail = new Mesh(new BoxGeometry(0.08, DEPOT_RAISE + 0.6, 0.08), dark)
    rail.position.set(side, (DEPOT_RAISE + 0.6) / 2, 0)
    ladder.add(rail)
  }
  for (let y = 0.3; y < DEPOT_RAISE + 0.4; y += 0.35) {
    const rung = new Mesh(new BoxGeometry(0.6, 0.06, 0.06), dark)
    rung.position.y = y
    ladder.add(rung)
  }
  ladder.position.set(-1.55, 0, 0.6)
  ladder.rotation.z = -0.25
  base.add(ladder)
  const shed = new Group()
  shed.position.y = DEPOT_RAISE
  base.add(shed)
  const floor = new Mesh(new BoxGeometry(2.6, DEPOT_BOARD, 2.4), wood)
  floor.position.y = DEPOT_BOARD / 2
  floor.receiveShadow = true
  shed.add(floor)
  const part = (w: number, h: number, d: number, x: number, y: number, z: number, mat = wood): void => {
    const m = new Mesh(new BoxGeometry(w, h, d), mat)
    m.position.set(x, y, z)
    m.castShadow = true
    shed.add(m)
  }
  part(2.6, 2.2, 0.15, 0, 1.1, -1.12, dark) // back wall, facing the gate
  part(0.18, 2.2, 0.18, -1.2, 1.1, 1.1, dark) // front posts
  part(0.18, 2.2, 0.18, 1.2, 1.1, 1.1, dark)
  const roof = new Mesh(new BoxGeometry(3, 0.14, 2.8), dark)
  roof.position.set(0, 2.3, 0)
  roof.rotation.x = -0.18
  roof.castShadow = true
  shed.add(roof)
  return base
}

// A log cabin with a pitched roof and a door facing the base.
export function huntersLodge(): Group {
  const logs = new MeshLambertMaterial({ color: COLORS.counter })
  const dark = new MeshLambertMaterial({ color: COLORS.trunk })
  const group = new Group()
  const walls = new Mesh(new BoxGeometry(3.2, 2, 3), logs)
  walls.position.y = 1
  walls.castShadow = true
  walls.receiveShadow = true
  const roof = new Mesh(new ConeGeometry(2.6, 1.5, 4), dark)
  roof.position.y = 2.75
  roof.rotation.y = Math.PI / 4
  roof.castShadow = true
  const door = new Mesh(new BoxGeometry(0.1, 1.3, 0.8), dark)
  door.position.set(1.62, 0.65, 0) // on the east side, toward the middle of the base
  const snow = snowCap(2.6, 1.5, 3.5)
  group.add(walls, roof, door, snow)
  return group
}

// Two A-frames with poles across, strips of meat hanging from them, and a smoky fire underneath.
export function dryingRack(): Group {
  const wood = new MeshLambertMaterial({ color: COLORS.stake })
  const meat = new MeshLambertMaterial({ color: COLORS.cooked })
  const fire = new MeshLambertMaterial({ color: COLORS.furnaceFire, emissive: COLORS.furnaceFire, emissiveIntensity: 0.6 })
  const group = new Group()
  for (const x of [-1.3, 1.3]) {
    for (const lean of [-0.25, 0.25]) {
      const leg = new Mesh(new BoxGeometry(0.12, 2.2, 0.12), wood)
      leg.position.set(x, 1.05, lean * 1.6)
      leg.rotation.x = lean
      leg.castShadow = true
      group.add(leg)
    }
  }
  for (const y of [1.5, 2]) {
    const pole = new Mesh(new CylinderGeometry(0.05, 0.05, 2.9, 5).rotateZ(Math.PI / 2), wood)
    pole.position.y = y
    group.add(pole)
    for (let i = 0; i < 6; i++) {
      const strip = new Mesh(new BoxGeometry(0.16, 0.5, 0.05), meat)
      strip.position.set(-1.1 + i * 0.44, y - 0.28, 0)
      group.add(strip)
    }
  }
  const embers = new Mesh(new CylinderGeometry(0.4, 0.5, 0.15, 8), fire)
  embers.position.y = 0.08
  group.add(embers)
  return group
}

// A low mound of turf over a cellar dug into the frozen ground, with a wooden hatch and a little shed on top.
export function iceCellar(): Group {
  const turf = new MeshLambertMaterial({ color: COLORS.trunk })
  const wood = new MeshLambertMaterial({ color: COLORS.counter })
  const group = new Group()
  const mound = new Mesh(new SphereGeometry(1.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), turf)
  mound.scale.set(1, 0.45, 1)
  mound.receiveShadow = true
  const cap = new Mesh(new SphereGeometry(1.52, 14, 8, 0, Math.PI * 2, 0, Math.PI / 5), new MeshLambertMaterial({ color: COLORS.pineSnow }))
  cap.scale.set(1, 0.45, 1)
  const hatch = new Mesh(new BoxGeometry(0.9, 0.12, 0.9), wood)
  hatch.position.set(0, 0.68, 0.4)
  hatch.rotation.x = -0.3
  const shed = new Mesh(new BoxGeometry(0.9, 0.8, 0.8), wood)
  shed.position.set(0, 0.95, -0.35)
  shed.castShadow = true
  group.add(mound, cap, hatch, shed)
  return group
}

// Poles and planks around the plot while it is being built.
export function scaffold(width: number, depth: number): Group {
  const group = new Group()
  for (const [x, z] of [
    [-width / 2, -depth / 2],
    [width / 2, -depth / 2],
    [width / 2, depth / 2],
    [-width / 2, depth / 2],
  ]) {
    const pole = new Mesh(new BoxGeometry(0.16, 3, 0.16), stakeMat)
    pole.position.set(x, 1.5, z)
    group.add(pole)
  }
  for (const y of [1, 2.2]) {
    for (const z of [-depth / 2, depth / 2]) {
      const plank = new Mesh(new BoxGeometry(width + 0.3, 0.12, 0.3), stakeMat)
      plank.position.set(0, y, z)
      group.add(plank)
    }
  }
  return group
}

// A flat bear rug: body, head with ears and four paws, in Yaşlı Ayı's grey.
export function bearPelt(): Group {
  const fur = new MeshLambertMaterial({ color: BOSSES.elder.color })
  const nose = new MeshLambertMaterial({ color: COLORS.bearNose })
  const group = new Group()
  const add = (w: number, h: number, d: number, x: number, y: number, z: number, mat = fur): void => {
    const m = new Mesh(new BoxGeometry(w, h, d), mat)
    m.position.set(x, y, z)
    m.receiveShadow = true
    group.add(m)
  }
  add(2.0, 0.06, 1.5, 0, 0.03, 0) // body; the head points to the middle of the base
  add(0.7, 0.3, 0.8, 1.25, 0.15, 0) // head
  add(0.16, 0.12, 0.3, 1.62, 0.12, 0, nose)
  add(0.18, 0.18, 0.18, 1.1, 0.34, -0.3) // ears
  add(0.18, 0.18, 0.18, 1.1, 0.34, 0.3)
  for (const [x, z] of [
    [0.75, 0.95],
    [0.75, -0.95],
    [-0.75, 0.95],
    [-0.75, -0.95],
  ]) {
    add(0.45, 0.05, 0.5, x, 0.025, z)
  }
  add(0.4, 0.05, 0.3, -1.15, 0.025, 0) // tail
  return group
}

const ropeMat = new MeshLambertMaterial({ color: COLORS.rope })
const dirtMat = new MeshLambertMaterial({ color: COLORS.dirt })

// A building site: snow cleared down to the dirt, a stake at each corner and a rope around.
export function siteMarks(width: number, depth: number): Group {
  const group = new Group()
  const dirt = new Mesh(new PlaneGeometry(width + 0.8, depth + 0.8).rotateX(-Math.PI / 2), dirtMat)
  dirt.position.y = 0.015
  dirt.receiveShadow = true
  group.add(dirt)
  const corners = [
    [-width / 2, -depth / 2],
    [width / 2, -depth / 2],
    [width / 2, depth / 2],
    [-width / 2, depth / 2],
  ]
  for (const [x, z] of corners) {
    const stake = new Mesh(new BoxGeometry(0.14, 0.9, 0.14), stakeMat)
    stake.position.set(x, 0.45, z)
    stake.castShadow = true
    group.add(stake)
  }
  for (let i = 0; i < 4; i++) {
    const [x1, z1] = corners[i]
    const [x2, z2] = corners[(i + 1) % 4]
    const length = Math.hypot(x2 - x1, z2 - z1)
    const rope = new Mesh(new BoxGeometry(0.05, 0.05, length), ropeMat)
    rope.position.set((x1 + x2) / 2, 0.75, (z1 + z2) / 2)
    rope.rotation.y = Math.atan2(x2 - x1, z2 - z1)
    group.add(rope)
  }
  return group
}
