import type { Vector3 } from 'three'
import { PLAYER } from '../config/balance.ts'
import type { Bear } from '../entities/Bear.ts'
import type { Player } from '../entities/Player.ts'
import type { BearHerd } from './BearHerd.ts'

// Chooses the bears one swing hits: at most `max` of them, nearest first. An empty list means nothing to hit.
// `from` is the player's position. A bear can be hit only when it is alive (`!bear.dead`)
// and within PLAYER.attackRange of `from`.
export function pickTargets(from: Vector3, bears: readonly Bear[], max: number): Bear[] {
  const  attackable_bears : Bear[] = []
  for (const b of bears){
    if (b.position.distanceTo(from) <= PLAYER.attackRange && !b.dead){
      attackable_bears.push(b)}
}
  attackable_bears.sort((a, b) => a.position.distanceTo(from) - b.position.distanceTo(from)) 
  const max_a_bears = attackable_bears.slice(0, max)
  
  return max_a_bears
}

// Swings every PLAYER.attackCooldown seconds with no button, like the ads' auto-attack,
// hitting every bear pickTargets returns.
export class AutoAttack {
  // Raised by the sweep upgrade pad.
  maxTargets: number = PLAYER.startTargets
  private cooldown = 0

  update(dt: number, player: Player, herd: BearHerd): void {
    this.cooldown = Math.max(0, this.cooldown - dt)
    const targets = pickTargets(player.position, herd.bears, this.maxTargets).filter(
      // Safety net: never hit a dead bear or one out of reach, whatever pickTargets returned.
      (bear) => !bear.dead && bear.position.distanceTo(player.position) <= PLAYER.attackRange,
    )
    if (targets.length === 0) return
    player.faceTowards(targets[0].position)
    if (this.cooldown > 0) return
    this.cooldown = PLAYER.attackCooldown
    player.swing()
    for (const bear of targets.slice(0, this.maxTargets)) herd.hit(bear, PLAYER.attackDamage)
  }
}
