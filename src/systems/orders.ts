import type { Progress } from './progression.ts'

// How many cooked pieces a new customer asks for.
// `random()` returns a number from 0 (inclusive) to 1 (exclusive), like Math.random().
// It is passed in rather than called directly, so a test can hand in a fixed value.
export function orderSize(progress: Progress, random: () => number): number {
  const Parçasayısı =  Math.floor(random()*3)+1
  void progress
  return Parçasayısı
}

// The extra cash a customer pays on top of `pieces × price`: a bonus for a bigger order
// and a tip for fast service. A customer whose patience ran out pays no extra (Shop handles that).
// `patienceLeft` runs from 1 (served the moment they arrived) down to 0 (patience just ran out).
export function tipFor(pieces: number, price: number, patienceLeft: number): number {
  if (pieces  == 3){
    return Math.floor(pieces*price*(1/2+Math.floor(10*(patienceLeft))/10))
  }
  else if (pieces == 2){
    return  Math.floor(pieces*price*(1/4+Math.floor(10*(patienceLeft))/10))
  }
  else { return  Math.floor(pieces*price*(1/8+Math.floor(10*(patienceLeft))/10))}
  
}
