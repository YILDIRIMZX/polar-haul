# Yol Haritası — Polar Haul

> Whiteout Survival'ın **gerçek oyununu** değil, **reklamlarında gösterilen** idle-arcade / tycoon oyununu yapıyoruz.
> Oyun **tek bir iPhone'da kişisel kullanım** için PWA olarak kurulacak. Mağazaya çıkmayacak, reklam ve satın alma içermeyecek.
> *Polar Haul* bir çalışma adı. "Whiteout" ve benzeri isimler oyunun adında **kullanılmayacak**.

---

## 1. Araştırma özeti: Reklam ile gerçek oyun arasındaki fark

**Gerçek oyun (Century Games):** 4X strateji. İlk ~90 dakika bir dev ocak (furnace) çevresinde menüden idle üs kurma geçiyor (yatakhane, avcı kulübesi, kereste atölyesi). Sonra dünya haritası, ittifaklar ve PvP açılıyor. Naavik bunu açıkça "bait-and-switch" olarak tanımlıyor. Oyuncu bina yerleştiremiyor, karakteri joystick'le yönetemiyor.

**Reklamlar (Naavik ve Segwise analizleri):**

| Reklam açısı | Ne gösteriliyor | Bizim oyunda karşılığı |
|---|---|---|
| Hiper-casual "Idle Arcade" | Karakter kar, taş ya da çimden kaynak topluyor, yığıp taşıyor | **Çekirdek mekanik** |
| Hunisinin devamı | Donan hayatta kalanlar kapıdan giriyor, işe koşuluyor | v1.1: hayatta kalan → işçi |
| Karakterler zor durumda | Donma, hastalık, çaresizlik ("şimdi kurtar") | v1.1: duygusal kanca |
| İlerleme çubukları | Her şeyin üstünde dolum barı | MVP: pad dolum barı, HP barları |
| Serbest üs kurma | Bina koyma, alan genişletme | MVP: kilitli alanlar, unlock pedleri |
| Ağır kıyamet teması | Buzul kıyameti, dev ocak, ısı alanı | v1.2: odun → ocak → ısı yarıçapı |
| İki seçenekli kanca | 2 saniyede verilen ikilem | Olay ve seçim anlarında |

Segwise'a göre 2024'ün en iyi 10 reklamının hepsinde idle arcade mekaniği, oynanış ile animasyon karışımı ve müzik ile oyun seslerinin birlikte kullanılması ortak.
Century'nin **Frozen City** adlı idle oyunu bu temayı daha önce test etmişti. Yani "reklamdaki oyun" fikrinin tutabileceğine dair bir işaret var.

### Örnek reklam karesinin analizi (ayı-et reklamı)

- Üstten açılı 3D kamera, dikey ekran.
- Çitle çevrili kum renkli üs. Kenarlarda **kilit ikonlu kapılar**, yani açılacak yeni alanlar var.
- Çit dışında **20–30 kutup ayısı** sürü halinde. Hasar alanların üstünde kırmızı HP barı var, kan efektleri saçılıyor.
- Oyuncu (mavi karakter, ayağında halka) **otomatik saldırıyla** ayı kesiyor. Üstünde yeşil HP barı var.
- Düşen **kemikli etler**, karakterin kafasının üstünde dev bir kule gibi yığılıyor. Görselin yıldızı bu.
- Üs içinde **et işleme makinesi**, ondan çıkan **konveyör bant**, bandın sonunda **çıkış masası** ve kesik çizgili **bırakma alanı** var.
- Sağ üstte para sayacı var.

---

## 2. Oyun tanımı

### Çekirdek döngü

```
Çit dışına çık → ayıları kes (oto-saldırı) → et yığını büyür
      ↑                                              ↓
Yükselt / alan aç ← para yığını ← konveyör ← makineye boşalt
```

### Tasarım kuralları (oyuncunun saniye saniye deneyimi)

