import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GoldDust from '../Ambient/GoldDust'
import styles from './Hero.module.css'

gsap.registerPlugin(ScrollTrigger)

/**
 * Hero — the brand IS the hero.
 * Giant AURUM wordmark over warm amber-graded video,
 * editorial serif/italic tagline beneath.
 */

const WORDMARK = 'AURUM'

export default function Hero({ ready = true }: { ready?: boolean }) {
  const rootRef = useRef<HTMLElement>(null)
  const videoWrapRef = useRef<HTMLDivElement>(null)
  const wordmarkRef = useRef<HTMLHeadingElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const scrollHintRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ready) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      const chars = wordmarkRef.current?.querySelectorAll(`.${styles.char}`)

      if (reduced) {
        gsap.set([taglineRef.current, scrollHintRef.current], { opacity: 1, y: 0 })
        if (chars) gsap.set(chars, { opacity: 1, y: 0 })
        return
      }

      // ---- Entrance ----
      const tl = gsap.timeline({ delay: 0.3 })

      tl.fromTo(
        videoWrapRef.current,
        { scale: 1.12, filter: 'brightness(0.4)' },
        { scale: 1, filter: 'brightness(1)', duration: 2.2, ease: 'power2.out' }
      )

      if (chars) {
        tl.fromTo(
          chars,
          { opacity: 0, y: '0.35em' },
          {
            opacity: 1,
            y: 0,
            duration: 1.4,
            ease: 'power4.out',
            stagger: 0.07,
          },
          '-=1.6'
        )
      }

      tl.fromTo(
        taglineRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
        '-=0.8'
      ).fromTo(
        scrollHintRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1 },
        '-=0.3'
      )

      // ---- Scroll: video zooms + darkens, content drifts up ----
      gsap.to(videoWrapRef.current, {
        scale: 1.15,
        filter: 'brightness(0.4)',
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      gsap.to(`.${styles.content}`, {
        y: -100,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: '75% top',
          scrub: true,
        },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [ready])

  return (
    <section ref={rootRef} className={styles.hero}>
      <div ref={videoWrapRef} className={styles.videoWrap}>
        <video
          className={styles.video}
          src="/videos/hero-loop.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        {/* warm amber grade over the footage */}
        <div className={styles.grade}></div>
      </div>

      <div className={styles.vignette}></div>

      <GoldDust density={40} />

      <div className={styles.content}>
        <h1 ref={wordmarkRef} className={styles.wordmark} aria-label="AURUM">
          {WORDMARK.split('').map((c, i) => (
            <span key={i} className={styles.char} aria-hidden="true">
              {c}
            </span>
          ))}
        </h1>

        <p ref={taglineRef} className={styles.tagline}>
          Fine JEWELLERY, <em>made for</em> GENERATIONS.
        </p>
      </div>

      <div ref={scrollHintRef} className={styles.scrollHint}>
        <span className={styles.scrollLabel}>Scroll</span>
        <span className={styles.scrollLine}></span>
      </div>
    </section>
  )
}
