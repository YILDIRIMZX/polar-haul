# Changelog / Sürüm notları

Every update is listed here with what changed and why. Newest first. Each entry is written in English and Turkish.

Her güncelleme, neyin neden değiştiğiyle birlikte burada listelenir. En yenisi en üstte. Her kayıt İngilizce ve Türkçe yazılmıştır.

---

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
