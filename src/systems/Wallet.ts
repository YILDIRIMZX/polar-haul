// Cash is kept as a fraction internally, because unlock pads drain it a little every frame.
export class Wallet {
  amount = 0

  add(value: number): void {
    this.amount += value
  }

  spend(value: number): void {
    this.amount = Math.max(0, this.amount - value)
  }
}
