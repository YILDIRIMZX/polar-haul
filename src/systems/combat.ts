import type { Vector3 } from 'three'
import { audio } from '../audio/Audio.ts'
import type { Bear } from '../entities/Bear.ts'
import type { Player } from '../entities/Player.ts'

// Chooses the bears one swing hits: at most `max` of them, nearest first. An empty list means nothing to hit.
// `from` is the player's position. A bear can be hit only when it is alive (`!bear.dead`)
// and within `range` of `from`.
export function pickTargets(from: Vector3, bears: readonly Bear[], max: number, range: number): Bear[] {
  const  attackable_bears : Bear[] = []
  for (const b of bears){
    if (b.position.distanceTo(from) <= range && !b.dead){
      attackable_bears.push(b)}
}
  attackable_bears.sort((a, b) => a.position.distanceTo(from) - b.position.distanceTo(from))
  const max_a_bears = attackable_bears.slice(0, max)

  return max_a_bears
}

// Swings every `cooldown` seconds with no button, like the ads' auto-attack,
// hitting every bear pickTargets returns.
export class AutoAttack {
  // All four come from Stats every frame, so upgrades and boss cards change them.
  maxTargets = 1
  damage = 10
  range = 3
  cooldown = 0.4
  private wait = 0

  // `bears` is every bear that can be hit, the boss included; `hit` deals the damage to one of them.
  update(dt: number, player: Player, bears: readonly Bear[], hit: (bear: Bear, damage: number) => void): void {
    this.wait = Math.max(0, this.wait - dt)
    const targets = pickTargets(player.position, bears, this.maxTargets, this.range).filter(
      // Safety net: never hit a dead bear or one out of reach, whatever pickTargets returned.
      (bear) => !bear.dead && bear.position.distanceTo(player.position) <= this.range,
    )
    if (targets.length === 0) return
    player.faceTowards(targets[0].position)
    if (this.wait > 0) return
    this.wait = this.cooldown
    player.swing()
    audio.play('hit') // one sound per swing, however many bears it hits
    for (const bear of targets.slice(0, this.maxTargets)) hit(bear, this.damage)
  }
}
