import { useRef } from 'react'
import { opening } from '../data/content'
import { gsap, useGSAP } from '../lib/gsap'
import { blur, soft } from '../lib/motion'
import { SplitText } from '../components/SplitText'
import { ScrollHint } from '../components/ScrollHint'
import { ParticleField } from '../components/ParticleField'

/** 23:59 → 00:00 dönen saat. Her rakam iki katlı bir şerit; şerit yukarı kayınca yeni rakam görünür. */
function Clock({ from, to }: { from: string; to: string }) {
  const chars = Array.from(to)
  const renderLayer = (glow: boolean) => (
    <span className={`clock-layer flex items-center ${glow ? 'clock-glow absolute inset-0 justify-center' : 'relative'}`}>
      {chars.map((ch, i) =>
        ch === ':' ? (
          <span key={i} className="clock-colon mx-[0.04em] -translate-y-[0.06em]">
            :
          </span>
        ) : (
          <span key={i} className="clock-slot relative inline-block h-[1em] overflow-hidden">
            <span className="clock-strip flex flex-col">
              <span className="h-[1em]">{from[i] ?? ch}</span>
              <span className="h-[1em]">{ch}</span>
            </span>
          </span>
        ),
      )}
    </span>
  )
  return (
    <span className="relative inline-flex font-serif font-light leading-none tabular-nums [font-variant-numeric:lining-nums_tabular-nums]" aria-label={to}>
      {renderLayer(true)}
      {renderLayer(false)}
    </span>
  )
}

/**
 * 1. AÇILIŞ
 * Karanlık ekran → "geç kaldım" → "tam zamanında" → saat 23:59'dan 00:00'a döner → "İyi ki doğdun."
 * Sonunda kamera aşağı iniyormuş gibi katmanlar farklı hızlarda yukarı kayar.
 */
