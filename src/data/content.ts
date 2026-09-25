/* ==========================================================================
   İÇERİK DOSYASI
   --------------------------------------------------------------------------
   Sitedeki bütün yazılar, fotoğraflar ve mesajlar BURADAN yönetilir.
   Kod dosyalarına dokunmadan sadece bu dosyayı düzenlemen yeterli.

   Fotoğraflar : /public/images/ klasörüne koy, burada yolunu yaz.
                 Örn. /public/images/photo1.jpg  →  "/images/photo1.jpg"
   Müzik        : /public/assets/music.mp3  (yolu aşağıdan değiştirebilirsin)
   ========================================================================== */

export const site = {
  /** Tarayıcı sekmesinde görünen başlık */
  tabTitle: 'Sana',
  /** Mektubun altındaki imza ve zarfın mühründeki harf */
  from: 'Ozan',
  sealLetter: 'O',
}

/* --------------------------------------------------------------------------
   MÜZİK
   -------------------------------------------------------------------------- */
export const music = {
  src: '/assets/music.mp3',
  /** 0 – 1 arası. Sinematik ve arka planda kalması için düşük tut. */
  volume: 0.32,
  /** Müziğin yavaşça açılma süresi (saniye) */
  fadeInSeconds: 4,
}

/* --------------------------------------------------------------------------
   1. AÇILIŞ
   -------------------------------------------------------------------------- */
export const opening = {
  first: 'daha önce biraz geç kaldım ama...',
  second: 'şimdi tam zamanında.',
  /** Saat bu değerden başlayıp aşağıdakine döner (aynı uzunlukta olmalı) */
  clockFrom: '23:59',
  clockTo: '00:00',
  birthday: 'İyi ki doğdun.',
  scrollHint: 'aşağı kaydır',
}

/* --------------------------------------------------------------------------
   2. HİKÂYENİN BAŞLANGICI
   Fotoğraf giriş animasyonları sırayla otomatik atanır:
   soldan → sağdan → büyüyerek → bulanıktan netliğe → dönerek
   -------------------------------------------------------------------------- */
export type StoryPhoto = {
  image: string
  caption: string
  alt?: string
}

export const story = {
  title: 'Her şey bir yerden başladı.',
  backgroundWord: 'başlangıç',
  photos: [
    { image: '/images/photo1.jpg', caption: 'İlk fotoğrafımız. Ne kadar da çekingendik.' },
    { image: '/images/photo2.jpg', caption: 'Gülüşünü ilk kez bu kadar yakından duydum.' },
    { image: '/images/photo3.jpg', caption: 'Ve sonra, bir anda, “biz” olduk.' },
    { image: '/images/photo4.jpg', caption: 'Asla bitmeyecek hikâye başladı.' },
    { image: '/images/photo5.jpg', caption: 'Gerisi zaten hikâyenin en güzel kısmı' },
  ] as StoryPhoto[],
}

/* --------------------------------------------------------------------------
   3. ANILAR (yatay film şeridi)
   -------------------------------------------------------------------------- */
export type Memory = {
  image: string
  date: string
  text: string
  alt?: string
}

export const memories = {
  title: 'Anılar',
  subtitle: 'Bazı günler takvimde değil, insanın içinde kalır.',
  outro: 've daha yazılacak nicesi...',
  items: [
    { image: '/images/photo6.jpg', date: '11.07.2024', text: 'Yağmur başladı ve biz hiç acele etmedik.' },
    { image: '/images/photo7.jpg', date: '08.01.2025', text: 'Kahvelerimiz soğudu, sohbetimiz bitmedi.' },
    { image: '/images/photo8.jpg', date: '21.05.2026', text: 'Onların mutluluğuna bakarken, kendi hikâyemizi düşündüm.' },
    { image: '/images/photo9.jpg', date: '17.09.2025', text: 'O an İstanbulun en güzel yeri orasıydı' },
    { image: '/images/photo10.jpg', date: '16.05.2026', text: 'Hiçbir şarkısını bilmiyordum ama seni izlemek yetti.' },
    { image: '/images/photo11.jpg', date: '18.04.2026', text: 'Sıradan bir Pazar. En sevdiğim günlerden biri.' },
    { image: '/images/photo12.jpg', date: '25.06.2026', text: 'Bir gün bu fotoğrafa bakıp güleceğiz.' },
  ] as Memory[],
}

/* --------------------------------------------------------------------------
   4. DUYGUSAL GEÇİŞ
   -------------------------------------------------------------------------- */
export const realization = {
  first: 'Sonra fark ettim...',
  second: '...seni hayatımda gerçekten istemeye başladığımı.',
  /** Bu kelimeler hafif sıcak bir tonla vurgulanır */
  emphasis: ['gerçekten'],
}

/* --------------------------------------------------------------------------
   5. SENDE SEVDİĞİM 99 ŞEY
   Tam olarak 99 madde olmalı. 100. hücre özel final alanıdır.
   -------------------------------------------------------------------------- */
export const ninetyNine = {
  titleBefore: 'Sende sevdiğim',
  titleNumber: '99',
  titleAfter: 'şey.',
  subtitle: 'Belki 99 tane yazabilirim ama aslında daha fazlası var.',
  finalCell: 've daha sayamadığım her şey...',
  because: 'Çünkü seni sadece 99 şey için sevmiyorum.',
  everything: 'Her şeyin için.',
}

