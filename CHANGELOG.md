# Changelog / Sürüm notları

Every update is listed here with what changed and why. Newest first. Each entry is written in English and Turkish.

Her güncelleme, neyin neden değiştiğiyle birlikte burada listelenir. En yenisi en üstte. Her kayıt İngilizce ve Türkçe yazılmıştır.

---

## 0.3.2 (2026-10-13)

**EN.**
- **iPhone bottom strip, fixed at the cause.** With a see-through status bar, iOS kept the home-screen app's viewport one status bar short and painted nothing below it, so stretching the game did not help. The status bar is now opaque and snow-coloured: the page starts below it and reaches the bottom of the screen. To pick this up on iPhone, remove the app from the home screen and add it again from Safari, because iOS stores the status bar style when the app is added.
- **Game design document.** [TASARIM.md](TASARIM.md) (Turkish) plans the next versions: a cooking and selling chain with customers instead of meat turning straight into cash, step-by-step automation (hauler and storage, cashier, conveyor), customer patience with tips, a hunt level that grows the herd on its own, mini bosses with two random upgrade cards, and main bosses with two unique perks. Visuals and animations move to the end, after the mechanics.

**TR.**
- **iPhone alt şeridi, kökünden düzeltildi.** Durum çubuğu şeffafken iOS ana ekran uygulamasının görüntü alanını bir durum çubuğu kadar kısa tutuyor ve altına hiçbir şey çizmiyordu; bu yüzden oyunu uzatmak işe yaramadı. Durum çubuğu artık opak ve kar renginde: sayfa onun altından başlıyor ve ekranın en altına ulaşıyor. iPhone'da bunu görmek için uygulamayı ana ekrandan silip Safari'den yeniden ekle, çünkü iOS durum çubuğu ayarını uygulama eklenirken kaydediyor.
- **Oyun tasarım belgesi.** [TASARIM.md](TASARIM.md) sonraki sürümleri planlıyor: etin doğrudan paraya dönüşmesi yerine müşterilerle pişirme ve satış zinciri, adım adım otomasyon (taşıyıcı ve depo, kasiyer, konveyör), bahşişli müşteri sabrı, sürüyü kendiliğinden büyüten av seviyesi, iki rastgele yükseltme kartı veren mini bosslar ve iki benzersiz yetenek sunan ana bosslar. Görseller ve animasyonlar mekaniklerden sonraya, en sona alındı.

## 0.3.1 (2026-10-13)

**EN.** Changes from the first playtest on iPhone.
- **Bears are close.** The herd now roams right outside the gate (30 bears in a smaller field), so the hunt starts a few steps from the base instead of a long walk away.
- **The world has an edge.** Rows of snowy pines surround the play area. The player and the bears cannot walk past them, so you can no longer get lost in an endless snowfield.
- **Way home.** When the base is off screen, a house badge appears on the edge of the screen with an arrow pointing toward it.
- **Wide sweep is earned.** The player now hits one bear per swing at first. The Wide sweep pad stays hidden until $100 has been earned and 20 bears have been killed, then pops up in the base. Its first purchase hits 3 bears per swing, each next level adds one, up to 6.
- **iPhone bottom strip, second try.** In a home-screen app with a see-through status bar, iOS sizes the page as "screen minus status bar" while starting it at the very top, which left a strip as tall as the status bar at the bottom. The game now adds that height back, and the page behind it is snow-coloured in case any gap remains.

**TR.** iPhone'daki ilk denemeden sonraki değişiklikler.
- **Ayılar yakında.** Sürü artık kapının hemen önünde dolaşıyor (daha dar bir alanda 30 ayı). Av, uzun bir yürüyüş yerine üssün birkaç adım ötesinde başlıyor.
- **Dünyanın bir sınırı var.** Oyun alanını sıra sıra karlı çam ağaçları çeviriyor. Karakter ve ayılar ağaçların ötesine geçemiyor, böylece sonsuz bir kar alanında kaybolmak mümkün değil.
- **Eve dönüş yolu.** Üs ekrandan çıkınca ekranın kenarında ev simgeli bir rozet beliriyor ve oku üssün yönünü gösteriyor.
- **Geniş savuruş kazanılıyor.** Karakter artık başta tek ayıya vuruyor. Geniş savuruş pedi, $100 kazanılıp 20 ayı öldürülene kadar gizli kalıyor, sonra üste zıplayarak beliriyor. İlk satın alma bir vuruşta 3 ayıya vurduruyor, sonraki her seviye bir ayı ekliyor, en fazla 6'ya kadar.
- **iPhone alt şeridi, ikinci deneme.** Durum çubuğu şeffaf olan ana ekran uygulamalarında iOS sayfayı ekranın en üstünden başlatıyor ama yüksekliğini "ekran eksi durum çubuğu" olarak hesaplıyor. Bu da altta durum çubuğu yüksekliğinde bir şerit bırakıyordu. Oyun artık bu yüksekliği geri ekliyor. Bir boşluk kalırsa diye arkadaki sayfa da kar renginde.

