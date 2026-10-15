# Görünüm rehberi

Bu belge, oyundaki her **kozmetik** parçanın (modeller, animasyonlar, sesler, renkler, ekran efektleri) nerede durduğunu gösterir. Amaç: ileride görünüm güncellemesi yapılırken (gerçek modeller, kayıtlı sesler) oyunun kurallarına dokunmadan sadece görünüşü değiştirebilmek.

## Kural

- **Modeller `src/looks/` klasöründe.** Her şey tek bir fonksiyon: `tent()`, `bear(color)`, `watchtower()`… Sistemler bu fonksiyonları çağırır, kendileri model kurmaz.
- **Her model aynı sözleşmeye uyar:**
  - Başlangıç noktası yerde, modelin ortasında (y = 0).
  - Ön yüzü +z yönüne bakar.
  - Nereye konacağını bilmez; yerleştirmeyi sistem yapar.
  - Hareket eden parçalar adıyla geri verilir (`fire`, `body`, `skin` gibi). Yeni model de aynı adlı parçaları vermeli.
- **Sesler** `src/audio/sounds.ts` dosyasında: her olayın bir adı var (`bossRoar`, `hammer`…). Kayıtlı bir ses dosyasına geçerken sadece bu dosya ve `Audio.ts` değişir.
- **Renkler** `src/config/world.ts` içindeki `COLORS` nesnesinde.
- **Ekran üstü arayüz** (menüler, kartlar, bantlar) `src/style.css` ve `src/ui/` klasöründe.

Yeni bir görsel eklerken bu belgeye de bir satır eklenir.

## Modeller (`src/looks/`)

| Dosya | İçindekiler | Kim kullanıyor |
|---|---|---|
| `camp.ts` | çadır (`tent`), kulübe (`cabin`), ayaklı ambar (`depotShed`), avcı kulübesi (`huntersLodge`), kurutma rafı (`dryingRack`), buz mahzeni (`iceCellar`), iskele (`scaffold`), inşa alanı işaretleri (`siteMarks`), Yaşlı Ayı postu (`bearPelt`) | Dwellings, Depot, Construction, Trophies |
| `defense.ts` | sur parçaları (`WALL_PIECES`: kar bloğu, kazık, kütük), ön kapı (`gate`), gözetleme kulesi (`watchtower`), çam (`pine`) | BaseArea, Gate, Towers, Construction |
| `stations.ts` | ocak (`furnace`), palet (`pallet`), tezgâh (`counter`), kasa (`till`), para destesi (`cashBundle`), Büyük Ocak (`greatFurnace`) | Furnace, Shop, GreatFurnace |
| `creatures.ts` | ayı ve bosslar (`bear`), oyuncu (`player`), müşteri (`customer`), işçi (`worker`) | Bear, Player, Customer, Worker |
| `decor.ts` | kampın süsleri: kızak (`sled`), sandıklar (`crates`), fıçı (`barrel`), kütük yığını (`logStack`), kar yığını (`snowPile`), odun (`firewood`); ne kadar yer kapladıkları (`DECOR_FOOTPRINT`) | Decor |
| `meat.ts` | çiğ ve pişmiş et (`createMeat`) | Loot, Stack, Furnace, Depot, Workers |
| `environment.ts` | gökyüzü, ışıklar, kar zemini, kar tepecikleri, orman kenarı (`createScene`), kampın zemini (`campGround`) | Game, BaseArea |
| `effects.ts` | toz bulutu (`dustPuff`), buz parçası (`iceChunk`), ok (`arrow`) | Construction, Dwellings, BossFight, Towers |
| `signs.ts` | binaların üstündeki kırmızı uyarı tabelası (`warningSign`: "DEPO DOLU", "ATEŞ SÖNDÜ") | Depot, Furnace |
| `bubbles.ts` | balon resimleri: kızgın müşteri yüzü (`drawAngryFace`), bekleyen işçinin "…" balonu (`waitingBubble`) | Customer, Worker |

## Efektler ve göstergeler (`src/fx/`)

Bunlar zaten tek başına duran, sadece görünüşten sorumlu parçalar:

| Dosya | Ne |
|---|---|
| `GroundWarning.ts` | bossun yerdeki kırmızı uyarı alanları (şerit, yelpaze, daire) ve pençe izleri |
| `Shockwave.ts` | yere vurma ve kükremede yayılan halka |
| `HpBar.ts` | kafaların üstündeki can ve ilerleme çubukları |
| `markers.ts` | yerdeki kesik çizgili daireler |
| `FloatingText.ts` | "+$25" gibi yükselen yazılar |
| `Flights.ts` | bir yerden bir yere uçan parçaların yayı |

## Animasyonlar nerede?

