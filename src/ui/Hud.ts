import { audio } from '../audio/Audio.ts'
import type { BossView } from '../systems/BossFight.ts'

const SOUND_ON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/></svg>'
const SOUND_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zm16.6 1.4-1.4-1.4L17 11.2 14.8 9l-1.4 1.4 2.2 2.2-2.2 2.2 1.4 1.4 2.2-2.2 2.2 2.2 1.4-1.4-2.2-2.2z"/></svg>'
const ANNOUNCE_MS = 2400

const PERSON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.5" r="4"/><path d="M4 21c0-4.4 3.6-7.5 8-7.5s8 3.1 8 7.5z"/></svg>'

// The on-screen numbers and buttons: carried meat on the left, cash on the right and the mute button
// between them at the top. Under them the hunt level, and during a boss fight the boss's health and time.
// The character button sits in the bottom-right corner, where the thumb rests.
export class Hud {
  private load = document.createElement('div')
  private cash = document.createElement('div')
  private sound = document.createElement('button')
  private character = document.createElement('button')
  private hunt = document.createElement('div')
  private huntLabel = document.createElement('span')
  private huntFill = document.createElement('div')
  private boss = document.createElement('div')
  private bossName = document.createElement('span')
  private bossTime = document.createElement('span')
  private bossFill = document.createElement('div')
  private banner = document.createElement('div')
  private bannerTimer = 0
  private shownCash = -1
  private shownLoad = ''
  private shownHunt = ''
  private shownBoss = ''

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

    // Hunt level: "Av 2" and a thin bar of the kills toward the next level.
    this.hunt.className = 'hunt'
    const huntBar = document.createElement('div')
    huntBar.className = 'hunt-bar'
    this.huntFill.className = 'hunt-fill'
    huntBar.append(this.huntFill)
    this.hunt.append(this.huntLabel, huntBar)

    // Boss fight: name and seconds left, with its health bar underneath.
    this.boss.className = 'boss-panel hidden'
    const bossHead = document.createElement('div')
    bossHead.className = 'boss-head'
    this.bossTime.className = 'boss-time'
    bossHead.append(this.bossName, this.bossTime)
    const bossBar = document.createElement('div')
    bossBar.className = 'boss-bar'
    this.bossFill.className = 'boss-fill'
    bossBar.append(this.bossFill)
    this.boss.append(bossHead, bossBar)

    this.banner.className = 'banner hidden'
    this.banner.setAttribute('role', 'status')

    const top = document.createElement('div')
    top.className = 'hud-top'
    top.append(this.load, this.sound, this.cash)
    hud.append(top, this.hunt, this.boss)
    document.body.append(hud, this.banner, this.character)
  }

  // Big text in the middle of the screen for a moment: "Dev Ayı geliyor!", "Av seviyesi 3!".
  announce(text: string): void {
    this.banner.textContent = text
    this.banner.classList.remove('hidden', 'pop')
    void this.banner.offsetWidth // restarts the pop animation when a new text replaces the old one
    this.banner.classList.add('pop')
    window.clearTimeout(this.bannerTimer)
    this.bannerTimer = window.setTimeout(() => this.banner.classList.add('hidden'), ANNOUNCE_MS)
  }

  updateHunt(level: number, kills: number, needed: number): void {
    const key = `${level}:${kills}`
    if (key === this.shownHunt) return
    this.shownHunt = key
    this.huntLabel.textContent = `Av ${level}`
    this.huntFill.style.width = `${(kills / needed) * 100}%`
  }

  updateBoss(view: BossView | null): void {
    this.boss.classList.toggle('hidden', view === null)
    if (!view) return
    const secs = Math.ceil(view.timeLeft)
    const key = `${view.name}:${secs}:${Math.round(view.hpRatio * 200)}`
    if (key === this.shownBoss) return
    this.shownBoss = key
    this.bossName.textContent = view.name
    this.bossTime.textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
    this.bossTime.classList.toggle('low', secs <= 15)
    this.bossFill.style.width = `${Math.max(0, view.hpRatio) * 100}%`
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
