/**
 * Sabit arka plan katmanları.
 * - #bd-dawn : Doğum günü bölümünde "şafak" ışığı (Birthday.tsx / Finale.tsx kontrol eder)
 * - vignette : kenarları hafifçe karartır
 */
export function Backdrop() {
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-ink" />
      <div id="bd-dawn" aria-hidden className="pointer-events-none fixed inset-0 z-0 opacity-0">
        <div className="absolute inset-0 bg-[#170f0d]" />
        <div className="dawn-sun absolute left-1/2 top-[62%] h-[130vmax] w-[130vmax] -translate-x-1/2 rounded-full" />
      </div>
      <div aria-hidden className="vignette pointer-events-none fixed inset-0 z-[55]" />
    </>
  )
}