Animasyonların **zamanlaması ve mantığı** oyun kurallarına bağlı olduğu için sistemlerde kalıyor; ama hepsi modelin adıyla verilen parçalarını hareket ettiriyor. Gerçek modellere geçerken aynı adlı parçalar (ya da bir animasyon karışımı) verilirse sistemler değişmeden çalışır.

| Animasyon | Nerede | Hangi parçayı kullanıyor |
|---|---|---|
| Ayının vurulunca kızarması, öfkeli bossun kırmızı nabzı | `entities/Bear.ts` (`updateLook`), `systems/BossFight.ts` (`angryPulse`) | `bear().skin` |
| Bossun girişi: koşma, şahlanma, yere çakılma, şişme, titreme | `systems/BossFight.ts` (`updateIntro`, `roarStep`, `slam`, `settle`) | bossun kök grubu (`Bear.root`) |
| Oyuncunun vuruşta esnemesi ve dönmesi | `entities/Player.ts` | `player().body` |
| Müşterinin dönmesi, kızgınken arkasını dönmesi | `entities/Customer.ts` | `customer()` |
| İşçinin yürürken sekmesi | `entities/Worker.ts` | `worker()` |
| Ocağın titremesi ve ateşin parlaması | `systems/Furnace.ts` | `furnace().root`, `furnace().fire` |
| Büyük Ocak'ın büyümesi ve alevi | `systems/GreatFurnace.ts` | `greatFurnace().root`, `.fire`, `.fireMat` |
| Kapının kırılması | `world/Gate.ts` | `gate().left`, `.right`, `.beam` |
| Surun yerden yükselmesi | `world/BaseArea.ts` | sur grubu |
| İskelenin yükselmesi, binanın belirmesi | `systems/Construction.ts` | `scaffold()`, bina grubu |
| Çadırın katlanıp kulübenin belirmesi | `systems/Dwellings.ts` | `tent()`, `cabin()` |
| Süslerin kardan çıkması | `world/Decor.ts` | süsün kök grubu |
| Ağaçların devrilmesi | `systems/Construction.ts` | `pine()` |
| Kamera sarsıntısı, yakınlaşma | `world/camera.ts`, `systems/BossFight.ts` | kamera |

## Kampın süsleri: boşlukları doldurmak

Yürüme yolları için bırakılan boş zemin, üs büyüdükçe süslerle dolar. Süsler hiçbir kuralı değiştirmez; görünüm güncellemesinde en çok buraya eklenecek.

- **Görünüş:** `src/looks/decor.ts`. Her süs tek bir fonksiyon; `DECOR_LOOKS` listesine eklenir. `DECOR_FOOTPRINT` ne kadar zemin kapladığını söyler (`null`: içinden geçilir, kar yığını gibi).
- **Yer ve zaman:** `src/config/decor.ts`. Her satır bir süs: hangi görünüş (`look`), nerede (`at`), kaç kez 90° döndüğü (`quarterTurns`), hangi üs seviyesinde geldiği (`level`) ve bir binayı bekleyip beklemediği (`after`: depo, kulübe, raf, mahzen).
- **Kurallar:** [TASARIM.md](TASARIM.md) "Kampın yerleşimi" bölümündeki gibi. Yoldan uzak, her şeyden 0,4 birim ötede, ped ve işçi yolu üstünde değil, göründüğü seviyede surun içinde.
- **Hareket eden süsler** (titreyen fener, tüten baca) için: modelin hareket eden parçası adıyla geri verilir ve `world/Decor.ts` her karede onu oynatır, diğer modellerdeki gibi.

Yeni bir süs eklemek: `decor.ts` içine fonksiyonu ve kapladığı yeri yaz, `config/decor.ts` içine yerini ekle. Başka hiçbir dosya değişmez.

## Sesler (`src/audio/sounds.ts`)

Her ses bir adla çağrılır: `audio.play('hammer')`. Bugün sesler ZzFX ile kodda üretiliyor. Kayıtlı seslere geçerken:
- Her adın karşısına bir dosya yazılır.
- `Audio.ts` dosyayı çalacak şekilde değiştirilir.
- Oyunun hiçbir yerinde `audio.play('…')` çağrıları değişmez.

## Henüz `looks/` dışında olanlar

Bunlar model değil, yazı ya da tabela çizimi. Değiştirmek kolay ama ayrı yerlerde duruyorlar:
- **Pedlerin yüzeyindeki yazı** (başlık, fiyat, MAKS): `systems/UnlockPad.ts` içindeki çizim kısmı.
- **Müşterinin sipariş balonu** (kaç parça, sabır çubuğu): `entities/Customer.ts` içindeki `drawBubble`.
- **Büyük Ocak'ın "ÜS 3" etiketi:** `systems/GreatFurnace.ts` içindeki `drawLabel`.
