import { MathUtils, PCFSoftShadowMap, Timer, WebGLRenderer, type Vector3 } from 'three'
import { audio } from '../audio/Audio.ts'
import { BASE_LEVELS, BEAR, BOSSES, type BossKind } from '../config/balance.ts'
import { MINI_BOSS_CARDS, TRIPLE_STRIKE, type CardDef } from '../config/cards.ts'
import { CAMERA, COLORS, LAYOUT } from '../config/world.ts'
import type { Bear } from '../entities/Bear.ts'
import { Player } from '../entities/Player.ts'
import { floatingText } from '../fx/FloatingText.ts'
import { HpBar } from '../fx/HpBar.ts'
import { Joystick } from '../input/Joystick.ts'
import { BearHerd } from '../systems/BearHerd.ts'
import { BossFight } from '../systems/BossFight.ts'
import { pickCards } from '../systems/cards.ts'
import { AutoAttack } from '../systems/combat.ts'
import { Furnace } from '../systems/Furnace.ts'
import { GreatFurnace } from '../systems/GreatFurnace.ts'
import { HuntLevel } from '../systems/HuntLevel.ts'
import { Loot } from '../systems/Loot.ts'
import type { Progress } from '../systems/progression.ts'
import { Shop } from '../systems/Shop.ts'
import { Stack } from '../systems/Stack.ts'
import { StationPads } from '../systems/StationPads.ts'
import { Storm } from '../systems/Storm.ts'
import { Wallet } from '../systems/Wallet.ts'
import { CardPicker } from '../ui/CardPicker.ts'
import { CharacterMenu } from '../ui/CharacterMenu.ts'
import { BOSS_ICON, EdgeMarker, HOME_ICON } from '../ui/EdgeMarker.ts'
import { Hud } from '../ui/Hud.ts'
import { BaseArea } from '../world/BaseArea.ts'
import { createCamera, placeCamera } from '../world/camera.ts'
import { createScene } from '../world/scene.ts'
import { Trophies } from '../world/Trophies.ts'
import { AdminPanel, type AdminTab } from '../ui/AdminPanel.ts' // test panel
import { ADMIN_PANEL, adminTabs, type Cheats } from './admin.ts' // test panel
import { Stats } from './Stats.ts'

const MAX_STEP = 0.05 // a long frame (or a return from the background) never advances more than this
const CARD_CHOICES = 2 // cards a mini boss offers
const FAST_STEPS = 3 // test panel

export class Game {
  private renderer: WebGLRenderer
  private canvas: HTMLCanvasElement
  private onFirstFrame: () => void
  private scene = createScene()
  private camera = createCamera(1)
  private timer = new Timer()
  private running = false
  private frame = 0

  private stats = new Stats()
  private progress: Progress = {
    bearsKilled: 0,
    totalEarned: 0,
    capacityLevel: 0,
    customersServed: 0,
    baseLevel: 1,
    furnaceSlots: 1,
    bossesDefeated: 0,
    miniBossesDefeated: 0,
  }
  private player = new Player()
  private playerBar = new HpBar(COLORS.hpPlayer, 1.3)
  private wallet = new Wallet()
  private attack = new AutoAttack()
  private hunt = new HuntLevel()
  private cardsTaken = new Map<string, number>()
  private targets: Bear[] = [] // every bear a swing can hit this frame, the boss included
  private homeMarker = new EdgeMarker(HOME_ICON)
  private bossMarker = new EdgeMarker(BOSS_ICON, 'boss')
  private cardPicker = new CardPicker()
  private trophies: Trophies
  private cheats: Cheats = { invincible: false, oneHit: false, fast: false } // test panel
  private admin: AdminPanel | null = null // test panel
  private base: BaseArea
  private stack: Stack
  private loot: Loot
  private herd: BearHerd
  private storm: Storm
  private bossFight: BossFight
  private furnace: Furnace
  private shop: Shop
  private stationPads: StationPads
  private greatFurnace: GreatFurnace
  private menu: CharacterMenu
  private hud: Hud
  private joystick: Joystick

