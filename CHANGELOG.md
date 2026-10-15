# Changelog / Sürüm notları

Every update is listed here with what changed and why. Newest first. Each entry is written in English and Turkish.

Her güncelleme, neyin neden değiştiğiyle birlikte burada listelenir. En yenisi en üstte. Her kayıt İngilizce ve Türkçe yazılmıştır.

---

## 0.8.0 (2026-10-16)

**EN.** From camp to fort. The base no longer just grows as a circle: it starts as a camp around a fire and is walled step by step, the way people in cold places actually built their settlements. Every change answers a need in the world; the research behind it is in [KUZEY-YERLESIMLERI.md](KUZEY-YERLESIMLERI.md).
- **A camp at the start.** At base level 1 there is no fence: knee-high blocks of snow keep the wind off the fire, and tents of hides stand to the east. Fire and the noise of the camp keep the bears away.
- **Walls that replace each other.** When the smell of stored meat draws bears in (base level 2), the snow blocks give way to a stockade of sharpened stakes; when bosses start breaking gates (base level 4), the stakes give way to a log wall with a roofed lookout over the gate. Each new wall rises from the ground while the old one sinks; nothing is stacked on top. Each makes the gate sturdier and keeps more of the blizzard off (none, 15%, 30%), but the blizzard is always felt.
- **A raised store.** The gate depot now stands on splayed legs with a ladder, like the tall caches of Alaska: bears smell the meat but cannot climb up to it.
- **Tents become cabins.** From base level 2 you can pay to give two families a log cabin; at base level 3 the winter is long enough that the other two build theirs. Every cabin keeps more people in the camp, and customers come 8% more often for each.
- **Winter stores.** Once the furnace cooks two at a time, a drying rack can be built: surplus meat dried over smoke keeps. At base level 4 an ice cellar is dug into the frozen ground. With food that keeps, customers order more at a time (up to 4 pieces with the rack, up to 5 with the cellar), and bigger orders now always earn a bigger bonus.
- **Base level 4 and watchtowers.** Needs 60 customers served and 2 mini bosses beaten. Two watchtowers stand on the corners of the gatehouse; their watchmen shoot at bears near the wall, a boss pounding the gate included, without making them angry.
- **Looks kept in one place.** Every model (buildings, walls, bears, people, effects) now comes from one folder, so the coming visual update can change how things look without touching the rules. [GORUNUM.md](GORUNUM.md) lists where each look, animation and sound lives.
- **A camp laid out by need (fix).** In 0.7 the grown Great Furnace hid the pad behind it, the hunters' lodge stood far from the front gate, and the upgrade pads in the south-west were crowded into each other. The camp is now laid out by what each part needs: the gate pads, the depot, the lodge and the ice cellar by the front gate, where meat and hunters come in; the furnace in the west, between the meat coming in and the counter; the shop by the customers' gate; the homes around the Great Furnace in the east. The wall is no longer a ring that just gets bigger: only the first camp's snow blocks are round. From base level 2 the wall is straight runs and corners put up around what the camp has become: a stockade around the camp and the depot (2), a yard pushed out west for the hunters' lodge (3), and a log fort with the ice cellar inside and a gatehouse jutting out at the front gate, a watchtower on each of its corners (4). Every two things have a walking path between them, and no pad stands behind a tall building. The Great Furnace grows a little less at base level 3.
- **Room to fill.** The free ground between the paths no longer stays bare: as the base grows, a sled, crates, a barrel, stacked logs, firewood and snow piles show up, each where it makes sense (logs for the stockade, firewood by the lodge). They change no rules; their place and look are kept apart so the visual update can fill the camp further.
- **Roof snow (fix).** The snow on cabin and lodge roofs lay on them like a flat white slab; it now follows the roof's slope and leaves the eaves bare.
- **Test panel.** New in this version: "Base 4: log wall", "Drying rack site" and "Whole camp built" (every building, cabin and decoration at once); the status tab shows the wall, cabins and winter stores.

