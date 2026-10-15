// Every sound effect, as ZzFX parameters: a few numbers each, no audio files.
// Order: volume, randomness, frequency, attack, sustain, release, shape, shapeCurve, slide,
// deltaSlide, pitchJump, pitchJumpTime, repeatTime, noise, modulation, bitCrush, delay,
// sustainVolume, decay. Shapes: 0 sine, 1 triangle, 2 saw, 3 tan, 4 noise.
// Tune them at https://killedbyapixel.github.io/ZzFX/ and paste the numbers back here.
export const SOUNDS = {
  // Hunt
  hit: [0.7, 0.1, 150, 0, 0.02, 0.08, 4, 1.4, 0, 0, 0, 0, 0, 0.8],
  bearDie: [0.8, 0.1, 90, 0.01, 0.1, 0.35, 2, 0.6, -4, 0, 0, 0, 0, 0.6, 0, 0, 0, 0.6],
  meatPop: [0.4, 0.1, 420, 0, 0.01, 0.06, 0, 1.5, 12],
  pickup: [0.5, 0, 520, 0, 0.02, 0.07, 0, 1.6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.6],
  full: [0.5, 0, 260, 0, 0.06, 0.12, 1, 1, 0, 0, -60, 0.06],
  hurt: [0.5, 0.1, 240, 0, 0.04, 0.12, 2, 1, -12],
  knockout: [0.7, 0.1, 200, 0.02, 0.2, 0.5, 2, 1, -6],
  levelUp: [0.6, 0, 660, 0.01, 0.1, 0.3, 1, 1.5, 0, 0, 330, 0.06],
  // Bosses
  bossWarn: [1, 0.05, 60, 0, 0.08, 0.4, 0, 2, -2, 0, 0, 0, 0.18, 0.4, 0, 0, 0, 0.7, 0.1],
  bossHit: [0.9, 0.1, 70, 0.01, 0.06, 0.3, 4, 1.2, -3, 0, 0, 0, 0, 0.9],
  bossDie: [1, 0.05, 70, 0.02, 0.25, 0.7, 2, 0.6, -2, 0, 0, 0, 0, 0.5, 0, 0, 0, 0.6],
  bossRoar: [0.9, 0.2, 80, 0.08, 0.4, 0.5, 2, 0.5, 1, 0, 0, 0, 0, 1.2, 8],
  bossIntro: [0.8, 0, 110, 0.05, 0.4, 0.6, 2, 1, 0, 0, 55, 0.2, 0, 0.3, 0, 0, 0.1, 0.8],
  growl: [0.7, 0.15, 75, 0.05, 0.3, 0.2, 2, 0.5, 0.5, 0, 0, 0, 0, 1.5, 12],
  whoosh: [0.6, 0, 200, 0.05, 0.12, 0.2, 4, 1, 4, 0, 0, 0, 0, 2],
  bonk: [0.8, 0, 300, 0, 0.02, 0.25, 1, 2, -8, 0, 0, 0, 0, 0.2],
  storm: [0.6, 0, 300, 0.6, 0.8, 1.2, 4, 0, -0.5, 0, 0, 0, 0, 3],
  cardShow: [0.5, 0, 300, 0.05, 0.1, 0.2, 0, 1, 20, 0, 0, 0, 0, 0.6],
  cardPick: [0.6, 0, 523, 0.01, 0.12, 0.35, 1, 1, 0, 0, 262, 0.07, 0.14],
  // Production
  pour: [0.25, 0.2, 700, 0, 0.005, 0.03, 1, 1],
  cooked: [0.4, 0, 1500, 0, 0.02, 0.25, 0, 2.5],
  place: [0.4, 0.1, 300, 0, 0.01, 0.05, 1, 1],
  // Customers
  bell: [0.35, 0, 1900, 0, 0.04, 0.45, 0, 3, 0, 0, 500, 0.08],
  pay: [0.6, 0, 1300, 0, 0.04, 0.2, 1, 1.4, 0, 0, 700, 0.05],
  tip: [0.4, 0, 2200, 0, 0.03, 0.3, 0, 2, 0, 0, 900, 0.06, 0.06],
  angry: [0.6, 0.15, 110, 0.03, 0.12, 0.2, 2, 0.6, -3, 0, 0, 0, 0, 0.3],
  // Money and upgrades
  coin: [0.4, 0, 1400, 0, 0.02, 0.09, 1, 1.5, 0, 0, 500, 0.03],
  padTick: [0.25, 0, 600, 0, 0.01, 0.04, 1, 1],
  purchase: [0.6, 0, 520, 0.02, 0.18, 0.35, 1, 1, 0, 0, 260, 0.08, 0.09],
  appear: [0.5, 0, 700, 0, 0.03, 0.15, 0, 1.8, 15],
} satisfies Record<string, number[]>

export type SoundId = keyof typeof SOUNDS
