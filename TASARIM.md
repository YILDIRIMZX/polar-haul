# Oyun Tasarımı — Polar Haul

> Bu belge oyunun **mekaniklerini ve ilerleme sistemini** tanımlar. Görünüm ve animasyonlar bilerek sona bırakıldı: önce bütün mekanikler belli bir seviyeye gelecek, sonra görseller eklenecek.
> Sayılar başlangıç tahminleridir. Bir ekonomi simülasyonuyla doğrulanıp oyun testleriyle ayarlanacaklar.

---

## 1. Üretim zinciri

Reklamlardaki gibi: ayı avla, eti pişir, **müşterilere sat**. Et doğrudan paraya dönüşmüyor.

```
 Ayı ──► Çiğ et (oyuncunun yığını ya da avcıların sırtı)
              │
              ▼
        [ KAPI DEPOSU ]  ön kapının hemen içi; avcılar buraya bırakır, oyuncu da bırakabilir
              │
   ┌─ 1. aşama: elle ─────────────── oyuncu depodan (ya da doğrudan avdan) ocağa taşır
   ├─ 2. aşama: Taşıyıcı ─────────── işçi depodan ocağa taşır
   └─ 3. aşama: Konveyör ─────────── depodan ocağa kesintisiz bant
              │
              ▼
        [   OCAK    ]  yuva: 1 → 4, pişirme süresi: 1,6 sn → −%12/seviye
              │
              ▼
        [ ÇIKIŞ RAFI ] pişmiş et ocağın yanında birikir; raf doluysa ocak durur
              │
   ┌─ 1. aşama: elle ─────────────── oyuncu raftan alır, kafasındaki yığınla tezgâha taşır
   ├─ 2. aşama: Garson ───────────── işçi raftan tezgâha taşır
   └─ 3. aşama: Tezgâh bandı ─────── raftan tezgâha kesintisiz bant
              │
              ▼
        [  TEZGÂH   ]  pişmiş et rafı, kapasite: 8 → +4/seviye
              │  oyuncu servis yapar → sonra Kasiyer
              ▼
        [ MÜŞTERİLER ] sıra: 6 → 10 kişi, 2 sn'de bir gelir, her biri 1–3 parça ister
              │  öder (+ büyük sipariş bonusu ve hız bahşişi)
              ▼
        [   KASA    ]  para destesi → oyuncu toplar → sonra Taşıyıcı cüzdana taşır
```

### Otomasyon merdiveni

Her iş önce **elle** yapılır, sonra adım adım otomatikleşir. Reklamlardaki asıl tatmin bu: yorucu işleri tek tek işçilere ve makinelere devretmek. Oyuncu zamanla "her şeyi yapan" kişiden "üssü yöneten" kişiye dönüşür.

| İş | Elle | 1. otomasyon | 2. otomasyon |
|---|---|---|---|
| Ayı avlamak | Oyuncu | **Avcılar** (Avcı Kulübesi), eti Kapı Deposuna bırakır | Daha çok ve daha güçlü avcı |
| Eti ocağa koymak | Oyuncu ocağın dairesine boşaltır | **Taşıyıcı**: Kapı Deposu → ocak | **Konveyör**: Kapı Deposu → ocak |
| Pişmiş eti tezgâha koymak | Oyuncu raftan alır, servis dairesinde bırakır | **Garson**: raf → tezgâh | **Tezgâh bandı**: raf → tezgâh |
| Müşteriye satmak | Oyuncu servis dairesinde durur | **Kasiyer** | Kasiyer hızı |
| Parayı toplamak | Oyuncu kasadan toplar | Konveyör kurulunca boşa çıkan **Taşıyıcı** kasadaki parayı cüzdana taşır | — |

### İstasyonlar

| İstasyon | Ne yapar | Yükseltmeler (yanındaki pedlerde) |
|---|---|---|
| **Kapı Deposu** | Ön kapının içinde büyük bir çiğ et stoku. Avcılar buraya bırakır. Avdan dönen oyuncu kapıdan geçerken buraya boşaltabilir. | Kapasite |
| **Ocak** | Tek dairede çiğ eti alır, pişmiş eti verir. Aynı anda yuva sayısı kadar pişirir. | Yuva sayısı, pişirme hızı, raf kapasitesi |
| **Tezgâh** | Pişmiş etin müşteriyi beklediği raf. | Kapasite |
| **Dükkân** | Müşteri sırası ve fiyatlar. | Et fiyatı, sıra uzunluğu, müşteri sıklığı |
| **Kasa** | Ödenen para burada birikir. | — |

