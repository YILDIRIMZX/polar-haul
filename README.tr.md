<div align="center">

# Polar Haul

**Reklamlardaki oyun, gerçekten: kutup ayısı avladığın, eti kafanda yığıp taşıdığın, işleme hattı kurduğun ve donmuş bir üssü büyüttüğün idle-arcade hayatta kalma oyunu. Kurulabilir bir web uygulaması (PWA) olarak geliştiriliyor.**

[English](README.md) · **Türkçe**

![Sürüm](https://img.shields.io/badge/sürüm-0.5.1-3b6e8f)
![Durum](https://img.shields.io/badge/durum-geliştiriliyor-8aa4b5)
![Three.js](https://img.shields.io/badge/Three.js-3D-1f2933)
![PWA](https://img.shields.io/badge/PWA-kurulabilir-3b6e8f)
![Lisans](https://img.shields.io/badge/Lisans-MIT-3b6e8f)

</div>

> [!IMPORTANT]
> **Resmi olmayan bir hayran projesi.** Polar Haul bağımsız ve ticari olmayan bir hobi projesidir. Century Games ya da Whiteout Survival ile **hiçbir bağı yoktur**, onlar tarafından desteklenmez ya da onaylanmaz. "Whiteout Survival" sahibinin markasıdır ve burada yalnızca fikrin nereden çıktığını anlatmak için anılır.
>
> Orijinal oyundan ya da reklamlarından hiçbir kod, görsel, ses, karakter veya başka içerik kullanılmaz. Polar Haul orijinal oyunun bir kopyası değildir ve onun yerine geçmek için yapılmamıştır. Reklamlarda gösterilen idle-arcade oyun fikrini, özgün ve açık lisanslı (CC0) içeriklerle ayrı bir oyun olarak hayata geçirir. Oyun mekanikleri herkesin kullandığı bir türdür, marka ve içerikleri ise sahibine aittir.
>
> Hak sahibiysen ve bir endişen varsa lütfen bir issue aç. En kısa sürede ilgilenilecektir.

## Neden yapıldı?

Whiteout Survival'ın telefon reklamları basit ve tatmin edici bir oyun gösterir. Bir hayatta kalan çitle çevrili kamptan çıkar, kutup ayılarıyla savaşır, kafasının üstünde kule gibi et yığınını kampa taşır, eti işleme makinesine boşaltır, parayı toplar ve yeni alanlar açar. Uygulamayı indirince ise bambaşka bir oyunla karşılaşırsın: dünya haritası, ittifaklar ve uzun bekleme süreleri olan bir 4X strateji oyunu.

Polar Haul, reklamların vaat ettiği oyunu yapar. İki amacı var:

1. **Reklamdaki oyunu oynamak:** tek bir kişisel iPhone'da, reklamsız, satın almasız ve hesapsız.
2. **Öğrenmek:** net ve eğlenceli bir hedefi olan bir proje üzerinde 3D web oyun geliştirmeyi öğrenmek (Three.js, oyun döngüsü, instancing, mobil performans ve PWA).

## Ne olacak?

| Alan | Plan |
|---|---|
| **Çekirdek döngü** | Üsten çık, ayılara otomatik saldır, düşen eti kafanda yığ, geri taşı, işleme hattını besle, parayı topla. |
| **İlerleme** | Unlock pedlerinin üstünde durarak para harca: taşıma kapasitesi, hasar, hız, ikinci makine, taşıyıcı işçiler, yeni bölgeler, kapılar. |
| **Zorluk** | Dış bölgelerde daha güçlü ayılar, ilk haritanın sonunda boss ayı. |
| **Sonraki güncellemeler** | Kurtarılıp işe alınan donmuş hayatta kalanlar, odun ve ısı yarıçapı olan dev ocak, çadırlar ve revir, yeni haritalar. |
| **Cihaz** | Dikey ekran, dokunmatik joystick, internetsiz çalışma, cihazda kayıt ve yedek dosyası. |

Ayrıntılı plan [ROADMAP.md](ROADMAP.md) dosyasında.

## iPhone'a kurulum

1. Uygulamanın GitHub Pages adresini **Safari**'de aç.
2. **Paylaş → Ana Ekrana Ekle**'ye dokun.
3. Ana ekrandaki simgeden aç. Tam ekran açılır ve internetsiz de çalışır.

Güncellemeler, uygulama bir sonraki açılışında kendiliğinden gelir.

## Teknoloji

TypeScript · Vite · Three.js · vite-plugin-pwa · GitHub Actions → GitHub Pages

## Sürüm notları

Her sürüm, neyin neden değiştiğiyle birlikte İngilizce ve Türkçe olarak [CHANGELOG.md](CHANGELOG.md) dosyasında listelenir.

## Lisans

Kod [MIT Lisansı](LICENSE) ile yayınlanır. Üçüncü taraf kod ve içerikler kendi lisanslarını korur ve [CREDITS.md](CREDITS.md) dosyasında listelenir; kayıtlı sesler ve görseller yalnızca CC0 olacak.
