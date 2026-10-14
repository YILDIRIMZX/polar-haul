import { audio } from '../audio/Audio.ts'
import type { CardDef } from '../config/cards.ts'

const INPUT_DELAY = 400 // ms before a card can be tapped, so a thumb still on the joystick cannot pick by accident

// The reward screen after a boss: the game pauses and the cards come up; one tap picks a card and play goes on.
export class CardPicker {
  isOpen = false
  private overlay = document.createElement('div')
  private heading = document.createElement('h2')
  private hint = document.createElement('p')
  private row = document.createElement('div')

  constructor() {
    this.overlay.className = 'cards-overlay hidden'
    this.overlay.setAttribute('role', 'dialog')
    this.heading.className = 'cards-heading'
    this.hint.className = 'cards-hint'
    this.row.className = 'cards-row'
    this.overlay.append(this.heading, this.row, this.hint)
    this.overlay.addEventListener('pointerdown', (e) => e.stopPropagation())
    document.body.append(this.overlay)
  }

  show(heading: string, cards: readonly CardDef[], onPick: (card: CardDef) => void): void {
    this.isOpen = true
    this.heading.textContent = heading
    this.hint.textContent = cards.length > 1 ? 'Bir kart seç' : 'Ödülü almak için dokun'
    this.overlay.setAttribute('aria-label', heading)
    const openedAt = performance.now()
    this.row.replaceChildren(
      ...cards.map((card, i) => {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'card'
        button.style.animationDelay = `${i * 0.12}s`
        const title = document.createElement('div')
        title.className = 'card-title'
        title.textContent = card.title
        const text = document.createElement('div')
        text.className = 'card-text'
        text.textContent = card.text
        button.append(title, text)
        button.addEventListener('click', () => {
          if (performance.now() - openedAt < INPUT_DELAY || !this.isOpen) return
          this.close()
          audio.play('cardPick')
          onPick(card)
        })
        return button
      }),
    )
    this.overlay.classList.remove('hidden')
    audio.play('cardShow')
  }

  private close(): void {
    this.isOpen = false
    this.overlay.classList.add('hidden')
  }
}