  constructor(canvas: HTMLCanvasElement, onFirstFrame: () => void) {
    this.canvas = canvas
    this.onFirstFrame = onFirstFrame
    this.renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = PCFSoftShadowMap

    this.base = new BaseArea(this.scene, BASE_LEVELS[0].fenceRadius)
    this.scene.add(this.player.root, this.playerBar.root)
    this.stack = new Stack(this.scene)
    this.loot = new Loot(this.scene)
    this.herd = new BearHerd(this.scene, this.hunt, (at) => this.bearKilled(at))
    this.storm = new Storm(this.scene)
    this.bossFight = new BossFight(this.scene, this.hunt, this.herd, this.storm, {
      onDefeated: (kind, at) => this.bossDefeated(kind, at),
      onCubKilled: (at) => this.bearKilled(at),
      announce: (text) => this.hud.announce(text),
      nameCard: (name, title) => this.hud.showNameCard(name, title),
      hideNameCard: () => this.hud.hideNameCard(),
    })
    this.trophies = new Trophies(this.scene)
    this.furnace = new Furnace(this.scene)
    this.shop = new Shop(this.scene)
    this.stationPads = new StationPads(this.scene, this.stats)
    this.greatFurnace = new GreatFurnace(this.scene, this.progress, this.base)
    this.menu = new CharacterMenu(this.stats, this.wallet, this.progress)
    this.hud = new Hud(() => this.menu.toggle())
    if (ADMIN_PANEL) this.admin = new AdminPanel(this.adminTabs()) // test panel

    this.joystick = new Joystick(canvas)

    this.resize()
    window.addEventListener('resize', () => this.resize())
    // iOS pauses a home-screen app in the background; stop the loop so time does not jump on return.
    document.addEventListener('visibilitychange', () => (document.hidden ? this.stop() : this.start()))
  }

  // Test panel: what its buttons may reach inside the game. Delete this whole method with the panel.
  private adminTabs(): AdminTab[] {
    return adminTabs({
      stats: this.stats,
      progress: this.progress,
      wallet: this.wallet,
      hunt: this.hunt,
      bossFight: this.bossFight,
      storm: this.storm,
      shop: this.shop,
      greatFurnace: this.greatFurnace,
      player: this.player,
      cheats: this.cheats,
      countKill: () => this.countKill(),
      offerCards: () => this.offerCards('Deneme kartları'),
      takeCard: (card) => this.takeCard(card),
      announce: (text) => this.hud.announce(text),
    })
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
    audio.pause()
  }

  // The world keeps drawing while the character menu, the card screen or the test panel is open,
  // but nothing moves.
  private get paused(): boolean {
    if (this.admin?.isOpen) return true // test panel
    return this.menu.isOpen || this.cardPicker.isOpen
  }

  private tick(time: number): void {
    this.timer.update(time)
    const dt = Math.min(this.timer.getDelta(), MAX_STEP)
    // A boss's intro freezes the world while the camera goes to look at it.
    if (this.bossFight.inIntro) {
      if (!this.paused) this.bossFight.updateIntro(dt, this.camera)
    } else if (dt > 0 && !this.paused) this.step(dt)
    if (this.cheats.fast) for (let i = 1; i < FAST_STEPS && dt > 0 && !this.paused && !this.bossFight.inIntro; i++) this.step(dt) // test panel

    placeCamera(this.camera, this.bossFight.cameraTarget(this.player.position))
    this.playerBar.update(this.player.hp / this.player.maxHp, this.player.position, 1.75, this.camera)
    this.homeMarker.update(this.camera, this.canvas, LAYOUT.home)
    const boss = this.bossFight.boss
    if (boss) this.bossMarker.update(this.camera, this.canvas, boss.position)
    else this.bossMarker.hide()
    // Here rather than in step, so the boss panel is gone as soon as the reward screen pauses the game.
    this.hud.updateBoss(this.bossFight.view)
    floatingText.update(this.paused ? 0 : dt, this.camera, this.canvas)
    this.renderer.render(this.scene, this.camera)
    if (this.frame++ === 0) this.onFirstFrame()
  }

