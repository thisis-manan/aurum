import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const lenis = new Lenis()
    // lenis ships its own (incompatible) window.lenis type, so cast around it
    const w = window as unknown as { lenis?: Lenis }
    w.lenis = lenis

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    // the site was mounted under the intro overlay — recalculate all
    // trigger positions now that scrolling is unlocked
    ScrollTrigger.refresh()

    return () => {
      delete w.lenis
      lenis.destroy()
    }
  }, [enabled])
}