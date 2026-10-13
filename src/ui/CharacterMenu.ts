import { audio } from '../audio/Audio.ts'
import { CHARACTER_UPGRADES, priceFor, type CharacterUpgradeDef } from '../config/upgrades.ts'
import type { Stats } from '../game/Stats.ts'
import type { Progress } from '../systems/progression.ts'
import type { Wallet } from '../systems/Wallet.ts'

// The character upgrades, opened from the button at the top of the screen. The game pauses while it is open.
export class CharacterMenu {
  isOpen = false
  private levels = new Map<string, number>()
  private overlay = document.createElement('div')
  private cash = document.createElement('div')
  private list = document.createElement('div')
  private stats: Stats
  private wallet: Wallet
  private progress: Progress
  private onToggle: (open: boolean) => void

  constructor(stats: Stats, wallet: Wallet, progress: Progress, onToggle: (open: boolean) => void) {
    this.stats = stats
    this.wallet = wallet
    this.progress = progress
    this.onToggle = onToggle

    this.overlay.className = 'menu-overlay hidden'
    const panel = document.createElement('div')
    panel.className = 'menu-panel'
    panel.setAttribute('role', 'dialog')
    panel.setAttribute('aria-label', 'Karakter')

    const head = document.createElement('div')
    head.className = 'menu-head'
    const title = document.createElement('h2')
    title.textContent = 'Karakter'
    this.cash.className = 'menu-cash'
    const close = document.createElement('button')
    close.type = 'button'
    close.className = 'menu-close'
    close.textContent = 'Kapat'
    close.addEventListener('click', () => this.close())
    head.append(title, this.cash, close)

    this.list.className = 'menu-list'
    panel.append(head, this.list)
    this.overlay.append(panel)
    // Tapping the dark area around the panel closes it too.
    this.overlay.addEventListener('pointerdown', (e) => {
      e.stopPropagation()
      if (e.target === this.overlay) this.close()
    })
    document.body.append(this.overlay)
  }

  level(id: string): number {
    return this.levels.get(id) ?? 0
  }

  toggle(): void {
    if (this.isOpen) this.close()
    else this.open()
  }

  open(): void {
    this.isOpen = true
    this.overlay.classList.remove('hidden')
    this.render()
    this.onToggle(true)
  }

  close(): void {
    this.isOpen = false
    this.overlay.classList.add('hidden')
    this.onToggle(false)
  }

  private buy(def: CharacterUpgradeDef): void {
    const level = this.level(def.id)
    const price = priceFor(def, level)
    if (this.wallet.amount < price) return
    this.wallet.spend(price)
    this.levels.set(def.id, level + 1)
    def.apply(this.stats, level + 1)
    audio.play('purchase')
    this.render()
  }

  private render(): void {
    this.cash.textContent = `$ ${Math.floor(this.wallet.amount)}`
    this.list.replaceChildren(...CHARACTER_UPGRADES.map((def) => this.row(def)))
  }

  private row(def: CharacterUpgradeDef): HTMLElement {
    const level = this.level(def.id)
    const max = def.maxLevel ?? Infinity
    const unlocked = def.unlocked(this.progress)
    const maxed = level >= max
    const price = priceFor(def, level)

    const row = document.createElement('div')
    row.className = 'menu-row'
    if (!unlocked) row.classList.add('locked')

    const text = document.createElement('div')
    text.className = 'menu-text'
    const name = document.createElement('div')
    name.className = 'menu-name'
    name.textContent = def.title
    const detail = document.createElement('div')
    detail.className = 'menu-detail'
    const levelText = Number.isFinite(max) ? `Seviye ${level}/${max}` : `Seviye ${level}`
    detail.textContent = !unlocked ? `Kilitli: ${def.lockedText ?? ''}` : maxed ? `${levelText} · tamamlandı` : `${levelText} · sonraki: ${def.reward(level)}`
    text.append(name, detail)

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'menu-buy'
    if (maxed) {
      button.textContent = 'MAKS'
      button.disabled = true
    } else if (!unlocked) {
      button.textContent = 'Kilitli'
      button.disabled = true
    } else {
      button.textContent = `$${price}`
      button.disabled = this.wallet.amount < price
      button.addEventListener('click', () => this.buy(def))
    }
    row.append(text, button)
    return row
  }
}