**TR.** Kamptan kaleye. Üs artık sadece büyüyen bir daire değil: bir ateşin etrafındaki kamp olarak başlıyor ve adım adım surlanıyor, tıpkı soğuk yerlerde yaşayan insanların yerleşimlerini gerçekten kurduğu gibi. Her değişiklik dünyadaki bir ihtiyaca cevap veriyor; arkasındaki araştırma [KUZEY-YERLESIMLERI.md](KUZEY-YERLESIMLERI.md) belgesinde.
- **Başta bir kamp.** Üs 1'de çit yok: diz boyu kar blokları rüzgârı ateşten uzak tutuyor, doğuda deri çadırlar duruyor. Ayıları ateş ve kampın gürültüsü uzak tutuyor.
- **Birbirinin yerine geçen surlar.** Depolanan etin kokusu ayıları çekince (Üs 2) kar bloklarının yerini sivri kazıklardan bir çit alıyor; bosslar kapıları kırmaya başlayınca (Üs 4) kazıkların yerini kapının üstünde çatılı bir gözetleme odası olan kütük sur alıyor. Her yeni sur yerden yükselirken eskisi yere çöküyor; hiçbir şey üst üste eklenmiyor. Her biri kapıyı sağlamlaştırıyor ve Kar Fırtınası'nın etkisini biraz daha azaltıyor (hiç, %15, %30), ama fırtına hep hissediliyor.
- **Ayaklı ambar.** Kapı Deposu artık dışa doğru eğik ayakların ve bir merdivenin üstünde, tıpkı Alaska'nın ayaklı ambarları gibi: ayılar eti kokluyor ama tırmanamıyor.
- **Çadırlar kulübeye dönüşüyor.** Üs 2'den sonra iki aileye parayla kütük kulübe yaptırabiliyorsun; Üs 3'te kış o kadar uzun ki diğer ikisi kendi kulübelerini yapıyor. Her kulübe kampta daha çok insan tutuyor ve her biri için müşteriler %8 daha sık geliyor.
- **Kışlık erzak.** Ocak aynı anda iki parça pişirmeye başlayınca bir kurutma rafı kurulabiliyor: dumanda kurutulan fazla et bozulmuyor. Üs 4'te donmuş toprağa bir buz mahzeni kazılıyor. Bozulmayan yiyecekle müşteriler bir seferde daha çok alıyor (rafla 4 parçaya, mahzenle 5 parçaya kadar) ve büyük siparişler artık her zaman daha büyük bonus kazandırıyor.
- **Üs 4 ve gözetleme kuleleri.** 60 müşteri ve 2 mini boss gerekiyor. Kapı bölümünün köşelerinde iki gözetleme kulesi var; nöbetçiler sura yaklaşan ayılara, kapıyı döven boss da dahil, ok atıyor ve onları kızdırmıyor.
- **Görünüşler tek yerde.** Bütün modeller (binalar, surlar, ayılar, insanlar, efektler) artık tek bir klasörden geliyor; böylece yaklaşan görünüm güncellemesi kurallara dokunmadan görünüşü değiştirebilecek. [GORUNUM.md](GORUNUM.md) her görünüşün, animasyonun ve sesin nerede olduğunu listeliyor.
- **İhtiyaca göre yerleşen kamp (düzeltme).** 0.7'de büyüyen Büyük Ocak arkasındaki pedi kapatıyordu, avcı kulübesi ön kapıdan çok uzaktaydı ve güneybatıdaki yükseltme pedleri iç içe geçmişti. Kamp artık her parçanın ihtiyacına göre yerleşiyor: kapı pedleri, depo, avcı kulübesi ve buz mahzeni et ve avcıların girdiği ön kapının yanında; ocak batıda, gelen etle tezgâhın arasında; dükkân müşterilerin kapısında; evler doğuda, Büyük Ocak'ın etrafında. Sur artık sadece büyüyen bir halka değil: yalnızca ilk kampın kar blokları yuvarlak. Üs 2'den sonra sur, kampın o an olduğu şeyin etrafına çekilen düz duvarlar ve köşeler: kampı ve depoyu saran bir kazık çit (2), batıya avcı kulübesi için bir avlu çıkıntısı (3) ve buz mahzenini de içine alan, ön kapısında öne taşan bir kapı bölümü olan, bu bölümün köşelerinde birer gözetleme kulesi duran bir kütük kale (4). Her iki şeyin arasında bir yürüme yolu var ve hiçbir ped uzun bir binanın arkasında kalmıyor. Büyük Ocak Üs 3'te biraz daha az büyüyor.
- **Dolacak boşluklar.** Yolların arasındaki boş zemin artık çıplak kalmıyor: üs büyüdükçe bir kızak, sandıklar, bir fıçı, kütük yığını, odun ve kar yığınları beliriyor, her biri anlamlı bir yerde (çit için kütükler, kulübenin yanında odun). Hiçbir kuralı değiştirmiyorlar; yerleri ve görünüşleri ayrı tutuluyor, böylece görünüm güncellemesi kampı daha da doldurabilecek.
- **Çatı karı (düzeltme).** Kulübe ve avcı kulübesi çatılarındaki kar düz beyaz bir levha gibi duruyordu; artık çatının eğimini izliyor, saçaklar açıkta kalıyor.
- **Test paneli.** Bu sürümde yeni: "Üs 4: kütük sur", "Kurutma rafı alanı" ve "Kamp tamamen kurulu" (bütün binalar, kulübeler ve süsler bir anda); durum sekmesi suru, kulübeleri ve kışlık erzakı gösteriyor.

## 0.7.1 (2026-10-15)

**EN.** Boss balance, after playing 0.7.0: Yaşlı Ayı could not be beaten even fully upgraded. The aim now is that a player with the upgrades they usually have when a boss comes can beat it with skill, while standing still and letting the auto-attack do the work loses. Each change was checked with a test player that dodges the red areas with a human reaction delay, and with one that does nothing.
- **Yaşlı Ayı comes later, for a reason.** It is drawn in by the smell of stored meat, so it only arrives once the gate depot is built.
- **Everything a boss does is warned.** Dev Ayı no longer has an unmarked swipe that reached further than the player's arm; it only charges and stomps, both shown on the ground first. Its charge hits harder instead.
- **Softer numbers where it was unfair.** Yaşlı Ayı has less health, its sweep hurts less and, once angry, still gives time to react on a phone. The stomp needs a full second of hugging and comes less often. The young bears hit softer.
- **A charge stuns only after a run-up.** Dev Ayı bumping into the fence from a few steps away no longer stuns it; luring it from afar still does.
- **A boss in reach is struck first,** instead of a small bear standing next to it.
- **Nothing is hit across the fence.** Bears outside cannot be struck from inside the base, nor the other way round.
- **The base is a short breather, not a fortress.** During a fight it heals a little faster than in 0.7.0 and the siege starts after 6 seconds instead of 4; once a boss has broken in, the base no longer heals at all.
- Results with the test players: with average upgrades the skilled player beat Yaşlı Ayı in about 35 seconds and, with no upgrades at all, in about 55; Dev Ayı with one damage and one health upgrade in two runs out of three. The player who stood still lost every time.

