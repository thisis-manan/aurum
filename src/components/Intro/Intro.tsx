import { useEffect, useRef, useState } from 'react'
import styles from './Intro.module.css'

/**
 * Intro — editorial preloader.
 * Parchment canvas, mixed roman/italic serif typography with a small
 * media swatch inline between the words. The swatch grows as loading
 * progresses; at 100% the frame expands to fullscreen, revealing the hero.
 */

const LOADING_DURATION_MS = 2000
const REVEAL_DURATION_MS = 1800

function progressCurve(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1)
  if (clamped < 0.15) return (clamped / 0.15) * 20
  if (clamped < 0.82) return 20 + ((clamped - 0.15) / (0.82 - 0.15)) * 38
  const rushT = (clamped - 0.82) / (1 - 0.82)
  return 58 + rushT * rushT * 42
}

type Phase = 'loading' | 'revealing' | 'done'

export default function Intro({
  onComplete,
  onReveal,
}: {
  onComplete: () => void
  onReveal?: () => void
}) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [count, setCount] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const skippedRef = useRef(false)
  const phaseRef = useRef<Phase>('loading')

  useEffect(() => {
    phaseRef.current = phase
    // tell the app the reveal has begun so the hero can start
    // its entrance underneath the intro
    if (phase === 'revealing') onReveal?.()
  }, [phase, onReveal])

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'

    const runLoading = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const t = elapsed / LOADING_DURATION_MS
      const value = skippedRef.current ? 100 : progressCurve(t)
      setCount(Math.round(value))

      if (value >= 100) {
        setPhase('revealing')
        return
      }
      rafRef.current = requestAnimationFrame(runLoading)
    }

    rafRef.current = requestAnimationFrame(runLoading)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    // ignore stray trackpad/wheel momentum right after mount so the
    // intro text is always seen before a scroll can skip it
    const armedAt = performance.now() + 800
    const onWheel = () => {
      if (performance.now() < armedAt) return
      if (phaseRef.current === 'loading') {
        skippedRef.current = true
        setCount(100)
        setPhase('revealing')
      } else if (phaseRef.current === 'revealing') {
        document.documentElement.style.overflow = ''
        setPhase('done')
        onComplete()
      }
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [onComplete])

  useEffect(() => {
    if (phase !== 'revealing') return
    const timer = setTimeout(() => {
      document.documentElement.style.overflow = ''
      setPhase('done')
      onComplete()
    }, REVEAL_DURATION_MS)
    return () => clearTimeout(timer)
  }, [phase, onComplete])

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (phase === 'loading') {
      skippedRef.current = true
      setCount(100)
      setPhase('revealing')
    } else if (phase === 'revealing') {
      document.documentElement.style.overflow = ''
      setPhase('done')
      onComplete()
    }
  }

  if (phase === 'done') return null

  const revealing = phase === 'revealing'
  // the clipped video window grows gently with progress
  const insetY = 44 - (count / 100) * 5 // 44% → 39%
  const insetX = 47 - (count / 100) * 4 // 47% → 43%

  return (
    <div
      className={`${styles.intro} ${revealing ? styles.introFade : ''}`}
      role="presentation"
    >
      <div className={styles.bg} />

      {/* Fullscreen video, clipped to a small centered window that
          matches the inline swatch, then opened on reveal */}
      <video
        className={`${styles.revealVideo} ${revealing ? styles.revealVideoOpen : ''}`}
        src="/videos/hero-loop.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={revealing ? undefined : { clipPath: `inset(${insetY}% ${insetX}%)` }}
      />

      <div className={styles.content}>
        <p className={`${styles.line} ${styles.lineTop} ${revealing ? styles.lineExitUp : ''}`}>
          WHERE <em>your</em> GOLD
        </p>

        {/* spacer holds the gap where the clipped video shows through */}
        <div className={styles.swatchGap} />

        <p className={`${styles.line} ${styles.lineBottom} ${revealing ? styles.lineExitDown : ''}`}>
          BECOMES <em>art.</em>
        </p>
      </div>

      <div className={`${styles.progress} ${revealing ? styles.hide : ''}`}>
        <span className={styles.counter}>{count}%</span>
        <div className={styles.track}>
          <div className={styles.fill} style={{ transform: `scaleX(${count / 100})` }} />
        </div>
      </div>

      <button
        className={`${styles.skip} ${revealing ? styles.hide : ''}`}
        onClick={handleSkip}
        type="button"
      >
        Skip
      </button>
    </div>
  )
}
