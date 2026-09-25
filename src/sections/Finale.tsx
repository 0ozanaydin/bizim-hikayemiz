import { useRef, useState } from 'react'
import { finale, site } from '../data/content'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { blur, reducedMotion, soft, tempo } from '../lib/motion'
import { scrollToTop, setScrollCalm } from '../lib/smoothScroll'
import { Envelope } from '../components/Envelope'
import { ParticleField } from '../components/ParticleField'
import { SplitText } from '../components/SplitText'

/**
 * 8. FİNAL
 * Her şey yavaşlar (partiküller, scroll yumuşaklığı). Ortada bir zarf süzülür.
 * Tıklanınca mühür kırılır, kapak açılır, kağıt çıkar ve mektup okunur hale gelir.
 * Son olarak çok hafif kalp / ışık parçacıkları yükselir.
 */
export function Finale() {
  const root = useRef<HTMLElement>(null)
  const envRef = useRef<HTMLButtonElement>(null)
  const [opened, setOpened] = useState(false)
  const [hearts, setHearts] = useState(false)
  const introTl = useRef<gsap.core.Timeline | null>(null)

  const { contextSafe } = useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const dawn = document.getElementById('bd-dawn')

      // Ekran sakinleşir: şafak ışığı kısılır
      if (dawn) {
        gsap.fromTo(
          dawn,
          { opacity: 1 },
          {
            opacity: 0.3,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 20%', scrub: true },
          },
        )
      }

      // Bütün animasyonlar yavaşlar
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top 65%',
        onEnter: () => {
          gsap.to(tempo, { value: 0.35, duration: 3, ease: 'sine.out' })
          setScrollCalm(true)
        },
        onLeaveBack: () => {
          gsap.to(tempo, { value: 1, duration: 1.5 })
          setScrollCalm(false)
        },
      })

      introTl.current = gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: 'top 80%', end: 'top 15%', scrub: 1.5 } })
        .from(q('.fn-intro .split-word'), soft({ opacity: 0, y: 14, filter: blur(8), stagger: 0.12, duration: 0.8 }))
        .from(q('.fn-env'), soft({ opacity: 0, y: 60, scale: 0.9, duration: 1.2, ease: 'power2.out' }), 0.3)
        .from(q('.fn-hint'), { opacity: 0, duration: 0.6 }, 1)

      // zarfın sakin süzülmesi
      if (!reducedMotion) {
        const float = gsap.to(q('.fn-float'), { y: -10, rotation: 0.6, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 })
        const syncTempo = () => {
          float.timeScale(Math.max(0.4, tempo.value))
        }
        gsap.ticker.add(syncTempo)
        return () => gsap.ticker.remove(syncTempo)
      }
    },
    { scope: root },
  )

  const open = contextSafe(() => {
    if (opened) return
    setOpened(true)
    const q = gsap.utils.selector(root)
    const env = envRef.current!
    const part = (s: string) => env.querySelector(s)

    // giriş animasyonunu tamamlanmış halde sabitle (geri scroll'da zarf tekrar görünmesin)
    if (introTl.current) {
      introTl.current.scrollTrigger?.kill()
      introTl.current.progress(1).kill()
    }

    gsap
      .timeline({ defaults: { ease: 'power2.inOut' } })
      .set(part('.env-flap'), { transition: 'none', zIndex: 4 })
      .set(part('.env-seal'), { zIndex: 5 })
      .set(part('.env-front'), { zIndex: 3 })
      .to(part('.env-seal'), { scale: 1.12, duration: 0.25, ease: 'power2.out' })
      .to(part('.env-seal'), { scale: 0, opacity: 0, duration: 0.4, ease: 'back.in(2)' })
      .to(q('.fn-hint'), { opacity: 0, duration: 0.4 }, '<')
      .to(part('.env-flap'), { rotationX: 180, duration: 1.2 }, '-=0.1')
      .set(part('.env-flap'), { zIndex: 1 }, '-=0.6')
      .set(part('.env-paper'), { zIndex: 2 }, '<')
      .to(part('.env-paper'), { yPercent: -58, duration: 1.2, ease: 'power3.out' }, '-=0.25')
      .to(q('.fn-env'), { ...soft({ y: 70, scale: 0.92 }), opacity: 0, duration: 1, ease: 'power2.in' }, '+=0.35')
      .to(q('.fn-intro'), { opacity: 0, duration: 0.8 }, '<')
      .fromTo(
        q('.fn-letter'),
        { autoAlpha: 0, ...soft({ y: 50, scale: 0.94 }) },
        { autoAlpha: 1, y: 0, scale: 1, duration: 1.5, ease: 'power3.out' },
        '-=0.35',
      )
      .from(q('.fn-line'), { ...soft({ y: 14, filter: blur(8) }), opacity: 0, stagger: 0.7, duration: 1.4, ease: 'power2.out' }, '-=0.7')
      .from(q('.fn-signature'), { ...soft({ x: -12 }), opacity: 0, duration: 1.4, ease: 'power2.out' }, '+=0.2')
      .add(() => setHearts(true), '-=1')
      .to(q('.fn-replay'), { autoAlpha: 1, duration: 1.2 }, '+=0.6')
  })

  return (
    <section ref={root} data-chapter="Mektup" className="relative min-h-svh overflow-hidden">
      <ParticleField count={30} size={[1, 2.4]} speed={0.5} className="opacity-60" />
      <ParticleField
        count={26}
        shape="heart"
        direction="up"
        size={[4, 9]}
        speed={0.55}
        active={hearts}
        colors={['rgba(168,56,46,0.75)', 'rgba(198,164,106,0.7)', 'rgba(236,228,216,0.45)']}
      />

      <div className="relative grid min-h-svh place-items-center px-5 py-[14svh]">
        {/* zarf */}
        <div className="col-start-1 row-start-1 flex flex-col items-center gap-12">
          <SplitText
            as="p"
            text={finale.intro}
            className="fn-intro block text-center font-serif text-[clamp(1.6rem,4vw,2.8rem)] font-light italic text-bone/85"
          />
          <div className="fn-env">
            <div className="fn-float">
              <Envelope ref={envRef} sealLetter={site.sealLetter} onOpen={open} disabled={opened} />
            </div>
          </div>
          <p className="fn-hint font-sans text-[10px] uppercase tracking-label text-bone/45">
            <span className="hint-pulse inline-block">{finale.hint}</span>
          </p>
        </div>

        {/* mektup */}
        <article
          className="fn-letter paper-texture invisible relative col-start-1 row-start-1 w-[min(88vw,540px)] rounded-[2px] bg-paper px-8 py-12 text-inkbrown opacity-0 shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)] md:px-14 md:py-16"
          aria-live="polite"
        >
          <div className="flex flex-col gap-5">
            {finale.letter.map((line, i) =>
              line === '' ? (
                <span key={i} className="fn-line block h-2" />
              ) : (
                <p key={i} className="fn-line font-serif text-[clamp(1.45rem,4.6vw,2.05rem)] font-normal italic leading-[1.3]">
                  {line}
                </p>
              ),
            )}
          </div>
          <p className="fn-signature mt-12 text-right font-serif text-[clamp(1.3rem,3.8vw,1.7rem)] italic text-wine">{finale.signature}</p>
        </article>
      </div>

      <div className="fn-replay invisible absolute inset-x-0 bottom-10 flex justify-center opacity-0">
        <button
          type="button"
          onClick={scrollToTop}
          className="font-sans text-[10px] uppercase tracking-label text-bone/40 transition-colors duration-500 hover:text-gold"
        >
          ↺ {finale.replay}
        </button>
      </div>
    </section>
  )
}