  // One step of the game, in the order things depend on each other.
  private step(dt: number): void {
    const time = this.timer.getElapsed()
    const s = this.stats
    this.stack.capacity = s.count('carryCapacity')
    this.attack.maxTargets = s.count('attackTargets')
    this.attack.damage = s.get('attackDamage')
    this.attack.range = s.get('attackRange')
    this.attack.cooldown = s.get('attackCooldown')
    if (this.cheats.oneHit) this.attack.damage = Number.MAX_SAFE_INTEGER // test panel
    this.player.maxHp = s.get('maxHp')

    this.player.update(dt, this.joystick, s.get('moveSpeed'))
    this.herd.update(dt, this.player, this.camera)
    this.bossFight.update(dt, this.player, this.camera)
    this.storm.update(dt)
    this.targets.length = 0
    this.targets.push(...this.herd.bears, ...this.bossFight.bears)
    this.attack.update(dt, this.player, this.targets, (bear, damage) =>
      this.bossFight.owns(bear) ? this.bossFight.hit(bear, damage) : this.herd.hit(bear, damage),
    )
    this.loot.update(dt, this.player, this.stack, s.get('pickupRadius'))
    this.stack.update(dt, this.player)
    this.furnace.update(dt, this.player, this.stack, s, this.camera, time, this.storm.cookRate)
    this.shop.update(dt, this.player, this.stack, s, this.wallet, this.progress, this.storm.patienceRate)
    this.stationPads.update(dt, this.player, this.wallet, this.progress)
    this.greatFurnace.update(dt, this.player, this.wallet, time)
    this.trophies.update(dt, this.progress)

    this.progress.totalEarned = this.wallet.totalEarned
    this.progress.capacityLevel = this.menu.level('capacity')
    this.progress.furnaceSlots = s.count('furnaceSlots')

    if (this.cheats.invincible) this.player.hp = this.player.maxHp // test panel

    // Knocked out: the carried meat is lost and the player wakes up back at the base.
    // During a boss fight it also loses the fight.
    if (this.player.hp <= 0) {
      this.stack.clear()
      this.player.respawn()
      audio.play('knockout')
      this.bossFight.playerKnockedOut()
    }

    this.hud.update(this.wallet.amount, this.stack.count, this.stack.capacity)
    this.hud.updateHunt(this.hunt.level, this.hunt.kills, this.hunt.needed)
  }

  private bearKilled(at: Vector3): void {
    this.loot.spawn(at, MathUtils.randInt(BEAR.meatMin, BEAR.meatMax) + this.hunt.meatBonus)
    this.countKill()
  }

  private countKill(): void {
    this.progress.bearsKilled++
    if (!this.hunt.addKill()) return
    audio.play('levelUp')
    this.hud.announce(`Av seviyesi ${this.hunt.level}!`)
    this.bossFight.levelReached(this.hunt.level)
  }

  // A beaten boss drops a pile of meat and gives its reward: Triple Strike from the first main boss,
  // a choice of two cards from a mini boss.
  private bossDefeated(kind: BossKind, at: Vector3): void {
    this.loot.spawn(at, BOSSES[kind].meat)
    const heading = `${BOSSES[kind].name} yenildi!`
    if (kind === 'elder') {
      this.progress.bossesDefeated++
      this.cardPicker.show(heading, [TRIPLE_STRIKE], (card) => this.takeCard(card))
      return
    }
    this.progress.miniBossesDefeated++
    if (!this.offerCards(heading)) this.hud.announce(heading)
  }

  // Shows the mini boss cards; false when none are left to offer.
  private offerCards(heading: string): boolean {
    const cards = pickCards(MINI_BOSS_CARDS, this.cardsTaken, this.progress, CARD_CHOICES, Math.random)
    if (cards.length === 0) return false
    this.cardPicker.show(heading, cards, (card) => this.takeCard(card))
    return true
  }

  private takeCard(card: CardDef): void {
    card.apply(this.stats)
    this.cardsTaken.set(card.id, (this.cardsTaken.get(card.id) ?? 0) + 1)
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
