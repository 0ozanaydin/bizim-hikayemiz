import { useRef } from 'react'
import { realization } from '../data/content'
import { gsap, useGSAP } from '../lib/gsap'
import { blur, soft } from '../lib/motion'
import { SplitText } from '../components/SplitText'
import { ParticleField } from '../components/ParticleField'

/**
 * 4. DUYGUSAL GEÇİŞ
 * Arka plan giderek kararır, ışık parçacıkları belirir,
 * kelimeler tek tek ortaya çıkar.
 */
export function Realization() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      gsap.set(q('.re-first .split-word, .re-second .split-word'), soft({ opacity: 0, y: 18, filter: blur(12) }))

      gsap
        .timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=320%',
            pin: true,
            scrub: 1.2,
            anticipatePin: 1,
          },
        })
        .to(q('.re-dark'), { opacity: 1, duration: 1.4, ease: 'none' }, 0)
        .to(q('.re-particles'), { opacity: 1, duration: 1.6, ease: 'none' }, 0.3)
        .to(q('.re-first .split-word'), { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.35 }, 0.6)
        .to({}, { duration: 0.8 })
        .to(q('.re-first'), soft({ opacity: 0.28, y: -28, scale: 0.94, duration: 1 }), '>')
        .to(q('.re-second .split-word'), { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.3 }, '<+0.2')
        .to(q('.re-second [data-emph]'), { color: '#d4a18a', textShadow: '0 0 28px rgba(168,56,46,0.55)', duration: 0.8 }, '>-0.4')
        .to({}, { duration: 1 })
        .to(q('.re-text'), soft({ opacity: 0, y: -30, filter: blur(10), duration: 1.2, ease: 'power1.in' }), '>')
        .to(q('.re-particles'), { opacity: 0.35, duration: 1.2 }, '<')
    },
    { scope: root },
  )

  return (
    <section ref={root} data-chapter="Fark ediş" className="relative h-svh overflow-hidden">
      <div className="re-dark pointer-events-none absolute inset-0 bg-night opacity-0" />
      <div className="re-particles absolute inset-0 opacity-0">
        <ParticleField
          count={70}
          size={[1.2, 3.4]}
          speed={0.8}
          colors={['rgba(236,228,216,0.9)', 'rgba(198,164,106,0.95)', 'rgba(210,120,100,0.8)']}
        />
      </div>
      <div className="re-text relative flex h-full flex-col items-center justify-center gap-8 px-6 text-center">
        <SplitText
          as="p"
          text={realization.first}
          className="re-first block font-serif text-[clamp(2.2rem,6vw,4.8rem)] font-light italic leading-tight text-bone"
        />
        <SplitText
          as="p"
          text={realization.second}
          emphasis={realization.emphasis}
          className="re-second block max-w-[20ch] font-serif text-[clamp(1.9rem,5vw,4rem)] font-light leading-[1.15] text-bone md:max-w-[24ch]"
          emphasisClassName="italic"
        />
      </div>
    </section>
  )
}
