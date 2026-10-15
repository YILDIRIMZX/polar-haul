import type { Progress } from './progression.ts'

// How many cooked pieces a new customer asks for.
// `random()` returns a number from 0 (inclusive) to 1 (exclusive), like Math.random().
// It is passed in rather than called directly, so a test can hand in a fixed value.
// Winter stores make orders bigger: once meat keeps (`progress.stores` is 1 with the drying rack, 2 with the
// ice cellar too), customers buy extra to see them through the winter.
export function orderSize(progress: Progress, random: () => number): number {
  const Parçasayısı =  Math.floor(random()*(progress.stores+3))+1
  return Parçasayısı
}

// The extra cash a customer pays on top of `pieces × price`: a bonus for a bigger order
// and a tip for fast service. A customer whose patience ran out pays no extra (Shop handles that).
// `patienceLeft` runs from 1 (served the moment they arrived) down to 0 (patience just ran out).
export function tipFor(pieces: number, price: number, patienceLeft: number): number {
  const rate = Math.min(2 ** (pieces - 1) / 8, 3 / 4)
  return Math.floor(pieces*price*((rate)+Math.floor(10*(patienceLeft))/10))
  
  
}
