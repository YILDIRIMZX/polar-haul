// TEST PANEL: everything it can do lives in this file and in ui/AdminPanel.ts.
//
// To switch it off, set ADMIN_PANEL to false: the button and the panel are then never built.
// To remove it for good:
//   1. delete this file and src/ui/AdminPanel.ts
//   2. in src/game/Game.ts delete every line marked `// test panel` and the adminTabs() method
//   3. in src/style.css delete the block that starts with "Test panel" (it ends at the end of the file)
//   4. optionally delete the methods whose comment starts with "Test panel:" (BossFight, Storm, Shop, GreatFurnace)
export const ADMIN_PANEL = true

import { TRIPLE_STRIKE, type CardDef } from '../config/cards.ts'
import type { Player } from '../entities/Player.ts'
import type { BossFight } from '../systems/BossFight.ts'
import type { Depot } from '../systems/Depot.ts'
import type { GreatFurnace } from '../systems/GreatFurnace.ts'
import type { HuntLevel } from '../systems/HuntLevel.ts'
import type { Progress } from '../systems/progression.ts'
import type { Shop } from '../systems/Shop.ts'
import type { Storm } from '../systems/Storm.ts'
import type { Wallet } from '../systems/Wallet.ts'
import type { Workers } from '../systems/Workers.ts'
import type { Furnace } from '../systems/Furnace.ts'
import type { Construction } from '../systems/Construction.ts'
import type { Dwellings } from '../systems/Dwellings.ts'
import type { Gate } from '../world/Gate.ts'
import type { WorkerKind } from '../config/upgrades.ts'
import type { AdminTab } from '../ui/AdminPanel.ts'
import type { Stats } from './Stats.ts'

// Switches that bend the rules while testing. Game reads them every step.
export interface Cheats {
  invincible: boolean
  oneHit: boolean
  fast: boolean // the world runs three times faster
}

// What the test panel may reach inside the game.
export interface AdminContext {
  stats: Stats
  progress: Progress
  wallet: Wallet
  hunt: HuntLevel
  bossFight: BossFight
  storm: Storm
  shop: Shop
  greatFurnace: GreatFurnace
  player: Player
  depot: Depot
  workers: Workers
  gate: Gate
  furnace: Furnace
  construction: Construction
  dwellings: Dwellings
  wallName: () => string
  cheats: Cheats
  countKill: () => void // one kill toward the hunt level, without dropping meat
  offerCards: () => boolean // the mini boss card screen; false when pickCards gave no cards
  takeCard: (card: CardDef) => void
  announce: (text: string) => void
}

