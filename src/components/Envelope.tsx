import { forwardRef } from 'react'

type EnvelopeProps = {
  sealLetter: string
  onOpen: () => void
  disabled?: boolean
}

/**
 * CSS ile çizilmiş zarf. Parçalar (animasyonu Finale.tsx yönetir):
 *  .env-back   arka yüz
 *  .env-paper  içindeki kağıt (açılınca yukarı kayar)
 *  .env-front  ön cep (V kesimli)
 *  .env-flap   üst kapak (rotateX ile açılır)
 *  .env-seal   mum mühür
 */
export const Envelope = forwardRef<HTMLButtonElement, EnvelopeProps>(function Envelope(
  { sealLetter, onOpen, disabled },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      disabled={disabled}
      aria-label="Mektubu aç"
      className="envelope group relative block aspect-[3/2] w-[min(80vw,440px)] cursor-pointer outline-none [perspective:1400px] focus-visible:ring-1 focus-visible:ring-gold/50 disabled:cursor-default"
    >
      <span className="env-halo pointer-events-none absolute -inset-[30%] rounded-full [background:radial-gradient(closest-side,rgba(198,164,106,0.13),rgba(168,56,46,0.06)_55%,transparent)]" />

      <span className="env-back absolute inset-0 rounded-[3px] bg-[#1d1513] shadow-[0_50px_90px_-30px_rgba(0,0,0,0.9)] ring-1 ring-inset ring-bone/[0.07]" />

      <span className="env-paper absolute inset-x-[6%] top-[5%] h-[88%] rounded-[2px] bg-paper shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.4)]">
        <span className="absolute inset-x-[12%] top-[22%] h-px bg-inkbrown/15" />
        <span className="absolute inset-x-[12%] top-[34%] h-px bg-inkbrown/15" />
        <span className="absolute left-[12%] right-[30%] top-[46%] h-px bg-inkbrown/15" />
      </span>

      <span className="env-front absolute inset-0 rounded-[3px] bg-gradient-to-b from-[#2a1e1b] to-[#211816] [clip-path:polygon(0_0,50%_56%,100%_0,100%_100%,0_100%)]">
        <span className="absolute inset-0 [background:linear-gradient(to_top_right,transparent_49.6%,rgba(236,228,216,0.06)_50%,transparent_50.4%),linear-gradient(to_top_left,transparent_49.6%,rgba(236,228,216,0.06)_50%,transparent_50.4%)]" />
      </span>

      <span className="env-flap absolute inset-x-0 top-0 h-[58%] origin-top [transform-style:preserve-3d] [transition:transform_0.9s_cubic-bezier(.2,.7,.2,1)] group-hover:[transform:rotateX(14deg)] group-disabled:group-hover:[transform:none]">
        <span className="absolute inset-0 bg-gradient-to-b from-[#33241f] to-[#2a1d1a] [backface-visibility:hidden] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
        <span className="absolute inset-0 bg-[#1a1210] [clip-path:polygon(0_0,100%_0,50%_100%)] [transform:rotateX(180deg)] [backface-visibility:hidden]" />
      </span>

      <span className="env-seal absolute left-1/2 top-[58%] grid h-[15%] min-h-[44px] w-auto -translate-x-1/2 -translate-y-1/2 place-items-center">
        <span className="grid aspect-square h-full place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#b3453a,#6e1b24_60%,#4a1118)] shadow-[0_4px_14px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)]">
          <span className="font-serif text-[clamp(1rem,3.4vw,1.4rem)] italic text-gold/90">{sealLetter}</span>
        </span>
      </span>
    </button>
  )
})