---

## 2. Müşteriler

Üssün arka kapısından gelen, üşüyen hayatta kalanlar. Reklamlardaki "zor durumdaki karakterler" kancası.

- Sıraya girerler. Başlarının üstünde kaç parça istedikleri ve bir **sabır barı** görünür.
- Siparişleri tamamlanınca öderler, kafalarının üstünde "+$25" gibi ödedikleri tutar yükselir ve memnun ayrılırlar.

### Sabır: ceza değil ödül, ileride gerçek risk

| Müşteri | Ne zaman | Sabır bitince |
|---|---|---|
| **Normal** | Baştan | Gitmez, ama **bahşişi kaybolur** ve **kızar**. Hızlı servis edilirse büyük sipariş bonusu ve hız bahşişi bırakır (`tipFor`). |
| **Acil** | Üs seviyesi 3'ten sonra, arada bir | Çok para öder (×2,5) ama sabrı biterse **ödemeden gider**. |
| **VIP** | Üs seviyesi 5'ten sonra, nadiren | Büyük sipariş (4–6 parça), sabrı uzun, bahşişi iki katı. |

Hızlı oynamak ödüllendirilir, yavaş oynamak cezalandırılmaz. Gerçek risk oyunun ileri aşamasında acil müşterilerle gelir.

### Sabrı biten müşteri nasıl görünür?
- Baloncuk kırmızıya döner ve sabır barının yerinde **kızgın yüz** simgesi çıkar.
- Müşteri tezgâha yarı arkasını döner.
- Kızgınlık anında bir kez **homurdanma** sesi çalar.
- Ödemede "bahşiş yok" yazısı belirir. Oyuncu neyi kaybettiğini görür.

---

## 3. Yükseltmeler nerede?

Yükseltme sayısı arttıkça "her şey yerde ped" modeli üssü doldurur. Bu yüzden yükseltmeler **türüne göre** üç ayrı yerde durur:

| Tür | Nerede | Neden |
|---|---|---|
| **Karakter** (taşıma, hasar, hız, can, toplama yarıçapı) | Ekranda sabit **Karakter** düğmesi → menü | Karakter bir yere bağlı değil, onunla birlikte geziyor. Her yerden ulaşılır. |
| **İstasyon** (ocak yuvası, tezgâh, depo, fiyat…) | **Yerde, istasyonun yanında** | Yükseltme, değiştirdiği şeyin yanında durur. Her yükseltme hattı için sadece **sıradaki seviyenin** pedi görünür; tavana ulaşınca ped kaybolur. Bir istasyonun yanında en fazla 2 ped olur. |
| **İnşa ve açma** (yeni bina, işçi alımı, üs seviyesi) | **Yerde, büyük ped** | Satın alınınca ped kaybolur, yerine kurulan şey gelir. Reklamlardaki "büyük an". |
| **Boss ödülleri** | Ekranda açılan **kart seçimi** | Bedava, anında. |

Böylece üs asla dolmaz: tavana ulaşan pedler ve kurulan binaların pedleri sahneden kalkar.

### Ortak temel: İstatistikler (Stats)
Bütün değerler tek bir sistemden okunur:

```
değer = (temel + Σ eklemeler) × Π (1 + çarpanlar)
```

Karakter menüsü, istasyon pedleri, mini boss kartları ve ana boss yetenekleri **aynı değerleri aynı yoldan** değiştirir.

### Pede para verme
- Oyuncu pede basınca para **0,7 saniye sonra** akmaya başlar. Pedin üstünden geçen oyuncu yanlışlıkla para harcamaz.
- Her satın almadan sonra bu bekleme **yeniden başlar**.
- Bekleme sırasında pedin üstünde ince bir çizgi dolar.

### 3.1 Karakter menüsü

Ekranın üstündeki **Karakter** düğmesiyle açılır, oyunun her yerinden ulaşılır. **Menü açıkken oyun durur:** ayılar, müşteriler ve ocak bekler. Av sırasında menü açmak tehlikeli olmaz.