- **Yığın ödülün kendisi.** Her parça kavisli bir yolla uçup "pop" sesiyle eklenmeli. Yığın sallanıp esnemeli ve komik derecede uzayabilmeli.
- **Tur süresi:** dışarıda 10–25 saniye, eve dönüş yaklaşık 10 saniye.
- **Boşaltma:** parçalar kafadan tek tek konveyöre akmalı. Bu ikinci büyük tatmin anı.
- **Unlock pedi:** üstünde durunca para akarak pede gitmeli ve dolum barı ilerlemeli.
- **Tempo:** ilk dakikalarda her **30–60 saniyede** yeni bir şey açılmalı, sonra tempo yavaşlamalı.
- **Ölü zaman yok:** oyuncu hiçbir zaman yaklaşık 2 saniyeden fazla boş kalmamalı.
- Ekranda "yüzlerce" ayı gerekmiyor, o reklam abartısı. Aynı anda **30–60 ayı** yeterli.

---

## 3. Teknik kararlar

### Neden Unity değil de Web PWA?

İlk değerlendirme mağazaya çıkacak, reklamla para kazanacak bir oyun varsayımıyla yapıldı ve Unity'yi seçti. Gerekçeler reklam SDK'ları ve publisher desteğiydi. Oyun artık **tek bir iPhone'da kişisel kullanım** için yapıldığından bu gerekçelerin hiçbiri geçerli değil.

Windows bilgisayardan bir iPhone'a oyun kurmanın dört yolu var:

| Yöntem | Nasıl çalışır | Maliyet | Sorun |
|---|---|---|---|
| **1. Web PWA + Three.js (seçilen)** | GitHub Pages → Safari → "Ana Ekrana Ekle" | Ücretsiz | Titreşim yok. Performans yerel uygulamadan düşük ama bu oyun için yeterli. |
| 2. Unity → Web build → PWA | Unity'de yap, web'e derle, aynı yöntemle kur | Ücretsiz | iOS Safari'de Unity web build'leri bellek yüzünden sık çöküyor (boş proje bile ~200 MB). Yükleme süresi uzun. |
| 3. Unity → iOS + ücretsiz Apple ID ile yandan yükleme (Sideloadly/AltStore) | IPA, macOS sunucusunda derlenir (GitHub Actions). Windows'ta imzalanıp USB/Wi-Fi ile kurulur. | Ücretsiz | Uygulama **7 günde bir yeniden imzalanmalı**, aksi halde açılmaz. En fazla 3 uygulama kurulabilir. Derleme hattı kurmak zor. |
| 4. Unity → iOS + TestFlight | Bulutta derlenir, TestFlight uygulamasıyla kurulur | **Yılda $99** (Apple Developer) | Her derleme 90 günde süresi dolar. Kurulum en rahat yerel yol bu. |

**Karar:** 1. yöntem. 3 ve 4. yöntemler gerçek bir yerel uygulama verir ama ya her hafta yeniden imza ya da yıllık ücret ister. 2. yöntem Unity'yi öğrenmeyi sağlar ama iPhone'da güvenilir çalışmıyor. Unity ileride mağazaya çıkma hedefi doğarsa yeniden değerlendirilir. Bu durumda oyun tasarımı, ekonomi tablosu ve görseller aynen taşınabilir.

| | Unity / Godot (yerel iOS uygulaması) | **Web PWA (seçilen)** |
|---|---|---|
| Windows'tan iPhone'a kurulum | Mac + Xcode ya da bulut build gerekir | Safari → "Ana Ekrana Ekle" |
| Apple hesabı | Ücretsiz hesapla uygulama 7 günde bir yeniden imzalanmalı, aksi halde yıllık $99 | Gerekmez |
| Güncelleme | Yeniden build, imza ve kurulum | `git push` yeterli, telefon kendisi günceller |
| İnternetsiz oynama | Var | Var (service worker) |
| Mevcut deneyim | Yok | Psikoloji uygulamasıyla aynı yöntem |

### Teknoloji yığını

