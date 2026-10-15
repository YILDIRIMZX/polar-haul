import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  type BufferGeometry,
  type Material,
} from 'three'
import type { WallKind } from '../config/balance.ts'
import { COLORS, WORLD } from '../config/world.ts'

// LOOKS: the camp's defences — the wall pieces, the front gate, the watchtowers — and the pines that stand
// where the hunters' lodge will go. Every function returns a model with its origin on the ground; the systems
// place it. To change how something looks, change it here only.

const snowMat = new MeshLambertMaterial({ color: COLORS.snowBlock })
const stakeMat = new MeshLambertMaterial({ color: COLORS.fenceWood })
const logMat = new MeshLambertMaterial({ color: COLORS.logWall })
const roofMat = new MeshLambertMaterial({ color: COLORS.trunk })

// How one kind of wall is laid out around the camp: what one piece looks like and how far apart they stand.
// BaseArea repeats the piece around the circle, leaving the gates open.
export interface WallPiece {
  geometry: BufferGeometry
  material: Material
  spacing: number // along the circle
  layers: number[] // heights of the piece's centre; several for stacked logs
  tangent: boolean // lies along the circle, like a log, instead of standing like a stake
  tip?: { geometry: BufferGeometry; y: number } // the sharpened top of a stake
}

export const WALL_PIECES: Record<WallKind, WallPiece> = {
  // Knee-high blocks of wind-packed snow, against the wind, not against bears.
  snow: { geometry: new BoxGeometry(0.95, 0.5, 0.55), material: snowMat, spacing: 1, layers: [0.25], tangent: true },
  // Sharpened stakes driven into the ground side by side: quick and cheap, like a Siberian ostrog.
  stakes: {
    geometry: new CylinderGeometry(0.16, 0.18, 1.7, 6),
    material: stakeMat,
    spacing: 0.42,
    layers: [0.85],
    tangent: false,
    tip: { geometry: new ConeGeometry(0.17, 0.4, 6), y: 1.9 },
  },
  // Logs laid on top of each other: much harder to break.
  logs: {
    geometry: new CylinderGeometry(0.28, 0.28, 1.25, 8).rotateZ(Math.PI / 2),
    material: logMat,
    spacing: 1.2,
    layers: [0.3, 0.86, 1.42, 1.98],
    tangent: true,
  },
}

export const GATE_HEIGHT = 2.6

// The front gate's parts, so the gate can restyle and topple them: two posts, the beam across, and the
// lookout that only the log wall has. `materials` gives each kind of wall its look.
export interface GateLook {
  root: Group
  left: Mesh
  right: Mesh
  beam: Mesh
  lookout: Group
  materials: Record<WallKind, Material>
  // How the posts are shaped on each kind of wall: wide and low snow pillars, plain posts, thick log posts.
  postShape: Record<WallKind, { thick: number; tall: number; beam: boolean; lookout: boolean }>
}

export function gate(): GateLook {
  const root = new Group()
  const half = WORLD.gateWidth / 2 + 0.2
  const left = new Mesh(new BoxGeometry(0.35, GATE_HEIGHT, 0.35), stakeMat)
  left.position.set(-half, GATE_HEIGHT / 2, 0)
  const right = new Mesh(new BoxGeometry(0.35, GATE_HEIGHT, 0.35), stakeMat)
  right.position.set(half, GATE_HEIGHT / 2, 0)
  const beam = new Mesh(new BoxGeometry(half * 2 + 0.6, 0.35, 0.4), stakeMat)
  beam.position.set(0, GATE_HEIGHT, 0)
  for (const m of [left, right, beam]) {
    m.castShadow = true
    root.add(m)
  }
  // A small roofed lookout over the gate.
  const lookout = new Group()
  const room = new Mesh(new BoxGeometry(half * 2 + 0.4, 1.1, 1.3), logMat)
  room.position.y = GATE_HEIGHT + 0.75
  const roof = new Mesh(new ConeGeometry(1.9, 0.9, 4), stakeMat)
  roof.position.y = GATE_HEIGHT + 1.75
  roof.rotation.y = Math.PI / 4
  for (const m of [room, roof]) {
    m.castShadow = true
    lookout.add(m)
  }
  root.add(lookout)
  return {
    root,
    left,
    right,
    beam,
    lookout,
    materials: { snow: snowMat, stakes: stakeMat, logs: logMat },
    postShape: {
      snow: { thick: 2.4, tall: 0.35, beam: false, lookout: false },
      stakes: { thick: 1, tall: 1, beam: true, lookout: false },
      logs: { thick: 1.8, tall: 1, beam: true, lookout: true },
    },
  }
}

export const WATCHTOWER_HEIGHT = 4.2 // the watchman shoots from just above this

// A log tower with a deck and a pointed roof.
export function watchtower(): Group {
  const group = new Group()
  const body = new Mesh(new BoxGeometry(1.6, WATCHTOWER_HEIGHT, 1.6), logMat)
  body.position.y = WATCHTOWER_HEIGHT / 2
  const deck = new Mesh(new BoxGeometry(2.2, 0.25, 2.2), logMat)
  deck.position.y = WATCHTOWER_HEIGHT
  const roof = new Mesh(new ConeGeometry(1.7, 1.1, 4), roofMat)
  roof.position.y = WATCHTOWER_HEIGHT + 1.2
  roof.rotation.y = Math.PI / 4
  for (const m of [body, deck, roof]) {
    m.castShadow = true
    group.add(m)
  }
  return group
}

const trunkMat = new MeshLambertMaterial({ color: COLORS.trunk })
const pineMat = new MeshLambertMaterial({ color: COLORS.pine })
const pineSnowMat = new MeshLambertMaterial({ color: COLORS.pineSnow })

// A snowy pine, as felled for the hunters' lodge.
export function pine(): Group {
  const group = new Group()
  const trunk = new Mesh(new CylinderGeometry(0.2, 0.28, 1, 6), trunkMat)
  trunk.position.y = 0.5
  const crown = new Mesh(new ConeGeometry(1.1, 3.2, 7), pineMat)
  crown.position.y = 2.3
  const cap = new Mesh(new ConeGeometry(0.7, 1.2, 7), pineSnowMat)
  cap.position.y = 3.6
  for (const m of [trunk, crown, cap]) {
    m.castShadow = true
    group.add(m)
  }
  return group
}
