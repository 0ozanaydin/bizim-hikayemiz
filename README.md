# Bizim Hikâyemiz — doğum günü sitesi

Scroll ile anlatılan, sinematik bir doğum günü hikâyesi.
React + Vite + TypeScript + Tailwind + GSAP (ScrollTrigger) + Lenis.

---

## Kurulum

Gerekli: **Node.js 18+** (öneri: 20 veya 22)

```bash
npm install
npm run dev
```

Terminalde çıkan adresi aç (genelde `http://localhost:5173`).
Aynı Wi-Fi'daki telefondan test etmek için terminaldeki **Network** adresini iPhone'da aç.

Yayına hazır sürüm:

```bash
npm run build      # dist/ klasörü oluşur
npm run preview    # build'i yerelde test et
```

`dist/` klasörünü Netlify / Vercel / GitHub Pages'e sürükle-bırak ile yükleyebilirsin.

### Kullanılan paketler

| Paket | Görevi |
| --- | --- |
| `react`, `react-dom` | arayüz |
| `gsap`, `@gsap/react` | tüm animasyonlar, ScrollTrigger (pin, scrub, yatay scroll) |
| `lenis` | yumuşak scroll |
| `lucide-react` | ikon ihtiyacı olursa diye hazır |
| `vite`, `@vitejs/plugin-react`, `typescript` | geliştirme ortamı |
| `tailwindcss`, `postcss`, `autoprefixer` | stil |

---

## Kişiselleştirme (sadece bu adımlar yeterli)

⬜️ **1. Yazılar** → `src/data/content.ts`
Sitedeki bütün metinler, 99 madde, doğum günü mesajı, mektup ve imza bu tek dosyada.

⬜️ **2. Fotoğraflar** → `public/images/`
Şu an içinde örnek (bulanık) görseller var: `photo1.jpg … photo12.jpg`.
Kendi fotoğraflarını **aynı isimlerle** koyarsan hiçbir koda dokunmana gerek kalmaz.
Farklı isim/sayı kullanacaksan `content.ts` içindeki `story.photos` ve `memories.items` dizilerini düzenle.

- `photo1–5` → 2. bölüm (Her şey bir yerden başladı)
- `photo6–12` → 3. bölüm (Anılar – yatay film şeridi)
- Fotoğraflar **kırpılmaz**; dikey, yatay, kare hepsi olduğu gibi görünür.
- Telefon fotoğrafları çok büyükse (5–10 MB), https://squoosh.app ile ~1600px genişliğe küçültmek siteyi çok hızlandırır.

⬜️ **3. Müzik** → `public/assets/music.mp3`
Dosyayı bu isimle koy. Yolu değiştirmek istersen `content.ts → music.src`.
Tarayıcılar otomatik çalmayı engellediği için sağ üstte **“♪ Müziği aç”** butonu çıkar;
müzik 4 saniyede yavaşça açılır. Dosya yoksa buton hiç görünmez.

⬜️ **4. 99 madde** → `content.ts → thingsILove`
Tam **99** madde olmalı. 100. hücre otomatik olarak “ve daha sayamadığım her şey…” olur.

⬜️ **5. Yıldızlar** → `content.ts → stars.formation`
`'heart'` → yıldızlar hafifçe kalp oluşturur.
`{ text: 'O & E' }` → yıldızlar baş harfleri oluşturur.

⬜️ **6. Mektup** → `content.ts → finale.letter` ve `finale.signature`

---

## Dosya yapısı

```
bizim-hikayemiz/
├─ index.html
├─ package.json
├─ tailwind.config.js        renk paleti ve fontlar
├─ public/
│  ├─ images/                fotoğraflar (photo1.jpg …)
│  └─ assets/                music.mp3 buraya
└─ src/
   ├─ main.tsx
   ├─ App.tsx                bölümlerin sırası
   ├─ index.css              grain, vinyet, küçük CSS animasyonları
   ├─ data/
   │  └─ content.ts          ★ BÜTÜN İÇERİK BURADA
   ├─ lib/
   │  ├─ gsap.ts             GSAP + ScrollTrigger kaydı
   │  ├─ smoothScroll.ts     Lenis (finalde scroll daha da yavaşlar)
   │  ├─ velocity.ts         scroll hızını ölçer (hıza bağlı hareketler için)
   │  ├─ motion.ts           reduced-motion, mobil tespiti, "tempo"
   │  ├─ refresh.ts          fotoğraf yüklenince ScrollTrigger yenileme
   │  └─ useInView.ts        ekranda olmayan canvas'ları durdurur
   ├─ components/
   │  ├─ SplitText.tsx       metni kelime/harf span'lerine böler
   │  ├─ Photo.tsx           lazy-load + kırpmasız fotoğraf + yer tutucu
   │  ├─ ParticleField.tsx   ışık / kalp parçacıkları (canvas)
   │  ├─ Envelope.tsx        CSS zarf
   │  ├─ MusicToggle.tsx     müzik (Web Audio API ile yumuşak açılış)
   │  ├─ ChapterIndicator.tsx sol alttaki “03 — Anılar”
   │  ├─ CursorLight.tsx     masaüstünde fareyi takip eden hafif ışık
   │  ├─ Backdrop.tsx        sabit arka plan + şafak ışığı + vinyet
   │  ├─ Grain.tsx           film greni
   │  └─ ScrollHint.tsx
   └─ sections/
      ├─ Opening.tsx         1 · karanlık → 23:59 → 00:00 → İyi ki doğdun
      ├─ StoryBeginning.tsx  2 · fotoğraf kolajı, 5 farklı giriş
      ├─ Memories.tsx        3 · pin + yatay film şeridi
      ├─ Realization.tsx     4 · kararan ekran, kelime kelime cümle
      ├─ NinetyNine.tsx      5 · 99 şey (20×5 grid + final)
      ├─ Stars.tsx           6 · yıldızlar, buluşan iki yıldız, kalp
      ├─ Birthday.tsx        7 · şafak, İYİ Kİ DOĞDUN, kişisel mesaj
      └─ Finale.tsx          8 · zarf, mektup, kalp parçacıkları
```

---

## Notlar

- **Mobil:** 99 şey bölümü 2 kolona düşer (çok dar ekranda 1). Parçacık sayısı ve blur miktarı otomatik azalır.
- **Hareketi azalt:** iPhone'da *Ayarlar → Erişilebilirlik → Hareket → Hareketi Azalt* açıksa animasyonlar sadece yumuşak geçişlere iner, yumuşak scroll kapanır.
- Site her açılışta en baştan başlar. Mektup açıldıktan sonra altta “↺ baştan izle” çıkar.
- Renkleri değiştirmek istersen: `tailwind.config.js → colors` (ink, bone, wine, ember, gold).
