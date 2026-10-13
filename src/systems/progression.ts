// What the player has done so far. New features look at this to decide when they appear.
export interface Progress {
  bearsKilled: number
  totalEarned: number // all cash ever collected, including what was already spent
  capacityLevel: number // how many times Capacity was bought in the character menu
  customersServed: number // customers who got their whole order and paid
  baseLevel: number // the Great Furnace's level, 1 at the start
  furnaceSlots: number // how many pieces the furnace cooks at once, 1 at the start
  bossesDefeated: number // main bosses beaten; bosses arrive in 0.7.0, until then this stays 0
  miniBossesDefeated: number // mini bosses beaten; also 0 until 0.7.0
}

// Decides when the Wide sweep pad appears in the base. Once it returns true, the pad stays for good.
export function isSweepUnlocked(progress: Progress): boolean {
  if (progress.totalEarned >= 100 && progress.bearsKilled >= 20){return true}
  else {return false}

}

// What a base level needs besides its price, and how far along the player is.
// `met` decides whether the Great Furnace pad accepts cash; `label` is written on the pad while it does not,
// for example "Müşteri 6/10".
export interface Requirement {
  met: boolean
  label: string
}

// The prerequisite for raising the base to `nextLevel` (2 or 3 in this version).
export function baseRequirement(nextLevel: number, progress: Progress): Requirement {
  // Labels: an icon and how far along the player is. 👥 customers, 🔥 furnace slots, 🐻 bosses.
  if (nextLevel === 2){
    if (progress.customersServed >= 25 )
    return {met: true,label:''}
    else {return { met: false, label: `👥 ${progress.customersServed}/25` }}
  }
  else if (nextLevel === 3){
    // Only the first missing condition is shown: the furnace first, then the boss.
    if (progress.furnaceSlots < 2) {
      return { met: false, label: `🔥 ${progress.furnaceSlots}/2` }
    }
    if (progress.bossesDefeated < 1) {
      return { met: false, label: `🐻 ${progress.bossesDefeated}/1` }
    }
    return {met: true,label:''}
  }

  return { met: false, label: 'Yakında' }
}
