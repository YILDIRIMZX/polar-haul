const RADIUS = 56 // px the knob can travel from the centre
const DEAD_ZONE = 6 // px of movement ignored, so a tap does not walk

// A floating joystick: touch anywhere, drag to move. WASD and arrow keys work too, for the computer.
// x is screen-right (+x in the world), z is screen-down (+z in the world, toward the camera).
export class Joystick {
  x = 0
  z = 0
  private pointerId: number | null = null
  private originX = 0
  private originY = 0
  private keys = new Set<string>()
  private base = document.createElement('div')
  private knob = document.createElement('div')

  constructor(surface: HTMLElement) {
    this.base.className = 'joy-base'
    this.knob.className = 'joy-knob'
    this.base.append(this.knob)
    document.body.append(this.base)

    surface.addEventListener('pointerdown', (e) => this.onDown(e))
    window.addEventListener('pointermove', (e) => this.onMove(e))
    window.addEventListener('pointerup', (e) => this.onUp(e))
    window.addEventListener('pointercancel', (e) => this.onUp(e))
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase())
      this.fromKeys()
    })
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase())
      this.fromKeys()
    })
    window.addEventListener('blur', () => {
      this.keys.clear()
      this.fromKeys()
    })
  }

  private onDown(e: PointerEvent): void {
    if (this.pointerId !== null) return
    this.pointerId = e.pointerId
    this.originX = e.clientX
    this.originY = e.clientY
    this.base.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
    this.base.classList.add('visible')
    this.setKnob(0, 0)
  }

  private onMove(e: PointerEvent): void {
    if (e.pointerId !== this.pointerId) return
    let dx = e.clientX - this.originX
    let dy = e.clientY - this.originY
    const len = Math.hypot(dx, dy)
    if (len > RADIUS) {
      dx *= RADIUS / len
      dy *= RADIUS / len
    }
    this.setKnob(dx, dy)
    if (len < DEAD_ZONE) {
      this.x = 0
      this.z = 0
    } else {
      this.x = dx / RADIUS
      this.z = dy / RADIUS
    }
  }

  private onUp(e: PointerEvent): void {
    if (e.pointerId !== this.pointerId) return
    this.pointerId = null
    this.base.classList.remove('visible')
    this.x = 0
    this.z = 0
    this.fromKeys()
  }

  private setKnob(dx: number, dy: number): void {
    this.knob.style.transform = `translate(${dx}px, ${dy}px)`
  }

  private fromKeys(): void {
    if (this.pointerId !== null) return
    const k = this.keys
    const x = Number(k.has('d') || k.has('arrowright')) - Number(k.has('a') || k.has('arrowleft'))
    const z = Number(k.has('s') || k.has('arrowdown')) - Number(k.has('w') || k.has('arrowup'))
    const len = Math.hypot(x, z) || 1
    this.x = x / len
    this.z = z / len
  }
}
