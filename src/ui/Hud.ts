// The on-screen numbers: carried meat on the left, cash on the right.
export class Hud {
  private load = document.createElement('div')
  private cash = document.createElement('div')
  private shownCash = -1
  private shownLoad = ''

  constructor() {
    const hud = document.createElement('div')
    hud.id = 'hud'
    this.load.className = 'pill'
    this.cash.className = 'pill cash'
    hud.append(this.load, this.cash)
    document.body.append(hud)
  }

  update(cash: number, carried: number, capacity: number): void {
    const c = Math.floor(cash)
    if (c !== this.shownCash) {
      this.shownCash = c
      this.cash.textContent = `$ ${c}`
    }
    const load = `Et ${carried}/${capacity}`
    if (load !== this.shownLoad) {
      this.shownLoad = load
      this.load.textContent = load
      this.load.classList.toggle('full', carried >= capacity)
    }
  }
}
