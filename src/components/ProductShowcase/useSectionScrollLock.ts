import { useEffect, useRef } from 'react'
type ProgressInfo = { progress: number; max: number }

interface UseSectionScrollLockArgs {
  sectionRef: React.RefObject<HTMLElement>
  onDelta: (dy: number) => void
  getProgress: () => ProgressInfo
  enabled?: boolean
}

interface LenisLike {
  stop: () => void
  start: () => void
}

declare global {
  interface Window {
    lenis?: LenisLike
  }
}

const EPS = 1

export function useSectionScrollLock({
  sectionRef,
  onDelta,
  getProgress,
  enabled = true,
}: UseSectionScrollLockArgs) {
  const locked = useRef(false)
  const touchStartY = useRef(0)

  useEffect(() => {
    if (!enabled) return // catalog too small for a meaningful loop — behave as a plain static grid
    const section = sectionRef.current
    if (!section) return

    const lock = () => {
      locked.current = true
      window.lenis?.stop()
    }

    const unlock = () => {
      locked.current = false
      window.lenis?.start()
      document.documentElement.style.touchAction = ''
    }

    const handleDelta = (dy: number, e: { preventDefault: () => void }) => {
      if (dy === 0) return

      if (!locked.current) {
        const rect = section.getBoundingClientRect()

        if (dy > 0 && rect.top > EPS) {
          
          if (rect.top - dy <= 0) {
            e.preventDefault()
            window.scrollBy(0, rect.top)
            lock()
            const leftover = dy - rect.top
            if (leftover > 0) onDelta(leftover)
          }
          return 
        }

        if (dy < 0 && rect.top < -EPS) {
          
          if (rect.top - dy >= 0) {
            e.preventDefault()
            window.scrollBy(0, rect.top)
            lock()
            const leftover = dy - rect.top
            if (leftover < 0) onDelta(leftover)
          }
          return
        }

        return 
      }
      const { progress, max } = getProgress()
      const atStart = progress <= EPS
      const atEnd = progress >= max - EPS

      if (dy > 0 && atEnd) {
        unlock()
        return
      }
      if (dy < 0 && atStart) {
        unlock()
        return
      }

      e.preventDefault()
      onDelta(dy)
    }

    const onWheel = (e: WheelEvent) => handleDelta(e.deltaY, e)
    const NEAR_DOCK_BUFFER = window.innerHeight * 1.5

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
      const rect = section.getBoundingClientRect()
      if (locked.current || Math.abs(rect.top) < NEAR_DOCK_BUFFER) {
        document.documentElement.style.touchAction = 'none'
      }
    }
    const onTouchEnd = () => {
      if (!locked.current) {
        document.documentElement.style.touchAction = ''
      }
    }
    const onTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY
      const dy = touchStartY.current - currentY 
      touchStartY.current = currentY
      handleDelta(dy, e)
    }
    window.addEventListener('wheel', onWheel, { passive: false, capture: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true, capture: true })

    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true } as EventListenerOptions)
      window.removeEventListener('touchstart', onTouchStart, { capture: true } as EventListenerOptions)
      window.removeEventListener('touchmove', onTouchMove, { capture: true } as EventListenerOptions)
      window.removeEventListener('touchend', onTouchEnd, { capture: true } as EventListenerOptions)
      document.documentElement.style.touchAction = ''
      if (locked.current) {
        window.lenis?.start()
      }
    }
  }, [sectionRef, onDelta, getProgress, enabled])
}