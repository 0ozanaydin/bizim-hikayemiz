import { useState } from 'react'
import { refreshSoon } from '../lib/refresh'

type PhotoProps = {
  src: string
  alt?: string
  /** img elementine eklenecek class'lar (boyutlandırma burada yapılır) */
  className?: string
  /** Fotoğraf bulunamazsa gösterilen yer tutucunun class'ları */
  fallbackClassName?: string
  eager?: boolean
}

/**
 * Fotoğraf: lazy-load, kırpmasız (doğal oran), yüklenince ScrollTrigger'ı yeniler.
 * Dosya yoksa şık bir yer tutucu gösterir ve hangi dosyanın eksik olduğunu yazar.
 */
export function Photo({ src, alt = '', className = '', fallbackClassName = '', eager = false }: PhotoProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={`photo-fallback relative flex items-end overflow-hidden bg-gradient-to-br from-[#221715] via-[#140e0d] to-[#0c0908] ${fallbackClassName}`}
      >
        <div className="absolute inset-0 opacity-40 [background:radial-gradient(60%_50%_at_30%_30%,rgba(198,164,106,0.25),transparent_70%)]" />
        <span className="relative m-4 font-sans text-[10px] uppercase tracking-label text-bone/40">
          {src.replace(/^\//, 'public/')}
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      onLoad={refreshSoon}
      onError={() => {
        setFailed(true)
        refreshSoon()
      }}
      className={`block select-none ${className}`}
    />
  )
}
