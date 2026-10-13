import { audio } from '../audio/Audio.ts'

const SOUND_ON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/></svg>'
const SOUND_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zm16.6 1.4-1.4-1.4L17 11.2 14.8 9l-1.4 1.4 2.2 2.2-2.2 2.2 1.4 1.4 2.2-2.2 2.2 2.2 1.4-1.4-2.2-2.2z"/></svg>'
const PERSON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.5" r="4"/><path d="M4 21c0-4.4 3.6-7.5 8-7.5s8 3.1 8 7.5z"/></svg>'

// The on-screen numbers and buttons: carried meat on the left, cash on the right and the mute button
// between them at the top. The character button sits in the bottom-right corner, where the thumb rests.
export class Hud {
  private load = document.createElement('div')
  private cash = document.createElement('div')
  private sound = document.createElement('button')
  private character = document.createElement('button')
  private shownCash = -1
  private shownLoad = ''

  constructor(onCharacter: () => void) {
    const hud = document.createElement('div')
    hud.id = 'hud'
    this.load.className = 'pill'
    this.cash.className = 'pill cash'

    this.character.className = 'char-button'
    this.character.type = 'button'
    this.character.innerHTML = PERSON
    this.character.setAttribute('aria-label', 'Karakter')
    this.character.addEventListener('pointerdown', (e) => e.stopPropagation())
    this.character.addEventListener('click', onCharacter)

    this.sound.className = 'pill icon'
    this.sound.type = 'button'
    this.showSound()
    this.sound.addEventListener('pointerdown', (e) => e.stopPropagation())
    this.sound.addEventListener('click', () => {
      audio.setMuted(!audio.muted)
      this.showSound()
    })

    hud.append(this.load, this.sound, this.cash)
    document.body.append(hud, this.character)
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

  private showSound(): void {
    this.sound.innerHTML = audio.muted ? SOUND_OFF : SOUND_ON
    this.sound.setAttribute('aria-label', audio.muted ? 'Sesi aç' : 'Sesi kapat')
  }
}
