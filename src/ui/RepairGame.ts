import { audio } from '../audio/Audio.ts'
import { judgeHit, type HitResult } from '../systems/repair.ts'

export type RepairKind = 'gate' | 'furnace'

interface Theme {
  title: string
  button: string
  done: string
  gain: Record<HitResult, number> // repair progress per hit, 0–1
}

const THEMES: Record<RepairKind, Theme> = {
  gate: { title: 'Kapıyı onar', button: 'VUR!', done: 'Kapı onarıldı!', gain: { perfect: 0.3, good: 0.15, miss: 0.05 } },
  furnace: { title: 'Ateşi yak', button: 'KÖRÜK!', done: 'Ateş yandı!', gain: { perfect: 0.5, good: 0.25, miss: 0.08 } },
}

const LABELS: Record<HitResult, string> = { perfect: 'TAM İSABET!', good: 'İYİ', miss: 'ISKA' }
const ZONE_WIDTH = 0.2
const START_SPEED = 1.1 // bar lengths per second
const SPEED_UP = 1.08 // a little faster after every hit
const COOLDOWN = 0.25 // seconds between taps, so tapping like mad does not beat the timing
const ZONE_COLORS: Record<HitResult, string> = { perfect: '#4cd964', good: '#ffcf5c', miss: 'transparent' }
const PROBES = 40 // points along the zone asked of judgeHit to paint it

// The repair minigame: a marker slides back and forth along a bar; tap the button while it is over the
// green zone. Good timing repairs fast, a miss still repairs a little. It opens while the player stands in a
// repair circle and closes when they walk out; the game keeps running around it.
export class RepairGame {
  kind: RepairKind | null = null
  private panel = document.createElement('div')
  private title = document.createElement('div')
  private zone = document.createElement('div')
  private marker = document.createElement('div')
  private fill = document.createElement('div')
  private feedback = document.createElement('div')
  private button = document.createElement('button')
  private pos = 0 // 0–1 along the bar
  private dir = 1
  private speed = START_SPEED
  private zoneStart = 0.4
  private progress = 0
  private wait = 0
  private onDone: (() => void) | null = null

  constructor() {
    this.panel.className = 'repair hidden'
    this.title.className = 'repair-title'
    const bar = document.createElement('div')
    bar.className = 'repair-bar'
    this.zone.className = 'repair-zone'
    this.marker.className = 'repair-marker'
    bar.append(this.zone, this.marker)
    const progress = document.createElement('div')
    progress.className = 'repair-progress'
    this.fill.className = 'repair-fill'
    progress.append(this.fill)
    this.feedback.className = 'repair-feedback'
    this.button.type = 'button'
    this.button.className = 'repair-button'
    this.panel.append(this.title, bar, this.feedback, this.button, progress)
    // Taps on the panel never reach the joystick behind it.
    this.panel.addEventListener('pointerdown', (e) => {
      e.stopPropagation()
      if (e.target === this.button) this.hit()
    })
    document.body.append(this.panel)
  }

  open(kind: RepairKind, onDone: () => void): void {
    if (this.kind === kind) return
    const theme = THEMES[kind]
    this.kind = kind
    this.onDone = onDone
    this.progress = 0
    this.speed = START_SPEED
    this.pos = 0
    this.dir = 1
    this.moveZone()
    this.title.textContent = theme.title
    this.button.textContent = theme.button
    this.feedback.textContent = ''
    this.fill.style.width = '0%'
    this.panel.classList.remove('hidden')
  }

  close(): void {
    this.kind = null
    this.onDone = null
    this.panel.classList.add('hidden')
  }

  update(dt: number): void {
    if (!this.kind) return
    this.wait -= dt
    this.pos += this.dir * this.speed * dt
    if (this.pos > 1) {
      this.pos = 2 - this.pos
      this.dir = -1
    } else if (this.pos < 0) {
      this.pos = -this.pos
      this.dir = 1
    }
    this.marker.style.left = `${this.pos * 100}%`
  }

  private hit(): void {
    if (!this.kind || this.wait > 0) return
    this.wait = COOLDOWN
    const result = judgeHit(this.pos, this.zoneStart, ZONE_WIDTH)
    const theme = THEMES[this.kind]
    this.progress = Math.min(1, this.progress + theme.gain[result])
    this.fill.style.width = `${this.progress * 100}%`
    this.feedback.textContent = LABELS[result]
    this.feedback.className = `repair-feedback ${result}`
    audio.play(result === 'miss' ? 'place' : this.kind === 'gate' ? 'hammer' : 'whoosh', { volume: result === 'perfect' ? 1 : 0.6 })
    if (result !== 'miss') {
      this.speed *= SPEED_UP
      this.moveZone()
    }
    if (this.progress < 1) return
    const done = this.onDone
    this.feedback.textContent = theme.done
    this.close()
    done?.()
  }

  private moveZone(): void {
    this.zoneStart = 0.05 + Math.random() * (0.9 - ZONE_WIDTH)
    this.zone.style.left = `${this.zoneStart * 100}%`
    this.zone.style.width = `${ZONE_WIDTH * 100}%`
    this.zone.style.background = this.zonePaint()
  }

  // Green where a tap is perfect, yellow where it is good. The colours come from asking judgeHit itself along
  // the zone, so the picture always matches the rule, whatever margins it uses.
  private zonePaint(): string {
    const stops: string[] = []
    for (let i = 0; i <= PROBES; i++) {
      const k = i / PROBES
      const color = ZONE_COLORS[judgeHit(this.zoneStart + k * ZONE_WIDTH, this.zoneStart, ZONE_WIDTH)]
      stops.push(`${color} ${(k * 100).toFixed(1)}%`)
    }
    return `linear-gradient(to right, ${stops.join(', ')})`
  }
}