**TR.** 0.7.0'ı oynadıktan sonra boss dengesi: Yaşlı Ayı bütün yükseltmeler alınmışken bile kesilemiyordu. Artık amaç şu: boss geldiğinde oyuncunun genelde sahip olduğu yükseltmelerle beceriyle kesilebilsin, ama hiç kıpırdamadan otomatik saldırıya bırakan kaybetsin. Her değişiklik iki test oyuncusuyla denendi: kırmızı alanlardan insan tepki süresiyle kaçan biri ve hiçbir şey yapmayan biri.
- **Yaşlı Ayı daha geç ve bir sebeple geliyor.** Depolanan etin kokusu onu çekiyor; bu yüzden ancak Kapı Deposu kurulduktan sonra geliyor.
- **Bossun her hamlesi uyarılı.** Dev Ayı'nın oyuncunun kolundan uzağa uzanan, uyarısız normal pençesi kaldırıldı; artık sadece hücum ediyor ve yere vuruyor, ikisi de önce yerde gösteriliyor. Buna karşılık hücumu daha sert.
- **Haksız yerlerde sayılar yumuşadı.** Yaşlı Ayı'nın canı azaldı, pençesi daha az acıtıyor ve öfkeliyken bile telefonda tepki verecek kadar zaman bırakıyor. Yere vurması için dibinde tam bir saniye kalmak gerekiyor ve daha seyrek geliyor. Genç ayılar daha hafif vuruyor.
- **Hücum ancak hız alınca sersemletiyor.** Dev Ayı birkaç adım ötedeki çite çarpınca artık sersemlemiyor; uzaktan kışkırtılan hücum hâlâ sersemletiyor.
- **Menzildeki boss önce vuruluyor;** yanındaki küçük bir ayı değil.
- **Çitin iki yanı birbirine vuramıyor.** Dışarıdaki ayılara üssün içinden, içeridekilere dışarıdan vurulamıyor.
- **Üs kısa bir nefes, kale değil.** Savaşta üs 0.7.0'dakinden biraz daha hızlı iyileştiriyor ve kuşatma 4 yerine 6 saniye sonra başlıyor; boss içeri daldıysa üs artık hiç iyileştirmiyor.
- Test oyuncularıyla sonuçlar: ortalama yükseltmelerle becerikli oyuncu Yaşlı Ayı'yı yaklaşık 35 saniyede, hiç yükseltme olmadan yaklaşık 55 saniyede kesti; Dev Ayı'yı bir hasar ve bir can yükseltmesiyle üç denemenin ikisinde kesti. Hiç kıpırdamayan oyuncu her seferinde kaybetti.

## 0.7.0 (2026-10-15)

**EN.** The base starts to run itself, and the bosses become real fights.
- **A boss's arrival.** While it is on its way a heartbeat sounds and dark red creeps in from the edges of the screen. Then cinema bars slide in and the boss runs out of the forest, shaking the ground with every stride while the bears scatter. It rears up on its hind legs, slams down and roars: a shockwave throws the bears back, the camera shakes and its name slams onto the screen.
- **No more hugging the boss.** Circling close behind a boss used to be a safe way to win. Now staying close for a moment makes it pound the ground: a red circle appears around it, and a moment later everyone inside is hurt and thrown back. Hit it, then step out.
- **Hiding in the base has a price.** During a boss fight healing in the base drops to a fifth, and the boss throws chunks of ice over the fence at you: a red circle shows where each one lands. Hide for more than a few seconds and it pounds the front gate, whose health shows over it. If the gate breaks the boss storms in: the customers run off without paying, no new ones come, and the furnace goes out.
- **Repairs are a minigame, and always free.** A broken gate stays broken until you fix it, so the next boss walks straight in. Stand in the circle inside the gate, or at a furnace that went out, and a panel opens: tap when the sliding marker is over the zone: its green middle is a perfect hit, its yellow edges a good one. Good timing repairs fast; a miss still repairs a little, so a repair always ends and nothing ever costs money to fix. After the first boss a gate pad makes the gate sturdier.
- **Hunters hide from bosses.** When a boss is on its way the hunters run to their lodge and stay in until the fight is over, then carry home what they had.
- **Yaşlı Ayı is fiercer.** Its sweep is wider (140°), reaches further, hits 40% harder and throws you back. At half health it rears up trembling, swells and glows a beating red, roars in slow motion and calls three young bears out of the forest. From then on it hits 35% harder and sweeps twice as fast.
- **Building sites.** A base level no longer just hands things over: it opens a place to build. Stakes and a rope mark the plot, and a pad in front shows the building and its price. Paying raises a scaffold with hammering and dust, and then the building pops up.
- **Base level 2: the gate depot and the carrier.** A shed by the front gate collects raw meat. Once the carrier is hired it takes the meat from the depot to the furnace, and you can drop your own raw meat in the circle beside the depot as you walk in.
- **Base level 3: the hunters' lodge, a waiter and a cashier.** The Great Furnace rises a storey, the trees in the west are felled one by one, and the hunters' lodge goes up where they stood. A hunter walks out through the gate, hunts, carries the meat home to the depot and goes out again; bears fight back, and a hunter that is knocked down rests at the lodge. Hunters' kills count toward the hunt level. The waiter carries cooked meat from the furnace shelf to the counter, and the cashier serves customers while you are away.
- **Every worker has its own upgrade pads**: depot size, carrier load, waiter load, cashier speed, hunter damage and hunter load. A hiring pad comes first; once the worker is hired, its upgrades take the spot.
- **Bottlenecks you can see.** When the depot is full a red "DEPO DOLU" sign pulses over it, and a worker that has nowhere to put its load waits with a "…" bubble over its head. You can see which station to grow next.
- **Test panel.** New in this version: jumps to the depot site and the lodge site, "20 raw meat in the depot", "Hire every worker", "Break the gate" and "Put the fire out"; the status tab shows the gate, the depot and the workers.

