// What the player has done so far. New features look at this to decide when they appear.
export interface Progress {
  bearsKilled: number
  totalEarned: number // all cash ever collected, including what was already spent
  capacityLevel: number // how many times the Capacity pad was bought
  customersServed: number // customers who got their whole order and paid
}

// Decides when the Wide sweep pad appears in the base. Once it returns true, the pad stays for good.
export function isSweepUnlocked(progress: Progress): boolean {
  if (progress.totalEarned >= 100 && progress.bearsKilled >= 20){return true}
  else {return false}
  
}