## 0.3.0 (2026-10-13)

**EN.** The core loop from the ads is playable: hunt bears, carry a tower of meat, process it, collect cash, buy upgrades. Everything is still made of simple shapes; models and effects come in 0.4.0.
- **Movement.** A floating joystick: touch anywhere and drag. On a computer, WASD or the arrow keys. The fence blocks the player everywhere except the gate.
- **Bears.** 28 polar bears roam the snowfield. A bear that is hit gets angry for a few seconds, chases the player and attacks; bears never enter the base, so they crowd at the fence. Health bars show on hurt bears. Dead bears respawn after a few seconds, out of the player's sight.
- **Auto-attack.** No button: every 0.4 s the player swings at the nearest bears in reach, up to 3 at once. Target choice keeps the swing on the closest bears first and skips dead ones.
- **Meat stack.** Each kill throws 2–3 pieces of meat onto the snow. Walking near them makes them fly onto the stack above the player's head. The tower leans against the direction of travel and springs back when the player stops. The counter at the top turns red when the stack is full.
- **Processing line.** Standing in the dashed circle unloads the stack piece by piece onto the conveyor. The machine turns each piece into a bundle of cash on the table; standing by the table collects it.
- **Upgrade pads.** Stand on a pad and cash flows into it until the price is paid. *Capacity* adds 5 to the stack (price ×1.25 per level). *Wide sweep* adds one more bear per swing, up to 6 (price ×1.8 per level, 3 levels, then MAX).
- **Health.** Bears hurt the player; inside the base health refills. At zero health the carried meat is lost and the player wakes up back at the base.
- **Fixes.** On iPhone the game now fills the whole screen; before, a strip of page background showed above the home indicator. Machines and pads moved closer to the centre so they all fit a portrait screen. The camera now looks down at 43° from 37 units.

**TR.** Reklamlardaki ana döngü oynanabilir: ayı avla, kule gibi et taşı, işle, parayı topla, yükseltme al. Her şey hâlâ basit şekillerden oluşuyor; modeller ve efektler 0.4.0'da gelecek.
- **Hareket.** Kayan joystick: ekranın herhangi bir yerine dokunup sürükle. Bilgisayarda WASD ya da ok tuşları. Çit, kapı dışında her yerde karakteri durduruyor.
- **Ayılar.** Kar alanında 28 kutup ayısı dolaşıyor. Vurulan ayı birkaç saniye öfkeleniyor, karakteri kovalıyor ve saldırıyor. Ayılar üsse hiç girmediği için çitin önüne yığılıyor. Yaralı ayıların üstünde can barı görünüyor. Ölen ayılar birkaç saniye sonra, karakterin göremeyeceği bir yerde yeniden doğuyor.
- **Otomatik saldırı.** Düğme yok: karakter 0,4 saniyede bir menzildeki en yakın ayılara vuruyor, aynı anda en fazla 3 ayıya. Hedef seçimi önce en yakın ayılara vuruyor ve ölüleri atlıyor.
- **Et yığını.** Her ölen ayı kara 2–3 parça et fırlatıyor. Yanlarından geçince etler karakterin kafasındaki yığına uçuyor. Kule gidilen yönün tersine eğiliyor ve karakter durunca yerine yaylanıyor. Yığın dolunca üstteki sayaç kırmızıya dönüyor.
- **İşleme hattı.** Kesik çizgili dairede durunca yığın parça parça konveyöre boşalıyor. Makine her parçayı masada bir deste paraya çeviriyor; masanın yanında durunca para toplanıyor.
- **Yükseltme pedleri.** Bir pedin üstünde durunca fiyat ödenene kadar para pede akıyor. *Kapasite* yığına 5 ekliyor (her seviyede fiyat ×1,25). *Geniş savuruş* her vuruşa bir ayı daha ekliyor, en fazla 6'ya kadar (her seviyede fiyat ×1,8, 3 seviye, sonra MAKS).
- **Can.** Ayılar karakterin canını azaltıyor; üssün içinde can doluyor. Can sıfırlanınca taşınan et kayboluyor ve karakter üste geri dönüyor.
- **Düzeltmeler.** iPhone'da oyun artık bütün ekranı kaplıyor; önceden alt çubuğun üstünde sayfa arka planından bir şerit görünüyordu. Makineler ve pedler dikey ekrana sığmaları için merkeze yaklaştırıldı. Kamera artık 37 birim uzaktan 43° açıyla bakıyor.

## 0.2.0 (2026-10-13)