**TR.** Üs kendi kendine işlemeye başlıyor ve bosslar gerçek savaşlara dönüşüyor.
- **Bossun gelişi.** Boss yoldayken kalp atışı duyuluyor ve ekranın kenarlarından koyu kırmızı sızıyor. Sonra sinema şeritleri iniyor ve boss ormandan koşarak geliyor; her adımında yer sarsılıyor, ayılar kaçışıyor. Arka ayakları üstüne kalkıyor, yere çakılıp kükrüyor: şok dalgası ayıları geri savuruyor, kamera sarsılıyor ve adı ekrana çarpıyor.
- **Bossun dibine sığınmak bitti.** Bossun arkasında dönerek onu kesmek güvenli bir yoldu. Artık dibinde bir an fazla kalınca yere vuruyor: etrafında kırmızı bir daire beliriyor ve kısa süre sonra içindeki herkes hasar alıp geri fırlıyor. Vur, sonra uzaklaş.
- **Üste saklanmanın bedeli var.** Boss savaşında üsteki iyileşme beşte bire iniyor ve boss çitin üstünden buz parçaları fırlatıyor; her birinin düşeceği yerde kırmızı bir daire beliriyor. Birkaç saniyeden fazla saklanırsan boss ön kapıya yükleniyor, kapının canı üstünde görünüyor. Kapı kırılırsa boss üsse dalıyor: müşteriler ödemeden kaçıyor, yenileri gelmiyor ve ocağın ateşi sönüyor.
- **Tamir bir mini oyun ve hep bedava.** Kırık kapı sen onarana kadar kırık kalıyor, sonraki boss doğrudan içeri yürüyor. Kapının içindeki daireye ya da ateşi sönen ocağa gidince bir panel açılıyor: kayan işaret hedef bölgenin üstündeyken dokun: ortadaki yeşil tam isabet, sarı kenarlar iyi sayılıyor. İyi zamanlama hızlı onarıyor, ıska bile biraz onarıyor; böylece tamir her zaman bitiyor ve hiçbir onarım para istemiyor. İlk bosstan sonra kapının yanında onu sağlamlaştıran bir ped çıkıyor.
- **Avcılar bosslardan saklanıyor.** Boss yoldayken avcılar kulübelerine koşuyor, savaş bitene kadar içeride kalıyor, sonra taşıdıklarını depoya götürüyor.
- **Yaşlı Ayı daha sert.** Pençesi daha geniş (140°), daha uzağa yetişiyor, %40 daha sert vuruyor ve geri fırlatıyor. Canı yarıya inince titreyerek şahlanıyor, şişiyor, kırmızı nabız gibi yanıp sönüyor, ağır çekimde kükrüyor ve ormandan üç genç ayı çağırıyor. Bundan sonra %35 daha sert vuruyor ve iki kat hızlı savuruyor.
- **İnşa alanları.** Üs seviyesi artık bir şeyi doğrudan vermiyor, inşa edilecek bir yer açıyor. Kazıklar ve ip alanı çiziyor, önündeki ped binanın adını ve fiyatını gösteriyor. Ödeme yapınca iskele yükseliyor, çekiç sesleri ve toz çıkıyor, sonra bina ortaya çıkıyor.
- **Üs 2: Kapı Deposu ve Taşıyıcı.** Ön kapının yanındaki baraka çiğ eti topluyor. Taşıyıcı işe alınınca eti depodan ocağa taşıyor; içeri girerken kendi çiğ etini de deponun yanındaki daireye bırakabiliyorsun.
- **Üs 3: Avcı Kulübesi, Garson ve Kasiyer.** Büyük Ocak bir kat yükseliyor, batıdaki ağaçlar sırayla devriliyor ve yerlerine Avcı Kulübesi kuruluyor. Avcı kapıdan çıkıp avlanıyor, eti depoya getiriyor ve yeniden çıkıyor; ayılar ona da saldırıyor, bayılan avcı kulübede dinleniyor. Avcıların kestiği ayılar av seviyesine sayılıyor. Garson pişmiş eti raftan tezgâha taşıyor, Kasiyer sen yokken müşterilere servis yapıyor.
- **Her işçinin kendi yükseltme pedleri var:** depo kapasitesi, Taşıyıcı yükü, Garson yükü, Kasiyer hızı, avcı hasarı ve avcı yükü. Önce işe alım pedi geliyor; işçi alınınca yerine onun yükseltmeleri geçiyor.
- **Görünen darboğazlar.** Depo dolunca üstünde kırmızı bir "DEPO DOLU" tabelası nabız gibi atıyor; yükünü bırakacak yer bulamayan işçinin başında "…" balonu çıkıyor. Hangi istasyonu büyütmen gerektiğini görüyorsun.
- **Test paneli.** Bu sürümde yeni: Kapı Deposu ve Avcı Kulübesi alanlarına atlama, "Depoya 20 çiğ et", "Bütün işçileri al", "Kapıyı kır" ve "Ateşi söndür"; durum sekmesi kapıyı, depoyu ve işçileri gösteriyor.

## 0.6.1 (2026-10-15)