| Yükseltme | Seviye başına | Tavan | İlk fiyat | Fiyat artışı |
|---|---|---|---|---|
| Taşıma kapasitesi | +5 parça | 10 seviye | $50 | ×1,25 |
| Hasar | +4 | 10 seviye | $80 | ×1,35 |
| Hareket hızı | +0,5 | 6 seviye | $60 | ×1,4 |
| Can | +20 | 8 seviye | $70 | ×1,3 |
| Toplama yarıçapı | +0,4 | 5 seviye | $50 | ×1,3 |

Aynı anda vurulan ayı sayısı menüde **yok**: o bosslardan gelir (bölüm 6).

### 3.2 İstasyon pedleri

| İstasyon | Yükseltme hattı | Seviye başına | Tavan | İlk fiyat | Artış | Ne zaman görünür |
|---|---|---|---|---|---|---|
| Ocak | Yuva | +1 yuva | 3 (toplam 4) | $80 | ×2,0 | 3 müşteriden sonra |
| Ocak | Pişirme hızı | −%12 süre | 5 | $100 | ×1,6 | Üs seviyesi 2 |
| Ocak | Raf kapasitesi | +6 parça | 4 | $60 | ×1,5 | Üs seviyesi 2 |
| Tezgâh | Kapasite | +4 parça | 5 | $60 | ×1,5 | 6 müşteriden sonra |
| Dükkân | Et fiyatı | +$1 | 8 | $100 | ×1,45 | 10 müşteriden sonra |
| Dükkân | Sıra uzunluğu | +1 kişi | 4 | $120 | ×1,6 | Üs seviyesi 2 |
| Dükkân | Müşteri sıklığı | −%10 bekleme | 4 | $150 | ×1,6 | Üs seviyesi 3 |
| Kapı Deposu | Kapasite | +15 parça | 5 | $80 | ×1,5 | Depo kurulunca |
| İşçiler | Hız, taşıma | işçiye göre | 5 | — | — | İşçi alınınca (bölüm 5) |

---

## 4. Üs seviyesi: Büyük Ocak

Üssün ortasında bir **Büyük Ocak** durur. Onun seviyesi **Üs Seviyesi**dir ve ilerlemenin omurgasıdır; gerçek Whiteout Survival'daki ocak seviyesi gibi. Her seviye:
- **çiti dışarı açar** (üs büyür),
- **yeni inşa pedleri** açar,
- **işçi sınırını** yükseltir,
- **yeni müşteri türleri** getirir.

Seviye atlamak için hem **para** hem **ön koşul** gerekir. Ön koşullar dönüşümlü olarak biri **ekonomiden** (müşteri, ocak), biri **savaştan** (boss) gelir. Oyuncu ne sadece avlanarak ne de sadece satarak üssü büyütebilir; iki yarıyı da ilerletmek zorundadır.

| Üs seviyesi | Fiyat | Ekonomi koşulu | Savaş koşulu | Açılanlar | Çit yarıçapı |
|---|---|---|---|---|---|
| **1** | — | — | — | Ocak, tezgâh, kasa, Karakter menüsü | 12 |
| **2** | $250 | 25 müşteri | — | **Kapı Deposu**, **Taşıyıcı**, ocak hızı ve raf pedleri, sıra uzunluğu · işçi sınırı 2 | 14 |
| **3** | $800 | Ocakta 2 yuva | **1. ana boss** (Yaşlı Ayı) | **Garson**, **Kasiyer**, **Avcı Kulübesi** (1 avcı), acil müşteriler · işçi sınırı 4 | 16 |
| **4** | $2.000 | 60 müşteri | 2 mini boss | **Konveyör**, **Tezgâh bandı**, 2. avcı, ikinci av bölgesi · işçi sınırı 6 | 18 |
| **5** | $5.000 | Ocakta 3 yuva | **2. ana boss** (Buzul Ayısı) | **İkinci ocak**, 3. avcı, VIP müşteriler · işçi sınırı 8 | 20 |
| **6** | $12.000 | 150 müşteri | 4 mini boss | 4. avcı, **final boss**'un yolu açılır | 22 |

### Üs seviyesi neyi değiştirir: inşa alanları

Üs seviyesi bir şeyi doğrudan vermez; **inşa edilecek bir yer hazırlar.** Oyuncu ödüle kendi parasıyla ulaşır ve üssün gözünün önünde değiştiğini görür:

```
Büyük Ocak pedi alınır
   ↓
1. ÇEVRE DEĞİŞİR       çit açılır, kar temizlenir, ağaçlar kesilir, Büyük Ocak büyür
   ↓
2. İNŞA ALANI BELİRİR  köşelerinde kazıklar, etrafında ip, önünde binanın adı ve fiyatı yazan bir ped
   ↓
3. OYUNCU ÖDER         iskele yükselir, çekiç sesleri, toz, bina "pop" diye ortaya çıkar
   ↓
4. BİNA ÇALIŞIR        yanında işçi alım pedi ve yükseltme pedleri belirir
```

| Üs | Çevrede ne değişir | İnşa alanı | Kurulunca ne açılır |
|---|---|---|---|
| **2** | Çit açılır. Ön kapının yanında kar temizlenir, kazıklı bir alan belirir | **Kapı Deposu** | Yanında **Taşıyıcı** alım pedi |
| **3** | Büyük Ocak bir kat yükselir, alevleri büyür. Batıda ağaçlar kesilip bir alan açılır | **Avcı Kulübesi** | **Avcı** alım pedi; Garson ve Kasiyer pedleri kendi istasyonlarında |
| **4** | Ahşap çit **kalın kütük çite** dönüşür. Ormanda bir **geçit** açılır (ikinci av bölgesi) | **Konveyör hattı**, **Tezgâh bandı** | Otomatik taşıma |
| **5** | Doğuda yeni bir alan, müşteri tarafında bekleme çadırları | **İkinci Ocak**, **VIP Çadırı** | İkinci üretim hattı, VIP müşteriler |
| **6** | Çit **taş duvara** dönüşür, kuzeyde büyük bir kapı | **Arena Kapısı** | Final boss: Ayı Kralı |

Büyük Ocak her seviyede görünür şekilde büyür; üssün ortasındaki tek bina bile oyuncunun ne kadar ilerlediğini gösterir.

Büyük Ocak'ın seviye pedi hemen yanında durur. Ön koşul eksikse ped gri görünür ve **sadece eksik olan** koşulu yazar ("Müşteri 7/25", "Ocak yuvası 1/2", "Boss: Yaşlı Ayı"). Ped dar olduğu için iki koşul birden yazılmaz; oyuncu bir seferde tek hedefe odaklanır. Kural `baseRequirement` fonksiyonunda (`src/systems/progression.ts`).

---

## 5. İşçiler ve avcılar

Her işçi kendi işinin yanındaki bir **inşa pediyle** işe alınır. İşe alındıktan sonra o pedin yerine işçinin **yükseltme pedi** gelir.

| İşçi | Açılır | Ne yapar | Yükseltmeler | Sonra |
|---|---|---|---|---|
| **Taşıyıcı** | Üs 2 | Kapı Deposu → ocak; her seferde 4 parça | Taşıma (4 → 12), hız | Konveyör kurulunca **kasaya geçer**: kasadaki parayı cüzdana taşır |
| **Garson** | Üs 3 | Ocak rafı → tezgâh; her seferde 4 parça | Taşıma, hız | Tezgâh bandı kurulunca **ikinci kasiyer** olur |
| **Kasiyer** | Üs 3 | Tezgâhta durur, müşterilere servis eder | Servis hızı | — |
| **Avcı** | Üs 3 (Avcı Kulübesi) | Av sahasına gider, ayı keser, eti **Kapı Deposuna** getirir | Avcı sayısı (üs seviyesiyle sınırlı: 1→4), hasar, taşıma, hız | İkinci av bölgesine de gider |

### Avcıların kuralları
- Oyuncudan zayıftır: başlangıç hasarı oyuncunun %60'ı, tek hedefe vurur.
- Avcı yığını dolunca üsse döner ve **Kapı Deposuna** bırakır. Depo doluysa kapıda bekler.
- Ayılar avcılara da saldırır. Canı biten avcı kulübeye döner ve 10 saniye dinlenir.
- Avcıların kestiği ayılar da **Av Seviyesi**ni ilerletir.
- Depodan ocağa taşıma önce elle, sonra Taşıyıcı, en sonunda Konveyör ile olur. Avcı ekonomisi bu yüzden kademeli büyür.

---

## 6. Av seviyesi (otomatik zorluk)

Ayı sayısı satın alınmıyor, **oyunda ilerledikçe kendiliğinden artıyor.** Öldürülen ayılar (oyuncu + avcılar) "Av Seviyesi"ni yükseltir:

