import { useEffect, useRef } from 'react'

/**
 * useSectionScrollLock
 * ---------------------
 * Page normal scroll karta hai (Lenis ke through, smooth) jab tak
 * section ka TOP edge viewport ke top tak "dock" nahi ho jaata. Dock
 * hote hi:
 *   1. Lenis ko `lenis.stop()` se freeze kar dete hain (page ab bilkul
 *      nahi hilega, Lenis apna internal scroll-target update karna
 *      band kar deta hai),
 *   2. wheel/touch delta seedha cards ki horizontal animation mein
 *      feed hota hai.
 * Jab last card (ya pehle card) tak pahunch jaate ho, `lenis.start()`
 * se wapas resume kar dete hain aur page phir se normal (smooth)
 * scroll karta hai.
 *
 * v5 fix: is site par Lenis (+ GSAP ScrollTrigger/Observer) already
 * globally chal raha hai (`<html class="lenis lenis-scrolling">`).
 * v4 sirf raw `window.scrollBy` se "native scroll" maan kar chal raha
 * tha — lekin Lenis apna khud ka scroll-target track karta hai aur
 * har apne animation frame par usko wapas apply kar deta hai, isliye
 * hamara manual scrollBy snap Lenis ke agle frame mein silently
 * overwrite ho jaata tha. Result: numbers (progress/target) sahi
 * dikhte the console mein, par screen par kuch move nahi hota tha.
 *
 * Fix do cheezein karta hai:
 *   - Lock/unlock ke liye raw scroll manipulate karne ke bajaye
 *     Lenis ke apne `stop()`/`start()` API ka use karta hai.
 *   - Apne wheel/touch listeners `capture: true` ke saath lagata hai
 *     taaki Lenis/GSAP Observer ke listeners (jo bubble phase mein
 *     hote hain) se PEHLE humein event mil jaaye.
 *
 * IMPORTANT — is file ko kaam karne ke liye tumhare Lenis instance ko
 * `window.lenis` par expose hona chahiye. Jahan bhi Lenis banate ho
 * (e.g. `const lenis = new Lenis(...)`), wahan ek line add karo:
 *
 *   ;(window as any).lenis = lenis
 *
 * Agar yeh nahi kiya gaya, hook ek console.warn dega aur sirf native
 * scroll behavior par fallback karega (jo Lenis ke saath phir bhi
 * unreliable rahega).
 *
 * Use:
 *   useSectionScrollLock({
 *     sectionRef,
 *     onDelta: (dy) => { ...same jo pehle handlePageScroll mein tha... },
 *     getProgress: () => ({ progress: target.current, max: maxScroll.current }),
 *   })
 */

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
      // Lazily read window.lenis HERE (not captured once at mount) —
      // by the time the user has actually scrolled to the dock point,
      // every component's mount effects (including the one that sets
      // window.lenis) have long since run, regardless of effect order.
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
          // Neeche scroll ho raha hai, section abhi dock nahi hua.
          if (rect.top - dy <= 0) {
            // Yeh tick dock point cross kar dega — Lenis ko rok do,
            // page ko exactly dock point pe snap karo, aur bacha hua
            // delta seedha animation ko de do.
            e.preventDefault()
            window.scrollBy(0, rect.top)
            lock()
            const leftover = dy - rect.top
            if (leftover > 0) onDelta(leftover)
          }
          return // warna Lenis ko normal smooth-scroll karne do
        }

        if (dy < 0 && rect.top < -EPS) {
          // Upar scroll ho raha hai, section already page ke upar
          // scroll ho chuka hai (top viewport se upar hai).
          if (rect.top - dy >= 0) {
            e.preventDefault()
            window.scrollBy(0, rect.top)
            lock()
            const leftover = dy - rect.top
            if (leftover < 0) onDelta(leftover)
          }
          return
        }

        return // dock point ke aas paas nahi hai, ignore karo
      }

      // Locked hai (Lenis stopped hai): animation ko feed karo jab
      // tak edge na aa jaaye, fir Lenis ko start karke release karo.
      const { progress, max } = getProgress()
      const atStart = progress <= EPS
      const atEnd = progress >= max - EPS

      if (dy > 0 && atEnd) {
        unlock()
        return // Lenis ko neeche scroll continue karne do
      }
      if (dy < 0 && atStart) {
        unlock()
        return // Lenis ko upar scroll continue karne do
      }

      e.preventDefault()
      onDelta(dy)
    }

    const onWheel = (e: WheelEvent) => handleDelta(e.deltaY, e)

    // Touch par ek real browser limitation hai: ek baar jo touch-gesture
    // scrollable maan liya, uske BEECH mein preventDefault() kaam nahi
    // karta ("cancelable=false" intervention) — Chrome yeh decision
    // touchstart ke waqt hi le leta hai. Isliye jab bhi section dock
    // point ke reasonably paas ho, touchstart par hi proactively
    // `touch-action: none` laga dete hain taaki Chrome is gesture ko
    // shuru se hi "native scroll nahi" maan le, aur humara preventDefault
    // beech mein bhi kaam kare.
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
      const dy = touchStartY.current - currentY // swipe up = positive, wheel deltaY jaisa hi
      touchStartY.current = currentY
      handleDelta(dy, e)
    }

    // capture: true — Lenis/GSAP Observer apne listeners bubble phase
    // mein lagate hain, isliye hum capture phase mein pehle intercept
    // karte hain taaki humara preventDefault() unse pehle chal jaaye.
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