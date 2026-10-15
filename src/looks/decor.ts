import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshLambertMaterial, SphereGeometry } from 'three'
import { COLORS } from '../config/world.ts'

// LOOKS: the camp's clutter. Things that do nothing but make the camp look lived in: a sled left by the road,
// crates by the till, logs waiting for the wall. Each function returns a new model with its origin on the
// ground at its centre, facing +z. Where they stand is in config/decor.ts; to add a new kind, add a function
// here and its footprint below.

const woodMat = new MeshLambertMaterial({ color: COLORS.counter })
const darkMat = new MeshLambertMaterial({ color: COLORS.trunk })
const logMat = new MeshLambertMaterial({ color: COLORS.logWall })
const snowMat = new MeshLambertMaterial({ color: COLORS.pineSnow })
const ironMat = new MeshLambertMaterial({ color: COLORS.machine })

function box(w: number, h: number, d: number, mat: MeshLambertMaterial, x = 0, y = h / 2, z = 0): Mesh {
  const m = new Mesh(new BoxGeometry(w, h, d), mat)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

// A wooden sled on two runners, long side along z.
function sled(): Group {
  const g = new Group()
  for (const x of [-0.32, 0.32]) {
    g.add(box(0.08, 0.08, 1.7, darkMat, x, 0.04))
    const tip = box(0.08, 0.3, 0.08, darkMat, x, 0.15, -0.85)
    g.add(tip)
  }
  g.add(box(0.8, 0.08, 1.4, woodMat, 0, 0.26))
  g.add(box(0.7, 0.2, 0.5, snowMat, 0, 0.4, 0.3)) // a load under snow
  return g
}

// Two crates, one on the other, a little turned.
function crates(): Group {
  const g = new Group()
  g.add(box(0.8, 0.6, 0.8, woodMat))
  const top = box(0.6, 0.45, 0.6, woodMat, 0.05, 0.6 + 0.225, 0)
  top.rotation.y = 0.35
  g.add(top, box(0.62, 0.06, 0.62, snowMat, 0.05, 0.6 + 0.48, 0))
  return g
}

// A barrel with two iron hoops and snow on the lid.
function barrel(): Group {
  const g = new Group()
  const body = new Mesh(new CylinderGeometry(0.34, 0.3, 0.8, 12), woodMat)
  body.position.y = 0.4
  body.castShadow = true
  for (const y of [0.18, 0.62]) {
    const hoop = new Mesh(new CylinderGeometry(0.35, 0.35, 0.05, 12), ironMat)
    hoop.position.y = y
    g.add(hoop)
  }
  const lid = new Mesh(new CylinderGeometry(0.3, 0.33, 0.06, 12), snowMat)
  lid.position.y = 0.83
  g.add(body, lid)
  return g
}

// Felled logs stacked in a pyramid, waiting to become the next wall. Long side along x.
function logStack(): Group {
  const g = new Group()
  const rows = [3, 2, 1]
  rows.forEach((count, row) => {
    for (let i = 0; i < count; i++) {
      const log = new Mesh(new CylinderGeometry(0.16, 0.16, 1.7, 8), logMat)
      log.rotation.z = Math.PI / 2
      log.position.set(0, 0.16 + row * 0.28, (i - (count - 1) / 2) * 0.33)
      log.castShadow = true
      g.add(log)
    }
  })
  g.add(box(1.5, 0.06, 0.3, snowMat, 0, 0.16 + 2 * 0.28 + 0.17, 0))
  return g
}

// A heap of shovelled snow.
function snowPile(): Group {
  const g = new Group()
  for (const [x, z, r] of [[0, 0, 0.55], [0.35, 0.2, 0.38], [-0.3, 0.25, 0.32]] as const) {
    const lump = new Mesh(new SphereGeometry(r, 10, 8), snowMat)
    lump.position.set(x, r * 0.35, z)
    lump.scale.y = 0.7
    lump.receiveShadow = true
    g.add(lump)
  }
  return g
}

// Split firewood stacked against a post. Long side along x.
function firewood(): Group {
  const g = new Group()
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 4; i++) {
      const piece = new Mesh(new CylinderGeometry(0.1, 0.1, 0.6, 6), row % 2 ? woodMat : darkMat)
      piece.rotation.x = Math.PI / 2
      piece.position.set((i - 1.5) * 0.24, 0.1 + row * 0.19, 0)
      g.add(piece)
    }
  }
  g.add(box(0.06, 0.8, 0.06, darkMat, -0.5, 0.4), box(0.06, 0.8, 0.06, darkMat, 0.5, 0.4))
  return g
}

export const DECOR_LOOKS = { sled, crates, barrel, logStack, snowPile, firewood }
export type DecorKind = keyof typeof DECOR_LOOKS

// How much ground each kind blocks, facing +z (width along x, depth along z); null means people walk through it.
export const DECOR_FOOTPRINT: Record<DecorKind, { width: number; depth: number } | null> = {
  sled: { width: 0.9, depth: 1.8 },
  crates: { width: 0.9, depth: 0.9 },
  barrel: { width: 0.8, depth: 0.8 },
  logStack: { width: 1.8, depth: 1.0 },
  snowPile: null,
  firewood: { width: 1.2, depth: 0.8 },
}