| Her av seviyesinde | Değişim |
|---|---|
| Sonraki seviye için gereken av | 15 + 5 × seviye |
| Ayı sayısı | +2 (üst sınır 50) |
| Ayı canı | ×1,12 |
| Ayı hasarı | ×1,08 |
| Ayı başına et | her 2 seviyede +1 |

Oyuncu güçlendikçe av da büyür. Yükseltmeler anlamsızlaşmaz, ekonomi de büyümeye devam eder.

---

## 7. Bosslar ve ödüller

Bosslar **av seviyesine bağlı** olarak kendiliğinden gelir. Ekranda "Dev Ayı geliyor!" uyarısı ve davul sesi çıkar. Boss av sahasının kapıya yakın bir yerinde belirir; yeri ekran kenarındaki bir işaretle gösterilir.

### Takvim

| Av seviyesi | Boss | Ödül |
|---|---|---|
| 2 | Mini boss: Dev Ayı | 2 rastgele karttan 1 |
| **3** | **1. ana boss: Yaşlı Ayı** | **Üçlü Vuruş** (seçimsiz, sabit ödül) |
| 4 | Mini boss | 2 rastgele karttan 1 |
| **6** | **2. ana boss: Buzul Ayısı** | 2 benzersiz yetenekten 1 |
| 7 | Mini boss | 2 rastgele karttan 1 |
| 9 | Mini boss | 2 rastgele karttan 1 |
| **10** | **Final: Ayı Kralı** (Üs 6 gerekli) | 2 benzersiz yetenekten 1, ilk harita tamamlanır |

### Ana boss: oyun tarzını değiştiren yetenekler
**İlk ana boss her zaman Üçlü Vuruş'u verir:** karakter artık aynı anda 3 ayıya vurur. Bu, oyunun ilk büyük dönüm noktası. Eski "Geniş Savuruş" satırı bu yüzden 0.6.0'da karakter menüsünden kaldırıldı.

Sonraki ana bosslar 2 benzersiz yetenek sunar. Oyuncu birini seçer, seçilmeyen havuza geri döner:

| Benzersiz yetenek | Etkisi |
|---|---|
| **Kanca** | 6 saniyede bir, yakındaki 4 ayıyı uzaktan üstüne çeker |
| **Dönen Savuruş** | 5 saniyede bir etrafındaki bütün ayılara 2 kat hasar |
| **Kasırga** | Vurma alanı +%50 |
| Mıknatıs | Et toplama yarıçapı ×2 |
| Kritik Vuruş | Her 5. vuruş 3 kat hasar |
| Buz Zırhı | Ayılardan alınan hasar %40 az |
| Bereket | Her ayıdan +1 et |
| Ziyafet | Müşteriler %50 fazla öder |
| Kor Ocak | Pişirme süresi yarıya iner |

### Mini boss: sayısal güçlenme kartları
Dev Ayı: normal ayıdan 1,6 kat büyük, 10 kat canlı, yavaş ama sert vuruyor. Ölünce **2 rastgele kart** sunar. Kartlar tekrar çıkabilir, tavana ulaşanlar havuzdan çıkar.

| Kart | Etkisi | Not |
|---|---|---|
| Geniş Alan | Vurma alanı +%15 | |
| Güçlü Kol | Hasar +%20 | |
| Çevik | Saldırı hızı +%10 | |
| Bir Ayı Daha | Aynı anda vurulan ayı +1 | Üçlü Vuruş'tan sonra, en fazla 6 |
| Uzun Kol | Toplama yarıçapı +%20 | |
| Geniş Sırt | Taşıma +3 | |
| Hafif Adım | Hareket hızı +%8 | |
| Kalın Post | Can +25 | |
| Lezzet | Et fiyatı +%10 | |
| Harlı Ateş | Pişirme hızı +%10 | |

### Seçim ekranı
Boss ölünce oyun durur ve iki kart ekrana gelir. Kart dokunuşla seçilir, oyun devam eder.

### Boss'u kesememenin cezası: Kar Fırtınası
Boss geldiğinde ekranın üstünde **90 saniyelik** bir sayaç başlar. Süre biterse ya da oyuncu boss'a karşı bayılırsa:
- Boss kükreyip av sahasının derinliklerine çekilir ve **üsse kar fırtınası çöker** (60 saniye).
- Fırtınada ekran beyazlaşır, görüş azalır; müşterilerin sabrı **iki kat hızlı** biter (bahşişler kaçar) ve ocak **%30 yavaş** pişirir.
- Boss **2 dakika sonra tekrar gelir**; ödülü kaybolmaz.

