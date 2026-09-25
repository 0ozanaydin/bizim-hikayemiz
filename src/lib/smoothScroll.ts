import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'
import { reducedMotion } from './motion'

let lenis: Lenis | null = null
const BASE_LERP = 0.085

/** Lenis'i başlatır ve GSAP ticker'a bağlar. Temizleme fonksiyonu döner. */
export function initSmoothScroll() {
  if (reducedMotion) return () => {}

  lenis = new Lenis({
    lerp: BASE_LERP,
    wheelMultiplier: 0.9,
    smoothWheel: true,
    // Dokunmatikte doğal iOS scroll'u korunur (daha stabil)
    syncTouch: false,
  })

  lenis.on('scroll', ScrollTrigger.update)
  const raf = (time: number) => lenis?.raf(time * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(raf)
    lenis?.destroy()
    lenis = null
  }
}

export const getLenis = () => lenis

/** Final bölümünde scroll'u daha da "ağır" ve sakin yapmak için */
export function setScrollCalm(calm: boolean) {
  if (lenis) lenis.options.lerp = calm ? 0.045 : BASE_LERP
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo(0, 0)
}
