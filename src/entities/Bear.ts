import { Group, MeshLambertMaterial, Vector3 } from 'three'
import { BEAR } from '../config/balance.ts'
import { COLORS } from '../config/world.ts'
import { turnTowards } from '../game/math.ts'
import { HpBar } from '../fx/HpBar.ts'
import type { Fighter } from './Fighter.ts'
import { bear as bearLook } from '../looks/creatures.ts'

// A boss is the same bear, only bigger and in another colour.
export interface BearLook {
  scale: number
  color: number
}

const NORMAL: BearLook = { scale: 1, color: COLORS.bear }

// One bear of the herd, or a boss. Its look comes from looks/creatures.ts; the head points along +z.
export class Bear {
  readonly root = new Group()
  readonly hpBar: HpBar
  readonly goal = new Vector3()
  readonly scale: number
  maxHp: number = BEAR.maxHp // set at every spawn, because it grows with the hunt level
  hp: number = BEAR.maxHp
  dead = false
  aggro = 0
  target: Fighter | null = null // who it is angry at; nobody set means the player
  attackTimer = 0
  goalTimer = 0
  respawnTimer = 0
  facing = 0
  glow = 0x000000 // a steady tint, such as an angry boss's red
  private flash = 0
  private material: MeshLambertMaterial

  constructor(look: BearLook = NORMAL) {
    this.scale = look.scale
    const looks = bearLook(look.color)
    this.material = looks.skin
    this.hpBar = new HpBar(COLORS.hpBear, 1.6 * look.scale)
    this.root.add(looks.model)
    this.root.scale.setScalar(look.scale)
    // Turn first, then tip: so a boss rearing up leans back along the way it faces.
    this.root.rotation.order = 'YXZ'
  }

  get radius(): number {
    return BEAR.radius * this.scale
  }

  get position(): Vector3 {
    return this.root.position
  }

  // Returns true when this hit killed the bear.
  hit(damage: number): boolean {
    this.hp -= damage
    this.flash = 0.12
    this.aggro = BEAR.aggroSeconds
    if (this.hp > 0) return false
    this.dead = true
    this.root.visible = false
    this.hpBar.hide()
    this.respawnTimer = BEAR.respawnSeconds
    return true
  }

  spawn(x: number, z: number, maxHp: number): void {
    this.dead = false
    this.maxHp = maxHp
    this.hp = maxHp
    this.aggro = 0
    this.target = null
    this.attackTimer = 0
    this.goalTimer = 0
    this.root.visible = true
    this.position.set(x, 0, z)
  }

  updateLook(dt: number): void {
    this.flash -= dt
    this.material.emissive.setHex(this.flash > 0 ? COLORS.hitFlash : this.glow)
    this.root.rotation.y = turnTowards(this.root.rotation.y, this.facing, BEAR.turnSpeed * dt)
  }
}
