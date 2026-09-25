import { useEffect, useRef, useState } from 'react'
import { music } from '../data/content'

type State = 'idle' | 'playing' | 'paused' | 'unavailable'

/**
 * Arka plan müziği.
 * - Tarayıcı izin verirse otomatik başlamayı dener.
 * - İzin vermezse sağ üstte minimal "♪ Müziği aç" butonu çıkar.
 * - Ses Web Audio API ile (GainNode) yavaşça açılır; iOS'ta da ses seviyesi çalışır.
 * - Müzik dosyası yoksa buton hiç görünmez.
 */
export function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const [state, setState] = useState<State>('idle')

  useEffect(() => {
    const audio = new Audio()
    audio.src = music.src
    audio.loop = true
    audio.preload = 'metadata'
    audioRef.current = audio

    const onError = () => {
      console.info(`[müzik] ${music.src} bulunamadı. public${music.src} konumuna bir mp3 koy.`)
      setState('unavailable')
    }
    audio.addEventListener('error', onError)

    // Otomatik oynatmayı sessizce dene (çoğu tarayıcı engeller, sorun değil)
    audio.volume = music.volume
    audio
      .play()
      .then(() => setState('playing'))
      .catch(() => {
        /* buton gösterilecek */
      })

    return () => {
      audio.removeEventListener('error', onError)
      audio.pause()
      audio.src = ''
      ctxRef.current?.close().catch(() => {})
      ctxRef.current = null
      gainRef.current = null
    }
  }, [])

  const ensureGraph = () => {
    const audio = audioRef.current
    if (!audio || ctxRef.current) return
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    const ctx = new AC()
    const source = ctx.createMediaElementSource(audio)
    const gain = ctx.createGain()
    gain.gain.value = 0
    source.connect(gain).connect(ctx.destination)
    audio.volume = 1
    ctxRef.current = ctx
    gainRef.current = gain
  }

  const fadeTo = (value: number, seconds: number) => {
    const ctx = ctxRef.current
    const gain = gainRef.current
    if (!ctx || !gain) return
    const now = ctx.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(gain.gain.value, now)
    gain.gain.linearRampToValueAtTime(value, now + seconds)
  }

  const play = async () => {
    const audio = audioRef.current
    if (!audio) return
    try {
      ensureGraph()
      await ctxRef.current?.resume()
      await audio.play()
      fadeTo(music.volume, music.fadeInSeconds)
      setState('playing')
    } catch {
      setState('unavailable')
    }
  }

  const pause = () => {
    const audio = audioRef.current
    if (!audio) return
    if (gainRef.current) {
      fadeTo(0, 1.2)
      window.setTimeout(() => audio.pause(), 1250)
    } else {
      audio.pause()
    }
    setState('paused')
  }

  if (state === 'unavailable') return null

  const playing = state === 'playing'
  return (
    <button
      type="button"
      onClick={playing ? pause : play}
      aria-label={playing ? 'Müziği kapat' : 'Müziği aç'}
      className={`music-toggle fixed right-4 top-4 z-[70] flex items-center gap-2 rounded-full border px-4 py-2 font-sans text-[10px] uppercase tracking-[0.28em] backdrop-blur-sm transition-all duration-700 md:right-8 md:top-7 ${
        playing
          ? 'border-transparent bg-transparent text-bone/40 hover:text-bone/80'
          : 'border-bone/15 bg-black/20 text-bone/70 hover:border-gold/40 hover:text-bone'
      }`}
    >
      {playing ? (
        <span className="flex h-3 items-end gap-[3px]" aria-hidden>
          <span className="eq-bar" />
          <span className="eq-bar [animation-delay:-0.4s]" />
          <span className="eq-bar [animation-delay:-0.8s]" />
        </span>
      ) : (
        <>
          <span aria-hidden className="text-[12px] tracking-normal text-gold/80">♪</span>
          <span>Müziği aç</span>
        </>
      )}
    </button>
  )
}
