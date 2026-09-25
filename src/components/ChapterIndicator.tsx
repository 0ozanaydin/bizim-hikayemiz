import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from '../lib/gsap'

/**
 * Sol altta küçük bölüm göstergesi: "03 — Anılar"
 * [data-chapter] özniteliği olan section'ları otomatik bulur.
 */
export function ChapterIndicator() {
  const [index, setIndex] = useState(0)
  const [names, setNames] = useState<string[]>([])
  const [visible, setVisible] = useState(false)
  const lastIndex = useRef(0)

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'))
    setNames(sections.map((s) => s.dataset.chapter ?? ''))

    const triggers = sections.map((section, i) =>
      ScrollTrigger.create({
        // Sabitlenen (pin) bölümlerde ölçüyü pin-spacer'dan al ki tüm sabitlenme süresini kapsasın
        trigger: section.parentElement?.classList.contains('pin-spacer') ? section.parentElement : section,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          if (self.isActive && lastIndex.current !== i) {
            lastIndex.current = i
            setIndex(i)
          }
        },
      }),
    )
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      triggers.forEach((t) => t.kill())
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  if (!names.length) return null
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed bottom-5 left-5 z-[70] flex items-center gap-3 font-sans text-[10px] uppercase tracking-label text-bone/45 transition-opacity duration-1000 md:bottom-8 md:left-8 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <span className="tabular-nums text-gold/70">{String(index + 1).padStart(2, '0')}</span>
      <span className="h-px w-6 bg-bone/25" />
      <span key={index} className="chapter-name">
        {names[index]}
      </span>
    </div>
  )
}
