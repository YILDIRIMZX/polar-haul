import { BoxGeometry, Group, Mesh, MeshLambertMaterial, Vector3 } from 'three'
import { BEAR } from '../config/balance.ts'
import { COLORS } from '../config/world.ts'
import { turnTowards } from '../game/math.ts'
import { HpBar } from '../fx/HpBar.ts'

// Shared by every bear; only the body material is per bear, so each one can flash on its own.
const bodyGeo = new BoxGeometry(1.5, 1.0, 2.2)
const headGeo = new BoxGeometry(0.9, 0.8, 0.85)
const earGeo = new BoxGeometry(0.22, 0.22, 0.12)
const noseGeo = new BoxGeometry(0.3, 0.22, 0.12)
const noseMat = new MeshLambertMaterial({ color: COLORS.bearNose })

// Placeholder look until a real model arrives in 0.4.0. The head points along +z.
export class Bear {
  readonly root = new Group()
  readonly hpBar = new HpBar(COLORS.hpBear, 1.6)
  readonly goal = new Vector3()
  hp: number = BEAR.maxHp
  dead = false
  aggro = 0
  attackTimer = 0
  goalTimer = 0
  respawnTimer = 0
  facing = 0
  private flash = 0
  private material = new MeshLambertMaterial({ color: COLORS.bear })

  constructor() {
    const body = new Mesh(bodyGeo, this.material)
    body.position.y = 0.8
    const head = new Mesh(headGeo, this.material)
    head.position.set(0, 1.1, 1.35)
    const nose = new Mesh(noseGeo, noseMat)
    nose.position.set(0, 1.0, 1.82)
    const earL = new Mesh(earGeo, this.material)
    earL.position.set(-0.3, 1.58, 1.2)
    const earR = new Mesh(earGeo, this.material)
    earR.position.set(0.3, 1.58, 1.2)
    body.castShadow = true
    head.castShadow = true
    this.root.add(body, head, nose, earL, earR)
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

  spawn(x: number, z: number): void {
    this.dead = false
    this.hp = BEAR.maxHp
    this.aggro = 0
    this.attackTimer = 0
    this.goalTimer = 0
    this.root.visible = true
    this.position.set(x, 0, z)
  }

  updateLook(dt: number): void {
    this.flash -= dt
    this.material.emissive.setHex(this.flash > 0 ? COLORS.hitFlash : 0x000000)
    this.root.rotation.y = turnTowards(this.root.rotation.y, this.facing, BEAR.turnSpeed * dt)
  }
}
