const mq = (q: string) => typeof window !== 'undefined' && window.matchMedia(q).matches

/** Kullanıcı işletim sisteminde "hareketi azalt" seçtiyse true */
export const reducedMotion = mq('(prefers-reduced-motion: reduce)')
/** Telefon / dokunmatik cihaz */
export const isMobile = mq('(max-width: 767px)') || mq('(pointer: coarse)')
export const hasFinePointer = mq('(pointer: fine)')

/** Blur miktarını cihaza göre ayarlar (mobilde daha az, reduced-motion'da hiç) */
export const blur = (px: number) =>
  reducedMotion ? 'blur(0px)' : `blur(${Math.round(isMobile ? px * 0.55 : px)}px)`

const MOTION_KEYS = [
  'x', 'y', 'xPercent', 'yPercent', 'scale', 'scaleX', 'scaleY',
  'rotate', 'rotation', 'rotationX', 'rotationY', 'skewX', 'skewY', 'filter', 'letterSpacing',
] as const

/**
 * reduced-motion açıksa hareket içeren değerleri atar, sadece opacity geçişi kalır.
 * Dekoratif giriş animasyonlarını bununla sar.
 */
export function soft<T extends gsap.TweenVars>(vars: T): T {
  if (!reducedMotion) return vars
  const copy: Record<string, unknown> = { ...vars }
  MOTION_KEYS.forEach((k) => delete copy[k])
  return copy as T
}

/**
 * Global "tempo". Finalde 1'den ~0.3'e iner; partiküller ve yıldızlar bununla yavaşlar.
 */
export const tempo = { value: 1 }

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
