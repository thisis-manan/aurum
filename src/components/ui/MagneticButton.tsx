import { useRef, type ReactNode, type ButtonHTMLAttributes } from 'react'
import { gsap } from 'gsap'

/**
 * MagneticButton — the button leans toward the cursor while hovered,
 * and its label leans slightly further, creating layered depth.
 * Falls back to a plain button when reduced motion is preferred.
 */

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  strength?: number
}

export default function MagneticButton({ children, strength = 0.35, className, ...rest }: Props) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  const reduced = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const onMove = (e: React.PointerEvent) => {
    const btn = btnRef.current
    const label = labelRef.current
    if (!btn || !label || reduced()) return
    const rect = btn.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    gsap.to(btn, { x: dx * strength, y: dy * strength, duration: 0.4, ease: 'power3.out' })
    gsap.to(label, { x: dx * strength * 0.4, y: dy * strength * 0.4, duration: 0.4, ease: 'power3.out' })
  }

  const onLeave = () => {
    const btn = btnRef.current
    const label = labelRef.current
    if (!btn || !label) return
    gsap.to([btn, label], { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' })
  }

  return (
    <button
      ref={btnRef}
      className={className}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...rest}
    >
      <span ref={labelRef} style={{ display: 'inline-block' }}>
        {children}
      </span>
    </button>
  )
}
