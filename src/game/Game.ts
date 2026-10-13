import { PCFSoftShadowMap, Timer, WebGLRenderer } from 'three'
import { CAMERA } from '../config/world.ts'
import { createCamera, placeCamera } from '../world/camera.ts'
import { createWorld } from '../world/scene.ts'

export class Game {
  private renderer: WebGLRenderer
  private canvas: HTMLCanvasElement
  private world = createWorld()
  private camera = createCamera(1)
  private timer = new Timer()
  private running = false
  private frame = 0
  private onFirstFrame: () => void

  constructor(canvas: HTMLCanvasElement, onFirstFrame: () => void) {
    this.onFirstFrame = onFirstFrame
    this.canvas = canvas
    this.renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = PCFSoftShadowMap

    this.resize()
    window.addEventListener('resize', () => this.resize())
    // iOS pauses a home-screen app in the background; stop the loop so time does not jump on return.
    document.addEventListener('visibilitychange', () => (document.hidden ? this.stop() : this.start()))
  }

  start(): void {
    if (this.running) return
    this.running = true
    this.timer.reset()
    this.renderer.setAnimationLoop((t) => this.tick(t))
  }

  stop(): void {
    this.running = false
    this.renderer.setAnimationLoop(null)
  }

  private tick(time: number): void {
    this.timer.update(time)
    placeCamera(this.camera, this.world.player.position)
    this.renderer.render(this.world.scene, this.camera)
    if (this.frame++ === 0) this.onFirstFrame()
  }

  // Sized from the canvas, not the window, because on a computer the canvas is a narrower phone frame.
  private resize(): void {
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, CAMERA.maxPixelRatio))
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }
}
