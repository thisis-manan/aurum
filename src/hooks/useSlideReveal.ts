import { useEffect, useRef, useState } from 'react'

/**
 * Scroll-triggered reveal for cards that slide in from the left/right
 * (used by SlideProductCard for the Rings / Necklaces sections).
 *
 * Mirrors the existing useGalleryReveal pattern: observes the card, and
 * once it's ~25% into the viewport it flips `revealed` to true (with a
 * small stagger based on index so cards don't all pop at once).
 */
export function useSlideReveal(index = 0) {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let timer: ReturnType<typeof setTimeout>

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const stagger = (index % 6) * 90 // ms — subtle cascade, resets every 6 cards
          timer = setTimeout(() => setRevealed(true), stagger)
          observer.disconnect()
        }
      },
      { threshold: 0.25, rootMargin: '0px 0px -10% 0px' }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [index])

  return { ref, revealed }
}