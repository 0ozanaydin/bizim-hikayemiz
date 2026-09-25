import { useRef, type CSSProperties } from 'react'
import { story } from '../data/content'
import { gsap, useGSAP } from '../lib/gsap'
import { blur, clamp, isMobile, reducedMotion, soft } from '../lib/motion'
import { getVelocity } from '../lib/velocity'
import { SplitText } from '../components/SplitText'
import { Photo } from '../components/Photo'

type Entrance = 'left' | 'right' | 'scale' | 'blur' | 'rotate'
const ENTRANCES: Entrance[] = ['left', 'right', 'scale', 'blur', 'rotate']

/** Masaüstü editoryal kolaj yerleşimi (12 kolon). 5'ten fazla fotoğrafta desen tekrar eder. */
const LAYOUT = [
  { col: '1 / span 5', row: 1, mt: '0vh', speed: 0.1 },
  { col: '8 / span 5', row: 1, mt: '26vh', speed: -0.06 },
  { col: '4 / span 6', row: 2, mt: '14vh', speed: 0.04 },
  { col: '1 / span 4', row: 3, mt: '10vh', speed: 0.14 },
  { col: '7 / span 5', row: 3, mt: '30vh', speed: -0.08 },
]

/**
 * 2. HİKÂYENİN BAŞLANGICI
 * Başlık maskeden yükselir; fotoğraflar her biri farklı bir hareketle gelir,
 * arka planda dev "başlangıç" kelimesi parallax + scroll hızıyla kayar.
 */
export function StoryBeginning() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const d = isMobile ? 0.45 : 1 // mobilde hareket mesafeleri daha kısa

      // Açılıştan gelen çizginin devamı
      gsap.fromTo(
        q('.st-guide'),
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 20%', scrub: true },
        },
      )

      // Başlık
      gsap
        .timeline({ scrollTrigger: { trigger: q('.st-head')[0], start: 'top 85%', end: 'top 40%', scrub: 1 } })
        .from(q('.st-eyebrow'), soft({ opacity: 0, y: 20, duration: 0.5 }))
        .from(q('.st-title .split-word'), soft({ yPercent: 110, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out' }), 0.1)

      // Arka plandaki dev kelime: dikey parallax
      gsap.to(q('.st-bgword-wrap'), {
        yPercent: reducedMotion ? 0 : -45,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
      })

      // Fotoğraflar
      q('.st-item').forEach((item, i) => {
        const frame = item.querySelector('.st-frame')
        const caption = item.querySelectorAll('.st-caption .split-word')
        const index = item.querySelector('.st-index')
        const type = ENTRANCES[i % ENTRANCES.length]

        const fromVars: Record<Entrance, gsap.TweenVars> = {
          left: { x: -140 * d, opacity: 0 },
          right: { x: 140 * d, opacity: 0 },
          scale: { scale: 0.74, opacity: 0, clipPath: 'inset(14% 14% 14% 14%)' },
          blur: { filter: blur(24), opacity: 0, scale: 1.04 },
          rotate: { rotate: -7, y: 90 * d, opacity: 0, transformOrigin: '50% 100%' },
        }

        gsap
          .timeline({ scrollTrigger: { trigger: item, start: 'top 94%', end: 'top 38%', scrub: 1 } })
          .from(frame, soft({ ...fromVars[type], duration: 1, ease: 'power2.out' }))
          .from(index, soft({ opacity: 0, x: -12, duration: 0.4 }), 0.5)
          .from(caption, soft({ opacity: 0, y: 12, filter: blur(6), stagger: 0.06, duration: 0.5 }), 0.6)

        // Her fotoğraf farklı hızda akar (derinlik hissi)
        const speed = LAYOUT[i % LAYOUT.length].speed
        if (!reducedMotion) {
          gsap.fromTo(
            item.querySelector('.st-par'),
            { y: () => window.innerHeight * speed * d },
            {
              y: () => -window.innerHeight * speed * d,
              ease: 'none',
              scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
            },
          )
        }
      })

      // Scroll hızına göre yatay kayan arka plan kelimesi
      if (reducedMotion) return
      const word = q('.st-bgword')[0]
      const xTo = gsap.quickTo(word, 'x', { duration: 1.2, ease: 'power3.out' })
      const skewTo = gsap.quickTo(word, 'skewX', { duration: 0.8, ease: 'power3.out' })
      let drift = 0
      const tick = () => {
        const v = getVelocity()
        drift = clamp(drift - v * 0.9, -260, 260) * 0.985
        xTo(drift)
        skewTo(clamp(-v * 0.25, -8, 8))
      }
      gsap.ticker.add(tick)
      return () => gsap.ticker.remove(tick)
    },
    { scope: root },
  )

  return (
    <section ref={root} data-chapter="Başlangıç" className="relative overflow-x-clip pb-[24vh] pt-[26vh] md:pb-[34vh]">
      <span className="st-guide absolute left-1/2 top-0 h-[20vh] w-px origin-top bg-gradient-to-b from-gold/40 to-transparent" />

      {/* dev arka plan kelimesi */}
      <div aria-hidden className="st-bgword-wrap pointer-events-none absolute inset-x-0 top-[38%] flex justify-center">
        <span className="st-bgword whitespace-nowrap font-serif text-[34vw] font-light italic leading-none text-transparent [-webkit-text-stroke:1px_rgba(236,228,216,0.07)] md:text-[24vw]">
          {story.backgroundWord}
        </span>
      </div>

      <header className="st-head relative mx-auto mb-[16vh] max-w-5xl px-6 text-center">
        <p className="st-eyebrow mb-6 font-sans text-[10px] uppercase tracking-label text-gold/70">II</p>
        <SplitText
          as="h2"
          mask
          text={story.title}
          className="st-title font-serif text-[clamp(2.4rem,7vw,6rem)] font-light leading-[1.05] text-bone"
        />
      </header>

      <div className="relative mx-auto flex max-w-[1320px] flex-col gap-[14vh] px-5 md:grid md:grid-cols-12 md:gap-x-8 md:gap-y-0 md:px-10">
        {story.photos.map((photo, i) => {
          const l = LAYOUT[i % LAYOUT.length]
          const row = l.row + Math.floor(i / LAYOUT.length) * 3
          return (
            <div
              key={photo.image + i}
              className={`st-item relative self-start md:[grid-column:var(--col)] md:[grid-row:var(--row)] md:[margin-top:var(--mt)] ${
                i % 2 ? 'ml-[10%] w-[90%]' : 'w-[92%]'
              } md:ml-0 md:w-auto`}
              style={{ '--col': l.col, '--row': row, '--mt': l.mt } as CSSProperties}
            >
              <div className="st-par will-change-transform">
              <span className="st-index mb-3 block font-sans text-[10px] tabular-nums uppercase tracking-label text-bone/35">
                {String(i + 1).padStart(2, '0')}
              </span>
              <figure className="st-frame relative overflow-hidden rounded-[2px] bg-black/30 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] will-change-transform">
                <Photo src={photo.image} alt={photo.alt ?? photo.caption} className="h-auto w-full" fallbackClassName="aspect-[4/5] w-full" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                  <SplitText
                    text={photo.caption}
                    className="st-caption block max-w-[32ch] font-serif text-[1.15rem] italic leading-snug text-bone md:text-[1.45rem]"
                  />
                </figcaption>
              </figure>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
