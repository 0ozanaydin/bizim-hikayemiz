import { forwardRef } from 'react'

/** Açılıştaki "aşağı kaydır" ipucu: minimal yazı + aşağı akan ince çizgi */
export const ScrollHint = forwardRef<HTMLDivElement, { label: string }>(function ScrollHint({ label }, ref) {
  return (
    <div ref={ref} className="pointer-events-none flex flex-col items-center gap-3">
      <span className="font-sans text-[10px] uppercase tracking-label text-bone/40">{label}</span>
      <span className="relative block h-12 w-px overflow-hidden bg-bone/10">
        <span className="scroll-hint-drop absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent via-gold/70 to-transparent" />
      </span>
    </div>
  )
})
