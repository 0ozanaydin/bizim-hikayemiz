import { useMemo, useRef } from 'react'
import { ninetyNine, thingsILove } from '../data/content'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { blur, clamp, isMobile, reducedMotion, soft } from '../lib/motion'
import { getVelocity } from '../lib/velocity'
import { offsetWithin } from '../lib/refresh'
import { SplitText } from '../components/SplitText'

/**
 * Her satır farklı bir karakterle açılır. 20 satır bu listeyi sırayla dolaşır.
 */
const VARIANTS = ['blur', 'rise', 'scale', 'chars', 'tilt', 'words', 'fade', 'stagger'] as const
type Variant = (typeof VARIANTS)[number]

const COLS = 5
const FINAL = '__final__'

function CellText({ text, variant }: { text: string; variant: Variant }) {
  if (variant === 'chars') return <SplitText by="chars" text={text} />
  if (variant === 'words') return <SplitText text={text} />
  if (variant === 'rise') return <SplitText mask text={text} />
  return <>{text}</>
}

/**
 * 5. SENDE SEVDİĞİM 99 ŞEY
 * - 20 satır × 5 kolon (mobilde 2 kolon). 1–99 madde, 100. hücre özel final alanı.
 * - Her satır scroll ile, kendine has bir animasyonla açılır; satır çizgileri çizilir.
 * - Scroll hızına göre satırlar hafifçe zıt yönlere süzülür, rastgele hücreler "nefes alır".
 * - Grid bitince uzaklaşır; son hücre büyüyüp final cümlelerine dönüşür.
 */
