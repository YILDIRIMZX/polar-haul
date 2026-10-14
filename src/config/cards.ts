import type { Stats } from '../game/Stats.ts'
import type { Progress } from '../systems/progression.ts'

// A reward card: a mini boss offers two at random, a main boss gives a fixed one.
export interface CardDef {
  id: string
  title: string
  text: string // what it does, on the card
  maxPicks: number // a card taken this many times leaves the pool
  available?: (progress: Progress) => boolean // left out means always available
  apply: (stats: Stats) => void
}

// Mini boss cards: small number boosts. They can come again until they reach maxPicks.
export const MINI_BOSS_CARDS: readonly CardDef[] = [
  { id: 'wideArea', title: 'Geniş Alan', text: 'Vurma alanı +%15', maxPicks: 4, apply: (s) => s.multiply('attackRange', 0.15) },
  { id: 'strongArm', title: 'Güçlü Kol', text: 'Hasar +%20', maxPicks: 5, apply: (s) => s.multiply('attackDamage', 0.2) },
  // 10% faster swings means the wait between them is 1/1.1 of what it was.
  { id: 'agile', title: 'Çevik', text: 'Saldırı hızı +%10', maxPicks: 5, apply: (s) => s.multiply('attackCooldown', 1 / 1.1 - 1) },
  {
    id: 'oneMore',
    title: 'Bir Ayı Daha',
    text: 'Aynı anda +1 ayı',
    maxPicks: 3, // 3 from Triple Strike + 3 = 6 at most
    available: (p) => p.bossesDefeated >= 1,
    apply: (s) => s.add('attackTargets', 1),
  },
  { id: 'longArm', title: 'Uzun Kol', text: 'Toplama yarıçapı +%20', maxPicks: 4, apply: (s) => s.multiply('pickupRadius', 0.2) },
  { id: 'broadBack', title: 'Geniş Sırt', text: 'Taşıma +3', maxPicks: 5, apply: (s) => s.add('carryCapacity', 3) },
  { id: 'lightStep', title: 'Hafif Adım', text: 'Hareket hızı +%8', maxPicks: 4, apply: (s) => s.multiply('moveSpeed', 0.08) },
  { id: 'thickFur', title: 'Kalın Post', text: 'Can +25', maxPicks: 5, apply: (s) => s.add('maxHp', 25) },
  { id: 'flavor', title: 'Lezzet', text: 'Et fiyatı +%10', maxPicks: 5, apply: (s) => s.multiply('meatPrice', 0.1) },
  { id: 'hotFire', title: 'Harlı Ateş', text: 'Pişirme hızı +%10', maxPicks: 5, apply: (s) => s.multiply('cookSeconds', 1 / 1.1 - 1) },
]

// The first main boss always gives this one, with no choice: the game's first big turning point.
export const TRIPLE_STRIKE: CardDef = {
  id: 'tripleStrike',
  title: 'Üçlü Vuruş',
  text: 'Aynı anda 3 ayıya vurursun',
  maxPicks: 1,
  apply: (s) => s.add('attackTargets', 2),
}




  