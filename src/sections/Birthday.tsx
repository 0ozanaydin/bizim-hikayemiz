import { useRef } from 'react'
import { birthday } from '../data/content'
import { gsap, useGSAP } from '../lib/gsap'
import { blur, reducedMotion, soft } from '../lib/motion'
import { SplitText } from '../components/SplitText'
import { ParticleField } from '../components/ParticleField'

/**
 * 7. DOĞUM GÜNÜ
 * Gece biter, arka plan yavaşça "şafak" gibi aydınlanır.
 * Büyük "İYİ Kİ DOĞDUN" harf harf yükselir, üzerinden yavaş bir ışık geçer.
 * Devamında kişisel mesaj, okundukça kelime kelime aydınlanır.
 */
export function Birthday() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const dawn = document.getElementById('bd-dawn')

      gsap.set(q('.bd-title .split-char'), soft({ yPercent: 115, opacity: 0, filter: blur(10) }))

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: q('.bd-stage')[0],
          start: 'top top',
          end: '+=230%',
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
        },
      })

      if (dawn) tl.fromTo(dawn, { opacity: 0 }, { opacity: 1, duration: 2.2, ease: 'none' }, 0)
      tl.fromTo(q('.bd-sun'), soft({ yPercent: 30, scale: 0.7, opacity: 0 }), { yPercent: 0, scale: 1, opacity: 1, duration: 2.4, ease: 'power1.out' }, 0)
        .from(q('.bd-date'), soft({ opacity: 0, y: 12, letterSpacing: '0.6em', duration: 0.6 }), 0.8)
        .to(q('.bd-title .split-char'), { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, stagger: 0.07, ease: 'power3.out' }, 1)
        .from(q('.bd-title'), soft({ letterSpacing: '0.28em', duration: 1.8, ease: 'power2.out' }), 1)
        .from(q('.bd-sub .split-word'), soft({ opacity: 0, y: 16, filter: blur(8), stagger: 0.12, duration: 0.7 }), 2.2)
        .from(q('.bd-motes'), { opacity: 0, duration: 1 }, 2.2)
        .to({}, { duration: 0.8 })

      // başlığın üzerinden geçen yavaş ışık (scroll'dan bağımsız, sürekli ama sakin)
      if (!reducedMotion) {
        gsap.fromTo(
          q('.bd-title'),
          { '--sheen': '130%' },
          { '--sheen': '-60%', duration: 3.6, ease: 'sine.inOut', repeat: -1, repeatDelay: 3.2 },
        )
      }

      // mesaj: okundukça kelimeler aydınlanır
      q('.bd-paragraph').forEach((p) => {
        gsap.fromTo(
          p.querySelectorAll('.split-word'),
          { opacity: 0.12 },
          {
            opacity: 1,
            stagger: 0.05,
            ease: 'none',
            scrollTrigger: { trigger: p, start: 'top 82%', end: 'bottom 55%', scrub: true },
          },
        )
      })
      gsap.from(q('.bd-msg-head > *'), {
        ...soft({ opacity: 0, y: 20 }),
        opacity: 0,
        stagger: 0.15,
        scrollTrigger: { trigger: q('.bd-msg-head')[0], start: 'top 85%', end: 'top 55%', scrub: true },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} data-chapter="Doğum günü" className="relative">
      <div className="bd-stage relative flex h-svh flex-col items-center justify-center overflow-hidden px-4 text-center">
        <div className="pointer-events-none absolute inset-0 [-webkit-mask-image:linear-gradient(to_bottom,#000_55%,transparent_98%)] [mask-image:linear-gradient(to_bottom,#000_55%,transparent_98%)]">
          <div className="bd-sun absolute left-1/2 top-[58%] h-[120vmax] w-[120vmax] -translate-x-1/2 rounded-full opacity-0 [background:radial-gradient(closest-side,rgba(233,170,120,0.2),rgba(168,56,46,0.12)_40%,rgba(92,22,32,0.06)_65%,transparent)]" />
        </div>
        <div className="bd-motes absolute inset-0">
          <ParticleField count={36} direction="up" size={[1.2, 3]} speed={0.5} colors={['rgba(243,217,184,0.9)', 'rgba(198,164,106,0.9)']} />
        </div>

        {birthday.dateLabel && (
          <p className="bd-date relative mb-8 font-sans text-[10px] uppercase tracking-label text-gold/80">{birthday.dateLabel}</p>
        )}
        <SplitText
          as="h2"
          by="chars"
          mask
          text={birthday.title}
          className="bd-title sheen-text relative block font-serif text-[clamp(3rem,12.5vw,11.5rem)] font-light leading-[0.95] tracking-[0.04em]"
          wordClassName="mx-[0.12em]"
        />
        <SplitText
          as="p"
          text={birthday.subtitle}
          className="bd-sub relative mt-10 block font-serif text-[clamp(1.4rem,3vw,2.2rem)] italic text-bone/80"
        />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 pb-[30vh] pt-[18vh] md:px-8">
        <div className="bd-msg-head mb-14 flex flex-col items-center gap-5 text-center">
          <span className="h-10 w-px bg-gradient-to-b from-transparent to-gold/60" />
          <p className="font-sans text-[10px] uppercase tracking-label text-gold/70">{birthday.messageEyebrow}</p>
        </div>
        <div className="flex flex-col gap-10">
          {birthday.message.map((para, i) => (
            <SplitText
              key={i}
              as="p"
              text={para}
              className={`bd-paragraph block font-serif font-light leading-[1.5] text-bone ${
                i === 0 ? 'text-[clamp(1.6rem,3.4vw,2.5rem)] italic' : 'text-[clamp(1.25rem,2.4vw,1.8rem)]'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
