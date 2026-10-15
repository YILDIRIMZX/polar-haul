// What a hunter knows about itself when it decides whether to stop hunting.
export interface HunterState {
  carried: number // pieces of meat on its back
  capacity: number // how many it can carry (the hunterLoad stat)
  hp: number
  maxHp: number
  bearsLeft: number // living bears in the field it could still go for
}

// Decides when a hunter stops hunting and walks home to unload at the gate depot.
// Called every frame while the hunter is out in the field. Returning true sends it home; after unloading
// it goes straight back out. A hunter whose health reaches 0 is sent to rest at the lodge regardless.
export function hunterShouldReturn(h: HunterState): boolean {
  if(h.carried >= h.capacity) return true
  if(h.hp < h.maxHp * 3/10) return true
  if(h.bearsLeft === 0 && h.carried > 0) return true
  return false
}
