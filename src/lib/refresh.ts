import { ScrollTrigger } from './gsap'

let t: number | undefined

/** Fotoğraf yüklenince vb. layout değiştiğinde ScrollTrigger'ı toplu şekilde yeniler */
export function refreshSoon() {
  window.clearTimeout(t)
  t = window.setTimeout(() => ScrollTrigger.refresh(), 250)
}

/**
 * Bir elementin, verilen ata elemente göre transform'dan bağımsız layout konumu.
 * Not: ata elementin position: relative olması gerekir.
 */
export function offsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let x = 0
  let y = 0
  let node: HTMLElement | null = el
  while (node && node !== ancestor) {
    x += node.offsetLeft
    y += node.offsetTop
    node = node.offsetParent as HTMLElement | null
  }
  return { x, y }
}