**EN.** Bosses that are remembered, not just bigger bears. Every boss is now a stage of its own: you see it arrive, you learn its moves, and the fight leaves a mark.
- **Arrival.** When a boss appears the world stops for a moment, the camera glides over to it and back, and its name and title cross the screen: "DEV AYI · Hücumcu", "YAŞLI AYI · Sürünün Lideri".
- **Moves you can see coming.** Before a special move a red area appears on the ground and fills up while the boss winds up; when it is full, the move lands. Stepping out in time means it misses. Fights are about reading the boss, not only about damage.
- **Dev Ayı charges.** Every few seconds it lowers its head, a red lane appears and it runs down it, even from close by. If it runs into the fence or the edge of the field it is stunned for two seconds and takes 50% more damage, so luring it into the fence is a tactic.
- **Yaşlı Ayı sweeps and gets angry.** Its only attack is a wide 120° sweep in front of it. At half health it roars, turns red and calls two young bears to its side, and sweeps faster from then on. One hit at a time is no longer enough, which is exactly what its reward, Triple Strike, answers.
- **Marks that stay.** Yaşlı Ayı's pelt lies beside the Great Furnace for good once it is beaten. A boss that gets away leaves claw marks where it will come back; they go when it returns.
- **The plan behind it.** The design now has five rules for bosses, and the main bosses use against you the power they give: Buzul Ayısı will fight with the two ice abilities it then offers, Ayı Kralı with its royal ones. Economy abilities (Magnet, Plenty, Feast, Ember Furnace) will come from base levels instead of bosses. Both arrive in 0.8.0.
- **Test panel.** New in this version: "Halve its health" (to see Yaşlı Ayı get angry) and "Pelt keepsake". Only this version's additions are marked NEW now.