export function Opening() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)

      // --- Sayfa açılışı (scroll'dan bağımsız): ilk cümle yavaşça belirir
      gsap.set(q('.op-first .split-char'), soft({ opacity: 0, filter: blur(10), y: 6 }))
      const intro = gsap.timeline({ delay: 0.9 })
      intro
        .to(q('.op-first .split-char'), {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          duration: 1.6,
          ease: 'power2.out',
          stagger: 0.035,
        })
        .to(q('.op-hint'), { opacity: 1, duration: 1.4 }, '+=0.6')

      // --- Başlangıç durumları
      gsap.set(q('.op-second .split-word'), soft({ opacity: 0, y: 14, filter: blur(8) }))
      gsap.set(q('.op-clock'), soft({ opacity: 0, scale: 1.12, filter: blur(28) }))
      gsap.set(q('.clock-glow'), { opacity: 0 })
      gsap.set(q('.op-bday .split-char'), soft({ yPercent: 115, opacity: 0 }))
      gsap.set(q('.op-guide'), { scaleY: 0, transformOrigin: 'top center' })

      // --- Scroll ile ilerleyen sahne
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=380%',
          pin: true,
          scrub: 1.1,
          anticipatePin: 1,
        },
      })

      tl.to(q('.op-hint'), { opacity: 0, duration: 0.3 }, 0)
        .to(q('.op-first'), soft({ y: -22, opacity: 0.32, duration: 1 }), 0)
        .to(q('.op-second .split-word'), { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.14, ease: 'power2.out' }, 0.25)
        // metinler çekilir, saat belirir (23:59)
        .addLabel('clock', '+=0.5')
        .to(q('.op-lines'), soft({ opacity: 0, y: -40, filter: blur(6), duration: 0.9 }), 'clock')
        .to(q('.op-clock'), { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.3, ease: 'power2.out' }, 'clock+=0.7')
        // gece yarısı: rakamlar sağdan sola döner
        .to(q('.clock-strip'), { yPercent: -50, duration: 0.55, ease: 'power3.inOut', stagger: { each: 0.1, from: 'end' } }, '>+0.15')
        .to(q('.clock-glow'), { opacity: 1, duration: 0.5, ease: 'power2.out' }, '<+0.35')
        .to(q('.op-bloom'), { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' }, '<')
        .to(q('.clock-glow'), { opacity: 0.55, duration: 0.6 }, '>')
        // İyi ki doğdun.
        .addLabel('bday', '+=0.3')
        .to(q('.op-clock'), soft({ scale: 0.62, y: '-9vh', opacity: 0.5, duration: 1.1 }), 'bday')
        .to(q('.op-bday .split-char'), { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.045, ease: 'power3.out' }, 'bday+=0.35')
        .to(q('.op-warm'), { opacity: 1, duration: 1.2 }, 'bday')
        .to(q('.op-dust'), { opacity: 1, duration: 1.2 }, 'bday')
        // kamera aşağı iner: yakın katman hızlı, uzak katman yavaş
        .addLabel('descend', '+=0.7')
        .to(q('.op-content'), soft({ yPercent: -55, duration: 1.7, ease: 'power1.in' }), 'descend')
        .to(q('.op-content'), soft({ opacity: 0, filter: blur(10), duration: 1.1, ease: 'power1.in' }), 'descend+=0.55')
        .to(q('.op-near'), soft({ yPercent: -120, duration: 1.7, ease: 'power1.in' }), 'descend')
        .to(q('.op-far'), soft({ yPercent: -25, duration: 1.7, ease: 'power1.in' }), 'descend')
        .to(q('.op-warm'), { opacity: 0.25, duration: 1.4 }, 'descend+=0.3')
        .to(q('.op-guide'), { scaleY: 1, duration: 1.2, ease: 'power2.inOut' }, 'descend+=0.5')
    },
    { scope: root },
  )

  return (
    <section ref={root} data-chapter="Açılış" className="relative h-svh w-full overflow-hidden bg-night">
      {/* uzak katman: çok hafif toz */}
      <div className="op-far op-dust absolute inset-0 opacity-0">
        <ParticleField count={40} size={[1, 2.6]} speed={0.6} />
      </div>
      {/* alt kenar: sonraki bölümün rengine yumuşak geçiş */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30vh] bg-gradient-to-b from-transparent to-ink" />
      {/* sıcak ışık (İyi ki doğdun anında yükselir) */}
      <div className="op-warm pointer-events-none absolute inset-0 opacity-0 [background:radial-gradient(60%_45%_at_50%_70%,rgba(168,56,46,0.16),transparent_70%),radial-gradient(40%_30%_at_50%_45%,rgba(198,164,106,0.07),transparent_70%)]" />

      <div className="op-content absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* ilk iki cümle */}
        <div className="op-lines absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
          <SplitText
            by="chars"
            text={opening.first}
            className="op-first block font-sans text-[13px] font-light tracking-[0.04em] text-bone/80 md:text-[15px]"
          />
          <SplitText
            text={opening.second}
            className="op-second block font-serif text-[30px] font-light italic leading-tight text-bone md:text-[46px]"
          />
        </div>

        {/* saat */}
        <div className="op-clock relative text-[clamp(5.5rem,24vw,17rem)] text-bone">
          <div className="op-bloom pointer-events-none absolute left-1/2 top-1/2 h-[1.6em] w-[2.6em] -translate-x-1/2 -translate-y-1/2 scale-75 rounded-full opacity-0 [background:radial-gradient(closest-side,rgba(198,164,106,0.16),rgba(168,56,46,0.06)_55%,transparent)]" />
          <Clock from={opening.clockFrom} to={opening.clockTo} />
        </div>

        {/* İyi ki doğdun. */}
        <SplitText
          by="chars"
          mask
          text={opening.birthday}
          as="h1"
          className="op-bday -mt-[4vh] text-center font-serif text-[clamp(2.6rem,9vw,6.5rem)] font-light italic leading-none text-bone"
          charClassName="will-change-transform"
        />
      </div>

      {/* yakın katman: büyük, bulanık ışık lekeleri — iniş sırasında hızlı geçer */}
      <div className="op-near op-dust pointer-events-none absolute inset-0 opacity-0">
        <span className="bokeh left-[8%] top-[78%] h-40 w-40" />
        <span className="bokeh left-[78%] top-[88%] h-56 w-56 [animation-delay:-3s]" />
        <span className="bokeh left-[58%] top-[110%] h-28 w-28 [animation-delay:-6s]" />
        <span className="bokeh left-[22%] top-[125%] h-24 w-24 [animation-delay:-2s]" />
      </div>

      <div className="op-hint absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0">
        <ScrollHint label={opening.scrollHint} />
      </div>

      {/* bir sonraki bölüme uzanan ince çizgi */}
      <span className="op-guide absolute bottom-0 left-1/2 h-[38vh] w-px bg-gradient-to-b from-transparent via-gold/50 to-gold/30" />
    </section>
  )
}
