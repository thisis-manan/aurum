import { useEffect, useRef, useState } from 'react'
import styles from './Intro.module.css'

// ── Timing ──
// Matches the reference recording: counter holds low for a while, then
// rushes to 100 right at the end, followed by a reveal transition.
// Total ≈ 16s, same ballpark as what was recorded. Turn this down if a
// 16s forced intro turns out to be too long once it's live — most of
// the "premium" feel survives fine at 4-6s too.
const LOADING_DURATION_MS = 14000
const REVEAL_DURATION_MS = 1800

// Slow climb to ~20%, a long hold, then a fast rush to 100 — same shape
// observed in the reference (20% held from ~70%–90% of the load time,
// then a sprint to 100 in the last stretch).
function progressCurve(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1)
  if (clamped < 0.15) return (clamped / 0.15) * 20
  if (clamped < 0.82) return 20 + ((clamped - 0.15) / (0.82 - 0.15)) * 8 // barely creeps to ~28
  const rushT = (clamped - 0.82) / (1 - 0.82)
  return 28 + rushT * rushT * 72 // eased rush from 28 → 100
}

type Phase = 'loading' | 'revealing' | 'done'

export default function Intro() {
  // Plays on every load/refresh, matching the reference site exactly —
  // no session-skip. (Previously this checked sessionStorage and only
  // played once per tab session; removed per your feedback.)
  const [phase, setPhase] = useState<Phase>('loading')
  const [count, setCount] = useState(0)
  const bgRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const skippedRef = useRef(false)

  useEffect(() => {
    // Lock page scroll while the intro plays.
    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'

    const runLoading = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const duration = skippedRef.current ? Math.min(elapsed, 500) : elapsed
      const t = duration / LOADING_DURATION_MS
      const value = skippedRef.current ? 100 : progressCurve(t)
      setCount(Math.round(value))

      if (value >= 100) {
        startRef.current = null
        setPhase('revealing')
        return
      }
      rafRef.current = requestAnimationFrame(runLoading)
    }

    rafRef.current = requestAnimationFrame(runLoading)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      document.documentElement.style.overflow = previousOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (phase !== 'revealing') return
    const bg = bgRef.current
    if (!bg) return

    const start = performance.now()
    const maxRadius = Math.hypot(window.innerWidth, window.innerHeight) * 0.75 // vmax-ish, covers any screen

    const runReveal = (timestamp: number) => {
      const elapsed = timestamp - start
      const t = Math.min(elapsed / REVEAL_DURATION_MS, 1)
      // ease-in — starts slow, accelerates outward, matching the "pop then expand" feel
      const eased = t * t
      const radius = eased * maxRadius
      bg.style.setProperty('--hole-radius', `${radius}px`)

      if (t >= 1) {
        document.documentElement.style.overflow = ''
        setPhase('done')
        return
      }
      rafRef.current = requestAnimationFrame(runReveal)
    }

    rafRef.current = requestAnimationFrame(runReveal)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
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

  return (
    <div
      className={styles.intro}
      onClick={handleSkip}
      role="button"
      aria-label="Skip intro"
    >
      <div ref={bgRef} className={styles.bg} style={{ ['--hole-radius' as string]: '0px' }} />

      <div className={`${styles.content} ${phase === 'revealing' ? styles.contentHide : ''}`}>
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
        <p className={styles.subtitle}>Fine Jewellery</p>

        <div className={styles.rule} />

        <p className={styles.counter}>{count}</p>
      </div>

      <button className={styles.skip} onClick={handleSkip} type="button">
        Skip
      </button>
    </div>
  )
}
