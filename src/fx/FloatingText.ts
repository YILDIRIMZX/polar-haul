import { Vector3, type Camera } from 'three'

const DURATION = 1.1 // seconds a text stays
const RISE_PX = 70 // how far it floats up
const point = new Vector3()

interface Item {
  el: HTMLDivElement
  at: Vector3
  age: number
}

// Text that floats up from a point in the world and fades: "+$25" over a paying customer.
class FloatingTexts {
  private items: Item[] = []

  spawn(text: string, at: Vector3, kind: 'cash' | 'bad' = 'cash'): void {
    const el = document.createElement('div')
    el.className = `float-text ${kind}`
    el.textContent = text
    document.body.append(el)
    this.items.push({ el, at: at.clone(), age: 0 })
  }

  update(dt: number, camera: Camera, canvas: HTMLCanvasElement): void {
    const rect = canvas.getBoundingClientRect()
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i]
      item.age += dt
      const t = item.age / DURATION
      if (t >= 1) {
        item.el.remove()
        this.items.splice(i, 1)
        continue
      }
      point.copy(item.at).project(camera)
      const x = rect.left + ((point.x + 1) / 2) * rect.width
      const y = rect.top + ((1 - point.y) / 2) * rect.height - RISE_PX * t * (2 - t)
      // Pops in slightly larger, then settles; fades out over the last third.
      const scale = t < 0.15 ? 1.3 - t * 2 : 1
      item.el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`
      item.el.style.opacity = String(t < 0.66 ? 1 : (1 - t) / 0.34)
    }
  }
}

export const floatingText = new FloatingTexts()
