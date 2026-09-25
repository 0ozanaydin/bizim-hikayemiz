import { useRef } from 'react'
import { memories } from '../data/content'
import { gsap, useGSAP } from '../lib/gsap'
import { blur, clamp, isMobile, reducedMotion, soft } from '../lib/motion'
import { getVelocity } from '../lib/velocity'
import { Photo } from '../components/Photo'
import { SplitText } from '../components/SplitText'

/**
 * 3. ANILAR — yatay film şeridi
 * Bölüm sabitlenir (pin), dikey scroll yatay harekete dönüşür.
 * Kartlar ekrana girerken netleşir; scroll hızına göre şerit hafifçe eğilir.
 */
export function Memories() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const trackEl = track.current!
      const distance = () => Math.max(0, trackEl.scrollWidth - window.innerWidth)

      const scrollTween = gsap.to(trackEl, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => gsap.set(q('.mem-progress'), { scaleX: self.progress }),
        },
      })

      // Giriş paneli
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: 'top 75%', end: 'top 10%', scrub: 1 } })
        .from(q('.mem-intro-eyebrow'), soft({ opacity: 0, y: 16, duration: 0.4 }))
        .from(q('.mem-intro-title .split-char'), soft({ yPercent: 110, opacity: 0, stagger: 0.05, duration: 0.8, ease: 'power3.out' }), 0.1)
        .from(q('.mem-intro-sub'), soft({ opacity: 0, y: 20, filter: blur(6), duration: 0.6 }), 0.5)

      // Her kart ekrana yatay girerken
      q('.mem-card').forEach((card, i) => {
        const media = card.querySelector('.mem-media')
        const meta = card.querySelectorAll('.mem-meta > *')
        const text = card.querySelectorAll('.mem-text .split-word')
        gsap
          .timeline({
            scrollTrigger: {
              trigger: card,
              containerAnimation: scrollTween,
              start: 'left 98%',
              end: 'left 45%',
              scrub: true,
            },
          })
          .from(
            media,
            soft({
              opacity: 0.1,
              scale: 0.88,
              clipPath: i % 2 ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)',
              filter: isMobile ? 'none' : blur(8),
              duration: 1,
              ease: 'power2.out',
            }),
          )
          .from(meta, soft({ opacity: 0, x: 30, stagger: 0.1, duration: 0.5 }), 0.4)
          .from(text, soft({ opacity: 0, y: 10, stagger: 0.04, duration: 0.4 }), 0.55)

        // fotoğraf şerit içinde hafifçe dikey süzülür
        if (!reducedMotion) {
          gsap.fromTo(
            card.querySelector('.mem-float'),
            { y: i % 2 ? -18 : 18 },
            {
              y: i % 2 ? 18 : -18,
              ease: 'none',
              scrollTrigger: { trigger: card, containerAnimation: scrollTween, start: 'left right', end: 'right left', scrub: true },
            },
          )
        }
      })

      // Çıkış yazısı
      gsap.from(q('.mem-outro .split-word'), {
        ...soft({ opacity: 0, y: 20, filter: blur(8) }),
        opacity: 0,
        stagger: 0.1,
        scrollTrigger: { trigger: q('.mem-outro')[0], containerAnimation: scrollTween, start: 'left 90%', end: 'left 50%', scrub: true },
      })

      // Scroll hızına göre eğilme
      if (reducedMotion) return
      const cards = q('.mem-skew')
      const skewTo = cards.map((c) => gsap.quickTo(c, 'skewX', { duration: 0.6, ease: 'power3.out' }))
      const tick = () => {
        const s = clamp(getVelocity() * -0.18, -5, 5)
        skewTo.forEach((fn) => fn(s))
      }
      gsap.ticker.add(tick)
      return () => gsap.ticker.remove(tick)
    },
    { scope: root },
  )

  return (
    <section ref={root} data-chapter="Anılar" className="relative h-svh overflow-hidden">
      {/* üst & alt film kenarı ışığı */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent" />

      <div ref={track} className="relative flex h-full w-max items-center will-change-transform">
        {/* film delikleri */}
        <div aria-hidden className="film-holes absolute inset-x-0 top-[7svh] h-3" />
        <div aria-hidden className="film-holes absolute inset-x-0 bottom-[7svh] h-3" />

        {/* giriş paneli */}
        <div className="flex w-[86vw] shrink-0 flex-col justify-center pl-[8vw] pr-[6vw] md:w-[46vw] md:pl-[9vw]">
          <p className="mem-intro-eyebrow mb-6 font-sans text-[10px] uppercase tracking-label text-gold/70">III</p>
          <SplitText
            as="h2"
            by="chars"
            mask
            text={memories.title}
            className="mem-intro-title font-serif text-[clamp(3.5rem,11vw,9rem)] font-light italic leading-none text-bone"
          />
          <p className="mem-intro-sub mt-8 max-w-[28ch] font-serif text-xl leading-snug text-bone/65 md:text-2xl">
            {memories.subtitle}
          </p>
          <div className="mt-10 flex items-center gap-4 font-sans text-[10px] uppercase tracking-label text-bone/35">
            <span className="h-px w-12 bg-bone/25" />
            <span>kaydırmaya devam et</span>
          </div>
        </div>

        {memories.items.map((m, i) => (
          <article key={m.image + i} className="mem-card relative shrink-0 px-[5vw] md:px-[3.2vw]">
            <div className={i % 2 ? 'md:translate-y-[5svh]' : 'md:-translate-y-[4svh]'}>
            <div className="mem-skew">
              <div className="mem-float">
                <p className="mb-3 font-sans text-[9px] tabular-nums uppercase tracking-label text-bone/30">
                  kare {String(i + 1).padStart(2, '0')}
                </p>
                <div className="mem-media relative will-change-transform">
                  <Photo
                    src={m.image}
                    alt={m.alt ?? m.text}
                    eager
                    className="h-auto max-h-[46svh] w-auto max-w-[78vw] md:max-h-[56svh] md:max-w-[46vw]"
                    fallbackClassName="h-[46svh] w-[70vw] md:h-[56svh] md:w-[34vw]"
                  />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-bone/[0.06]" />
                </div>
                <div className="mem-meta mt-5 flex items-center gap-4">
                  <span className="font-sans text-[11px] tabular-nums tracking-[0.2em] text-gold/80">{m.date}</span>
                  <span className="h-px w-10 bg-gold/30" />
                </div>
                <SplitText
                  as="p"
                  text={m.text}
                  className="mem-text mt-3 block max-w-[26ch] font-serif text-lg italic leading-snug text-bone/85 md:text-[1.35rem]"
                />
              </div>
            </div>
            </div>
          </article>
        ))}

        {/* çıkış */}
        <div className="mem-outro flex w-[80vw] shrink-0 items-center justify-center md:w-[44vw]">
          <SplitText
            text={memories.outro}
            className="block text-center font-serif text-[clamp(2rem,5vw,3.8rem)] font-light italic leading-tight text-bone/80"
          />
        </div>
      </div>

      {/* ilerleme çizgisi */}
      <div className="absolute bottom-[3.5svh] left-1/2 h-px w-[40vw] -translate-x-1/2 bg-bone/10 md:w-[22vw]">
        <div className="mem-progress h-full origin-left scale-x-0 bg-gold/60" />
      </div>
    </section>
  )
}
