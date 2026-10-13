import { MathUtils, PCFSoftShadowMap, Timer, WebGLRenderer } from 'three'
import { BEAR, CAPACITY_UPGRADE, PLAYER, SWEEP_UPGRADE } from '../config/balance.ts'
import { CAMERA, COLORS, LAYOUT } from '../config/world.ts'
import { Player } from '../entities/Player.ts'
import { HpBar } from '../fx/HpBar.ts'
import { Joystick } from '../input/Joystick.ts'
import { BearHerd } from '../systems/BearHerd.ts'
import { AutoAttack } from '../systems/combat.ts'
import { Loot } from '../systems/Loot.ts'
import { Processor } from '../systems/Processor.ts'
import { isSweepUnlocked, type Progress } from '../systems/progression.ts'
import { Stack } from '../systems/Stack.ts'
import { UnlockPad } from '../systems/UnlockPad.ts'
import { Wallet } from '../systems/Wallet.ts'
import { HomeMarker } from '../ui/HomeMarker.ts'
import { Hud } from '../ui/Hud.ts'
import { createCamera, placeCamera } from '../world/camera.ts'
import { createScene } from '../world/scene.ts'

const MAX_STEP = 0.05 // a long frame (or a return from the background) never advances more than this

export class Game {
  private renderer: WebGLRenderer
  private canvas: HTMLCanvasElement
  private onFirstFrame: () => void
  private scene = createScene()
  private camera = createCamera(1)
  private timer = new Timer()
  private running = false
  private frame = 0

  private player = new Player()
  private playerBar = new HpBar(COLORS.hpPlayer, 1.3)
  private wallet = new Wallet()
  private attack = new AutoAttack()
  private hud = new Hud()
  private homeMarker = new HomeMarker()
  private progress: Progress = { bearsKilled: 0, totalEarned: 0, capacityLevel: 0 }
  private stack: Stack
  private loot: Loot
  private herd: BearHerd
  private processor: Processor
  private capacityPad: UnlockPad
  private sweepPad: UnlockPad
  private joystick: Joystick

  constructor(canvas: HTMLCanvasElement, onFirstFrame: () => void) {
    this.canvas = canvas
    this.onFirstFrame = onFirstFrame
    this.renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = PCFSoftShadowMap

    this.scene.add(this.player.root, this.playerBar.root)
    this.stack = new Stack(this.scene)
    this.loot = new Loot(this.scene)
    this.herd = new BearHerd(this.scene, (at) => {
      this.progress.bearsKilled++
      this.loot.spawn(at, MathUtils.randInt(BEAR.meatMin, BEAR.meatMax))
    })
    this.processor = new Processor(this.scene)
    this.capacityPad = new UnlockPad(this.scene, {
      at: LAYOUT.capacityPad,
      title: 'KAPASİTE',
      reward: () => `+${CAPACITY_UPGRADE.step}`,
      pricing: CAPACITY_UPGRADE,
      apply: () => (this.stack.capacity += CAPACITY_UPGRADE.step),
    })
    // Hidden until isSweepUnlocked says so. The first purchase gives 3 bears per swing, then +1 per level.
    this.sweepPad = new UnlockPad(this.scene, {
      at: LAYOUT.sweepPad,
      title: 'GENİŞ SAVURUŞ',
      reward: (level) => (level === 0 ? `${SWEEP_UPGRADE.firstTargets} AYI` : `+${SWEEP_UPGRADE.step} AYI`),
      pricing: SWEEP_UPGRADE,
      apply: (level) => (this.attack.maxTargets = SWEEP_UPGRADE.firstTargets + (level - 1) * SWEEP_UPGRADE.step),
      hidden: true,
    })
    this.joystick = new Joystick(canvas)

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
    const dt = Math.min(this.timer.getDelta(), MAX_STEP)
    if (dt > 0) this.step(dt)

    placeCamera(this.camera, this.player.position)
    this.playerBar.update(this.player.hp / PLAYER.maxHp, this.player.position, 1.75, this.camera)
    this.homeMarker.update(this.camera, this.canvas, LAYOUT.home)
    this.renderer.render(this.scene, this.camera)
    if (this.frame++ === 0) this.onFirstFrame()
  }

  // One step of the game, in the order things depend on each other.
  private step(dt: number): void {
    this.player.update(dt, this.joystick)
    this.herd.update(dt, this.player, this.camera)
    this.attack.update(dt, this.player, this.herd)
    this.loot.update(dt, this.player, this.stack)
    this.stack.update(dt, this.player)
    this.processor.update(dt, this.player, this.stack, this.wallet, this.timer.getElapsed())
    this.capacityPad.update(dt, this.player, this.wallet)
    this.sweepPad.update(dt, this.player, this.wallet)

    // New features appear once the player has made enough progress.
    this.progress.totalEarned = this.wallet.totalEarned
    this.progress.capacityLevel = this.capacityPad.level
    if (!this.sweepPad.shown && isSweepUnlocked(this.progress)) this.sweepPad.show()

    // Knocked out: the carried meat is lost and the player wakes up back at the base.
    if (this.player.hp <= 0) {
      this.stack.clear()
      this.player.respawn()
    }

    this.hud.update(this.wallet.amount, this.stack.count, this.stack.capacity)
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
