# Oyun Tasarımı — Polar Haul

> Bu belge oyunun **mekaniklerini ve ilerleme sistemini** tanımlar. Görünüm ve animasyonlar bilerek sona bırakıldı: önce bütün mekanikler belli bir seviyeye gelecek, sonra görseller eklenecek.
> Sayılar başlangıç tahminleridir. Bir ekonomi simülasyonuyla doğrulanıp oyun testleriyle ayarlanacaklar.

---

## 1. Üretim zinciri

Reklamlardaki gibi: ayı avla, eti pişir, **müşterilere sat**. Et doğrudan paraya dönüşmüyor.

```
 Ayı ──► Çiğ et (kafadaki yığın)
              │
              ▼
   ┌─ 1. aşama: elle ─────────────── oyuncu ocağın girişine boşaltır
   ├─ 2. aşama: Taşıyıcı + Depo ──── oyuncu depoya boşaltır, işçi depodan ocağa taşır
   └─ 3. aşama: Konveyör ─────────── depodan ocağa kesintisiz bant
              │
              ▼
        [   OCAK    ]  yuva: 1 → 4, pişirme süresi: 2,0 sn → ×0,85/seviye
              │
              ▼
        [  TEZGÂH   ]  pişmiş et rafı, kapasite: 8 → +4/seviye
              │  oyuncu servis yapar → sonra Kasiyer
              ▼
        [ MÜŞTERİLER ] sıra: 3 → 8 kişi, her biri 1–3 parça ister
              │  öder (+ hızlı serviste bahşiş)
              ▼
        [   KASA    ]  para destesi → oyuncu toplar
```

### Otomasyon merdiveni

Her istasyon önce **elle** çalışır, sonra adım adım otomatikleşir. Reklamlardaki asıl tatmin bu: yorucu işleri tek tek makinelere ve işçilere devretmek.

| İş | Elle | 1. otomasyon | 2. otomasyon |
|---|---|---|---|
| Eti ocağa koymak | Oyuncu ocağın girişine boşaltır | **Taşıyıcı** işe alınır, **Et Deposu** açılır: oyuncu depoya boşaltır, işçi depodan ocağa taşır | **Konveyör** taşıyıcının yerini alır; taşıyıcı başka işe geçer |
| Müşteriye satmak | Oyuncu tezgâhın servis noktasında durur | **Kasiyer** işe alınır | Kasiyer hızı ve ikinci kasa |
| Parayı toplamak | Oyuncu kasadan toplar | (ileride) Kasadaki para otomatik cüzdana akar | — |

### İstasyonlar

| İstasyon | Ne yapar | Yükseltmeler |
|---|---|---|
| **Ocak girişi** | Oyuncu yanına gelince yığın hızla (parça başına 0,03 sn) giriş rafına boşalır. Artık her parçayı tek tek beklemek yok. | Giriş rafı kapasitesi |
| **Et Deposu** | Taşıyıcıyla birlikte açılır. Büyük bir ara stok. | Kapasite: 20 → +10/seviye |
| **Ocak** | Girişten et alır, aynı anda yuva sayısı kadar pişirir. Pişen et tezgâha geçer, tezgâh doluysa durur. | Yuva sayısı, pişirme hızı |
| **Tezgâh** | Pişmiş etin beklediği raf. Müşteriler buradan alır. | Kapasite |
| **Kasa** | Ödenen para burada birikir, oyuncu yanından geçince toplanır. | — |

---

## 2. Müşteriler

Üssün arka kapısından gelen, üşüyen hayatta kalanlar. Reklamlardaki "zor durumdaki karakterler" kancası.

- Sıraya girerler. Başlarının üstünde kaç parça istedikleri ve bir **sabır barı** görünür.
- Siparişleri tamamlanınca öderler ve memnun ayrılırlar.

### Sabır: ceza değil ödül, ileride gerçek risk

| Müşteri | Ne zaman | Sabır bitince |
|---|---|---|
| **Normal** | Baştan | Gitmez, ama **bahşiş kaybolur** ve titremeye başlar. Hızlı servis edilirse fiyatın %30'u kadar bahşiş bırakır. |
| **Acil** | Av seviyesi 3'ten sonra, arada bir | Çok para öder (×2,5) ama sabrı biterse **ödemeden gider**. |

Hızlı oynamak ödüllendirilir, yavaş oynamak cezalandırılmaz. Gerçek risk oyunun ileri aşamasında acil müşterilerle gelir.

