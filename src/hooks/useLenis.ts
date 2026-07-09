import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useLenis() {
  useEffect(() => {
    // 1. Initialize the smooth scroll instance
    const lenis = new Lenis()

    // 2. IMPORTANT FIX: Bind the instance to the global window object.
    // This allows useSectionScrollLock.ts to access lenis.stop() and lenis.start()
    window.lenis = lenis

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    return () => {
      // 3. Clean up the instance and the global reference on unmount
      lenis.destroy()
      window.lenis = undefined
    }
  }, [])
}