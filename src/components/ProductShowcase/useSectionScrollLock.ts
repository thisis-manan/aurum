import { useEffect, useRef } from 'react'
type ProgressInfo = { progress: number; max: number }
type ContentRect = { top: number; height: number }

interface UseSectionScrollLockArgs {
  sectionRef: React.RefObject<HTMLElement>
  onDelta: (dy: number) => void
  getProgress: () => ProgressInfo
  enabled?: boolean
  /** Height (px) of any fixed/sticky header that sits above the section.
   *  Used so the locked section docks BELOW the header instead of at
   *  viewport top:0 — prevents cards being cut off underneath a navbar. */
  headerOffset?: number
  /**
   * Delay (ms) between the section docking/freezing and the wheel actually
   * starting to drive the carousel. The page scroll is frozen immediately
   * on dock (so the user can't scroll past it), but card entrance
   * animations (reveal/stagger) need a moment to finish first — activating
   * the wheel-hijack instantly cuts them off mid-animation. Default 550ms.
   */
  settleDelayMs?: number
  /**
   * Optional: return the *visually painted* top/height of the content
   * (union of card bounding rects), including any CSS transforms
   * (stagger translateY, rotate, tilt, etc).
   *
   * getBoundingClientRect() on the section itself only reflects the
   * untransformed layout box — it does NOT grow/shift when children are
   * moved purely via `transform`. Cards using translateY(--stagger-y) or
   * rotate(--card-rot) can visually poke above/below the section's own
   * rect, and if we center/dock using the section's rect, those cards get
   * clipped under the header or above the viewport. Passing this lets the
   * hook dock against reality instead of the static layout box.
   */
  getContentRect?: () => ContentRect | null
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
const RELOCK_COOLDOWN_MS = 400 // guards against bounce-back re-triggering the lock

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
      // Stop lenis FIRST, before we touch native scroll or overflow.
      // If lenis is still running when we jump the scroll position, its own
      // rAF loop fights the jump and snaps back for a frame — that snap is
      // the visible "blink". Stopping it first means our scroll change is
      // the only thing moving the page.
      window.lenis?.stop()
      locked.current = true

      // Hiding overflow removes the scrollbar, which changes the viewport's
      // available width and reflows/shifts content horizontally — another
      // source of a sudden visual jump. Compensate by padding the body by
      // the scrollbar's width so the layout width stays identical.
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : ''

      // The page is frozen right away (can't scroll past the section), but
      // we don't let the wheel drive the carousel yet — that happens after
      // settleDelayMs, once the cards' entrance animation has had time to
      // finish. Locking + hijacking in the same instant was cutting the
      // reveal animation off mid-flight.
      hijackActive.current = false
      if (settleTimeout.current) clearTimeout(settleTimeout.current)
      settleTimeout.current = setTimeout(() => {
        if (locked.current) hijackActive.current = true
      }, settleDelayMs)
    }

    const unlock = () => {
      locked.current = false
      hijackActive.current = false
      if (settleTimeout.current) {
        clearTimeout(settleTimeout.current)
        settleTimeout.current = null
      }
      lastUnlockAt.current = performance.now()
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      window.lenis?.start()
    }

    // --- Safety valve: never let the page get permanently stuck ---
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && locked.current) unlock()
    }
    window.addEventListener('keydown', onKeyDown)

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
          // Section is considered "docked" once its top reaches just below
          // the fixed header, not viewport top:0.
          const crossedDown = prev > headerOffset + EPS && top <= headerOffset + EPS
          const crossedUp = prev < headerOffset - EPS && top >= headerOffset - EPS
          if (crossedDown || crossedUp) {
            // Guard: if the carousel has no real scroll range, locking would
            // immediately hit atStart/atEnd and unlock again — an infinite
            // lock/unlock flicker that freezes the page. Skip locking entirely
            // in that case and just let native scroll pass through.
            const { max } = getProgress()
            if (max > EPS) {
              // Use the real painted bounds of the cards (post-transform)
              // when available, since translateY/rotate on individual cards
              // (stagger, tilt) don't grow the section's own layout rect —
              // falling back to the section rect would clip those cards
              // against the header or viewport edge.
              const content = getContentRect?.()
              const contentTop = content?.top ?? top
              const contentHeight = content?.height ?? rect.height

              // Dock the content just below the header, and if it's shorter
              // than the available viewport space, center it vertically so
              // cards never get clipped top or bottom.
              const availableHeight = window.innerHeight - headerOffset
              const extraSpace = Math.max(0, availableHeight - contentHeight)
              const target = contentTop - headerOffset - extraSpace / 2

              // lock() FIRST: stops lenis and locks overflow before we move
              // the scroll position, so nothing fights the jump and nothing
              // reflows underneath it. Order matters here.
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

    const handleDelta = (dy: number, e: { preventDefault: () => void }) => {
      if (dy === 0 || !locked.current) return

      // During the settle window the page is frozen but the wheel hasn't
      // taken over the carousel yet — swallow input quietly so nothing
      // scrolls or jumps while the cards are still animating in.
      if (!hijackActive.current) {
        e.preventDefault()
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

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
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

    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true } as EventListenerOptions)
      window.removeEventListener('touchstart', onTouchStart, { capture: true } as EventListenerOptions)
      window.removeEventListener('touchmove', onTouchMove, { capture: true } as EventListenerOptions)
      window.removeEventListener('keydown', onKeyDown)
      cancelAnimationFrame(watchRaf)
      if (settleTimeout.current) clearTimeout(settleTimeout.current)
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      if (locked.current) {
        window.lenis?.start()
      }
    }
  }, [sectionRef, onDelta, getProgress, enabled, headerOffset, settleDelayMs, getContentRect])
}