// The panel's tabs. Every new version adds its features here, marked with the version in `since`,
// so each update can be tested without playing up to it.
export function adminTabs(g: AdminContext): AdminTab[] {
  const huntUp = (): void => {
    for (let n = g.hunt.needed - g.hunt.kills; n > 0; n--) g.countKill()
  }
  const huntTo = (level: number): void => {
    while (g.hunt.level < level) huntUp()
  }
  const baseTo = (level: number): void => {
    while (g.progress.baseLevel < level) {
      const before = g.progress.baseLevel
      g.greatFurnace.skipLevel()
      if (g.progress.baseLevel === before) break // already at the top level
    }
  }

  return [
    {
      title: 'Atla',
      actions: [
        {
          label: 'İlk mini boss',
          hint: 'Av 2\'ye çıkar, Dev Ayı hemen gelir, +$300',
          since: '0.6.0',
          closes: true,
          run: () => {
            huntTo(2)
            g.wallet.add(300)
            g.bossFight.summon('mini')
          },
        },
        {
          label: 'Yaşlı Ayı',
          hint: 'Av 3\'e çıkar, ilk ana boss hemen gelir, +$600',
          since: '0.6.0',
          closes: true,
          run: () => {
            huntTo(3)
            g.wallet.add(600)
            g.bossFight.summon('elder')
          },
        },
        {
          label: 'Üs 3 eşiği',
          hint: 'Üs 2, 25 müşteri, 1 boss, +$1500. Ocak yuvası pedini al, sonra Büyük Ocak',
          since: '0.6.0',
          closes: true,
          run: () => {
            baseTo(2)
            g.progress.customersServed = Math.max(g.progress.customersServed, 25)
            g.progress.bossesDefeated = Math.max(g.progress.bossesDefeated, 1)
            g.wallet.add(1500)
          },
        },
        {
          label: 'Acil müşteriler',
          hint: 'Üs 3\'e çıkar ve bir acil müşteri gönderir',
          since: '0.6.0',
          closes: true,
          run: () => {
            baseTo(3)
            g.shop.sendUrgent(g.stats, g.progress)
          },
        },
        {
          label: 'Kapı Deposu alanı',
          hint: 'Üs 2\'ye çıkar, +$600: depoyu inşa et, Taşıyıcıyı işe al',
          since: '0.7.0',
          closes: true,
          run: () => {
            baseTo(2)
            g.wallet.add(600)
          },
        },
        {
          label: 'Avcı Kulübesi alanı',
          hint: 'Üs 3\'e çıkar, +$1500: ağaçlar kesilir, kulübeyi kur, avcı, garson ve kasiyer al',
          since: '0.7.0',
          closes: true,
          run: () => {
            baseTo(3)
            g.wallet.add(1500)
          },
        },
        {
          label: 'Üs 4: kütük sur',
          hint: 'Üs 4\'e çıkar, +$2500: kütük sur, kapı kulesi, gözetleme kuleleri, buz mahzeni alanı',
          since: '0.8.0',
          closes: true,
          run: () => {
            baseTo(4)
            g.wallet.add(2500)
          },
        },
        {
          label: 'Kurutma rafı alanı',
          hint: 'Üs 2 ve ocakta 2 yuva: rafın inşa alanı açılır, +$400',
          since: '0.8.0',
          closes: true,
          run: () => {
            baseTo(2)
            if (g.stats.count('furnaceSlots') < 2) g.stats.add('furnaceSlots', 1)
            g.wallet.add(400)
          },
        },
        {
          label: 'Kamp tamamen kurulu',
          hint: 'Üs 4; bütün binalar, kulübeler ve süsler hazır: yerleşimi bir bakışta görmek için',
          since: '0.8.0',
          closes: true,
          run: () => {
            baseTo(4)
            g.construction.finishAll()
            g.dwellings.allCabins()
          },
        },
        {
          label: 'Kar fırtınası',
          hint: '60 saniyelik fırtınayı başlatır',
          since: '0.6.0',
          closes: true,
          run: () => g.storm.start(),
        },
      ],
    },
    {
      title: 'Av ve boss',
      actions: [
        { label: 'Av seviyesi +1', hint: 'Eksik avları sayar; o seviyenin bossu sıraya girer', since: '0.6.0', run: huntUp },
        { label: 'Dev Ayı çağır', hint: 'Hemen gelir. Hücumunu çite çarptır: sersemler', since: '0.6.0', closes: true, run: () => g.bossFight.summon('mini') },
        { label: 'Yaşlı Ayı çağır', hint: 'Ormandan koşarak gelir. Kırmızı yelpazeden çık: pençesi geri fırlatır', since: '0.6.0', closes: true, run: () => g.bossFight.summon('elder') },
        { label: 'Canını yarıya indir', hint: 'Yaşlı Ayı şahlanıp öfkelenir, ağır çekimde kükrer, 3 genç ayı çağırır', since: '0.6.1', closes: true, run: () => g.bossFight.halveHealth() },
        {
          label: 'Kapıyı kır',
          hint: 'Kapı kırılır; boss varsa içeri dalar, yoksa onarım dairesi çıkar',
          since: '0.7.0',
          closes: true,
          run: () => g.gate.setBroken(),
        },
        {
          label: 'Ateşi söndür',
          hint: 'Ocak söner; dairesinde durup Körük oyununu oyna',
          since: '0.7.0',
          closes: true,
          run: () => g.furnace.douse(),
        },
        { label: 'Bossu yen', hint: 'Savaştaki boss ölür, ödülü gelir', since: '0.6.0', closes: true, run: () => g.bossFight.win() },
        { label: 'Süreyi 5 sn yap', hint: 'Boss sayacı bitmek üzere: fırtınayı görmek için', since: '0.6.0', closes: true, run: () => g.bossFight.expireSoon(5) },
        {
          label: 'Kart ekranı',
          hint: 'Senin pickCards fonksiyonunu çağırır ve sonucu gösterir',
          since: '0.6.0',
          closes: true,
          run: () => {
            if (!g.offerCards()) g.announce('pickCards boş liste döndürdü')
          },
        },
        { label: 'Üçlü Vuruş ver', hint: 'Yaşlı Ayı\'nın ödülünü verir (+2 hedef)', since: '0.6.0', run: () => g.takeCard(TRIPLE_STRIKE) },
        { label: 'Fırtınayı bitir', hint: 'Kar fırtınası hemen diner', since: '0.6.0', run: () => g.storm.stop() },
      ],
    },
    {
      title: 'Üs',
      actions: [
        { label: 'Üs seviyesi +1', hint: 'Bedava ve koşulsuz; çit büyür, yeni pedler açılır', since: '0.6.0', run: () => baseTo(g.progress.baseLevel + 1) },
        {
          label: 'Post hatırası',
          hint: 'Yaşlı Ayı yenilmiş sayılır; postu Büyük Ocak\'ın önüne serilir',
          since: '0.6.1',
          closes: true,
          run: () => (g.progress.bossesDefeated = Math.max(g.progress.bossesDefeated, 1)),
        },
        {
          label: 'Depoya 20 çiğ et',
          hint: 'Kapı Deposu kuruluysa; Taşıyıcıyı izlemek için',
          since: '0.7.0',
          run: () => (g.depot.built ? g.depot.fill(20, g.stats) : g.announce('Önce Kapı Deposunu kur')),
        },
        {
          label: 'Bütün işçileri al',
          hint: 'Binaları kurulu olan işçileri bedavaya işe alır',
          since: '0.7.0',
          closes: true,
          run: () => {
            const p = g.progress
            const hire = (kind: WorkerKind, have: number, open: boolean): void => {
              if (have === 0 && open) g.workers.hire(kind)
            }
            hire('carrier', p.carriers, p.depotBuilt)
            hire('waiter', p.waiters, p.baseLevel >= 3)
            hire('cashier', p.cashiers, p.baseLevel >= 3)
            hire('hunter', p.hunters, p.lodgeBuilt)
          },
        },
        { label: 'Müşteri sayısı +10', hint: 'Hizmet edilen müşteri sayacına ekler', since: '0.6.0', run: () => (g.progress.customersServed += 10) },
        { label: 'Acil müşteri gönder', hint: 'Sıra doluysa en arkadaki yer açar', since: '0.6.0', closes: true, run: () => g.shop.sendUrgent(g.stats, g.progress) },
      ],
    },
    {
      title: 'Para',
      actions: [
        { label: '+$100', hint: 'Cüzdana ekler', since: '0.6.0', run: () => g.wallet.add(100) },
        { label: '+$1000', hint: 'Cüzdana ekler', since: '0.6.0', run: () => g.wallet.add(1000) },
        { label: '+$10000', hint: 'Cüzdana ekler', since: '0.6.0', run: () => g.wallet.add(10000) },
      ],
    },
    {
      title: 'Hileler',
      actions: [
        { label: 'Ölümsüz', hint: 'Can hiç azalmaz', since: '0.6.0', isOn: () => g.cheats.invincible, run: () => (g.cheats.invincible = !g.cheats.invincible) },
        { label: 'Tek vuruş', hint: 'Her vuruş öldürür, bosslar dahil', since: '0.6.0', isOn: () => g.cheats.oneHit, run: () => (g.cheats.oneHit = !g.cheats.oneHit) },
        { label: 'Oyun hızı ×3', hint: 'Her şey üç kat hızlı akar', since: '0.6.0', isOn: () => g.cheats.fast, run: () => (g.cheats.fast = !g.cheats.fast) },
      ],
    },
    {
      title: 'Durum',
      info: () => {
        const s = g.stats
        const view = g.bossFight.view
        return [
          ['Av seviyesi', `${g.hunt.level} (${g.hunt.kills}/${g.hunt.needed})`],
          ['Ayı: sayı / can / hasar', `${g.hunt.bearCount} / ${g.hunt.bearHp} / ${g.hunt.bearDamage.toFixed(1)}`],
          ['Boss', view ? `${view.name}, ${Math.ceil(view.timeLeft)} sn` : 'yok'],
          ['Yenilen boss (ana / mini)', `${g.progress.bossesDefeated} / ${g.progress.miniBossesDefeated}`],
          ['Kar fırtınası', g.storm.active ? `${Math.ceil(g.storm.remaining)} sn` : 'yok'],
          ['Üs seviyesi', String(g.progress.baseLevel)],
          ['Kapı', g.gate.broken ? 'kırık' : `${Math.ceil(g.gate.hp)}/${g.gate.maxHp}`],
          ['Sur', g.wallName()],
          ['Kulübe / kışlık erzak', `${g.progress.cabins} / ${g.progress.stores}`],
          ['Kapı Deposu', g.depot.built ? `${g.depot.count}/${s.count('depotCapacity')}` : 'kurulmadı'],
          ['İşçiler: taşıyıcı / garson / kasiyer / avcı', g.workers.counts],
          ['Hizmet edilen müşteri', String(g.progress.customersServed)],
          ['Toplam kazanç', `$${Math.floor(g.progress.totalEarned)}`],
          ['Hedef / hasar', `${s.count('attackTargets')} / ${s.get('attackDamage').toFixed(1)}`],
          ['Vurma alanı / bekleme', `${s.get('attackRange').toFixed(2)} / ${s.get('attackCooldown').toFixed(2)} sn`],
          ['Can / hız', `${Math.round(g.player.maxHp)} / ${s.get('moveSpeed').toFixed(2)}`],
          ['Et fiyatı / pişirme', `$${s.get('meatPrice').toFixed(2)} / ${s.get('cookSeconds').toFixed(2)} sn`],
        ]
      },
    },
  ]
}
