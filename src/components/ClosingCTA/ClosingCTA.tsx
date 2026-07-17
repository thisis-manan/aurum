import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MagneticButton from '../ui/MagneticButton'
import styles from './ClosingCTA.module.css'

gsap.registerPlugin(ScrollTrigger)

/**
 * ClosingCTA — parchment editorial finale (VERO language).
 * A pull-quote, then a huge mixed serif/italic statement,
 * then the commission CTA.
 */
export default function ClosingCTA() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(`.${styles.reveal}`)

      if (reduced) {
        gsap.set(items, { opacity: 1, y: 0 })
        return
      }

      items.forEach((item, i) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            delay: i * 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 80%',
              toggleActions: 'play reverse play reverse',
            },
          }
        )
      })
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className={styles.cta}>
      <div className={styles.inner}>
        <blockquote className={`${styles.quote} ${styles.reveal}`}>
          “Machines can repeat. Only hands can remember.
          Every AURUM piece keeps the memory of the hands that made it.”
          <cite className={styles.cite}>— The Atelier</cite>
        </blockquote>

        <h2 className={`${styles.headline} ${styles.reveal}`}>
          SOME THINGS ARE <em>made once,</em>
          <br />
          THEN KEPT <em>forever.</em>
        </h2>

        <div className={`${styles.action} ${styles.reveal}`}>
          <MagneticButton className={styles.commissionBtn}>
            Book a Private Viewing
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}