### Servis
- Başta oyuncu **tezgâhın servis noktasında durarak** satar: 0,25 saniyede bir parça.
- Bu, oyunun ana gerilimini yaratıyor: **avlanmak mı, satmak mı?**
- **Kasiyer** işe alınınca satış otomatikleşir ve oyuncu ava odaklanabilir.

---

## 3. Yükseltme sistemi

### Ortak temel: İstatistikler (Stats)
Bütün oyun değerleri tek bir sistemden okunur. Her değer üç kaynaktan oluşur:

```
değer = (temel + Σ eklemeler) × Π (1 + çarpanlar)
```

- **Temel:** ayar dosyasındaki başlangıç değeri
- **Pedler:** satın alınan seviyeler (ekleme)
- **Kartlar ve özel yetenekler:** boss ödülleri (ekleme ya da çarpan)

Böylece pedler, mini boss kartları ve ana boss yetenekleri **aynı değerleri aynı yoldan** değiştirir. Yeni bir yükseltme eklemek tek bir tanım yazmak demek.

### Ped kategorileri ve açılma sırası

Pedler bir anda değil, ilerledikçe ortaya çıkar. Ekran asla kalabalıklaşmaz.

| Kategori | Pedler | Ne zaman görünür |
|---|---|---|
| Karakter | Kapasite, Hasar, Hız | Kapasite baştan, diğerleri ilk satışlardan sonra |
| Karakter | Geniş Savuruş | $100 kazanılıp 20 ayı öldürülünce *(senin kuralın; para artık müşterilerden geldiği için yeniden ayarlanabilir)* |
| Üretim | Ocak yuvası, pişirme hızı, ocak girişi | İlk satışlardan sonra |
| Dükkân | Tezgâh, sıra uzunluğu, et fiyatı | İlk müşteriler memnun ayrıldıkça |
| Çalışanlar | Taşıyıcı (+ Depo), Kasiyer | Ekonomi rahatladığında, yaklaşık 4. ve 8. dakika |
| Makine | Konveyör, Depo kapasitesi | Taşıyıcıdan sonra |

---

## 4. Av seviyesi (otomatik zorluk)

Ayı sayısı satın alınmıyor, **oyunda ilerledikçe kendiliğinden artıyor.** Öldürülen ayılar "Av Seviyesi"ni yükseltir:

| Her av seviyesinde | Değişim |
|---|---|
| Sonraki seviye için gereken av | 15 + 5 × seviye |
| Ayı sayısı | +2 (üst sınır 50) |
| Ayı canı | ×1,12 |
| Ayı hasarı | ×1,08 |
| Ayı başına et | her 2 seviyede +1 |

Böylece oyuncu güçlendikçe av da büyür. Yükseltmeler "anlamsız" hale gelmez, ekonomi de büyümeye devam eder. Geniş Savuruş'un değeri, sürü kalabalıklaştıkça artar.

---

## 5. Bosslar ve ödüller

Bosslar **av seviyesine bağlı** olarak kendiliğinden gelir. Ekranda "Dev Ayı geliyor!" uyarısı çıkar.

### Mini boss: Dev Ayı
- **Ne zaman:** her 3 av seviyesinde bir
- **Nasıl:** normal ayıdan 1,6 kat büyük, 10 kat canlı, yavaş ama sert vuruyor
- **Ödül:** **2 rastgele kart.** Oyuncu birini seçer, yükseltme bedava uygulanır.
- **Kart havuzu (ortak):** mevcut pedlerden birinin bedava +1 seviyesi ya da küçük kalıcı bonuslar (+%10 hasar, +%10 hız, +%15 toplama yarıçapı, +%10 et fiyatı…). Tavana ulaşmış yükseltmeler havuzdan çıkar.

### Ana boss
- **Ne zaman:** av seviyesi 5 ve 10'da. Seviye 10 boss'u ilk haritanın finali.
- **Ödül:** **2 benzersiz yetenek.** Oyuncu birini seçer. Her yetenek oyun boyunca bir kez alınabilir; seçilmeyen havuza geri döner ve sonraki boss'ta tekrar çıkabilir.

