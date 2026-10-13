import { CapsuleGeometry, CylinderGeometry, Group, Mesh, MeshLambertMaterial } from 'three'
import { COLORS } from '../config/world.ts'

// A flat piece of meat with a bone through it, like in the ads. Flat so it stacks into a tower.
const meatGeo = new CylinderGeometry(0.42, 0.45, 0.24, 12)
const boneGeo = new CapsuleGeometry(0.07, 1.0, 2, 6).rotateZ(Math.PI / 2)
const meatMat = new MeshLambertMaterial({ color: COLORS.meat })
const boneMat = new MeshLambertMaterial({ color: COLORS.bone })

export function createMeat(): Group {
  const meat = new Mesh(meatGeo, meatMat)
  meat.castShadow = true
  const group = new Group()
  group.add(meat, new Mesh(boneGeo, boneMat))
  return group
}
