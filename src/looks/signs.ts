import { CanvasTexture, Sprite, SpriteMaterial, SRGBColorSpace } from 'three'

// LOOKS: floating signs over buildings ("DEPO DOLU", "ATEŞ SÖNDÜ"). A red rounded label, hidden until shown.
export function warningSign(text: string): Sprite {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const c = canvas.getContext('2d')
  if (!c) throw new Error('2D canvas is not available')
  c.fillStyle = 'rgba(224, 69, 58, 0.95)'
  c.beginPath()
  c.roundRect(4, 4, 248, 56, 16)
  c.fill()
  c.fillStyle = '#ffffff'
  c.font = 'bold 32px system-ui, sans-serif'
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.fillText(text, 128, 34)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  const sprite = new Sprite(new SpriteMaterial({ map: texture, depthTest: false }))
  sprite.scale.set(3.2, 0.8, 1)
  sprite.renderOrder = 12
  sprite.visible = false
  return sprite
}
