import type { CardDef } from '../config/cards.ts'
import type { Progress } from './progression.ts'

// The cards a mini boss offers: `count` different cards from `pool`, at random.
// `taken` says how many times each card id has been picked so far (a missing id means 0).
// A card may be offered only while it is below its maxPicks and its `available` check (if any) passes.
// If fewer than `count` cards qualify, all of them are offered; an empty list means nothing is left,
// and the card screen is skipped. `random` returns a number in [0, 1), like Math.random.
export function pickCards(
  pool: readonly CardDef[],
  taken: ReadonlyMap<string, number>,
  progress: Progress,
  count: number,
  random: () => number,
): CardDef[] {
  const AvailableCards  : CardDef[]  = []
  for ( const i of pool)
  {
    const timesTaken =  taken.get(i.id)?? 0
    if (i.maxPicks > timesTaken && (i.available === undefined || i.available(progress))){
      AvailableCards.push(i)
      
    }
    
  }
  // Pick one at random, take it out of the list so it cannot come again, and repeat until there are
  // `count` cards or none left.
  const chosen: CardDef[] = []
  while (chosen.length < count && AvailableCards.length > 0) {
    const t = Math.floor(random() * AvailableCards.length)
    chosen.push(AvailableCards[t])
    AvailableCards.splice(t, 1)
  }
  return chosen
}