export const thingsILove: string[] = [
  // 1 – 10
  'gülüşün',
  'bakışların',
  'sesin',
  'sabrın',
  'kahkahan',
  'uykulu hâlin',
  'inatçılığın',
  'ellerinin sıcaklığı',
  '“beş dakika” deyip bir saat hazırlanman',
  'kahveni içişin',
  // 11 – 20
  'yolda kendi kendine şarkı söylemen',
  'beni dinleyişin',
  'sessizliğin',
  'kaşlarını çatman',
  'heyecanlanınca hızlı konuşman',
  'saçlarının kokusu',
  'dürüstlüğün',
  'küçük şeylere sevinmen',
  'bana kızıp sonra gülmen',
  'mesajlarının sonundaki gülücükler',
  // 21 – 30
  'cesaretin',
  'merakın',
  'düşünceli hâlin',
  'omzuma yaslanman',
  'menü önündeki kararsızlığın',
  'sabah sesin',
  'sarılışın',
  'hayallerin',
  'sakarlığın',
  'gözlerindeki ışık',
  // 31 – 40
  'kötü dans edişin',
  'adımı söyleyişin',
  'inandığın şeyler',
  'fotoğraf çekerken ciddileşmen',
  'tatlı kıskançlığın',
  'şefkatin',
  'kendi esprine gülmen',
  'buz gibi ayakların',
  'arabada uyuyakalman',
  'zor günlerdeki gücün',
  // 41 – 50
  '“iyi misin?” diye sorman',
  'elimi tutuşun',
  'gece yarısı sohbetlerimiz',
  'günaydın mesajların',
  'pijamaların',
  'düşünceli sürprizlerin',
  'dizi izlerken yorum yapman',
  'yanakların',
  'kötü şakalarıma bile gülmen',
  'kitap okuyuşun',
  // 51 – 60
  'zevkin',
  'ağlarken bile güzel oluşun',
  'hayvanlara bakışın',
  'yürüyüşün',
  'omuz silkişin',
  'gece atıştırmaların',
  'yön duygunun olmayışı',
  'plan yapmayı sevmen',
  'sonra plansız kaçışlarımız',
  'kararlılığın',
  // 61 – 70
  'kokun',
  'fısıldayışın',
  'sokak kedileriyle konuşman',
  'yağmuru sevmen',
  'sabırsızlığın',
  'nezaketin',
  'içindeki çocuk',
  'bana “deli” demen',
  'telefonu kapatamayışımız',
  'sarılınca susman',
  // 71 – 80
  'aynı şarkıyı yüz kez dinlemen',
  'aynı filmi yeniden izlemen',
  'kocaman kalbin',
  'beni tanıyışın',
  'beni benden iyi bilmen',
  'sinirlenince sevimli olman',
  'tebessümün',
  'yüzündeki ifadeler',
  'gözlerini kısarak gülmen',
  'destek oluşun',
  // 81 – 90
  'bana güvenmen',
  'hatalarımı affedişin',
  'beni özleyişin',
  'beni görünce gülümsemen',
  'hayata bakışın',
  'bakışarak anlaşmamız',
  'kıyafet seçerken fikrimi sorman',
  'sonra yine bildiğini giymen',
  'tatlı krizlerin',
  'bana huzur vermen',
  // 91 – 99
  'dünyayı güzelleştirişin',
  'cümlelerini tamamlayabilmem',
  'bana ev gibi gelmen',
  'geleceğe dair konuşmalarımız',
  '“biz” deyişin',
  'varlığın',
  'benimle olman',
  'sen olman',
  'bana kendimi sevdirmen',
]

/* --------------------------------------------------------------------------
   6. YILDIZLAR
   formation: 'heart'  → yıldızlar hafifçe kalp şekli oluşturur
              { text: 'O & E' } → yıldızlar bu harfleri oluşturur
   -------------------------------------------------------------------------- */
export const stars = {
  first: 'Milyarlarca insanın arasında...',
  second: '...iyi ki yollarımız kesişmiş.',
  formation: 'heart' as 'heart' | { text: string },
}

/* --------------------------------------------------------------------------
   7. DOĞUM GÜNÜ
   message: her eleman ayrı bir paragraf.
   -------------------------------------------------------------------------- */
export const birthday = {
  /** Başlığın üstündeki küçük etiket. İstemiyorsan '' yap. */
  dateLabel: 'bugün',
  title: 'İYİ Kİ DOĞDUN',
  subtitle: 'Bugün senin günün.',
  messageEyebrow: 'sana birkaç satır',
  message: [
    '.',
    'Bu satırları yazarken aklımda hep aynı şey vardı: seninle geçen her gün, bir öncekinden biraz daha güzel. Bazen bunu sana yeterince söylemediğimi düşünüyorum, o yüzden bugün burada, herkesin değil sadece senin okuyacağın bir yerde söylemek istedim.',
    'Yeni yaşında seni yoran her şey hafiflesin, seni güldüren her şey çoğalsın. Ve ne olursa olsun, bil ki ben hep yanındayım.',
  ],
}

/* --------------------------------------------------------------------------
   8. FİNAL – MEKTUP
   letter: her eleman ayrı bir satır/paragraf. Boş satır için '' kullan.
   -------------------------------------------------------------------------- */
export const finale = {
  intro: 'Sana bir mektup bıraktım.',
  hint: 'açmak için dokun',
  letter: [
    'İyi ki doğdun.',
    'İyi ki hayatımdasın.',
    'Ve iyi ki daha anlatacak çok hikâyemiz var.',
  ],
  signature: '— Ozan ❤️',
  replay: 'baştan izle',
}
