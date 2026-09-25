import { useEffect, useRef } from 'react'
import { isMobile, reducedMotion, tempo } from '../lib/motion'
import { useInViewRef } from '../lib/useInView'

type ParticleFieldProps = {
  /** Masaüstündeki parçacık sayısı (mobilde otomatik ~%45'e düşer) */
  count?: number
  shape?: 'dot' | 'heart'
  /** drift: her yöne yavaş süzülme · up: aşağıdan yukarı yükselme */
  direction?: 'drift' | 'up'
  colors?: string[]
  /** px cinsinden [min, max] boyut */
  size?: [number, number]
  speed?: number
  /** false olunca parçacıklar yavaşça kaybolur */
  active?: boolean
  className?: string
}

type P = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  a: number
  phase: number
  spin: number
  sprite: number
}

/** Yumuşak ışıklı nokta veya kalp sprite'ı (bir kere çizilip tekrar kullanılır) */
function makeSprite(color: string, shape: 'dot' | 'heart') {
  const s = 64
  const c = document.createElement('canvas')
  c.width = c.height = s
  const g = c.getContext('2d')!
  if (shape === 'dot') {
    const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    grd.addColorStop(0, color)
    grd.addColorStop(0.25, color)
    grd.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, s, s)
  } else {
    g.shadowColor = color
    g.shadowBlur = 10
    g.fillStyle = color
    g.translate(s / 2, s / 2 + 2)
    g.scale(1.1, 1.1)
    g.beginPath()
    g.moveTo(0, 10)
    g.bezierCurveTo(-14, 0, -14, -12, -6, -14)
    g.bezierCurveTo(-2, -15, 0, -12, 0, -9)
    g.bezierCurveTo(0, -12, 2, -15, 6, -14)
    g.bezierCurveTo(14, -12, 14, 0, 0, 10)
    g.fill()
  }
  return c
}

/**
 * Hafif canvas parçacık sistemi.
 * Ekranda değilken çizmeyi durdurur, mobilde parçacık sayısını azaltır,
 * reduced-motion'da sabit (hareketsiz) çizer.
 */
export function ParticleField({
  count = 60,
  shape = 'dot',
  direction = 'drift',
  colors = ['rgba(236,228,216,0.9)', 'rgba(198,164,106,0.9)'],
  size = [1.5, 4],
  speed = 1,
  active = true,
  className = '',
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inView = useInViewRef(canvasRef)
  const activeRef = useRef(active)
  activeRef.current = active

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2)
    const n = Math.round(isMobile ? count * 0.45 : count)
    const sprites = colors.map((c) => makeSprite(c, shape))
    let w = 0
    let h = 0
    let particles: P[] = []
    let fade = 0
    let raf = 0
    let last = performance.now()

    const spawn = (initial: boolean): P => {
      const r = size[0] + Math.random() * (size[1] - size[0])
      const base = direction === 'up' ? 0.25 + Math.random() * 0.35 : 0.04 + Math.random() * 0.12
      return {
        x: Math.random() * w,
        y: direction === 'up' && !initial ? h + 20 + Math.random() * 60 : Math.random() * h,
        vx: (Math.random() - 0.5) * 0.12,
        vy: direction === 'up' ? -base : (Math.random() - 0.5) * 0.08 - 0.02,
        r,
        a: 0.25 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        spin: 0.4 + Math.random() * 0.8,
        sprite: Math.floor(Math.random() * sprites.length),
      }
    }

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      w = Math.max(1, rect?.width ?? window.innerWidth)
      h = Math.max(1, rect?.height ?? window.innerHeight)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = Array.from({ length: n }, () => spawn(true))
    }

    const draw = (t: number, dt: number) => {
      ctx.clearRect(0, 0, w, h)
      if (fade <= 0.001) return
      const k = dt * 0.06 * speed * tempo.value
      for (const p of particles) {
        if (!reducedMotion) {
          p.x += p.vx * k * 16 + Math.sin(t * 0.0004 * p.spin + p.phase) * 0.08 * k * 16
          p.y += p.vy * k * 16
          if (direction === 'up') {
            if (p.y < -30) Object.assign(p, spawn(false))
          } else {
            if (p.y < -10) p.y = h + 10
            if (p.y > h + 10) p.y = -10
          }
          if (p.x < -10) p.x = w + 10
          if (p.x > w + 10) p.x = -10
        }
        // yükselen parçacıklar üst kısma yaklaştıkça solar
        const edge = direction === 'up' ? Math.min(1, p.y / (h * 0.35)) : 1
        const twinkle = 0.65 + 0.35 * Math.sin(t * 0.0012 * p.spin * tempo.value + p.phase)
        ctx.globalAlpha = p.a * twinkle * edge * fade
        const d = p.r * (shape === 'heart' ? 2.2 : 4)
        ctx.drawImage(sprites[p.sprite], p.x - d / 2, p.y - d / 2, d, d)
      }
      ctx.globalAlpha = 1
    }

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(64, t - last)
      last = t
      if (!inView.current || document.hidden) return
      const target = activeRef.current ? 1 : 0
      fade += (target - fade) * 0.02
      draw(t, dt)
    }

    resize()
    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    if (reducedMotion) {
      // Hareket yok: sadece aktifse bir kere sabit çiz
      fade = activeRef.current ? 1 : 0
      draw(0, 16)
    } else {
      raf = requestAnimationFrame(loop)
    }
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, shape, direction, speed, reducedMotion ? active : null])

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none absolute inset-0 ${className}`} />
}
