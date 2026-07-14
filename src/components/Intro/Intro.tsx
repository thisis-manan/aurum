import { useEffect, useRef, useState } from 'react'
import styles from './Intro.module.css'

const LOADING_DURATION_MS = 14000
const REVEAL_DURATION_MS = 2000

function progressCurve(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1)
  if (clamped < 0.15) return (clamped / 0.15) * 20
  if (clamped < 0.82) return 20 + ((clamped - 0.15) / (0.82 - 0.15)) * 8
  const rushT = (clamped - 0.82) / (1 - 0.82)
  return 28 + rushT * rushT * 72
}

type Phase = 'loading' | 'revealing' | 'done'

export default function Intro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [count, setCount] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const skippedRef = useRef(false)
  const phaseRef = useRef<Phase>('loading')

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

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
    const onWheel = () => {
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

  return (
    <div className={styles.intro} role="presentation">
      <div className={styles.bg} />

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
