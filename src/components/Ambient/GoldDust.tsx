import { useEffect, useRef } from 'react'
import styles from './Ambient.module.css'

/**
 * GoldDust — lightweight ambient particle canvas.
 * ~55 slow-drifting gold motes with soft glow.
 * - Pauses when offscreen (IntersectionObserver)
 * - Disabled entirely for prefers-reduced-motion
 * - DPR-capped at 1.5 to stay cheap on retina screens
 */

type Mote = {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  phase: number
  speed: number
  alpha: number
}

export default function GoldDust({ density = 55 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let width = 0
    let height = 0
    let motes: Mote[] = []
    let raf = 0
    let running = true

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      width = rect?.width ?? window.innerWidth
      height = rect?.height ?? window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const spawn = (): Mote => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.6 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -(0.04 + Math.random() * 0.14),
      phase: Math.random() * Math.PI * 2,
      speed: 0.004 + Math.random() * 0.008,
      alpha: 0.25 + Math.random() * 0.5,
    })

    const init = () => {
      resize()
      motes = Array.from({ length: density }, spawn)
    }

    const tick = () => {
      if (!running) return
      ctx.clearRect(0, 0, width, height)
      for (const m of motes) {
        m.phase += m.speed
        m.x += m.vx + Math.sin(m.phase) * 0.08
        m.y += m.vy

        // recycle motes that drift off
        if (m.y < -8 || m.x < -8 || m.x > width + 8) {
          m.x = Math.random() * width
          m.y = height + 8
        }

        const twinkle = 0.6 + 0.4 * Math.sin(m.phase * 3)
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(214, 178, 106, ${(m.alpha * twinkle).toFixed(3)})`
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting
      if (running) {
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(tick)
      }
    })
    observer.observe(canvas)

    init()
    raf = requestAnimationFrame(tick)
    window.addEventListener('resize', init)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('resize', init)
    }
  }, [density])

  return <canvas ref={canvasRef} className={styles.dust} aria-hidden="true" />
}
