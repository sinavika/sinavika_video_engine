/**
 * The processes the lessons show happening (VisualSchema: process), stage by stage, grouped by subject. Each stage
 * has an id (also a part beats can point at), a title for the stage strip and a note written under the scene. Labels
 * are the other named parts of a process. Pure data, so the schema can check a script's stage and part names.
 *
 * Owner, 29 Oct 2026: "heyelan anlatılıyorsa görüntüde toprak gerçekten kaysın"; rocks and waters told the same way.
 */
type StageInfo = {readonly id: string; readonly title: string; readonly note: string};
type ProcessInfo = {readonly stages: readonly StageInfo[]; readonly labels: readonly string[]};

export const PROCESS_CATALOG = {
	landslide: {
		stages: [
			{id: 'egim', title: 'Dik yamaç', note: 'Eğim arttıkça yamaçtaki toprak ve kayaç dengesizleşir.'},
			{id: 'tabaka', title: 'Tabakalar', note: 'Tabakalar yamaca paralel: üstteki tabaka bir kaydırağın üstünde durur.'},
			{id: 'su', title: 'Yağış ve kar suyu', note: 'Sağanak ve kar erimesi toprağı suya doyurur; toprak ağırlaşır.'},
			{id: 'kayma', title: 'Kayma yüzeyi', note: 'Suyu geçirmeyen kil ıslanıp kayganlaşır: kayma yüzeyi.'},
			{id: 'kutle', title: 'Kopma ve kayma', note: 'Kütle kopar; ağaçları, yolu ve evleri de alıp yamaçtan kayar.'},
			{id: 'set', title: 'Set gölü', note: 'Kayan kütle vadiyi kapatır; arkasında heyelan set gölü birikir.'},
		],
		labels: ['catlak', 'yol'],
	},
	erosion: {
		stages: [
			{id: 'damla', title: 'Yağmur damlası', note: 'Çıplak toprağa çarpan damla, toprak tanelerini yerinden sıçratır.'},
			{id: 'akis', title: 'Yüzey akışı', note: 'Toprağa sızamayan su yamaçtan akar ve gevşeyen toprağı sürükler.'},
			{id: 'oluk', title: 'Oluk ve yarıntı', note: 'Akan su yamaçta oluklar açar; oluklar derinleşip yarıntıya döner.'},
			{id: 'tasinma', title: 'Taşınma', note: 'Önce verimli A horizonu gider; akarsu bulanır, baraj gölü dolar.'},
			{id: 'ortu', title: 'Bitki örtüsü', note: 'Kökler toprağı tutar, su toprağa sızar: ormanlık yamaçta toprak kalır.'},
			{id: 'onlem', title: 'Önlem', note: 'Taraçalar ve eğime dik sürülen tarla suyu yakalar, toprağı korur.'},
		],
		labels: ['ahorizon', 'kok', 'taraca'],
	},
	karst: {
		stages: [
			{id: 'lapya', title: 'Lapya', note: 'Karbondioksitli yağmur suyu kalkeri eritir, yüzeyde oluklar açar.'},
			{id: 'dolin', title: 'Dolin ve uvala', note: 'Çatlaklarda erime çukur açar: dolin. Dolinler birleşir: uvala.'},
			{id: 'polye', title: 'Polye', note: 'En büyük karstik çukur polyedir: tabanı düz ve alüvyonla örtülü.'},
			{id: 'obruk', title: 'Düden ve obruk', note: 'Su düdenden yer altına iner; boşluğun tavanı çökünce obruk açılır.'},
			{id: 'magara', title: 'Mağara', note: 'Damlayan su kireci çökeltir: sarkıt iner, dikit yükselir, birleşip sütun olur.'},
			{id: 'traverten', title: 'Traverten', note: 'Kalkerli su yüzeye çıkınca kireç çöker: basamak basamak traverten.'},
		],
		labels: ['uvala', 'duden', 'sarkit', 'dikit', 'sutun', 'kaynak'],
	},
	spring: {
		stages: [
			{id: 'sizma', title: 'Sızma', note: 'Yağış geçirimli tabakadan sızar, geçirimsiz tabakanın üstünde birikir.'},
			{id: 'yamac', title: 'Yamaç kaynağı', note: 'Geçirimsiz tabakanın yamaçta yüzeye çıktığı yerden su kaynar.'},
			{id: 'karstik', title: 'Karstik kaynak', note: 'Kalkerdeki kanallardan gelen su eteklerde gür bir kaynak olarak çıkar.'},
			{id: 'artezyen', title: 'Artezyen', note: 'İki geçirimsiz tabaka arasındaki basınçlı su, kuyudan kendiliğinden fışkırır.'},
			{id: 'fay', title: 'Fay kaynağı', note: 'Derinde ısınan su fay boyunca yükselir: sıcak su ve jeotermal enerji.'},
		],
		labels: ['gecirimli', 'gecirimsiz', 'tabansuyu', 'kuyu', 'kaplica'],
	},
	rockcycle: {
		stages: [
			{id: 'magma', title: 'Magma', note: 'Yerin derinliklerindeki erimiş kayaç: magma.'},
			{id: 'magmatik', title: 'Magmatik kayaç', note: 'Derinde yavaş soğuyan magma iri, yüzeyde hızlı soğuyan lav ince kristallidir.'},
			{id: 'tortul', title: 'Tortul kayaç', note: 'Aşınan parçalar taşınır, denizde birikir, sıkışıp tortul kayaca döner.'},
			{id: 'baskalasim', title: 'Başkalaşım', note: 'Isı ve basınç kayacı başkalaştırır; daha da ısınan kayaç erir, magmaya döner.'},
		],
		labels: ['granit', 'bazalt', 'asinma', 'birikme', 'mermer'],
	},
	volcano: {
		stages: [
			{id: 'batolit', title: 'Batolit', note: 'Derinde yavaş soğuyan magma: iri kristalli, geniş kubbe biçimli batolit.'},
			{id: 'lakolit', title: 'Lakolit, sill, dayk', note: 'Magma tabakaları kabartır, aralarına yayılır ya da onları keserek yükselir.'},
			{id: 'koni', title: 'Koni ve krater', note: 'Yüzeye ulaşan magma püskürür; kül ve lav katmanları koniyi büyütür.'},
			{id: 'lav', title: 'Lav', note: 'Havayla temas eden lav hızla soğur: ince kristalli ya da camsı kayaç.'},
			{id: 'kaldera', title: 'Kaldera', note: 'Magma odası boşalınca tepe çöker; geniş çukur zamanla göl olur (Nemrut).'},
			{id: 'maar', title: 'Maar', note: 'Gaz patlamasıyla açılan çukur suyla dolar: maar gölü (Meke).'},
		],
		labels: ['sill', 'dayk', 'krater', 'magma'],
	},
	glacier: {
		stages: [
			{id: 'karsiniri', title: 'Kalıcı kar sınırı', note: 'Yıl boyu erimeyen kar sıkışıp buza döner: buzul, kalıcı kar sınırının üstünde doğar.'},
			{id: 'sirk', title: 'Sirk', note: 'Buz, dağın tepesinde koltuk biçimli bir çukur oyar: sirk.'},
			{id: 'buzulvadisi', title: 'U biçimli vadi', note: 'Buzul vadiyi törpüler: V biçimli vadi U biçimine döner, hörgüç kayalar kalır.'},
			{id: 'moren', title: 'Moren ve sirk gölü', note: 'Eriyen buzul taşıdığı karışık malzemeyi bırakır: moren. Sirkte göl kalır.'},
		],
		labels: ['horguc', 'buz'],
	},
	coast: {
		stages: [
			{id: 'falez', title: 'Falez', note: 'Dalgalar dik kıyının dibini oyar, üstü çöker: falez geriler.'},
			{id: 'asinim', title: 'Aşınım düzlüğü', note: 'Falez geriledikçe önünde dalgaların düzlediği bir taban kalır.'},
			{id: 'kiyioku', title: 'Kıyı oku', note: 'Akıntı kumu kıyı boyunca taşır ve denize uzanan dil biçimli kıyı okunu yapar.'},
			{id: 'lagun', title: 'Lagün', note: 'Kıyı oku koyun ağzını kapatınca arkada kıyı gölü kalır: lagün.'},
			{id: 'tombolo', title: 'Tombolo', note: 'Kum seti adayı karaya bağlar: tombolo. İnce kum da kumsalları yapar.'},
		],
		labels: ['kumsal'],
	},
	desert: {
		stages: [
			{id: 'ruzgar', title: 'Rüzgâr ve kum', note: 'Rüzgâr kumu yere yakın taşır ve kayaları zımparalar.'},
			{id: 'mantar', title: 'Mantar kaya', note: 'Kayanın alt kısmı daha çok aşınır: mantar kaya.'},
			{id: 'sahit', title: 'Şahit kaya, tafoni', note: 'Yumuşak tabakalar aşınır, sert tabakanın koruduğu şahit kaya kalır.'},
			{id: 'barkan', title: 'Barkan', note: 'Rüzgâr kumu biriktirir: hilal biçimli barkan, rüzgâr yönünde yürür.'},
		],
		labels: ['tafoni', 'los'],
	},
	weathering: {
		stages: [
			{id: 'don', title: 'Don olayı', note: 'Çatlağa dolan su donunca genişler ve kayayı yarar.'},
			{id: 'sicaklik', title: 'Sıcaklık farkı', note: 'Gündüz ısınıp gece soğuyan kaya genleşip büzülür, kabuk kabuk dökülür.'},
			{id: 'kimyasal', title: 'Kimyasal çözülme', note: 'Sıcak ve nemli yerde su kayacın bileşimini değiştirir, kaya ufalanır.'},
			{id: 'kaya', title: 'Kaya düşmesi', note: 'Gevşeyen bloklar dik yamaçtan düşer, eteğinde köşeli moloz birikir.'},
			{id: 'camur', title: 'Çamur akıntısı', note: 'Suya doyan ince malzeme vadiden aşağı çamur olarak akar.'},
		],
		labels: ['catlak', 'moloz'],
	},
	greenhouse: {
		stages: [
			{id: 'gunes', title: 'Güneş ışığı', note: 'Güneş’ten gelen kısa dalga ışınlar atmosferi büyük ölçüde geçip yeryüzünü ısıtır.'},
			{id: 'yansima', title: 'Yansıma', note: 'Bulutlar, buzullar ve karlar ışığın bir kısmını uzaya geri yansıtır: albedo.'},
			{id: 'yayma', title: 'Isı yayımı', note: 'Isınan yeryüzü enerjiyi uzun dalga boylu ısı olarak geri yayar.'},
			{id: 'tutma', title: 'Sera etkisi', note: 'Su buharı, CO₂ ve metan ısıyı tutar; sera etkisi olmasa Dünya −18 °C olurdu.'},
			{id: 'artis', title: 'Küresel ısınma', note: 'Fosil yakıtlarla sera gazları artınca daha çok ısı tutulur: Dünya ısınır.'},
		],
		labels: ['albedo', 'gazlar', 'termometre', 'buzul'],
	},
	ocean: {
		stages: [
			{id: 'isik', title: 'Işıklı kuşak', note: 'Işık yaklaşık 200 metreye iner: fitoplanktonlar burada fotosentez yapar.'},
			{id: 'besin', title: 'Kıyıdan besin', note: 'Akarsular karadan azot ve fosfor getirir: kıta sahanlığı canlı dolu.'},
			{id: 'derinlik', title: 'Derinlere doğru', note: 'Derine indikçe ışık azalır, su soğur; basınç her 10 metrede 1 atm artar.'},
			{id: 'dip', title: 'Karanlık dip', note: 'Dipte ışık yok, besin yukarıdan düşer: canlı sayısı çok azdır.'},
		],
		labels: ['plankton', 'sahanlik', 'basinc'],
	},
	watercycle: {
		stages: [
			{id: 'buharlasma', title: 'Buharlaşma', note: 'Güneş ısıtır: denizden ve göllerden su buharlaşır, bitkiler terler.'},
			{id: 'yogusma', title: 'Yoğuşma', note: 'Yükselen buhar soğur ve yoğuşur: bulut olur; rüzgâr onu karaya taşır.'},
			{id: 'yagis', title: 'Yağış', note: 'Yamaç boyunca yükselen hava soğur: yamaca yağmur, zirveye kar yağar.'},
			{id: 'yuzeyakis', title: 'Yüzey akışı', note: 'Yağışın bir kısmı yüzeyden akar; akarsular suyu denize geri taşır.'},
			{id: 'yeralti', title: 'Yer altı suyu', note: 'Bir kısmı toprağa sızar, yer altı suyunu besler; o da denize ulaşır.'},
		],
		labels: ['terleme', 'ruzgar', 'kar'],
	},
	cyclone: {
		stages: [
			{id: 'olusum', title: 'Sıcak deniz', note: 'Su 26 °C’yi geçince buharlaşma artar; nemli hava yükselir, alçak basınç doğar.'},
			{id: 'buyume', title: 'Dönen fırtına', note: 'Coriolis etkisiyle döner: kuzey yarım kürede saat yönünün tersine; ortada göz.'},
			{id: 'kiyi', title: 'Kıyıya çarpma', note: 'Kıyıda şiddetli rüzgâr, sağanak ve deniz kabarması: kıyı selleri yaşanır.'},
			{id: 'zayiflama', title: 'Karada zayıflama', note: 'Karada nem kaynağı kesilir, sürtünme artar: fırtına zayıflar ve dağılır.'},
		],
		labels: ['ekvator', 'goz', 'kabarma'],
	},
	flood: {
		stages: [
			{id: 'saganak', title: 'Sağanak', note: 'Kısa sürede çok yağış düşer; çıplak ve eğimli yamaç suyu tutamaz.'},
			{id: 'sel', title: 'Sel', note: 'Yamaçlardan inen sular derede birleşir, su dakikalar içinde yükselir.'},
			{id: 'taskin', title: 'Taşkın', note: 'Dere yatağından taşar; yatağa yapılan evler su altında kalır.'},
		],
		labels: ['yatak'],
	},
	avalanche: {
		stages: [
			{id: 'birikme', title: 'Kar birikir', note: 'Dik yamaçta kat kat kar birikir; katlar arasında zayıf bir tabaka kalır.'},
			{id: 'kopma', title: 'Kopma', note: 'Yeni kar, ısınma ya da bir sarsıntıyla üstteki kar levhası kopar.'},
			{id: 'cig', title: 'Çığ', note: 'Kar kütlesi hızlanarak yamaçtan iner; ağaçları, yolları ve evleri siler.'},
		],
		labels: ['zayif'],
	},
	// ---------------------------------------------------------------- physics
	phasechange: {
		stages: [
			{id: 'kati', title: 'Katı ısınır', note: 'Buz ısınır: tanecikler yerinde daha hızlı titreşir, sıcaklık yükselir.'},
			{id: 'erime', title: 'Erime', note: 'Erirken sıcaklık 0 °C’de sabit kalır: alınan ısı tanecikleri birbirinden ayırır.'},
			{id: 'sivi', title: 'Sıvı ısınır', note: 'Su ısınır: tanecikler birbirinin üzerinden kayarak daha hızlı hareket eder.'},
			{id: 'kaynama', title: 'Kaynama', note: 'Kaynarken sıcaklık 100 °C’de sabit kalır: tanecikler gaz olarak kopar.'},
			{id: 'gaz', title: 'Gaz ısınır', note: 'Buhar ısınır: tanecikler serbest ve çok hızlı hareket eder.'},
		],
		labels: ['sicaklik', 'tanecik'],
	},
	heattransfer: {
		stages: [
			{id: 'iletim', title: 'İletim', note: 'Isı, katıda tanecikten taneciğe çarpışmalarla iletilir.'},
			{id: 'konveksiyon', title: 'Konveksiyon', note: 'Isınan akışkan yükselir, soğuyan çöker: madde akarak ısı taşır.'},
			{id: 'isima', title: 'Işıma', note: 'Isı ışıma ile maddeye gerek duymadan, boşlukta bile yayılır.'},
			{id: 'denge', title: 'Isıl denge', note: 'Isı sıcaktan soğuğa akar; sıcaklıklar eşitlenince akış durur.'},
		],
		labels: ['sicak', 'soguk'],
	},
	pressure: {
		stages: [
			{id: 'kati', title: 'Katı basıncı', note: 'Aynı ağırlık, küçük yüzeye daha büyük basınç uygular: P = G / S.'},
			{id: 'derinlik', title: 'Sıvı basıncı', note: 'Sıvı basıncı derinlikle artar: alttaki delikten su daha uzağa fışkırır.'},
			{id: 'acikhava', title: 'Açık hava basıncı', note: 'Deniz seviyesinde hava, 76 cm cıva sütununu dengeler; yükseldikçe azalır.'},
			{id: 'pascal', title: 'Pascal ilkesi', note: 'Kapalı sıvıdaki basınç her yere aynen iletilir: küçük kuvvet büyük yükü kaldırır.'},
		],
		labels: ['yuzey', 'civa'],
	},
	// ---------------------------------------------------------------- biology
	mitosis: {
		stages: [
			{id: 'interfaz', title: 'İnterfaz', note: 'Hücre büyür, DNA eşlenir: her kromozom iki kardeş kromatitli olur.'},
			{id: 'profaz', title: 'Profaz', note: 'Kromozomlar kısalıp kalınlaşır, çekirdek zarı kaybolur, iğ iplikleri oluşur.'},
			{id: 'metafaz', title: 'Metafaz', note: 'Kromozomlar hücrenin ekvatorunda tek sıra dizilir.'},
			{id: 'anafaz', title: 'Anafaz', note: 'Kardeş kromatitler ayrılır ve zıt kutuplara çekilir.'},
			{id: 'telofaz', title: 'Telofaz ve bölünme', note: 'Çekirdek zarı yeniden oluşur; hücre boğumlanıp iki eş hücre olur.'},
		],
		labels: ['kromatit', 'ig', 'ekvator', 'bogum'],
	},
	carboncycle: {
		stages: [
			{id: 'fotosentez', title: 'Fotosentez', note: 'Bitkiler havadaki karbondioksiti alır ve besin üretir.'},
			{id: 'solunum', title: 'Solunum', note: 'Bütün canlılar solunumla karbondioksiti havaya geri verir.'},
			{id: 'ayristirma', title: 'Ayrıştırma', note: 'Ayrıştırıcılar ölü canlıları çürütür; karbonun bir kısmı fosil yakıta döner.'},
			{id: 'yanma', title: 'Yanma', note: 'Fosil yakıtlar yakılınca karbon hızla havaya döner: karbondioksit artar.'},
		],
		labels: ['co2', 'fosil'],
	},
	nitrogencycle: {
		stages: [
			{id: 'tutulma', title: 'Azot bağlama', note: 'Şimşek ve baklagil köklerindeki bakteriler havadaki azotu toprağa bağlar.'},
			{id: 'nitrifikasyon', title: 'Nitrifikasyon', note: 'Toprak bakterileri amonyağı önce nitrite, sonra nitrata çevirir.'},
			{id: 'ozumleme', title: 'Bitkiye geçiş', note: 'Bitkiler nitratı kökleriyle alıp protein yapar; hayvanlar bitkiyle alır.'},
			{id: 'ayristirma', title: 'Ayrıştırma', note: 'Ölü canlılar ve atıklar ayrışır: azot yeniden amonyak olur.'},
			{id: 'denitrifikasyon', title: 'Denitrifikasyon', note: 'Bazı bakteriler nitratı azot gazına çevirir: azot havaya döner.'},
		],
		labels: ['simsek', 'nodul', 'nitrat', 'n2'],
	},
	// ---------------------------------------------------------------- mathematics
	areamodel: {
		stages: [
			{id: 'tamkare', title: '(a + b)²', note: 'Kenarı a + b olan kare: a², iki tane ab ve b². (a + b)² = a² + 2ab + b²'},
			{id: 'karefarki', title: 'a² − b²', note: 'a² karesinden b² çıkar, kalan şekil kesilip dizilir: (a − b)(a + b).'},
		],
		labels: ['a2', 'ab', 'b2'],
	},
	numberline: {
		stages: [
			{id: 'uzaklik', title: 'Uzaklık', note: '|x|, x’in sıfıra uzaklığıdır: |3| = |−3| = 3.'},
			{id: 'denklem', title: 'Denklem', note: '|x − 2| = 3: 2’ye uzaklığı 3 olan iki sayı var, x = 5 ya da x = −1.'},
			{id: 'esitsizlik', title: 'Eşitsizlik', note: '|x − 2| < 3: 2’ye uzaklığı 3’ten az olanlar, −1 < x < 5.'},
		],
		labels: ['merkez'],
	},
} as const satisfies Record<string, ProcessInfo>;

export type ProcessName = keyof typeof PROCESS_CATALOG;
export const PROCESSES = Object.keys(PROCESS_CATALOG) as [ProcessName, ...ProcessName[]];

/** Every part a beat may point at in a process: its stages and its labels. */
export const processParts = (process: ProcessName): string[] => [...PROCESS_CATALOG[process].stages.map((stage) => stage.id), ...PROCESS_CATALOG[process].labels];
