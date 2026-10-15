import { CapsuleGeometry, CylinderGeometry, Group, Mesh, MeshLambertMaterial, type Object3D } from 'three'
import { COLORS } from '../config/world.ts'

// LOOKS: a piece of meat, raw or cooked.
// A flat piece of meat with a bone through it, like in the ads. Flat so it stacks into a tower.
const meatGeo = new CylinderGeometry(0.42, 0.45, 0.24, 12)
const boneGeo = new CapsuleGeometry(0.07, 1.0, 2, 6).rotateZ(Math.PI / 2)
const rawMat = new MeshLambertMaterial({ color: COLORS.meat })
const cookedMat = new MeshLambertMaterial({ color: COLORS.cooked })
const boneMat = new MeshLambertMaterial({ color: COLORS.bone })

export type MeatKind = 'raw' | 'cooked'

export function createMeat(kind: MeatKind = 'raw'): Group {
  const meat = new Mesh(meatGeo, kind === 'raw' ? rawMat : cookedMat)
  meat.castShadow = true
  const group = new Group()
  group.add(meat, new Mesh(boneGeo, boneMat))
  group.userData.kind = kind
  return group
}

export function meatKind(object: Object3D): MeatKind {
  return object.userData.kind === 'cooked' ? 'cooked' : 'raw'
}
