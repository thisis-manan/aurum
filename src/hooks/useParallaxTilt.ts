import { useEffect, useRef, useState, type CSSProperties } from 'react'

export function useParallaxTilt() {
  const ref = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<CSSProperties>({})

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let ticking = false

    const update = () => {
      ticking = false
      const rect = el.getBoundingClientRect()
      const vw = window.innerWidth || document.documentElement.clientWidth

      const center = rect.left + rect.width / 2
      const raw = (center - vw / 2) / (vw / 2)
      const progress = Math.max(-1, Math.min(1, raw))

      const translateX = progress * -60
      const rotateY = progress * -22
      const scale = 1 - Math.abs(progress) * 0.12
      const shadowX = progress * -18
      const shadowBlur = 30 + Math.abs(progress) * 40
      const shadowOpacity = 0.15 + Math.abs(progress) * 0.2

      setStyle({
        transform: `perspective(1000px) rotateY(${rotateY}deg) translateX(${translateX}px) scale(${scale})`,
        boxShadow: `${shadowX}px 16px ${shadowBlur}px rgba(0,0,0,${shadowOpacity})`,
      })
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return { ref, style }
}