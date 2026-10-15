import { CanvasTexture, SRGBColorSpace } from 'three'

// LOOKS: what is drawn in the speech bubbles over people's heads. The bubbles themselves (what they show
// and when) stay with the people; only the pictures are here.

let waitTexture: CanvasTexture | null = null

// A worker that has nowhere to put its load: one shared picture for every waiting bubble: a white speech bubble with three dots.
export function waitingBubble(): CanvasTexture {
  if (waitTexture) return waitTexture
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 64
  const c = canvas.getContext('2d')
  if (!c) throw new Error('2D canvas is not available')
  c.fillStyle = 'rgba(255, 255, 255, 0.95)'
  c.beginPath()
  c.roundRect(6, 6, 116, 44, 18)
  c.moveTo(56, 50)
  c.lineTo(64, 60)
  c.lineTo(72, 50)
  c.fill()
  c.fillStyle = '#1f3a4d'
  for (const x of [42, 64, 86]) {
    c.beginPath()
    c.arc(x, 28, 6, 0, Math.PI * 2)
    c.fill()
  }
  waitTexture = new CanvasTexture(canvas)
  waitTexture.colorSpace = SRGBColorSpace
  return waitTexture
}

// A small round face with slanted brows and a frown.
export function drawAngryFace(c: CanvasRenderingContext2D, x: number, y: number): void {
  c.fillStyle = '#ff7b5c'
  c.beginPath()
  c.arc(x, y, 16, 0, Math.PI * 2)
  c.fill()
  c.strokeStyle = '#5a1d12'
  c.lineWidth = 3
  c.lineCap = 'round'
  c.beginPath()
  c.moveTo(x - 10, y - 9)
  c.lineTo(x - 3, y - 5)
  c.moveTo(x + 10, y - 9)
  c.lineTo(x + 3, y - 5)
  c.stroke()
  c.fillStyle = '#5a1d12'
  c.beginPath()
  c.arc(x - 5, y, 2, 0, Math.PI * 2)
  c.arc(x + 5, y, 2, 0, Math.PI * 2)
  c.fill()
  c.beginPath()
  c.arc(x, y + 11, 6, Math.PI * 1.15, Math.PI * 1.85)
  c.stroke()
}