| Benzersiz yetenek | Etkisi |
|---|---|
| Mıknatıs | Et toplama yarıçapı ×2 |
| Kritik Vuruş | Her 5. vuruş 3 kat hasar |
| Ziyafet | Müşteriler %50 fazla öder |
| Buz Zırhı | Ayılardan alınan hasar %40 az |
| Kor Ocak | Pişirme süresi yarıya iner |
| Bereket | Her ayıdan +1 et |
| Kasırga | Saldırı menzili +%50 |
| Sürü Avcısı | Aynı anda 3+ ayıya vururken hasar +%25 |

### Seçim ekranı
Boss ölünce oyun kısa süre yavaşlar ve iki kart ekrana gelir. Kart dokunuşla seçilir ve oyun devam eder. Başlangıçta görsel olarak sade olacak, animasyonları sonra eklenecek.

---

## 6. Hedef tempo (ilk harita ≈ 30 dakika)

| Dakika | Oyuncu ne yaşıyor |
|---|---|
| 0–2 | İlk av, eti ocağa elle koyma, ilk müşteri. Kapasite pedi. |
| 2–4 | Ocak 2. yuva, tezgâh büyür, sıra uzar. |
| ~4 | **Taşıyıcı ve Depo:** eti ocağa taşımak otomatikleşir. |
| 5–8 | Geniş Savuruş açılır. Av seviyesi 2–3, ilk mini boss. |
| ~8 | **Kasiyer:** satış otomatikleşir, oyuncu ava odaklanır. |
| 8–15 | Fiyat yükseltmeleri, acil müşteriler, **Konveyör**. |
| ~15 | **1. ana boss** (av seviyesi 5): benzersiz yetenek, ikinci av bölgesi açılır. |
| 15–30 | Ocak 3–4. yuva, yoğun sürüler, mini bosslar. |
| ~30 | **2. ana boss** (av seviyesi 10): ilk harita tamamlanır. |

Kural: ilk dakikalarda her 30–60 saniyede bir yeni şey açılmalı. Sonra bu aralık 2–4 dakikaya çıkabilir.

Bu tempo bir **ekonomi simülasyonu** ile doğrulanacak: oyunu saniye saniye oynayan küçük bir betik, her yükseltmenin kaçıncı dakikada alınabildiğini hesaplayacak. Böylece sayılar tahmine değil ölçüme dayanacak.

---

## 7. Sürüm planı

| Sürüm | İçerik |
|---|---|
| 0.3.2 | iPhone alt şerit düzeltmesi (opak durum çubuğu), bu tasarım belgesi |
| **0.4.0** | **Üretim zinciri, elle:** İstatistik sistemi, çiğ ve pişmiş et, ocak girişi ve yuvaları, tezgâh, müşteriler (sabır ve bahşiş), elle servis, kasa, yeni pedler |
| 0.5.0 | **Otomasyon:** Taşıyıcı ve Et Deposu, Kasiyer, Konveyör |
| 0.6.0 | Av seviyesi (otomatik zorluk), acil müşteriler, mini boss, kart seçim ekranı |
| 0.7.0 | Ana boss, benzersiz yetenekler, ikinci av bölgesi |
| 0.8.0 | Kayıt sistemi, ekonomi simülasyonu ve denge ayarı |
| 0.9.0 | Görseller ve animasyonlar: modeller, efektler, sesler |
| 1.0.0 | İlk harita baştan sona, iPhone'da sorunsuz |

---

## 8. Kod temelleri

Bu sistemlerin hepsi aynı birkaç temel parçaya dayanacak. Bu parçalar 0.4.0'da kurulacak:

| Temel | Görevi |
|---|---|
| `Stats` | Bütün değerleri (temel + pedler + kartlar + yetenekler) tek yerden hesaplar |
| `UpgradeDef` | Bir yükseltmenin tanımı: ad, maliyet eğrisi, tavan, hangi değeri ne kadar değiştirdiği, ne zaman görüneceği |
| `ItemKind` | Taşınan şeyin türü: çiğ et, pişmiş et (ileride odun, deri…) |
| `Station` | Girişi, çıkışı, yuvası ve süresi olan genel üretim birimi (ocak, ileride başka makineler) |
| `Customer` | Durum makinesi: yürü → sıraya gir → bekle → al → öde → ayrıl |
| `Worker` | Durum makinesi: al → taşı → bırak (taşıyıcı), servis et (kasiyer) |
| `Events` | "Ayı öldü", "müşteri memnun", "boss yenildi" gibi olayları sistemler arasında taşır |
| `Progress` | İlerleme sayaçları (şimdiden var) |
