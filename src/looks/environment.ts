import {
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  Fog,
  HemisphereLight,
  InstancedMesh,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  PlaneGeometry,
  Scene,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  Vector2,
} from 'three'
import { COLORS, LAYOUT, WORLD, type Outline } from '../config/world.ts'

// LOOKS: the static world around the camp.
// The static world: sky, ground, snow and the forest edge. The base and its fence are in BaseArea,
// because they grow with the base level.
export function createScene(): Scene {
  const scene = new Scene()
  scene.background = new Color(COLORS.sky)
  scene.fog = new Fog(COLORS.sky, 45, 110)

  addLights(scene)
  addGround(scene)
  addSnowMounds(scene)
  addForestEdge(scene)

  return scene
}

// Rows of snowy pines just outside the play area: a natural wall that shows where the world ends.
function addForestEdge(scene: Scene): void {
  const a = LAYOUT.playArea
  const rand = seededRandom(21)
  const spots: { x: number; z: number; size: number }[] = []
  for (let row = 0; row < WORLD.treeRows; row++) {
    const out = 2.4 + row * 2.4 // how far outside the play area this row stands
    const minX = a.minX - out
    const maxX = a.maxX + out
    const minZ = a.minZ - out
    const maxZ = a.maxZ + out
    const sides = [
      { x0: minX, z0: minZ, x1: maxX, z1: minZ },
      { x0: maxX, z0: minZ, x1: maxX, z1: maxZ },
      { x0: maxX, z0: maxZ, x1: minX, z1: maxZ },
      { x0: minX, z0: maxZ, x1: minX, z1: minZ },
    ]
    for (const s of sides) {
      const length = Math.hypot(s.x1 - s.x0, s.z1 - s.z0)
      const count = Math.ceil(length / WORLD.treeSpacing)
      for (let i = 0; i < count; i++) {
        const t = (i + rand() * 0.6) / count
        spots.push({
          x: s.x0 + (s.x1 - s.x0) * t + (rand() - 0.5) * 1.4,
          z: s.z0 + (s.z1 - s.z0) * t + (rand() - 0.5) * 1.4,
          size: 0.6 + rand() * 0.4 + row * 0.12,
        })
      }
    }
  }

  const trunks = new InstancedMesh(new CylinderGeometry(0.22, 0.3, 1, 6), new MeshLambertMaterial({ color: COLORS.trunk }), spots.length)
  const crowns = new InstancedMesh(new ConeGeometry(1.2, 3.6, 7), new MeshLambertMaterial({ color: COLORS.pine }), spots.length)
  const caps = new InstancedMesh(new ConeGeometry(0.75, 1.3, 7), new MeshLambertMaterial({ color: COLORS.pineSnow }), spots.length)
  const dummy = new Object3D()
  spots.forEach((p, i) => {
    dummy.rotation.set(0, rand() * Math.PI, 0)
    dummy.scale.setScalar(p.size)
    dummy.position.set(p.x, 0.5 * p.size, p.z)
    dummy.updateMatrix()
    trunks.setMatrixAt(i, dummy.matrix)
    dummy.position.set(p.x, 2.6 * p.size, p.z)
    dummy.updateMatrix()
    crowns.setMatrixAt(i, dummy.matrix)
    dummy.position.set(p.x, 4.1 * p.size, p.z)
    dummy.updateMatrix()
    caps.setMatrixAt(i, dummy.matrix)
  })
  for (const m of [trunks, crowns, caps]) {
    m.castShadow = true
    scene.add(m)
  }
}

function addLights(scene: Scene): void {
  scene.add(new HemisphereLight(0xffffff, 0xb8c7d3, 1.6))

  const sun = new DirectionalLight(0xffffff, 1.8)
  sun.position.set(-18, 30, 12)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  const s = sun.shadow.camera
  s.left = -30
  s.right = 30
  s.top = 30
  s.bottom = -30
  scene.add(sun)
}

function addGround(scene: Scene): void {
  const ground = new Mesh(
    new PlaneGeometry(WORLD.groundSize, WORLD.groundSize),
    new MeshLambertMaterial({ color: COLORS.snow }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)
}

// Flattened spheres scattered outside the base give the snow some depth.
function addSnowMounds(scene: Scene): void {
  const mounds = new InstancedMesh(
    new SphereGeometry(1, 10, 6),
    new MeshLambertMaterial({ color: COLORS.snowShade }),
    WORLD.snowMounds,
  )
  const dummy = new Object3D()
  const rand = seededRandom(7)
  let placed = 0
  while (placed < WORLD.snowMounds) {
    const x = (rand() - 0.5) * WORLD.groundSize * 0.8
    const z = (rand() - 0.5) * WORLD.groundSize * 0.8
    // Clear of the base even at its largest, so a growing fence never swallows a mound.
    if (Math.hypot(x, z) < WORLD.campClearing) continue
    // Keep mounds off the forest edge, so they never poke through a tree trunk.
    const a = LAYOUT.playArea
    const nearEdgeX = x > a.minX - 10 && x < a.maxX + 10 && (x < a.minX + 1 || x > a.maxX - 1)
    const nearEdgeZ = z > a.minZ - 10 && z < a.maxZ + 10 && (z < a.minZ + 1 || z > a.maxZ - 1)
    if (nearEdgeX || nearEdgeZ) continue
    const size = 0.6 + rand() * 1.8
    dummy.position.set(x, 0, z)
    dummy.scale.set(size * 1.6, size * 0.35, size)
    dummy.rotation.y = rand() * Math.PI
    dummy.updateMatrix()
    mounds.setMatrixAt(placed++, dummy.matrix)
  }
  mounds.receiveShadow = true
  scene.add(mounds)
}

// Same layout on every launch, so the world looks the same each time the app opens.
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const campGroundMat = new MeshLambertMaterial({ color: COLORS.baseGround })

// The trodden ground inside the camp's wall, in the wall's own shape, growing with the camp.
export function campGround(outline: Outline): Mesh {
  // Drawn flat on x/y, then laid down, which turns y into -z.
  const shape = new Shape(outline.map((p) => new Vector2(p.x, -p.z)))
  const ground = new Mesh(new ShapeGeometry(shape), campGroundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = 0.01
  ground.receiveShadow = true
  return ground
}
