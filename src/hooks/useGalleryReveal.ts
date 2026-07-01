import { useEffect, useRef, useState } from 'react'

export function useGalleryReveal(index: number = 0) {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const delay = (index % 4) * 150
          setTimeout(() => setRevealed(true), delay)
          observer.unobserve(el)
        }
      },
      { threshold: 0.2, rootMargin: '0px -5% 0px -5%' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [index])

  return { ref, revealed }
}