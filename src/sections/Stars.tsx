import { useEffect, useRef } from 'react'
import { stars as content } from '../data/content'
import { gsap, useGSAP } from '../lib/gsap'
import { blur, clamp, isMobile, reducedMotion, smoothstep, soft, tempo } from '../lib/motion'
import { getVelocity } from '../lib/velocity'
import { useInViewRef } from '../lib/useInView'
import { SplitText } from '../components/SplitText'

type Star = {
  x: number // 0..1
  y: number // 0..1 (ekranın 1.4 katı yükseklikte döngü)
  r: number
  depth: number // 0.2 (uzak) .. 1 (yakın)
  th: number // görünmeye başladığı scroll ilerlemesi
  phase: number
  tw: number
  warm: boolean
}

/** Kalp eğrisinden eşit aralıklı noktalar */
function heartPoints(k: number) {
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i < k; i++) {
    const t = (i / k) * Math.PI * 2
    const x = 16 * Math.sin(t) ** 3
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    pts.push({ x: x / 16, y: -(y + 2.5) / 16 })
  }
  return pts
}

/** Yazıdan (baş harfler vb.) nokta örnekler */
function textPoints(text: string, k: number) {
  const c = document.createElement('canvas')
  c.width = 600
  c.height = 220
  const g = c.getContext('2d')!
  g.fillStyle = '#fff'
  g.font = 'italic 300 170px "Cormorant Garamond", Georgia, serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(text, 300, 115)
  const data = g.getImageData(0, 0, 600, 220).data
  const all: { x: number; y: number }[] = []
  for (let y = 0; y < 220; y += 5) {
    for (let x = 0; x < 600; x += 5) {
      if (data[(y * 600 + x) * 4 + 3] > 128) all.push({ x: (x - 300) / 300, y: (y - 110) / 300 })
    }
  }
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return all.slice(0, k)
}

/** İki yıldızın izlediği eğri (quadratic bezier) */
const bez = (a: number, c: number, b: number, t: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b

function makeGlow(inner: string) {
  const s = 128
  const c = document.createElement('canvas')
  c.width = c.height = s
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  grd.addColorStop(0, inner)
  grd.addColorStop(0.12, inner)
  grd.addColorStop(0.35, 'rgba(198,164,106,0.25)')
  grd.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, s, s)
  return c
}

/**
 * 6. YILDIZLAR / GECE
 * Scroll ilerledikçe yıldızlar belirir (3 derinlik katmanı, parallax).
 * İki parlak yıldız farklı yönlerden gelip ortada buluşur,
 * ardından bazı yıldızlar çok hafifçe bir kalp (veya baş harfler) oluşturur.
 */
