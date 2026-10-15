import { Mesh, Vector3, type Object3D, type Scene } from 'three'
import { audio } from '../audio/Audio.ts'
import { SHOP } from '../config/balance.ts'
import { LAYOUT } from '../config/world.ts'
import { Customer } from '../entities/Customer.ts'
import type { Player } from '../entities/Player.ts'
import { Flights } from '../fx/Flights.ts'
import { floatingText } from '../fx/FloatingText.ts'
import { dashedRing } from '../fx/markers.ts'
import { flatDistance } from '../game/math.ts'
import type { Stats } from '../game/Stats.ts'
import { addObstacle } from '../world/bounds.ts'
import { orderSize, tipFor } from './orders.ts'
import { cashBundle, counter as counterLook, COUNTER_TOP, till as tillLook, TILL_TOP } from '../looks/stations.ts'
import type { Progress } from './progression.ts'
import type { Stack } from './Stack.ts'
import type { Wallet } from './Wallet.ts'

const PIECE_HEIGHT = 0.26
const PER_LAYER = 4 // cooked pieces lie in a row of 4 on each layer of the counter

// The counter, the queue of customers and the till.
// At the service spot the player puts the cooked meat they carry onto the counter and hands it to
// the first customer; a served customer pays into the till; the player walks past the till to collect.
export class Shop {
  private scene: Scene
  private flights = new Flights()
  private counter: Object3D[] = []
  private reserved = 0 // cooked pieces flying onto the counter
  private queue: Customer[] = [] // in queue order; queue[0] stands at the counter
  private leaving: Customer[] = []
  private spawnTimer = 1
  private dropTimer = 0
  private serveTimer = 0
  private till = 0 // cash waiting to be collected
  private cashMeshes: Mesh[] = []
  private cashTimer = 0
  private playerChest = new Vector3()
  cashier = false // once hired, customers are served without the player standing at the counter
  closed = false // no new customers come while a boss is loose in the base

  constructor(scene: Scene) {
    this.scene = scene
    this.build()
  }

  counterHasRoom(stats: Stats): boolean {
    return this.counter.length + this.reserved < stats.count('counterCapacity')
  }

  // The mesh must already be in the scene; it flies onto the counter.
  receiveCooked(mesh: Object3D): void {
    const target = this.counterPosition(this.counter.length + this.reserved)
    this.reserved++
    this.flights.add(mesh, () => target, 0.35, 0.9, () => {
      this.reserved--
      this.counter.push(mesh)
      this.layoutCounter()
    })
  }

  // `patienceRate` is 1 normally; the blizzard makes customers lose patience faster.
  update(dt: number, player: Player, stack: Stack, stats: Stats, wallet: Wallet, progress: Progress, patienceRate: number): void {
    this.playerChest.set(player.position.x, 1.2, player.position.z)
    const atService = flatDistance(player.position, LAYOUT.serviceSpot) <= SHOP.serviceRadius
    this.spawnCustomers(dt, stats, progress)
    this.moveQueue(dt * patienceRate, dt)
    this.dropOnCounter(dt, atService, stack, stats)
    this.serve(dt, atService, stats)
    this.finishOrder(stats, progress)
    this.moveLeaving(dt)
    for (const c of this.queue) c.updateLook()
    for (const c of this.leaving) c.updateLook()
    this.collectCash(dt, player, wallet)
    this.flights.update(dt)
  }

  // A boss broke into the base: everyone in the queue runs off without paying.
  panic(): void {
    for (const c of [...this.queue]) {
      floatingText.spawn('Kaçtı!', c.position.clone().setY(2.6), undefined, 'loss')
      c.state = 'leaving'
      this.leaving.push(c)
    }
    this.queue.length = 0
    if (this.leaving.length > 0) audio.play('angry')
  }

  // Test panel: an urgent customer joins at once; when the queue is full the last one in it makes room.
  sendUrgent(stats: Stats, progress: Progress): void {
    if (this.queue.length >= stats.count('queueLength')) {
      const last = this.queue.pop()
      last?.root.removeFromParent()
      last?.dispose()
    }
    this.addCustomer(stats, progress, true)
  }

