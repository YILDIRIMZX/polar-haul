import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshLambertMaterial } from 'three'
import { COLORS } from '../config/world.ts'

// LOOKS: the work stations — the furnace and its pallets, the counter, the till with its cash, and the Great
// Furnace. Models have their origin on the ground at their centre; parts that animate are handed back by name.
// To change how something looks, change it here only.

const metal = new MeshLambertMaterial({ color: COLORS.machine })
const wood = new MeshLambertMaterial({ color: COLORS.counter })

export interface FurnaceLook {
  root: Group // shakes while cooking
  fire: MeshLambertMaterial // glows while cooking, goes dark when the fire is out
}

// A metal stove with a glowing mouth toward the camera (+z) and a chimney.
export function furnace(): FurnaceLook {
  const fire = new MeshLambertMaterial({ color: COLORS.furnaceFire, emissive: COLORS.furnaceFire, emissiveIntensity: 0.2 })
  const root = new Group()
  const body = new Mesh(new BoxGeometry(2, 1.7, 1.8), metal)
  body.position.y = 0.85
  body.castShadow = true
  const mouth = new Mesh(new BoxGeometry(1.2, 0.6, 0.1), fire)
  mouth.position.set(0, -0.2, 0.91)
  const chimney = new Mesh(new BoxGeometry(0.4, 0.8, 0.4), metal)
  chimney.position.set(0.55, 1.2, -0.45)
  body.add(mouth, chimney)
  root.add(body)
  return { root, fire }
}

export const PALLET_TOP = 0.3 // meat piles start on top of this

// A low wooden pallet the raw tray and the cooked shelf stand on.
export function pallet(): Mesh {
  const m = new Mesh(new BoxGeometry(1.5, PALLET_TOP, 1.4), wood)
  m.position.y = PALLET_TOP / 2
  m.receiveShadow = true
  return m
}

export const COUNTER_TOP = 0.85 // cooked pieces lie on top of this
export const TILL_TOP = 0.7 // cash bundles stack on top of this

export function counter(): Mesh {
  const m = new Mesh(new BoxGeometry(3.2, COUNTER_TOP, 1.0), wood)
  m.position.y = COUNTER_TOP / 2
  m.castShadow = true
  m.receiveShadow = true
  return m
}

export function till(): Mesh {
  const m = new Mesh(new BoxGeometry(1.4, TILL_TOP, 1.2), metal)
  m.position.y = TILL_TOP / 2
  m.castShadow = true
  m.receiveShadow = true
  return m
}

const cashGeo = new BoxGeometry(0.55, 0.14, 0.32)
const cashMat = new MeshLambertMaterial({ color: COLORS.cash })

// One green bundle of cash on the till.
export function cashBundle(): Mesh {
  const m = new Mesh(cashGeo, cashMat)
  m.castShadow = true
  return m
}

export interface GreatFurnaceLook {
  root: Group // grows a storey at base level 3
  fire: Mesh // its flames grow too
  fireMat: MeshLambertMaterial // flickers
}

// A round stone furnace with fire on top: the camp's heart.
export function greatFurnace(): GreatFurnaceLook {
  const fireMat = new MeshLambertMaterial({ color: COLORS.furnaceFire, emissive: COLORS.furnaceFire, emissiveIntensity: 0.6 })
  const root = new Group()
  const body = new Mesh(new CylinderGeometry(1.1, 1.4, 2.2, 10), metal)
  body.position.y = 1.1
  body.castShadow = true
  const fire = new Mesh(new CylinderGeometry(0.9, 0.9, 0.3, 10), fireMat)
  fire.position.y = 2.3
  root.add(body, fire)
  return { root, fire, fireMat }
}
