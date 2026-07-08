import { useEffect, useRef, useState } from 'react'
import styles from './Intro.module.css'

// ── Timing ──
const LOADING_DURATION_MS = 14000
const REVEAL_DURATION_MS = 2000

// Slow climb to ~20%, a long hold, then a fast rush to 100 — matches the
// ilCapo reference recording (20% held from ~70%–90% of the load time,
// then a sprint to 100 right at the end).
function progressCurve(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1)
  if (clamped < 0.15) return (clamped / 0.15) * 20
  if (clamped < 0.82) return 20 + ((clamped - 0.15) / (0.82 - 0.15)) * 8
  const rushT = (clamped - 0.82) / (1 - 0.82)
  return 28 + rushT * rushT * 72
}

type Phase = 'loading' | 'revealing' | 'done'

export default function Intro() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [count, setCount] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const skippedRef = useRef(false)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (phase !== 'revealing') return
    // Reveal is pure CSS (clip-path transition, see Intro.module.css) —
    // just wait it out, then unmount and hand off to the real Hero
    // underneath (same video, so the handoff is seamless).
    const timer = setTimeout(() => {
      document.documentElement.style.overflow = ''
      setPhase('done')
    }, REVEAL_DURATION_MS)
    return () => clearTimeout(timer)
  }, [phase])

  const handleSkip = () => {
    if (phase === 'loading') {
      skippedRef.current = true
    } else if (phase === 'revealing') {
      document.documentElement.style.overflow = ''
      setPhase('done')
    }
  }

  if (phase === 'done') return null

  const revealing = phase === 'revealing'

  return (
    <div className={styles.intro} onClick={handleSkip} role="button" aria-label="Skip intro">
      <div className={styles.bg} />

      {/* Same source as the real Hero — clip-path grows this from a small
          centered box to fullscreen, so the handoff to the real Hero
          underneath is seamless once this unmounts. */}
      <video
        className={`${styles.revealVideo} ${revealing ? styles.revealVideoOpen : ''}`}
        src="/videos/hero-loop.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      <div className={`${styles.previewBadge} ${revealing ? styles.previewBadgeHide : ''}`}>
        Scroll
      </div>

      <div className={`${styles.content} ${revealing ? styles.contentSettle : ''}`}>
        <svg className={styles.mark} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <circle cx="32" cy="32" r="30" stroke="var(--color-gold)" strokeWidth="1" />
          <text
            x="32"
            y="42"
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontSize="28"
            fill="var(--color-gold)"
          >
            A
          </text>
        </svg>

        <h1 className={styles.wordmark}>AURUM</h1>
        <p className={`${styles.subtitle} ${revealing ? styles.hide : ''}`}>Fine Jewellery</p>

        <div className={`${styles.rule} ${revealing ? styles.hide : ''}`} />

        <p className={`${styles.counter} ${revealing ? styles.hide : ''}`}>{count}</p>
      </div>

      <button className={`${styles.skip} ${revealing ? styles.hide : ''}`} onClick={handleSkip} type="button">
        Skip
      </button>
    </div>
  )
}
