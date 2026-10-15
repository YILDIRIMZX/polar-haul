export type HitResult = 'perfect' | 'good' | 'miss'

// Judges one tap in the repair minigame. A marker slides back and forth along a bar; the green zone is the
// stretch from `zoneStart` to `zoneStart + zoneWidth`. All three numbers are on the same 0–1 scale, where 0 is
// the bar's left end and 1 its right end. `marker` is where the marker was at the moment of the tap.
// A perfect hit repairs the most, a good one less, and even a miss repairs a little, so a repair always ends.
export function judgeHit(marker: number, zoneStart: number, zoneWidth: number): HitResult {
  const zoneMiddle = zoneStart+(zoneWidth /2)
  if (marker <= (zoneMiddle+(zoneWidth*3/10)) && marker >= (zoneMiddle-(zoneWidth*3/10)))return 'perfect'
  
  if (marker <= zoneMiddle+(zoneWidth/2) && marker >= zoneMiddle-(zoneWidth/2))return 'good'
  
  return 'miss'
}
