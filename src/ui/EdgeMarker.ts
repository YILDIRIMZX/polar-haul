import { Vector3, type Camera } from 'three'

const EDGE = 46 // px kept between the marker and the edge of the game
const ON_SCREEN = 0.9 // the home counts as visible while it is inside 90% of the view

const point = new Vector3()

export const HOME_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 11h3v9h5v-6h4v6h5v-9h3z"/></svg>'
export const BOSS_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M12 5c-4.4 0-8 3.4-8 7.6 0 4 3.6 7.4 8 7.4s8-3.3 8-7.4C20 8.4 16.4 5 12 5zm-3 8a1.2 1.2 0 1 1 0-2.4A1.2 1.2 0 0 1 9 13zm6 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4zm-3 4.2c-1.3 0-2.2-.8-2.2-1.6h4.4c0 .8-.9 1.6-2.2 1.6z"/></svg>'

// When a place is off screen, a badge sits on the screen edge, its arrow pointing toward it:
// a house for the base, a bear's head for a boss.
export class EdgeMarker {
  private el = document.createElement('div')
  private arrow = document.createElement('div')

  constructor(icon: string, variant?: string) {
    this.el.className = 'edge-marker hidden'
    if (variant) this.el.classList.add(variant)
    this.el.innerHTML = icon
    this.arrow.className = 'edge-arrow'
    this.el.append(this.arrow)
    document.body.append(this.el)
  }

  hide(): void {
    this.el.classList.add('hidden')
  }

  update(camera: Camera, canvas: HTMLCanvasElement, target: { x: number; z: number }): void {
    point.set(target.x, 1, target.z).project(camera)
    // Behind the camera the projection is mirrored; flip it back so the arrow still points the right way.
    const behind = point.z > 1
    const nx = behind ? -point.x : point.x
    const ny = behind ? -point.y : point.y
    const visible = !behind && Math.abs(nx) < ON_SCREEN && Math.abs(ny) < ON_SCREEN
    this.el.classList.toggle('hidden', visible)
    if (visible) return

    // From the centre of the game toward the target, stretched or shrunk to touch the edge margin.
    const rect = canvas.getBoundingClientRect()
    const halfW = rect.width / 2 - EDGE
    const halfH = rect.height / 2 - EDGE
    const dx = (nx * rect.width) / 2
    const dy = (-ny * rect.height) / 2
    const scale = Math.min(halfW / Math.max(Math.abs(dx), 1e-6), halfH / Math.max(Math.abs(dy), 1e-6))
    const x = rect.left + rect.width / 2 + dx * scale
    const y = rect.top + rect.height / 2 + dy * scale
    this.el.style.transform = `translate(${x}px, ${y}px)`
    this.arrow.style.transform = `rotate(${Math.atan2(dy, dx)}rad) translateX(34px)`
  }
}
