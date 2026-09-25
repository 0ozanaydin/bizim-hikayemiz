import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { hasFinePointer, reducedMotion } from '../lib/motion'

/** Masaüstünde fareyi yavaşça takip eden çok hafif sıcak ışık */
export function CursorLight() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !hasFinePointer || reducedMotion) return
    const xTo = gsap.quickTo(el, 'x', { duration: 1.4, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 1.4, ease: 'power3.out' })
    gsap.set(el, { x: window.innerWidth / 2, y: window.innerHeight / 2 })
    const onMove = (e: PointerEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
      el.style.opacity = '1'
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  if (!hasFinePointer) return null
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[50] -ml-[320px] -mt-[320px] h-[640px] w-[640px] rounded-full opacity-0 mix-blend-screen transition-opacity duration-1000 [background:radial-gradient(circle,rgba(198,164,106,0.07)_0%,rgba(168,56,46,0.035)_35%,transparent_70%)]"
    />
  )
}
