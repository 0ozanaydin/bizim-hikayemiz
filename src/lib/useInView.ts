import { useEffect, useRef, type RefObject } from 'react'

/** Element ekrana yakınken true olan bir ref döner (canvas döngülerini durdurmak için). */
export function useInViewRef(target: RefObject<Element>, rootMargin = '200px') {
  const inView = useRef(false)
  useEffect(() => {
    const el = target.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target, rootMargin])
  return inView
}