  private spawnCustomers(dt: number, stats: Stats, progress: Progress): void {
    this.spawnTimer -= dt
    if (this.closed || this.spawnTimer > 0 || this.queue.length >= stats.count('queueLength')) return
    // From base level 3, now and then an urgent customer: pays far more, but leaves unpaid if kept waiting.
    const urgent = progress.baseLevel >= SHOP.urgentFromBaseLevel && Math.random() < SHOP.urgentChance
    this.addCustomer(stats, progress, urgent)
    this.spawnTimer = stats.get('customerInterval')
  }

  private addCustomer(stats: Stats, progress: Progress, urgent: boolean): void {
    const patience = stats.get('patienceSeconds') * (urgent ? SHOP.urgentPatience : 1)
    const customer = new Customer(orderSize(progress, Math.random), patience, urgent)
    customer.position.set(LAYOUT.customerSpawn.x, 0, LAYOUT.customerSpawn.z)
    customer.slot = this.queue.length
    this.queue.push(customer)
    this.scene.add(customer.root)
    audio.play('bell')
  }

  // `patienceDt` is the time that counts against patience; it runs faster than `dt` in a blizzard.
  private moveQueue(patienceDt: number, dt: number): void {
    for (const c of [...this.queue]) {
      const arrived = c.walkTo(this.queuePosition(c.slot), SHOP.walkSpeed, dt)
      if (!arrived) continue
      c.state = 'waiting'
      c.faceCounter(dt)
      const wasPatient = !c.cold
      c.patience = Math.max(0, c.patience - patienceDt)
      if (!wasPatient || !c.cold) continue
      audio.play('angry')
      if (c.urgent) this.walkOut(c)
    }
  }

  // An urgent customer whose patience ran out leaves without paying; whatever they already got is lost.
  private walkOut(c: Customer): void {
    floatingText.spawn('Gitti!', c.position.clone().setY(2.6), 'ödemeden', 'loss')
    c.state = 'leaving'
    this.queue.splice(this.queue.indexOf(c), 1)
    this.queue.forEach((q, i) => (q.slot = i))
    this.leaving.push(c)
  }

  // The cooked meat the player carries moves onto the counter while there is room.
  private dropOnCounter(dt: number, atService: boolean, stack: Stack, stats: Stats): void {
    if (!atService) {
      this.dropTimer = 0
      return
    }
    this.dropTimer -= dt
    while (this.dropTimer <= 0 && this.counterHasRoom(stats)) {
      const piece = stack.takeTop('cooked')
      if (!piece) break
      this.receiveCooked(piece)
      audio.play('place')
      this.dropTimer += SHOP.counterDropInterval
    }
  }

  // While the player stands at the service spot, or once a cashier is hired, hands pieces from the counter
  // to the first customer. The player serves faster than the cashier.
  private serve(dt: number, atService: boolean, stats: Stats): void {
    const front = this.queue[0]
    const canServe = front !== undefined && front.state === 'waiting' && front.slot === 0 && (atService || this.cashier)
    if (!canServe) {
      this.serveTimer = 0
      return
    }
    this.serveTimer -= dt
    while (this.serveTimer <= 0 && front.waitingFor > 0) {
      const piece = this.counter.pop()
      if (!piece) break
      front.incoming++
      const head = front.position.clone().setY(1.6)
      this.flights.add(piece, () => head, 0.25, 0.6, () => {
        piece.removeFromParent()
        front.incoming--
        front.got++
      })
      this.serveTimer += stats.get(atService ? 'serveInterval' : 'cashierInterval')
    }
  }

