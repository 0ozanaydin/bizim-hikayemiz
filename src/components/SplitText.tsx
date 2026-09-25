import { type CSSProperties, type ElementType } from 'react'

type SplitTextProps = {
  text: string
  /** 'words' → kelime kelime, 'chars' → harf harf span üretir */
  by?: 'words' | 'chars'
  /** Her kelimeyi overflow:hidden bir maskeye sarar (aşağıdan yukarı mask reveal için) */
  mask?: boolean
  as?: ElementType
  className?: string
  wordClassName?: string
  charClassName?: string
  /** Vurgulanacak kelimeler (noktalama ve büyük/küçük harf fark etmez) */
  emphasis?: string[]
  emphasisClassName?: string
  style?: CSSProperties
}

const normalize = (w: string) => w.toLocaleLowerCase('tr').replace(/[.,!?…“”"'’:;]/g, '')

/**
 * Metni animasyon için kelime/harf span'lerine böler.
 * Ekran okuyucular için tam metin aria-label olarak korunur.
 *
 * Üretilen class'lar:
 *  .split-mask  → (mask=true ise) kelime maskesi
 *  .split-word  → her kelime
 *  .split-char  → her harf (by='chars')
 *  [data-emph]  → vurgulu kelime
 */
export function SplitText({
  text,
  by = 'words',
  mask = false,
  as: Tag = 'span',
  className,
  wordClassName = '',
  charClassName = '',
  emphasis = [],
  emphasisClassName = '',
  style,
}: SplitTextProps) {
  const emph = new Set(emphasis.map(normalize))
  const words = text.split(' ')
  let charIndex = 0

  return (
    <Tag className={className} aria-label={text} style={style}>
      {words.map((word, wi) => {
        const isEmph = emph.has(normalize(word))
        const inner =
          by === 'chars' ? (
            <span
              className={`split-word inline-block whitespace-nowrap ${wordClassName} ${isEmph ? emphasisClassName : ''}`}
              data-emph={isEmph || undefined}
            >
              {Array.from(word).map((ch, ci) => (
                <span
                  key={ci}
                  className={`split-char inline-block ${charClassName}`}
                  style={{ '--i': charIndex++ } as CSSProperties}
                >
                  {ch}
                </span>
              ))}
            </span>
          ) : (
            <span
              className={`split-word inline-block ${wordClassName} ${isEmph ? emphasisClassName : ''}`}
              data-emph={isEmph || undefined}
            >
              {word}
            </span>
          )

        return (
          <span key={wi} aria-hidden="true">
            {mask ? <span className="split-mask">{inner}</span> : inner}
            {wi < words.length - 1 ? ' ' : null}
          </span>
        )
      })}
    </Tag>
  )
}