Ceza can sıkıcıdır ama oyunu bitirmez: "hazırlan, tekrar dene" hissi verir. Whiteout'un "beyaz kıyamet" temasıyla da uyumludur.

---

## 8. Tam ilerleme yolu (ilk harita ≈ 35 dakika)

| Dakika | Üs | Av | Oyuncu ne yaşıyor |
|---|---|---|---|
| 0–2 | 1 | 1 | İlk av, ocak, ilk müşteriler. Karakter menüsünden ilk taşıma yükseltmesi. |
| 2–4 | 1 | 1–2 | Ocak 2. yuva, tezgâh. İlk **mini boss**, ilk kart. |
| 5–6 | 1 | 2–3 | **1. ana boss → Üçlü Vuruş.** Av hızı patlar. |
| ~7 | **2** | 3 | **Kapı Deposu ve Taşıyıcı** (25 müşteriden sonra): eti ocağa taşımak otomatikleşir. |
| ~8 | **3** | 3 | **Garson, Kasiyer, Avcı Kulübesi.** Satış otomatikleşir, ilk avcı sahaya çıkar. Acil müşteriler. |
| 8–14 | 3 | 4–5 | Avcılar depoyu doldurur, fiyat ve sıra yükseltmeleri, mini boss. |
| ~14 | **4** | 5 | **Konveyörler**, 2. avcı, ikinci av bölgesi. Taşıyıcı kasaya geçer. |
| 15–20 | 4 | 6 | **2. ana boss → benzersiz yetenek** (Kanca, Dönen Savuruş…). |
| ~21 | **5** | 7 | **İkinci ocak**, 3. avcı, VIP müşteriler. |
| 21–32 | 5–6 | 8–9 | Yoğun sürüler, mini bosslar, Üs 6, 4. avcı. |
| ~35 | 6 | 10 | **Ayı Kralı.** İlk harita tamamlanır. |

Kural: ilk dakikalarda her 30–60 saniyede bir yeni şey açılmalı. Sonra bu aralık 2–4 dakikaya çıkabilir. Tempo bir **ekonomi simülasyonu** ile doğrulanacak: oyunu saniye saniye oynayan bir betik, her açılışın kaçıncı dakikada gerçekleştiğini hesaplayacak.

---

## 9. Sürüm planı

| Sürüm | İçerik |
|---|---|
| 0.4.0 ✅ | Üretim zinciri (elle): ocak, tezgâh, müşteriler, bahşiş, kasa |
| 0.4.1 ✅ | Pişmiş eti elle taşıma, sesler, uçan ödeme yazıları, kızgın müşteri, ped beklemesi |
| 0.5.0 ✅ | **Yükseltme düzeni ve üs:** Karakter menüsü, istasyon pedlerinin yanlarına taşınması (sadece sıradaki seviye), inşa pedleri, **Büyük Ocak** ve üs seviyeleri 1–3, genişleyen çit |
| **0.6.0** | **Av seviyesi ve bosslar:** sürü kendiliğinden büyür, mini boss ve kart ekranı, 1. ana boss ve Üçlü Vuruş (Geniş Savuruş satırı kalkar), Kar Fırtınası cezası, acil müşteriler. Üs 3 ulaşılabilir hale gelir. |
| 0.7.0 | **İnşa alanları ve işçiler:** üs seviyesinde çevre değişimi ve inşaat animasyonu, Kapı Deposu ve Taşıyıcı (Üs 2), Avcı Kulübesi ve avcılar, Garson, Kasiyer (Üs 3) |
| 0.8.0 | Konveyör hattı ve tezgâh bandı, üs seviyeleri 4–6 ve çevre değişimleri, 2. ana boss ve final, benzersiz yetenekler, ikinci av bölgesi, ikinci ocak, VIP müşteriler |
| 0.9.0 | Kayıt sistemi, ekonomi simülasyonu ve denge ayarı |
| 0.10.0 | Görseller ve animasyonlar: modeller, efektler, kayıtlı (CC0) organik sesler, müzik |
| 1.0.0 | İlk harita baştan sona, iPhone'da sorunsuz |

---

## 10. Kod temelleri

