import { useEffect } from 'react'
import { site } from './data/content'
import { ScrollTrigger } from './lib/gsap'
import { initSmoothScroll } from './lib/smoothScroll'
import { Backdrop } from './components/Backdrop'
import { CursorLight } from './components/CursorLight'
import { Grain } from './components/Grain'
import { ChapterIndicator } from './components/ChapterIndicator'
import { MusicToggle } from './components/MusicToggle'
import { Opening } from './sections/Opening'
import { StoryBeginning } from './sections/StoryBeginning'
import { Memories } from './sections/Memories'
import { Realization } from './sections/Realization'
import { NinetyNine } from './sections/NinetyNine'
import { Stars } from './sections/Stars'
import { Birthday } from './sections/Birthday'
import { Finale } from './sections/Finale'

// Deneyim her zaman en baştan başlasın
if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)
}

export default function App() {
  useEffect(() => {
    document.title = site.tabTitle
    const cleanup = initSmoothScroll()
    // Fontlar yüklenince ölçüler değişir → tüm tetikleyicileri yeniden hesapla
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    return () => {
      cleanup()
      window.removeEventListener('load', onLoad)
    }
  }, [])

  return (
    <>
      <Backdrop />
      <CursorLight />
      <main className="relative z-10">
        <Opening />
        <StoryBeginning />
        <Memories />
        <Realization />
        <NinetyNine />
        <Stars />
        <Birthday />
        <Finale />
      </main>
      <ChapterIndicator />
      <MusicToggle />
      <Grain />
    </>
  )
}
