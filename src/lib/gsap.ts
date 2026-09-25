import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// iOS'ta adres çubuğu açılıp kapanırken tüm sayfanın yeniden hesaplanmasını engeller
ScrollTrigger.config({ ignoreMobileResize: true })
gsap.defaults({ ease: 'power2.out' })

export { gsap, ScrollTrigger, useGSAP }
