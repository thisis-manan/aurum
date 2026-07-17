import { useEffect, useRef } from 'react'

type ProgressInfo = { progress: number; max: number }
type ContentRect = { top: number; height: number }

type LenisLike = {
  stop: () => void
  start: () => void
}

interface UseSectionScrollLockArgs {
  sectionRef: React.RefObject<HTMLElement | null>
  onDelta: (dy: number) => void
  getProgress: () => ProgressInfo
  enabled?: boolean
  headerOffset?: number
  settleDelayMs?: number
  getContentRect?: () => ContentRect | null
}

const getLenis = () => (window as unknown as { lenis?: LenisLike }).lenis
const EPS = 1
const RELOCK_COOLDOWN_MS = 400 

export function useSectionScrollLock({
  sectionRef,
  onDelta,
  getProgress,
  enabled = true,
  headerOffset = 80,
  settleDelayMs = 550,
  getContentRect,
}: UseSectionScrollLockArgs) {
  const locked = useRef(false)
  const hijackActive = useRef(false)
  const settleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartY = useRef(0)
  const prevTop = useRef<number | null>(null)
  const lastUnlockAt = useRef(0)

  useEffect(() => {
    if (!enabled) return
    const section = sectionRef.current
    if (!section) return

    const lock = () => {
      locked.current = true
      getLenis()?.stop()
      
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : ''

      hijackActive.current = false
      if (settleTimeout.current) clearTimeout(settleTimeout.current)
      settleTimeout.current = setTimeout(() => {
        if (locked.current) hijackActive.current = true
      }, settleDelayMs)
    }

    const unlock = () => {
      if (!locked.current) return
      locked.current = false
      getLenis()?.start()
      document.documentElement.style.overflow = ''
      document.documentElement.style.touchAction = ''
      document.body.style.touchAction = ''
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      lastUnlockAt.current = performance.now()
    }

    const releaseScroll = (dy: number) => {
      unlock()
      if (dy !== 0) {
        requestAnimationFrame(() => {
          window.scrollBy({ top: dy, left: 0, behavior: 'auto' })
          getLenis()?.start()
        })
      }
      hijackActive.current = false
      if (settleTimeout.current) {
        clearTimeout(settleTimeout.current)
        settleTimeout.current = null
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && locked.current) unlock()
    }
    window.addEventListener('keydown', onKeyDown)

    const handleDelta = (dy: number, e: Event) => {
      if (dy === 0 || !locked.current) return

      if (!hijackActive.current) {
        e.preventDefault()
        return
      }

      const { progress, max } = getProgress()
      const atStart = progress <= EPS
      const atEnd = progress >= max - EPS

      if (dy > 0 && atEnd) {
        e.preventDefault()
        releaseScroll(dy)
        return
      }
      if (dy < 0 && atStart) {
        e.preventDefault()
        releaseScroll(dy)
        return
      }

      e.preventDefault()
      onDelta(dy)
    }

    const onWheel = (e: WheelEvent) => handleDelta(e.deltaY, e)

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
    }
    
    const onTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY
      const dy = touchStartY.current - currentY
      touchStartY.current = currentY
      handleDelta(dy, e)
    }

    let lastProgress: number | null = null
    let stuckSince = 0
    const STUCK_TIMEOUT_MS = 4000
    
    const safetyCheck = () => {
      if (locked.current) {
        const { progress } = getProgress()
        if (lastProgress === null || Math.abs(progress - lastProgress) > 0.5) {
          lastProgress = progress
          stuckSince = performance.now()
        } else if (performance.now() - stuckSince > STUCK_TIMEOUT_MS) {
          console.warn('[scroll-lock] progress not changing for 4s — force unlocking')
          unlock()
          stuckSince = performance.now()
        }
      } else {
        lastProgress = null
      }
    }

    let watchRaf = 0
    const watchDock = () => {
      safetyCheck()
      if (!locked.current) {
        const withinCooldown = performance.now() - lastUnlockAt.current < RELOCK_COOLDOWN_MS
        const rect = section.getBoundingClientRect()
        const top = rect.top
        const prev = prevTop.current

        if (!withinCooldown && prev !== null) {
          const crossedDown = prev > headerOffset + EPS && top <= headerOffset + EPS
          const crossedUp = prev < headerOffset - EPS && top >= headerOffset - EPS
          if (crossedDown || crossedUp) {
            const { max } = getProgress()
            if (max > EPS) {
              const content = getContentRect?.()
              const contentTop = content?.top ?? top
              const contentHeight = content?.height ?? rect.height

              const availableHeight = window.innerHeight - headerOffset
              const extraSpace = Math.max(0, availableHeight - contentHeight)
              const target = contentTop - headerOffset - extraSpace / 2
              
              lock()
              window.scrollBy(0, target)
            }
          }
        }
        prevTop.current = top
      } else {
        prevTop.current = null
      }
      watchRaf = requestAnimationFrame(watchDock)
    }
    watchRaf = requestAnimationFrame(watchDock)

    window.addEventListener('wheel', onWheel, { passive: false, capture: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true })

    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true } as EventListenerOptions)
      window.removeEventListener('touchstart', onTouchStart, { capture: true } as EventListenerOptions)
      window.removeEventListener('touchmove', onTouchMove, { capture: true } as EventListenerOptions)
      window.removeEventListener('keydown', onKeyDown)
      cancelAnimationFrame(watchRaf)
      if (settleTimeout.current) clearTimeout(settleTimeout.current)
      unlock()
    }
  }, [sectionRef, onDelta, getProgress, enabled, headerOffset, settleDelayMs, getContentRect])
}