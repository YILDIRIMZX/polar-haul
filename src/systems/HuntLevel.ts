import { BEAR, HUNT } from '../config/balance.ts'

// The hunt level: every bear killed counts toward it, and each level makes the herd bigger and stronger.
// The player never buys it; it grows by itself as they hunt, so the upgrades always have something to beat.
export class HuntLevel {
  level = 1
  kills = 0 // kills made on this level, toward the next one

  // Kills needed to leave the current level.
  get needed(): number {
    return HUNT.killsBase + HUNT.killsPerLevel * this.level
  }

  // Returns true when this kill raised the level.
  addKill(): boolean {
    this.kills++
    if (this.kills < this.needed) return false
    this.kills -= this.needed
    this.level++
    return true
  }

  get bearCount(): number {
    return Math.min(HUNT.maxBears, BEAR.count + HUNT.bearsPerLevel * (this.level - 1))
  }

  get bearHp(): number {
    return Math.round(BEAR.maxHp * HUNT.hpGrowth ** (this.level - 1))
  }

  get bearDamage(): number {
    return BEAR.attackDamage * HUNT.damageGrowth ** (this.level - 1)
  }

  // Extra meat each bear drops on top of BEAR.meatMin–meatMax.
  get meatBonus(): number {
    return Math.floor((this.level - 1) / HUNT.meatEveryLevels)
  }
}