**EN.** The app skeleton: it now builds, publishes itself and opens on the iPhone home screen.
- **Project setup.** TypeScript, Vite and Three.js, with every world number (sizes, colors, camera) kept in one config file so tuning never means searching the code.
- **First scene.** A snowfield with scattered snow mounds, a sandy base inside a round wooden fence with an open gate facing the bear side, soft shadows and a placeholder player with a ground ring. The camera looks down at an angle and follows the player, like in the ads.
- **Installable app.** Web app manifest, offline cache, portrait lock, home-screen icon and a splash screen that fades out once the first frame is drawn. Pinch zoom, page bounce and text selection are turned off so touches only reach the game.
- **Phone frame on a computer.** On a wide screen the game is drawn in a centered portrait frame with a phone's proportions, so it looks the same as on the iPhone during development.
- **Automatic publishing.** Every push to `main` builds the app and publishes it on GitHub Pages; the installed app updates itself on the next launch.
- **Battery and stability.** The render loop stops while the app is in the background, and the pixel ratio is capped at 2 so high-density screens do not render more pixels than needed.

**TR.** Uygulamanın iskeleti: artık derleniyor, kendini yayınlıyor ve iPhone ana ekranından açılıyor.
- **Proje kurulumu.** TypeScript, Vite ve Three.js. Dünyaya ait bütün sayılar (boyutlar, renkler, kamera) tek bir ayar dosyasında, böylece ayar yapmak için kodun içinde arama yapmak gerekmiyor.
- **İlk sahne.** Kar tümsekleriyle dolu bir kar alanı, ayıların tarafına bakan açık bir kapısı olan yuvarlak ahşap çitin içinde kum renkli bir üs, yumuşak gölgeler ve ayağında halka olan yer tutucu bir karakter. Kamera reklamlardaki gibi açılı olarak yukarıdan bakıyor ve karakteri takip ediyor.
- **Kurulabilir uygulama.** Web uygulaması manifesti, internetsiz önbellek, dikey ekran kilidi, ana ekran simgesi ve ilk kare çizilince kaybolan açılış ekranı. İki parmakla yakınlaştırma, sayfa esnemesi ve metin seçimi kapalı, böylece dokunuşlar yalnızca oyuna gidiyor.
- **Bilgisayarda telefon çerçevesi.** Geniş bir ekranda oyun, telefon oranlarında ortalanmış dikey bir çerçevede çiziliyor. Böylece geliştirme sırasında iPhone'daki ile aynı görünüyor.
- **Otomatik yayın.** `main` dalına yapılan her push uygulamayı derleyip GitHub Pages'te yayınlıyor. Kurulu uygulama bir sonraki açılışta kendini güncelliyor.
- **Pil ve kararlılık.** Uygulama arka plandayken çizim döngüsü duruyor. Piksel oranı en fazla 2, böylece yoğun ekranlarda gereğinden fazla piksel çizilmiyor.

## 0.1.0 (2026-10-13)

**EN.** Project start: plan and documentation only, no game code yet.
- **Purpose.** Ads for Whiteout Survival show an idle-arcade game (hunt polar bears, stack meat, process it, unlock areas) that the installed app does not contain. Polar Haul builds that game for personal play on one iPhone, and as a way to learn 3D web game development.
- **Research.** The ads were studied through public analyses (Naavik, Segwise) and ad examples. The roadmap lists each ad scene and the version that brings it into the game.
- **Platform decision.** An installable web app (PWA) with Three.js, published on GitHub Pages and added to the iPhone home screen from Safari. A native iOS build would need a Mac and Apple signing; the PWA needs neither and updates itself after each push.
- **Not an official product.** The READMEs state that the project is unofficial, non-commercial, not affiliated with Century Games, and uses no material from the original game or its ads.

**TR.** Projenin başlangıcı: yalnızca plan ve belgeler, henüz oyun kodu yok.
- **Amaç.** Whiteout Survival reklamları, indirilen uygulamada bulunmayan bir idle-arcade oyun gösteriyor (kutup ayısı avla, eti yığ, işle, alan aç). Polar Haul bu oyunu tek bir iPhone'da kişisel olarak oynamak ve 3D web oyun geliştirmeyi öğrenmek için yapıyor.
- **Araştırma.** Reklamlar herkese açık analizler (Naavik, Segwise) ve reklam örnekleri üzerinden incelendi. Yol haritası her reklam sahnesini ve onu oyuna getirecek sürümü listeliyor.
- **Platform kararı.** Three.js ile kurulabilir bir web uygulaması (PWA). GitHub Pages'te yayınlanacak ve Safari'den iPhone ana ekranına eklenecek. Yerel bir iOS uygulaması Mac ve Apple imzası gerektirirdi. PWA ikisini de gerektirmiyor ve her push'tan sonra kendini güncelliyor.
- **Resmi bir ürün değil.** README'ler projenin resmi olmadığını, ticari olmadığını, Century Games ile bağı bulunmadığını ve orijinal oyundan ya da reklamlarından hiçbir içerik kullanmadığını belirtiyor.