export function Stars() {
  const root = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progress = useRef({ p: 0 })
  const inView = useInViewRef(root)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      gsap.set(q('.sk-first .split-word, .sk-second .split-word'), soft({ opacity: 0, y: 14, filter: blur(10) }))

      gsap
        .timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=420%',
            pin: true,
            scrub: 1.2,
            anticipatePin: 1,
          },
        })
        .to(progress.current, { p: 1, duration: 10, ease: 'none' }, 0)
        .to(q('.sk-haze'), { opacity: 1, duration: 4, ease: 'none' }, 0.5)
        .to(q('.sk-first .split-word'), { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.25 }, 1.3)
        .to(q('.sk-first'), soft({ opacity: 0, y: -24, filter: blur(8), duration: 0.9, ease: 'power2.in' }), 4.6)
        .to(q('.sk-second .split-word'), { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.25 }, 5.7)
    },
    { scope: root },
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2)
    const N = isMobile ? 230 : 540
    const K = isMobile ? 38 : 66
    const glowWarm = makeGlow('rgba(255,236,214,1)')
    const glowCool = makeGlow('rgba(236,228,216,0.9)')

    const field: Star[] = Array.from({ length: N }, () => {
      const depth = [0.25, 0.5, 1][Math.floor(Math.random() * 3)]
      return {
        x: Math.random(),
        y: Math.random(),
        r: (0.35 + Math.random() * 0.9) * (0.6 + depth * 0.7),
        depth,
        th: Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        tw: 0.5 + Math.random() * 1.5,
        warm: Math.random() < 0.12,
      }
    })
    // Şekli oluşturacak yıldızlar (yakın katmanda)
    const formers: Star[] = Array.from({ length: K }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.7 + Math.random() * 0.6,
      depth: 0.9,
      th: 0.1 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      tw: 0.6 + Math.random(),
      warm: Math.random() < 0.3,
    }))
    const targets =
      content.formation === 'heart' ? heartPoints(K) : textPoints(content.formation.text, K)
    while (targets.length < K) targets.push(targets[targets.length % Math.max(1, targets.length)] ?? { x: 0, y: 0 })

    let W = 0
    let H = 0
    let raf = 0
    let smoothP = 0
    let clock = 0
    let last = performance.now()

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect()
      W = rect.width
      H = rect.height
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const project = (s: Star, p: number, t: number) => {
      const span = H * 1.4
      let y = (s.y * span - p * H * 0.55 * s.depth - t * 0.004 * s.depth) % span
      if (y < 0) y += span
      return { x: s.x * W + Math.sin(t * 0.0003 + s.phase) * 3 * s.depth, y: y - H * 0.2 }
    }

    const draw = (t: number) => {
      const p = smoothP
      const v = reducedMotion ? 0 : clamp(getVelocity(), -60, 60)
      ctx.clearRect(0, 0, W, H)

      // --- arka plan yıldızları
      for (const s of field) {
        const appear = clamp((p - s.th) / 0.12, 0, 1)
        if (appear <= 0) continue
        const { x, y } = project(s, p, t)
        const tw = 0.55 + 0.45 * Math.sin(t * 0.001 * s.tw * tempo.value + s.phase)
        ctx.globalAlpha = appear * tw * (0.35 + s.depth * 0.6)
        ctx.fillStyle = s.warm ? '#f3d9b8' : '#ece4d8'
        const streak = Math.abs(v) * s.depth * 0.5
        if (streak > 1.2) {
          ctx.fillRect(x - s.r * 0.5, y - (v > 0 ? 0 : streak), s.r, streak)
        } else if (s.r < 0.9) {
          ctx.fillRect(x, y, s.r * 1.4, s.r * 1.4)
        } else {
          ctx.beginPath()
          ctx.arc(x, y, s.r, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // --- buluşma noktası
      const M = { x: W * 0.5, y: H * (isMobile ? 0.33 : 0.36) }
      const R = Math.min(W, H) * (isMobile ? 0.15 : 0.13)

      // --- şekil oluşturan yıldızlar
      const f = smoothstep(0.74, 0.96, p)
      formers.forEach((s, i) => {
        const appear = clamp((p - s.th) / 0.12, 0, 1)
        if (appear <= 0) return
        const a = project(s, p, t)
        const tg = targets[i]
        const x = a.x + (M.x + tg.x * R - a.x) * f
        const y = a.y + (M.y + tg.y * R - a.y) * f
        const tw = 0.6 + 0.4 * Math.sin(t * 0.0012 * s.tw * tempo.value + s.phase)
        ctx.globalAlpha = appear * tw * (0.55 + f * 0.3)
        ctx.fillStyle = s.warm ? '#f0c9a8' : '#ece4d8'
        ctx.beginPath()
        ctx.arc(x, y, s.r * (1 + f * 0.25), 0, Math.PI * 2)
        ctx.fill()
      })

      // --- iki yol: iki yıldız farklı yönlerden gelip buluşur
      const travel = smoothstep(0.28, 0.7, p)
      const vis = smoothstep(0.18, 0.3, p)
      if (vis > 0) {
        const paths = [
          { a: { x: W * 0.08, y: H * 0.16 }, c: { x: W * 0.28, y: H * 0.62 } },
          { a: { x: W * 0.92, y: H * 0.7 }, c: { x: W * 0.74, y: H * 0.08 } },
        ]
        paths.forEach(({ a, c }, idx) => {
          // iz
          const steps = 26
          const from = Math.max(0, travel - 0.4)
          for (let i = 0; i < steps; i++) {
            const tt = from + ((travel - from) * i) / steps
            ctx.globalAlpha = vis * (i / steps) * 0.35
            ctx.fillStyle = idx ? '#ece4d8' : '#f3d9b8'
            ctx.fillRect(bez(a.x, c.x, M.x, tt), bez(a.y, c.y, M.y, tt), 1.2, 1.2)
          }
          const x = bez(a.x, c.x, M.x, travel)
          const y = bez(a.y, c.y, M.y, travel)
          const size = (isMobile ? 26 : 34) * (1 - smoothstep(0.9, 1, travel) * 0.5)
          ctx.globalAlpha = vis * (1 - smoothstep(0.96, 1, travel))
          ctx.drawImage(idx ? glowCool : glowWarm, x - size / 2, y - size / 2, size, size)
        })
        // buluştuklarında tek ve daha sıcak bir ışık
        const met = smoothstep(0.95, 1, travel)
        if (met > 0) {
          const pulse = 1 + Math.sin(t * 0.0016 * tempo.value) * 0.08
          const size = (isMobile ? 44 : 58) * pulse * (0.7 + met * 0.3)
          ctx.globalAlpha = met
          ctx.drawImage(glowWarm, M.x - size / 2, M.y - size / 2, size, size)
        }
      }
      ctx.globalAlpha = 1
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(64, now - last)
      last = now
      if (!inView.current || document.hidden) return
      clock += dt * tempo.value
      smoothP += (progress.current.p - smoothP) * 0.12
      draw(clock)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement!)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [inView])

  return (
    <section ref={root} data-chapter="Gece" className="relative h-svh overflow-hidden bg-night">
      <div className="sk-haze pointer-events-none absolute inset-0 opacity-0 [background:radial-gradient(90%_60%_at_50%_36%,rgba(198,164,106,0.035),transparent_75%),radial-gradient(90%_60%_at_20%_110%,rgba(92,22,32,0.18),transparent_70%)]" />
      <div className="absolute inset-0">
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0" />
      </div>
      <div className="relative flex h-full items-end justify-center px-6 pb-[26svh] text-center md:pb-[24svh]">
        <div className="relative grid place-items-center">
          <SplitText
            as="p"
            text={content.first}
            className="sk-first col-start-1 row-start-1 block font-serif text-[clamp(1.9rem,5vw,4rem)] font-light italic leading-tight text-bone"
          />
          <SplitText
            as="p"
            text={content.second}
            className="sk-second col-start-1 row-start-1 block font-serif text-[clamp(1.9rem,5vw,4rem)] font-light leading-tight text-bone"
          />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[20vh] bg-gradient-to-b from-transparent to-ink" />
    </section>
  )
}