  // The first customer has everything: pay into the till and walk away; the queue moves up.
  private finishOrder(stats: Stats, progress: Progress): void {
    const front = this.queue[0]
    if (!front || front.got < front.want) return
    const price = stats.get('meatPrice')
    const tip = front.cold ? 0 : Math.max(0, tipFor(front.want, price, front.patience / front.patienceMax))
    const paid = front.want * price * (front.urgent ? SHOP.urgentPay : 1) + tip
    this.till += paid
    this.layoutCash()
    progress.customersServed++

    // "+$25" floats up over the customer's head; a cold customer also shows, underneath, the tip they kept.
    const head = front.position.clone().setY(2.6)
    floatingText.spawn(`+$${Math.floor(paid)}`, head, front.cold ? 'bahşiş yok' : undefined)
    audio.play('pay')
    if (tip > 0) audio.play('tip', { volume: Math.min(1, 0.4 + tip / (front.want * price)) })

    front.state = 'leaving'
    this.queue.shift()
    this.queue.forEach((c, i) => (c.slot = i))
    this.leaving.push(front)
  }

  private moveLeaving(dt: number): void {
    for (let i = this.leaving.length - 1; i >= 0; i--) {
      const c = this.leaving[i]
      if (!c.walkTo(LAYOUT.customerSpawn, SHOP.walkSpeed * 1.2, dt)) continue
      c.root.removeFromParent()
      c.dispose()
      this.leaving.splice(i, 1)
    }
  }

  private collectCash(dt: number, player: Player, wallet: Wallet): void {
    if (this.till <= 0 || flatDistance(player.position, LAYOUT.till) > SHOP.cashPickupRadius) {
      this.cashTimer = 0
      return
    }
    this.cashTimer -= dt
    while (this.cashTimer <= 0 && this.till > 0) {
      this.cashTimer += SHOP.cashPickupInterval
      const amount = Math.min(SHOP.cashPerBundle, this.till)
      this.till -= amount
      wallet.add(amount)
      audio.play('coin', { rising: true })
      if (this.cashMeshes.length > this.visibleBundles()) {
        const m = this.cashMeshes.pop()
        if (m) this.flights.add(m, () => this.playerChest, 0.2, 0.6, () => m.removeFromParent())
      }
    }
  }

  private visibleBundles(): number {
    return Math.min(Math.ceil(this.till / SHOP.cashPerBundle - 1e-9), SHOP.maxVisibleCash)
  }

  // Stacks green bundles on the till, 2 × 3 per layer.
  private layoutCash(): void {
    while (this.cashMeshes.length < this.visibleBundles()) {
      const i = this.cashMeshes.length
      const m = cashBundle()
      m.position.set(
        LAYOUT.till.x - 0.3 + (i % 2) * 0.6,
        TILL_TOP + 0.07 + Math.floor(i / 6) * 0.14,
        LAYOUT.till.z - 0.36 + (Math.floor(i / 2) % 3) * 0.36,
      )
      this.scene.add(m)
      this.cashMeshes.push(m)
    }
  }

  private counterPosition(index: number): Vector3 {
    return new Vector3(
      LAYOUT.counter.x - 1.05 + (index % PER_LAYER) * 0.7,
      COUNTER_TOP + 0.13 + Math.floor(index / PER_LAYER) * PIECE_HEIGHT,
      LAYOUT.counter.z,
    )
  }

  private layoutCounter(): void {
    this.counter.forEach((item, i) => item.position.copy(this.counterPosition(i)))
  }

  private queuePosition(slot: number): { x: number; z: number } {
    return { x: LAYOUT.queueFront.x, z: LAYOUT.queueFront.z + slot * SHOP.queueSpacing }
  }

  private build(): void {
    const counter = counterLook()
    counter.position.x = LAYOUT.counter.x
    counter.position.z = LAYOUT.counter.z
    const till = tillLook()
    till.position.x = LAYOUT.till.x
    till.position.z = LAYOUT.till.z

    this.scene.add(counter, till, dashedRing(LAYOUT.serviceSpot.x, LAYOUT.serviceSpot.z, SHOP.serviceRadius, 10))
    addObstacle(LAYOUT.counter, 3.2, 1.0)
    addObstacle(LAYOUT.till, 1.4, 1.2)
  }
}
