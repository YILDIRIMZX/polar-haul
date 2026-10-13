// Cash is kept as a fraction internally, because unlock pads drain it a little every frame.
export class Wallet {
  amount = 0
  totalEarned = 0 // never goes down; progression reads it

  add(value: number): void {
    this.amount += value
    this.totalEarned += value
  }

  spend(value: number): void {
    this.amount = Math.max(0, this.amount - value)
  }
}