export function NinetyNine() {
  const root = useRef<HTMLElement>(null)
  const pinWrap = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const finalCell = useRef<HTMLDivElement>(null)
  const counter = useRef<HTMLDivElement>(null)

  const rows = useMemo(() => {
    const items = [...thingsILove.slice(0, 99), FINAL]
    return Array.from({ length: Math.ceil(items.length / COLS) }, (_, r) => items.slice(r * COLS, r * COLS + COLS))
  }, [])

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const gridEl = grid.current!
      const pinEl = pinWrap.current!
      const finalEl = finalCell.current!

      /* ---------------- Başlık ---------------- */
      const num = q('.nn-num-value')[0]
      gsap
        .timeline({
          scrollTrigger: {
            trigger: q('.nn-head')[0],
            start: 'top 80%',
            end: 'top 25%',
            scrub: 1,
            onUpdate: (self) => {
              num.textContent = String(Math.round(self.progress * 99)).padStart(2, '0')
            },
          },
        })
        .from(q('.nn-eyebrow'), soft({ opacity: 0, y: 14, duration: 0.3 }))
        .from(q('.nn-title .split-word'), soft({ yPercent: 110, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' }), 0.05)
        .from(q('.nn-num'), soft({ opacity: 0, scale: 0.6, filter: blur(16), duration: 1 }), 0.1)
        .from(q('.nn-sub'), soft({ opacity: 0, y: 16, filter: blur(8), duration: 0.6 }), 0.6)

      /* ---------------- Hücre animasyonları ---------------- */
      const reveal = (tl: gsap.core.Timeline, cell: Element, variant: Variant, at: number, col: number) => {
        const line = cell.querySelector('.nn-line')
        const idx = cell.querySelector('.nn-idx')
        const text = cell.querySelector('.nn-text')
        tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }, at)
        tl.from(idx, { opacity: 0, duration: 0.3 }, at + 0.15)

        if (cell.classList.contains('nn-final')) {
          tl.from(text, soft({ opacity: 0, filter: blur(10), y: 10, duration: 0.8 }), at + 0.2)
          tl.from(cell.querySelector('.nn-dot'), soft({ scale: 0, opacity: 0, duration: 0.4 }), at + 0.5)
          return
        }
        switch (variant) {
          case 'blur':
            tl.from(text, soft({ opacity: 0, filter: blur(14), duration: 0.6 }), at)
            break
          case 'rise':
            tl.from(cell.querySelectorAll('.split-word'), soft({ yPercent: 105, opacity: 0, duration: 0.55, stagger: 0.05, ease: 'power3.out' }), at)
            break
          case 'scale':
            tl.from(text, soft({ scale: 0.7, opacity: 0, transformOrigin: '0% 50%', duration: 0.6, ease: 'back.out(1.4)' }), at)
            break
          case 'chars':
            tl.from(cell.querySelectorAll('.split-char'), soft({ opacity: 0, y: '0.45em', duration: 0.3, stagger: 0.016 }), at)
            break
          case 'tilt':
            tl.from(text, soft({ rotate: col % 2 ? 5 : -5, y: 22, opacity: 0, transformOrigin: '0% 100%', duration: 0.6 }), at)
            break
          case 'words':
            tl.from(cell.querySelectorAll('.split-word'), soft({ opacity: 0, x: -12, filter: blur(6), duration: 0.4, stagger: 0.07 }), at)
            break
          case 'fade':
            tl.from(text, { opacity: 0, duration: 0.9, ease: 'none' }, at)
            break
          case 'stagger':
            tl.from(text, soft({ y: col % 2 ? -34 : 34, opacity: 0, duration: 0.6 }), at)
            break
        }
      }

      const mm = gsap.matchMedia()

      // Masaüstü: satır satır açılır, hücreler soldan sağa kademeli
      mm.add('(min-width: 1024px)', () => {
        q('.nn-row').forEach((row, r) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 90%', end: 'top 50%', scrub: 0.8 } })
          row.querySelectorAll('.nn-cell').forEach((cell, c) => reveal(tl, cell, VARIANTS[r % VARIANTS.length], c * 0.14, c))
        })

        // scroll hızına göre satırlar zıt yönlere süzülür
        if (reducedMotion) return
        const rowsEls = q('.nn-row')
        const setters = rowsEls.map((el) => gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' }))
        const tick = () => {
          const v = getVelocity()
          setters.forEach((fn, r) => fn(clamp(v * (r % 2 ? 1 : -1) * (0.7 + (r % 3) * 0.25), -30, 30)))
        }
        gsap.ticker.add(tick)
        return () => gsap.ticker.remove(tick)
      })

      // Tablet / mobil: her hücre kendi ekrana girişinde açılır
      mm.add('(max-width: 1023px)', () => {
        q('.nn-cell').forEach((cell, i) => {
          const r = Math.floor(i / COLS)
          const tl = gsap.timeline({ scrollTrigger: { trigger: cell, start: 'top 94%', end: 'top 62%', scrub: 0.8 } })
          reveal(tl, cell, VARIANTS[r % VARIANTS.length], 0, i % COLS)
        })
      })

      /* ---------------- Sayaç + nefes alan hücreler ---------------- */
      const counterEl = counter.current!
      const counterValue = counterEl.querySelector('.nn-counter-value')!
      let twinkleTimer = 0
      const cells = q('.nn-cell:not(.nn-final) .nn-text')
      const twinkle = () => {
        const el = cells[Math.floor(Math.random() * cells.length)]
        if (!el || el.classList.contains('nn-twinkle')) return
        el.classList.add('nn-twinkle')
        window.setTimeout(() => el.classList.remove('nn-twinkle'), 2800)
      }
      ScrollTrigger.create({
        trigger: gridEl,
        start: 'top 78%',
        end: 'bottom 62%',
        onUpdate: (self) => {
          counterValue.textContent = String(Math.min(99, Math.round(self.progress * 99))).padStart(2, '0')
        },
        onToggle: (self) => {
          counterEl.classList.toggle('is-visible', self.isActive)
          window.clearInterval(twinkleTimer)
          if (self.isActive && !reducedMotion) twinkleTimer = window.setInterval(twinkle, isMobile ? 1600 : 900)
        },
      })

      /* ---------------- Final: grid uzaklaşır, son hücre büyür ---------------- */
      const S = isMobile ? 0.5 : 0.38
      const geom = () => {
        const vw = window.innerWidth
        const vh = window.innerHeight
        const cell = offsetWithin(finalEl, pinEl)
        const g = offsetWithin(gridEl, pinEl)
        const cx = cell.x + finalEl.offsetWidth / 2
        const cy = cell.y + finalEl.offsetHeight / 2
        const pinLeft = pinEl.getBoundingClientRect().left
        return {
          origin: `${cx - g.x}px ${cy - g.y}px`,
          dx: vw / 2 - (pinLeft + cx),
          dy: vh / 2 - (vh - pinEl.offsetHeight + cy),
        }
      }

      gsap.set(q('.nn-ov-because .split-word'), soft({ opacity: 0, y: 16, filter: blur(10) }))
      gsap.set(q('.nn-ov-every .split-char'), soft({ opacity: 0, yPercent: 110 }))

      const others = q('.nn-cell:not(.nn-final)')
      const fin = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: pinEl,
          start: 'bottom bottom',
          end: '+=440%',
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      fin
        .to(gridEl, { transformOrigin: () => geom().origin, duration: 0.001 }, 0)
        .to(gridEl, { scale: S, x: () => geom().dx, y: () => geom().dy, duration: 2 }, 0)
        .to(finalEl, { scale: 1 / S, duration: 2 }, 0)
        .to(others, { opacity: 0.28, duration: 1.4 }, 0.4)
        .to(q('.nn-final-glow'), { opacity: 1, duration: 1.2 }, 0.8)
        // son hücre ekranı kaplayan cümleye dönüşür
        .addLabel('grow', '>')
        .to(finalEl.querySelectorAll('.nn-text, .nn-idx'), { opacity: 0, duration: 0.5 }, 'grow')
        .fromTo(q('.nn-ov-final'), { opacity: 0, scale: 0.34 }, { opacity: 1, scale: 1, duration: 1.4, ease: 'power3.out' }, 'grow')
        .to(gridEl, soft({ opacity: 0, filter: blur(6), duration: 1.8, ease: 'power1.inOut' }), 'grow+=0.4')
        .to({}, { duration: 0.9 })
        // Çünkü seni sadece 99 şey için sevmiyorum.
        .to(q('.nn-ov-final'), soft({ opacity: 0, y: -40, filter: blur(8), duration: 1 }), '>')
        .to(q('.nn-ov-because .split-word'), { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.12, ease: 'power2.out' }, '<+0.4')
        .to({}, { duration: 0.8 })
        // Her şeyin için.
        .to(q('.nn-ov-because'), soft({ opacity: 0.35, y: -24, scale: 0.92, duration: 1 }), '>')
        .to(q('.nn-ov-every .split-char'), { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.05, ease: 'power3.out' }, '<+0.3')
        .to(q('.nn-ov-glow'), { opacity: 1, scale: 1, duration: 1.2 }, '<+0.3')
        .to({}, { duration: 1.2 })


      return () => {
        window.clearInterval(twinkleTimer)
        mm.revert()
      }
    },
    { scope: root },
  )

  let n = 0
  return (
    <section ref={root} data-chapter="99 şey" className="relative overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40vh] bg-gradient-to-b from-night to-transparent" />

      <header className="nn-head relative mx-auto max-w-6xl px-6 pb-[12vh] pt-[28vh] text-center">
        <p className="nn-eyebrow mb-8 font-sans text-[10px] uppercase tracking-label text-gold/70">V</p>
        <h2 className="nn-title font-serif text-[clamp(2.5rem,7.4vw,6.6rem)] font-light leading-[1.02] text-bone">
          <SplitText mask text={ninetyNine.titleBefore} />{' '}
          <span className="nn-num relative isolate inline-block font-normal italic text-gold [font-variant-numeric:lining-nums]">
            <span className="nn-num-value">{ninetyNine.titleNumber}</span>
            <span aria-hidden className="absolute -inset-x-4 inset-y-0 -z-10 rounded-full bg-ember/10 blur-2xl" />
          </span>{' '}
          <SplitText mask text={ninetyNine.titleAfter} />
        </h2>
        <p className="nn-sub mx-auto mt-8 max-w-[34ch] font-serif text-lg italic text-bone/55 md:text-2xl">{ninetyNine.subtitle}</p>
      </header>

      <div ref={pinWrap} className="nn-pin relative px-4 pb-[46svh] md:px-10">
        <div
          ref={grid}
          role="list"
          className="nn-grid relative mx-auto grid max-w-[1320px] grid-cols-2 gap-x-4 will-change-transform max-[359px]:grid-cols-1 lg:flex lg:flex-col"
        >
          {rows.map((row, r) => (
            <div key={r} className="nn-row contents lg:grid lg:grid-cols-5 lg:gap-x-8" data-row={r}>
              {row.map((item) => {
                const i = n++
                if (item === FINAL) {
                  return (
                    <div key="final" ref={finalCell} role="listitem" className="nn-cell nn-final relative py-6 lg:py-9">
                      <span className="nn-final-glow pointer-events-none absolute -inset-6 rounded-full opacity-0 [background:radial-gradient(closest-side,rgba(168,56,46,0.22),transparent)]" />
                      <span className="nn-line absolute inset-x-0 bottom-0 h-px origin-left bg-ember/40" />
                      <span className="nn-idx mb-2 block font-sans text-[10px] tabular-nums text-ember/80">100</span>
                      <span className="nn-text relative block font-serif text-[1.08rem] italic leading-snug text-[#d9a594] lg:text-[1.35rem]">
                        <span className="nn-dot mr-2 inline-block h-1.5 w-1.5 -translate-y-[0.2em] rounded-full bg-ember align-middle" />
                        {ninetyNine.finalCell}
                      </span>
                    </div>
                  )
                }
                const variant = VARIANTS[r % VARIANTS.length]
                const italic = i % 3 === 1
                const featured = i % 7 === 3
                return (
                  <div key={i} role="listitem" className="nn-cell group relative py-6 lg:py-9">
                    <span className="nn-line absolute inset-x-0 bottom-0 h-px origin-left bg-bone/10" />
                    <span className="nn-idx mb-2 block font-sans text-[10px] tabular-nums text-gold/45 transition-colors duration-500 group-hover:text-ember">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`nn-text block font-serif leading-snug text-bone/90 transition-[color,transform] duration-700 group-hover:translate-x-1 group-hover:text-bone ${
                        italic ? 'italic' : ''
                      } ${featured ? 'text-[1.2rem] lg:text-[1.6rem]' : 'text-[1.08rem] lg:text-[1.35rem]'}`}
                    >
                      <CellText text={item} variant={variant} />
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* final katmanı: sabitlenen alanda ekranın tam ortası */}
        <div className="nn-overlay pointer-events-none absolute inset-x-0 bottom-0 flex h-svh items-center justify-center px-6 text-center">
          <p className="nn-ov-final absolute font-serif text-[clamp(2.2rem,6.4vw,5.4rem)] font-light italic leading-tight text-[#e3b8a8] opacity-0 [text-shadow:0_0_40px_rgba(168,56,46,0.35)]">
            {ninetyNine.finalCell}
          </p>
          <div className="relative flex flex-col items-center gap-8">
            <SplitText
              as="p"
              text={ninetyNine.because}
              className="nn-ov-because block max-w-[22ch] font-serif text-[clamp(1.7rem,4.2vw,3.4rem)] font-light leading-tight text-bone"
            />
            <div className="relative">
              <span className="nn-ov-glow pointer-events-none absolute left-1/2 top-1/2 h-[3em] w-[9em] -translate-x-1/2 -translate-y-1/2 scale-75 rounded-full text-[clamp(2.8rem,8vw,7rem)] opacity-0 [background:radial-gradient(closest-side,rgba(198,164,106,0.18),rgba(168,56,46,0.08)_60%,transparent)]" />
              <SplitText
                as="p"
                by="chars"
                mask
                text={ninetyNine.everything}
                className="nn-ov-every relative block font-serif text-[clamp(2.8rem,8vw,7rem)] font-light italic leading-none text-bone"
              />
            </div>
          </div>
        </div>
      </div>

      {/* sayaç */}
      <div
        ref={counter}
        aria-hidden
        className="nn-counter pointer-events-none fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-baseline gap-2 font-sans text-[10px] uppercase tracking-label text-bone/40 opacity-0 transition-opacity duration-700 md:bottom-8"
      >
        <span className="nn-counter-value text-[13px] tabular-nums tracking-[0.15em] text-gold/80">00</span>
        <span>/ 99</span>
      </div>
    </section>
  )
}