| Temel | Görevi | Durum |
|---|---|---|
| `Stats` | Bütün değerleri tek yerden hesaplar | ✅ 0.4.0 |
| `UpgradeDef` | Bir yükseltmenin tanımı: ad, maliyet eğrisi, tavan, etkisi, ne zaman görüneceği | ✅ 0.4.0 |
| `MeatKind` | Taşınan şeyin türü: çiğ et, pişmiş et | ✅ 0.4.1 |
| `Audio` | Bütün sesleri çalan tek servis | ✅ 0.4.1 |
| `FloatingText` | Bir noktanın üstünde süzülen yazı | ✅ 0.4.1 |
| `Customer` | Durum makinesi: yürü → sıraya gir → bekle → al → öde → ayrıl | ✅ 0.4.0 |
| `UpgradeTrack` | Bir istasyonun yanındaki yükseltme hattı: sadece sıradaki seviyenin pedini gösterir | 0.5.0 |
| `BuildPad` | Satın alınınca kaybolup yerine bir bina kuran ped | 0.5.0 |
| `BaseLevel` | Büyük Ocak seviyesi, ön koşullar, çitin genişlemesi | 0.5.0 |
| `CharacterMenu` | Ekrandaki karakter yükseltme menüsü | 0.5.0 |
| `Worker` | Durum makinesi: al → taşı → bırak; servis et; avla | 0.6.0 |
| `Events` | "Ayı öldü", "boss yenildi" gibi olayları sistemler arasında taşır | 0.7.0 |
| `Progress` | İlerleme sayaçları | ✅ |

---

## 11. Ses tasarımı

Hiper-casual oyunlarda ses, görüntü kadar önemli. Her eylemin kısa ve tatmin edici bir karşılığı olmalı.

### Teknik
- **Web Audio API:** iOS'ta ses ancak **ilk dokunuştan sonra** açılabiliyor; oyun ilk dokunuşta sesi uyandırır.
- **Tek ses servisi (`Audio`):** oyun sistemleri sadece olay adını bildirir (`audio.play('pickup')`).
- **Varyasyon:** her çalmada perde biraz değişir; aynı ses 50 kez çalsa bile robotik gelmez.
- **Yığılma koruması:** aynı ses aynı anda en fazla 3 kez çalar.
- **Artan perde:** art arda gelen toplama, para ve ped seslerinin perdesi kademeli yükselir.
- **Sessiz düğmesi:** ekranın üstünde, ayarı hatırlar.
- **Arka plan:** uygulama arka plana geçince ses durur.

### Kaynaklar
| Tür | Kaynak | Lisans |
|---|---|---|
| Kısa efektler | **ZzFX**: kodla ses üreten küçük bir kütüphane, dosya gerektirmez | MIT |
| Organik sesler (ayı kükremesi, müşteri homurtusu, cızırtı) | Kenney, OpenGameArt, Freesound'daki **yalnızca CC0** kayıtlar | CC0 |
| Müzik | CC0 sakin döngüler, boss sırasında daha hızlı bir parça | CC0 |

Kullanılan her kütüphane ve dosya [CREDITS.md](CREDITS.md) içinde listelenir.

### Ses listesi

| Olay | Ses | Durum |
|---|---|---|
| Vuruş, ayı ölümü, et fırlaması | Tok vuruş, derin homurtu, pop | ✅ |
| Et toplama | Pop, yığınla birlikte yükselen perde | ✅ |
| Yığın doldu, hasar alma, bayılma | Uyarı tonu, "of", düşüş | ✅ |
| Tepsiye dökme, et pişti, tezgâha koyma | Tık dizisi, ding, tok "tak" | ✅ |
| Müşteri geldi, ödeme, bahşiş, kızgınlık | Kapı zili, yazar kasa, parıltı, homurtu | ✅ |
| Para toplama, ped dolumu, satın alma, yeni ped | Şıngırtı, yükselen ton, fanfar, pop | ✅ |
| Ayı öfkelendi | Kükreme | 0.10.0 (kayıtlı ses) |
| Ocak çalışıyor | Cızırtı döngüsü | 0.10.0 |
| Acil müşteri gitti | Kızgın "hıh!" + kapı çarpması | 0.7.0 |
| Boss geliyor, kart seçimi, ödül | Davul, whoosh, fanfar | 0.7.0 |
| İşçi alındı, bina kuruldu, üs seviyesi | Fanfar, inşaat sesi | 0.5.0–0.6.0 |
