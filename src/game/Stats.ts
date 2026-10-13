import { BASE_STATS, type StatId } from '../config/balance.ts'

// Every changeable value in one place: value = (base + sum of additions) × product of (1 + multipliers).
// Upgrade pads, boss cards and perks all change values through here, so they stack the same way.
export class Stats {
  private flat = new Map<StatId, number>()
  private product = new Map<StatId, number>()

  get(id: StatId): number {
    return (BASE_STATS[id] + (this.flat.get(id) ?? 0)) * (this.product.get(id) ?? 1)
  }

  // Whole-number view, for counts such as slots or targets.
  count(id: StatId): number {
    return Math.floor(this.get(id) + 1e-9)
  }

  add(id: StatId, amount: number): void {
    this.flat.set(id, (this.flat.get(id) ?? 0) + amount)
  }

  // 0.1 means +10%, -0.15 means -15%. Several multipliers multiply together.
  multiply(id: StatId, fraction: number): void {
    this.product.set(id, (this.product.get(id) ?? 1) * (1 + fraction))
  }
}