| Konu | Seçim |
|---|---|
| Dil ve derleme | TypeScript + Vite |
| 3D | **Three.js**: `InstancedMesh` ile ayılar ve et parçaları, GLTF modeller |
| PWA | `vite-plugin-pwa`: manifest, service worker, otomatik güncelleme, dikey ekran kilidi |
| Arayüz (HUD) | Canvas üstünde sade HTML/CSS. React gerekmiyor. |
| Fizik | Fizik motoru yok. Yığın için basit yay zinciri, çarpışma için daire testleri yeterli. |
| Kayıt | `localStorage` / IndexedDB, ayrıca `.json` yedek dışa ve içe aktarma |
| Yayın | GitHub Actions → GitHub Pages (psikoloji uygulamasındaki `deploy.yml` ile aynı) |
| Görseller | Yalnızca **CC0** low-poly paketler (Kenney, Quaternius, Poly Pizza'daki CC0 olanlar) ya da kendi çizimlerimiz |

### iPhone'a özel kontrol listesi

- [ ] `apple-touch-icon.png`, `display: standalone`, `orientation: portrait`
- [ ] `viewport-fit=cover` ve çentik için `env(safe-area-inset-*)` boşlukları
- [ ] `touch-action: none`, iki parmakla yakınlaştırma, kaydırma ve metin seçimi kapalı
- [ ] Ses ilk dokunuşta açılacak (iOS kuralı)
- [ ] Safari'de titreşim (Vibration API) yok. Eksikliği ses, ekran sarsıntısı ve squash efektiyle telafi edilecek.
- [ ] Piksel oranı en fazla 2 olacak, hedef 60 FPS. Uygulama arka plana geçince oyun duraklayacak.
- [ ] Kayıt her açılış kapanışta ve 10 saniyede bir yapılacak, ayrıca elle yedek alınabilecek

---

## 4. Fazlar ve sürümler

Her sürümün notu `CHANGELOG.md` dosyasına **İngilizce ve Türkçe** yazılacak.

### 0.1.0 — Plan ve belgeler ✅
Yol haritası, README (EN/TR), CHANGELOG, lisans ve resmi olmama uyarısı.

### 0.2.0 — İskelet ve iPhone'da açılış (≈2–3 gün)
- [x] Vite + TypeScript + Three.js + `vite-plugin-pwa` kurulumu
- [x] Kar zemini, çitli üs, üstten açılı kamera, ikon ve açılış ekranı
- [x] `deploy.yml` ile GitHub Pages yayını
- [x] iPhone'da "Ana Ekrana Ekle" ile tam ekran ve internetsiz açılıyor

### 0.3.0 — Gri kutu çekirdek döngü (≈1–2 hafta) ✅
- [x] Sanal joystick (dokunmatik) ve karakter hareketi, çit ve kapı
- [x] Oto-saldırı: menzildeki en yakın ayılar (en fazla 3)
- [x] Ayı sürüsü: dolaşma, öfkelenip saldırma, HP barı, yeniden doğma
- [x] Et düşürme ve toplama, **kafa üstü yığın** (kapasite sınırlı, sallanan)
- [x] Makine: et girer, konveyörden geçer, para yığını olarak çıkar
- [x] Para toplama, sayaç ve 2 unlock pedi (kapasite, geniş savuruş)
- [x] Karakter canı, üste dönünce dolma, bayılınca yığını kaybetme

✅ **Bitti kriteri:** Model ve süsleme olmadan bile 3 dakika oynamak keyifli olmalı.

### 0.3.1 — İlk iPhone testinden sonra ✅
- [x] Ayılar kapının önünde ve daha yoğun
- [x] Orman sınırı, eve dönüş işareti
- [x] Geniş Savuruş başta kilitli ($100 + 20 ayı)

### 0.4.0 – 0.10.0 — Mekanikler, sonra görseller
İlk iPhone testinden sonra plan değişti: önce bütün mekanikler belli bir seviyeye gelecek, görseller ve animasyonlar en sona kalacak. Ayrıntılı plan [TASARIM.md](TASARIM.md) dosyasında:

| Sürüm | İçerik |
|---|---|
| 0.4.0 ✅ | Üretim zinciri (elle): ocak, tezgâh, müşteriler, bahşiş, kasa |
| 0.4.1 ✅ | Pişmiş eti elle taşıma, sesler, uçan ödeme yazıları, kızgın müşteri, ped beklemesi |
| 0.5.0 ✅ | Yükseltme düzeni ve üs: Karakter menüsü, istasyon pedleri, inşa pedleri, Büyük Ocak ve üs seviyeleri 1–3 |
| 0.6.0 ✅ | Av seviyesi, mini boss ve kartlar, 1. ana boss ve Üçlü Vuruş, Kar Fırtınası, acil müşteriler, test paneli |
| 0.6.1 ✅ | Hatırlanan bosslar: giriş anı, uyarılı saldırılar, Dev Ayı'nın hücumu, Yaşlı Ayı'nın pençesi ve ikinci aşaması, post hatırası, pençe izleri |
| 0.7.0 ✅ | Sinematik boss girişi, yakınlık cezası, sertleşen Yaşlı Ayı · İnşa alanları ve işçiler: üs seviyesinde çevre değişimi, Kapı Deposu ve Taşıyıcı, Avcı Kulübesi ve avcılar, Garson, Kasiyer |
| 0.8.0 | Konveyörler, üs seviyeleri 4–6 ve çevre değişimleri, Buzul Ayısı ve Ayı Kralı (sunacakları yetenekleri sana karşı kullanırlar), üs seviyesinde ekonomi yetenekleri, ikinci av bölgesi |
| 0.9.0 | Kayıt sistemi, ekonomi simülasyonu, denge |
| 0.10.0 | Görseller, animasyonlar, kayıtlı (CC0) sesler ve müzik |

### 1.0.0 — İlk tam sürüm
İlk harita baştan sona oynanabilir ve iPhone'da günlük kullanımda sorunsuz.

### 1.x — Diğer reklam sahnelerini oyuna taşıma
| Sürüm | İçerik | Reklamdaki karşılığı |
|---|---|---|
| 1.1 | **Donan hayatta kalanlar** kapıda sıra bekler. Yiyecek ya da mont verip kurtarırsın, işçi olurlar. | "Karakterler zor durumda" sahnesi |
| 1.2 | **Odun kesme → dev ocak → ısı yarıçapı.** Isı dışında kalan işçiler donar. | Ocak ve kıyamet teması |
| 1.3 | Çadır ve ev kurma, hasta iyileştirme (revir) | Üs kurma reklamları |
| 1.4 | Yeni haritalar (buz mağarası, terk edilmiş şehir), prestij | Uzun vadeli hedef |
| 1.5 | Günlük ödül, internetsizken birikmiş kazanç, buz balıkçılığı mini oyunu | Gerçek oyundaki küçük etkinlikler |

---

## 5. Kod yapısı

```
src/
  main.ts            giriş, PWA kaydı
  game/              Game (döngü), Time, Events, Pool
  config/            balance.ts (TÜM sayılar burada)
  input/             Joystick
  world/             Scene, Camera, Ground, Fence, Zones
  entities/          Player, BearHerd (InstancedMesh), Bear, MeatItem, Worker, Boss
  systems/           Combat, Stack, Processor, Conveyor, Wallet, UnlockPad, Save
  fx/                FloatingText, Shake, Particles, Audio
  ui/                HUD, Bars
public/              ikonlar, modeller (.glb), sesler
```

Kurallar:
- Oyun sayıları kodun içine yazılmayacak. Hepsi `config/balance.ts` dosyasında tutulacak.
- Her sistem tek bir iş yapacak. Sistemler birbirleriyle `Events` üzerinden haberleşecek.

---

## 6. Başlangıç ekonomi değerleri (ayarlanacak)

| Parametre | Başlangıç | Artış |
|---|---|---|
| Yığın kapasitesi | 10 et | +5 / seviye |
| Oyuncu hasarı | 10 | ×1.25 / seviye |
| Ayı HP | 30 | Bölge 2: ×3 |
| Et / ayı | 2–3 | Boss: 30 |
| Makine işleme | 1 et / 0.3 sn → $5 | 2. makine ×2 |
| Yükseltme maliyeti | $50 | ×1.2–1.3 / seviye |
| Unlock aralığı | 30–60 sn (ilk 5 dk) | Sonra 1–3 dk |

Kontrol: "dakika başına gelir" ile "sonraki açılışın maliyeti" karşılaştırılacak. Oyuncunun **2 dakikadan uzun para biriktirmek zorunda kaldığı ölü bölge** olmamalı.

---

## 7. GitHub'da paylaşım yöntemi

Psikoloji uygulamasıyla aynı yöntem kullanılacak:

1. github.com/new adresinde **Public** ve boş bir depo oluştur. README, lisans ve .gitignore ekleme. Önerilen ad: `polar-haul`.
2. Proje klasöründe `git init`, ilk commit, `origin` ekle ve `main`'e push et.
3. Depoda **Settings → Pages → Source: GitHub Actions** seç. Her push'tan sonra `deploy.yml` derleyip yayınlar.
4. iPhone'da Safari'de `https://yildirimzx.github.io/polar-haul/` adresini aç, **Paylaş → Ana Ekrana Ekle** de.
5. Sonraki güncellemeler: `git push`. Uygulama bir sonraki açılışta kendini günceller.

Commit ve belge kuralları:
- Commit başlığı `0.3.0: Türkçe kısa özet` biçiminde olacak, gövdesinde İngilizce madde işaretleri yer alacak.
- Commit'ler yalnızca senin adınla atılacak. Ek imza satırı veya araç adı olmayacak.
- Her sürüm `package.json` sürümünü, README sürüm rozetini ve `CHANGELOG.md` dosyasındaki EN + TR kaydı birlikte günceller.
- Depo herkese açık olduğu için kişisel ayrıntı yazılmayacak.

---

## 8. Riskler ve önlemler

| Risk | Önlem |
|---|---|
| **Marka ve telif** | Mekanikler korunmaz. İsim, logo, karakterler, arayüz ve reklam görüntüleri korunur. Özgün isim kullanılacak ve yalnızca CC0 ya da kendi görsellerimiz olacak. Orijinal oyundan veya reklamlardan hiçbir dosya alınmayacak. README'de resmi olmadığı açıkça yazacak. |
| **Herkese açık link** | GitHub Pages adresi herkese açık. Oyunda ticari bir unsur, reklam ve kişisel veri olmayacak. |
| **iPhone'da veri kaybı** | Kayıt cihazda tutulduğu için uygulama silinirse veri gider. `.json` yedek dışa aktarma eklenecek. |
| **Performans** | `InstancedMesh`, nesne havuzu, gölgeler sınırlı, piksel oranı en fazla 2. Her sürüm iPhone'da denenecek. |
| **Kapsamın büyümesi** | Reklamlarda ~8 ayrı mekanik var. 1.0 çıkmadan 1.x içeriklerine başlanmayacak. |

---

## Kaynaklar
- [Naavik — The 4X Evolution of Century Games](https://naavik.co/deep-dives/four-x-evolution-2/)
- [Segwise — How Whiteout Survival's Ads Drove $1B+ in 2024](https://segwise.ai/blog/whiteout-survival-ad-strategy)
- [Whiteout Survival — Google Play](https://play.google.com/store/apps/details?id=com.gof.global&hl=en_US)
- [Whiteout Survival — App Store](https://apps.apple.com/us/app/whiteout-survival/id6443575749)
- [Playable Factory — WOS playable ad örneği](https://playablefactory.com/our-works)
- [Mobidictum — Idle games](https://mobidictum.com/idle-games/)
- [TikTok — Whiteout Survival ads (reklam ve gerçek oyun karşılaştırmaları)](https://www.tiktok.com/discover/whiteout-survival-ads)
