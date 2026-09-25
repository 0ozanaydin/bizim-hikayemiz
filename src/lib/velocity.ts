import { gsap } from './gsap'

/**
 * Scroll hızını (px / frame) yumuşatılmış şekilde tutar.
 * Lenis olsun olmasın, dokunmatikte de çalışır.
 */
let last = typeof window !== 'undefined' ? window.scrollY : 0
let smooth = 0

if (typeof window !== 'undefined') {
  gsap.ticker.add(() => {
    const y = window.scrollY
    const v = y - last
    last = y
    smooth += (v - smooth) * 0.14
    if (Math.abs(smooth) < 0.01) smooth = 0
  })
}

export const getVelocity = () => smooth
