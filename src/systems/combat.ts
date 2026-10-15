import type { Vector3 } from 'three'
import { audio } from '../audio/Audio.ts'
import type { Bear } from '../entities/Bear.ts'
import type { Player } from '../entities/Player.ts'
import { isInsideBase } from '../world/bounds.ts'

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
  // A boss in reach is always struck first: nobody turns away from a giant bear to hit a small one.
  // Nothing is hit across the fence: a bear outside cannot be struck from inside the base, nor the other way round.
  update(dt: number, player: Player, allBears: readonly Bear[], hit: (bear: Bear, damage: number) => void, boss: Bear | null = null): void {
    this.wait = Math.max(0, this.wait - dt)
    const inside = player.inBase
    const bears = allBears.filter((b) => isInsideBase(b.position.x, b.position.z) === inside)
    const bossInReach = boss !== null && !boss.dead && bears.includes(boss) && boss.position.distanceTo(player.position) <= this.range
    const others = bossInReach ? bears.filter((b) => b !== boss) : bears
    const picked = pickTargets(player.position, others, this.maxTargets - (bossInReach ? 1 : 0), this.range)
    const targets = (bossInReach && boss ? [boss, ...picked] : picked).filter(
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
