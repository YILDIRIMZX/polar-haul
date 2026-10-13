import { Vector3, type Camera } from 'three'

const EDGE = 46 // px kept between the marker and the edge of the game
const ON_SCREEN = 0.9 // the home counts as visible while it is inside 90% of the view

const point = new Vector3()

// When the base is off screen, a house badge sits on the screen edge, its arrow pointing home.
export class HomeMarker {
  private el = document.createElement('div')
  private arrow = document.createElement('div')

  constructor() {
    this.el.className = 'home-marker hidden'
    this.el.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 11h3v9h5v-6h4v6h5v-9h3z"/></svg>'
    this.arrow.className = 'home-arrow'
    this.el.append(this.arrow)
    document.body.append(this.el)
  }

  update(camera: Camera, canvas: HTMLCanvasElement, home: { x: number; z: number }): void {
    point.set(home.x, 1, home.z).project(camera)
    // Behind the camera the projection is mirrored; flip it back so the arrow still points the right way.
    const behind = point.z > 1
    const nx = behind ? -point.x : point.x
    const ny = behind ? -point.y : point.y
    const visible = !behind && Math.abs(nx) < ON_SCREEN && Math.abs(ny) < ON_SCREEN
    this.el.classList.toggle('hidden', visible)
    if (visible) return

    // From the centre of the game toward the home, stretched or shrunk to touch the edge margin.
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