**TR.** Sadece büyük ayı değil, hatırlanan bosslar. Her boss artık kendi başına bir aşama: geldiğini görüyorsun, hamlelerini öğreniyorsun ve savaş arkasında bir iz bırakıyor.
- **Giriş anı.** Boss belirince dünya bir an duruyor, kamera bossa kayıp geri dönüyor ve ekranda adı ile unvanı çıkıyor: "DEV AYI · Hücumcu", "YAŞLI AYI · Sürünün Lideri".
- **Gelişi görülen hamleler.** Özel bir hamleden önce yerde kırmızı bir alan beliriyor ve boss hazırlanırken doluyor; dolunca hamle iniyor. Vaktinde dışarı adım atan kurtuluyor. Savaş artık sadece hasar yarışı değil, bossu okumak.
- **Dev Ayı hücum ediyor.** Birkaç saniyede bir başını eğiyor, kırmızı bir şerit beliriyor ve o şerit boyunca koşuyor, yakındayken bile. Çite ya da sahanın kenarına çarparsa iki saniye sersemliyor ve %50 fazla hasar alıyor; onu çite çarptırmak bir taktik.
- **Yaşlı Ayı pençe savuruyor ve öfkeleniyor.** Tek saldırısı önündeki 120°'lik geniş pençe. Canı yarıya inince kükrüyor, kırmızılaşıyor, yanına iki genç ayı çağırıyor ve bundan sonra daha hızlı savuruyor. Tek tek vurmak artık yetmiyor; ödülü Üçlü Vuruş da tam bunun cevabı.
- **Kalıcı izler.** Yaşlı Ayı yenilince postu Büyük Ocak'ın yanına kalıcı olarak seriliyor. Kaçan boss geri döneceği yerde pençe izleri bırakıyor; geri gelince izler kayboluyor.
- **Arkasındaki plan.** Tasarıma bosslar için beş kural eklendi ve ana bosslar verecekleri gücü sana karşı kullanıyor: Buzul Ayısı sonra sunacağı iki buz yeteneğiyle, Ayı Kralı kendi kral yetenekleriyle savaşacak. Ekonomi yetenekleri (Mıknatıs, Bereket, Ziyafet, Kor Ocak) bosslardan değil üs seviyelerinden gelecek. İkisi de 0.8.0'da.
- **Test paneli.** Bu sürümde yeni: "Canını yarıya indir" (Yaşlı Ayı'nın öfkelenmesini görmek için) ve "Post hatırası". Artık sadece bu sürümün eklemeleri YENİ olarak işaretleniyor.

## 0.6.0 (2026-10-14)

**EN.** The hunt grows on its own, and bosses arrive.
- **Hunt level.** Every bear killed counts toward the hunt level, shown under the top bar as "Av 2" with a bar. Each level needs 5 more kills than the last (20, 25, 30…) and makes the herd bigger and tougher: +2 bears (up to 50), 12% more health, 8% more damage, and every second level one more piece of meat per bear. The upgrades always have something to beat.
- **Bosses.** A boss comes at hunt levels 2, 3, 4, 7 and 9. "Dev Ayı geliyor!" appears with a drum, and a red badge on the screen edge points to it. It waits just outside the front gate and charges when the player comes close or hits it, but never follows them into the base. A bar at the top shows its name, health and the time left.
- **Mini boss and cards.** Dev Ayı (the Giant Bear) is 1.6 times bigger and has 10 times a bear's health. When it falls the game pauses and two random cards come up; one tap picks one: wider reach, stronger hits, faster swings, a longer pickup reach, a broader back, lighter steps, thicker fur, tastier meat or a hotter fire. A card that has been taken often enough leaves the pool.
- **The first main boss and Triple Strike.** Yaşlı Ayı (the Old Bear) comes at hunt level 3. Beating it gives Triple Strike: the player hits three bears at once. It is the game's first big turning point, so the Wide sweep row left the character menu. After it, mini bosses can also offer "One more bear" (up to six at once). Beating it is also what base level 3 was waiting for.
- **Blizzard.** A boss must be beaten within 90 seconds. If time runs out, or the player is knocked out during the fight, the boss backs off and a blizzard falls on the base for 60 seconds: the screen turns white at the edges, customers lose patience twice as fast and the furnace cooks 30% slower. The same boss comes back two minutes later, and its reward is not lost. It hurts, but it never ends the game.
- **Urgent customers.** From base level 3, about one new customer in seven is urgent, with a thick red rim on the bubble. They pay two and a half times the price but have less patience, and when it runs out they leave without paying.
- **Test panel.** A small wrench in the bottom-left corner opens a test panel when held for a second. It jumps straight to the parts being tested (the first mini boss, the Old Bear, the edge of base level 3, urgent customers, the blizzard), adds cash, turns on invincibility, one-hit kills or triple speed, and shows the current numbers. Each update adds its new features to it. It is for testing on the phone and will be removed later.

**TR.** Av kendiliğinden büyüyor ve bosslar geliyor.
- **Av seviyesi.** Öldürülen her ayı av seviyesine sayılıyor; üst çubuğun altında "Av 2" ve bir çubukla görünüyor. Her seviye bir öncekinden 5 av fazla istiyor (20, 25, 30…) ve sürüyü büyütüp güçlendiriyor: +2 ayı (en fazla 50), %12 fazla can, %8 fazla hasar ve iki seviyede bir ayı başına bir parça fazla et. Yükseltmelerin her zaman yenecek bir rakibi oluyor.
- **Bosslar.** Av seviyesi 2, 3, 4, 7 ve 9'da bir boss geliyor. Davul sesiyle "Dev Ayı geliyor!" yazıyor ve ekran kenarındaki kırmızı bir işaret yerini gösteriyor. Boss ön kapının hemen dışında bekliyor; oyuncu yaklaşınca ya da ona vurunca saldırıyor, ama üsse girmiyor. Üstteki bir çubuk adını, canını ve kalan süreyi gösteriyor.
- **Mini boss ve kartlar.** Dev Ayı normal ayıdan 1,6 kat büyük ve 10 kat canlı. Düşünce oyun duruyor ve iki rastgele kart geliyor; bir dokunuşla biri seçiliyor: geniş vurma alanı, güçlü vuruş, hızlı saldırı, uzun toplama, geniş sırt, hafif adım, kalın post, lezzetli et ya da harlı ateş. Yeterince alınan kart havuzdan çıkıyor.
- **İlk ana boss ve Üçlü Vuruş.** Yaşlı Ayı av seviyesi 3'te geliyor. Onu yenmek Üçlü Vuruş'u veriyor: oyuncu aynı anda üç ayıya vuruyor. Bu oyunun ilk büyük dönüm noktası; bu yüzden Geniş savuruş satırı karakter menüsünden kalktı. Bundan sonra mini bosslar "Bir Ayı Daha" kartını da sunabiliyor (aynı anda en fazla altı). Üs 3'ün beklediği koşul da bu boss.
- **Kar Fırtınası.** Boss 90 saniye içinde yenilmeli. Süre biterse ya da oyuncu savaş sırasında bayılırsa boss geri çekiliyor ve üsse 60 saniyelik bir kar fırtınası çöküyor: ekranın kenarları beyazlaşıyor, müşterilerin sabrı iki kat hızlı bitiyor ve ocak %30 yavaş pişiriyor. Aynı boss iki dakika sonra geri geliyor ve ödülü kaybolmuyor. Can sıkıyor ama oyunu bitirmiyor.
- **Acil müşteriler.** Üs 3'ten sonra yeni gelen her yedi müşteriden yaklaşık biri acil; baloncuğunun kalın kırmızı bir çerçevesi var. Fiyatın iki buçuk katını ödüyor ama sabrı daha kısa; sabrı biterse ödemeden gidiyor.
- **Test paneli.** Sol alt köşedeki küçük anahtar simgesi bir saniye basılı tutulunca bir test paneli açıyor. Panel denenen bölümlere doğrudan atlıyor (ilk mini boss, Yaşlı Ayı, Üs 3 eşiği, acil müşteriler, kar fırtınası), para ekliyor, ölümsüzlük, tek vuruş ya da üç kat hızı açıyor ve güncel değerleri gösteriyor. Her güncelleme yeni özelliklerini buraya ekliyor. Telefonda test etmek için var ve ileride kaldırılacak.

## 0.5.1 (2026-10-13)

**EN.** The character button moved from the top of the screen to the bottom-right corner and grew to 60 px, where the thumb rests while holding the phone in one hand. The mute button stays at the top, since it is rarely used.

**TR.** Karakter düğmesi ekranın üstünden sağ alt köşeye taşındı ve 60 piksele büyüdü; telefon tek elle tutulurken başparmağın durduğu yer burası. Ses düğmesi seyrek kullanıldığı için üstte kaldı.

## 0.5.0 (2026-10-13)

**EN.** Where upgrades live, and a base that grows.
- **Character menu.** A button with a person icon at the top of the screen opens the character upgrades: carry capacity, damage, move speed, health and pickup radius. The game pauses while the menu is open. Wide sweep moved here too, as a locked row until its condition is met; in 0.7.0 it will come from the first boss instead.
- **Station upgrades stand next to their station.** Furnace slot, cooking speed and furnace shelf by the furnace; counter by the counter; meat price, queue length and customer rate by the till. At most two pads stand by a station; a pad that reaches its last level leaves, and the next one takes its spot. The base no longer fills up with pads.
- **Great Furnace and base level.** A tall furnace in the base shows the base level. Its pad raises the base: level 2 needs 25 customers served, level 3 needs two furnace slots and the first main boss (bosses arrive in 0.7.0, so level 3 waits until then). While a condition is missing the pad is grey and shows what is missing with an icon: 👥 customers, 🔥 furnace slots, 🐻 bosses.
- **The fence grows.** Each base level pushes the fence out (12 → 14 → 16) and unlocks new station upgrades. Bears move back to stay outside it.
- **Solid objects.** The player can no longer walk through the counter, the till, the furnace and its trays, or the Great Furnace.
- **Pads stop only after a purchase.** Cash flows as soon as you step on a pad. Right after a purchase it stops once for a second, so the money left over is not spent on the next level by accident; stepping off and on again carries on straight away.
- **Fixes from playing 0.4.1.** The angry face no longer covers how many pieces a customer wants: it takes the steak icon's place. The cooked meat shelf moved to the counter side of the furnace, the raw tray to the gate side. "No tip" now appears as a small second line under the amount paid instead of on top of it.

**TR.** Yükseltmelerin yeri ve büyüyen bir üs.
- **Karakter menüsü.** Ekranın üstündeki insan simgeli düğme karakter yükseltmelerini açıyor: taşıma kapasitesi, hasar, hareket hızı, can ve toplama yarıçapı. Menü açıkken oyun duruyor. Geniş savuruş da buraya taşındı ve koşulu sağlanana kadar kilitli bir satır olarak duruyor; 0.7.0'da bunun yerine ilk boss'tan gelecek.
- **İstasyon yükseltmeleri kendi istasyonlarının yanında.** Ocak yuvası, pişirme hızı ve ocak rafı ocağın yanında; tezgâh tezgâhın yanında; et fiyatı, sıra uzunluğu ve müşteri sıklığı kasanın yanında. Bir istasyonun yanında en fazla iki ped duruyor; son seviyesine ulaşan ped kayboluyor ve yerini sıradaki alıyor. Üs artık pedlerle dolmuyor.
- **Büyük Ocak ve üs seviyesi.** Üsteki büyük ocak, üs seviyesini gösteriyor. Pedi üssü büyütüyor: Üs 2 için 25 müşteri, Üs 3 için iki ocak yuvası ve ilk ana boss gerekiyor (bosslar 0.7.0'da gelecek, Üs 3 o zamana kadar bekliyor). Bir koşul eksikken ped gri oluyor ve eksik olanı simgeyle gösteriyor: 👥 müşteri, 🔥 ocak yuvası, 🐻 boss.
- **Çit büyüyor.** Her üs seviyesi çiti dışarı açıyor (12 → 14 → 16) ve yeni istasyon yükseltmeleri getiriyor. Ayılar çitin dışında kalmak için geri çekiliyor.
- **Katı nesneler.** Karakter artık tezgâhın, kasanın, ocağın ve tepsilerinin ve Büyük Ocak'ın içinden geçemiyor.
- **Pedler sadece satın almadan sonra duruyor.** Pede basınca para hemen akıyor. Satın almadan hemen sonra bir kez bir saniye duruyor; böylece kalan para yanlışlıkla bir sonraki seviyeye gitmiyor. Pedden çıkıp tekrar basınca beklemeden devam ediyor.
- **0.4.1'i oynadıktan sonraki düzeltmeler.** Kızgın yüz artık müşterinin kaç parça istediğini kapatmıyor: et simgesinin yerine geçiyor. Pişmiş et rafı ocağın tezgâh tarafına, çiğ et tepsisi kapı tarafına taşındı. "Bahşiş yok" artık ödenen tutarın üstüne değil, altına küçük ikinci bir satır olarak çıkıyor.

## 0.4.1 (2026-10-13)

**EN.** Changes from playing 0.4.0 on iPhone.
- **Cooked meat is carried by hand.** The furnace no longer sends cooked meat to the counter by itself. It waits on a shelf next to the furnace. One dashed circle by the furnace now does both jobs: standing in it pours the raw meat in and picks the cooked meat up. The stack can hold raw and cooked meat together; at the counter only the cooked pieces go down. A waiter and a conveyor will take over this job in 0.5.0.
- **Sound.** Short effects for every action: hits, a bear going down, meat popping out, a pickup whose pitch climbs as the stack grows, the furnace ding, the door bell, the till, tips, an angry huff, coins and pads. They are generated in code with ZzFX (MIT), so there are no sound files. A mute button sits at the top of the screen and remembers its setting.
- **Paying customers show what they paid.** "+$25" floats up over the customer's head; a customer whose patience ran out also shows "no tip".
- **An angry customer no longer shivers.** The bubble turns red, an angry face replaces the patience bar, the customer turns half away from the counter and huffs once.
- **Pads wait before taking cash.** Cash starts to flow after 0.7 s on a pad, and the wait starts over after every purchase, so walking across a pad or finishing a level never spends money by accident. A thin line on the pad fills during the wait.
- **Busier shop.** Up to 6 customers queue at once (was 3) and a new one arrives every 2 s (was 3.5 s).
- **Credits.** [CREDITS.md](CREDITS.md) lists the libraries the app includes and their licenses.

**TR.** 0.4.0'ı iPhone'da oynadıktan sonraki değişiklikler.
- **Pişmiş et elle taşınıyor.** Ocak pişmiş eti artık tezgâha kendisi göndermiyor; et ocağın yanındaki rafta bekliyor. Ocağın yanındaki tek kesik çizgili daire artık iki işi birden yapıyor: içinde durunca çiğ et ocağa dökülüyor ve pişmiş et alınıyor. Yığında çiğ ve pişmiş et birlikte durabiliyor; tezgâhta sadece pişmiş parçalar bırakılıyor. Bu işi 0.5.0'da bir garson ve bir konveyör devralacak.
- **Ses.** Her eylem için kısa efektler: vuruşlar, düşen ayı, fırlayan et, yığın büyüdükçe perdesi yükselen toplama sesi, ocak zili, kapı zili, yazar kasa, bahşiş, kızgın homurtu, paralar ve pedler. Hepsi ZzFX (MIT) ile kodla üretiliyor, ses dosyası yok. Ekranın üstünde bir sessiz düğmesi var ve ayarı hatırlıyor.
- **Ödeyen müşteri ne kadar ödediğini gösteriyor.** Müşterinin kafasının üstünde "+$25" yükselip kayboluyor; sabrı biten müşteride ayrıca "bahşiş yok" yazıyor.
- **Kızgın müşteri artık titremiyor.** Baloncuk kırmızıya dönüyor, sabır barının yerine kızgın bir yüz çıkıyor, müşteri tezgâha yarı arkasını dönüyor ve bir kez homurdanıyor.
- **Pedler para almadan önce bekliyor.** Para bir pedde 0,7 saniye durduktan sonra akmaya başlıyor ve her satın almadan sonra bekleme yeniden başlıyor. Böylece pedin üstünden geçmek ya da bir seviyeyi bitirmek yanlışlıkla para harcatmıyor. Bekleme sırasında pedin üstünde ince bir çizgi doluyor.
- **Daha kalabalık dükkân.** Aynı anda 6 müşteri sıraya girebiliyor (önceden 3) ve 2 saniyede bir yeni müşteri geliyor (önceden 3,5).
- **Kaynakça.** [CREDITS.md](CREDITS.md) uygulamaya dahil edilen kütüphaneleri ve lisanslarını listeliyor.

## 0.4.0 (2026-10-13)

**EN.** Meat no longer turns straight into cash: it is cooked and sold to customers, like in the ads. This is the "by hand" stage of the production chain; workers and machines that automate it come in 0.5.0.
- **Furnace.** Walk into the dashed circle next to the furnace and the whole stack pours onto its tray in about a second; no more waiting piece by piece. The furnace cooks one piece at a time (more with upgrades), shows a progress bar for each slot and glows while it works. If the counter is full, cooked pieces wait inside.
- **Counter and customers.** Cooked meat goes to the counter. Cold survivors come in through a new back gate and queue up. A bubble above each one shows how many pieces they want (1 to 3, equally likely) and a patience bar. Stand in the circle in front of the counter to hand them their order; a served customer pays and walks away, and the queue moves up.
- **Bigger and faster orders pay more.** On top of the order price, a customer adds a bonus for a bigger order (12.5% for 1 piece, 25% for 2, 50% for 3) and a tip for fast service (up to 100% of the order, in 10% steps as patience runs down). A customer whose patience ran out pays the order only and starts to shiver.
- **Till.** Payments pile up as green bundles on the till next to the counter; walk past it to collect.
- **New upgrade pads** appear as the shop grows: Furnace slot (after 3 customers), Counter (after 6), Meat price (after 10), alongside Capacity and Wide sweep.
- **Under the hood.** Every changeable value now goes through one stats system, and every upgrade pad is a single entry in a list. Boss cards and perks planned for later versions will change values the same way.

**TR.** Et artık doğrudan paraya dönüşmüyor: reklamlardaki gibi pişirilip müşterilere satılıyor. Bu, üretim zincirinin "elle" aşaması; onu otomatikleştiren işçiler ve makineler 0.5.0'da gelecek.
- **Ocak.** Ocağın yanındaki kesik çizgili daireye girince bütün yığın yaklaşık bir saniyede tepsiye dökülüyor; artık parça parça beklemek yok. Ocak aynı anda bir parça pişiriyor (yükseltmeyle daha fazla), her yuva için bir ilerleme barı gösteriyor ve çalışırken parlıyor. Tezgâh doluysa pişen parçalar içeride bekliyor.
- **Tezgâh ve müşteriler.** Pişmiş et tezgâha geçiyor. Üşüyen hayatta kalanlar yeni arka kapıdan girip sıraya diziliyor. Her birinin üstündeki baloncuk kaç parça istediğini (1 ile 3 arası, eşit olasılıkla) ve sabır barını gösteriyor. Siparişlerini vermek için tezgâhın önündeki dairede dur; servis edilen müşteri ödüyor ve ayrılıyor, sıra ilerliyor.
- **Büyük ve hızlı siparişler daha çok kazandırıyor.** Müşteri sipariş tutarının üstüne büyük sipariş için bir bonus (1 parçada %12,5, 2 parçada %25, 3 parçada %50) ve hızlı servis için bir bahşiş (siparişin %100'üne kadar, sabır azaldıkça %10'luk basamaklarla) ekliyor. Sabrı biten müşteri sadece sipariş tutarını ödüyor ve titremeye başlıyor.
- **Kasa.** Ödemeler tezgâhın yanındaki kasada yeşil desteler halinde birikiyor; yanından geçince toplanıyor.
- **Yeni yükseltme pedleri** dükkân büyüdükçe beliriyor: Ocak yuvası (3 müşteriden sonra), Tezgâh (6'dan sonra), Et fiyatı (10'dan sonra); Kapasite ve Geniş savuruş'un yanında.
- **Altyapı.** Değişebilen bütün değerler artık tek bir istatistik sisteminden geçiyor ve her yükseltme pedi bir listedeki tek bir kayıt. Sonraki sürümlerde gelecek boss kartları ve yetenekler değerleri aynı yoldan değiştirecek.

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
