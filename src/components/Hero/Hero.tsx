import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import styles from './Hero.module.css'

export default function Hero() {
  const eyebrowRef = useRef<HTMLParagraphElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 })

    tl.fromTo(eyebrowRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo(headlineRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo(buttonRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6 },
      '-=0.3'
    )
  }, [])

  return (
    <section className={styles.hero}>
      <video
        className={styles.video}
        src="/videos/hero-loop.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className={styles.overlay}></div>
      <div className={styles.content}>
        <p ref={eyebrowRef} className="eyebrow">NEW COLLECTION</p>
        <h1 ref={headlineRef} className={styles.title}>Crafted to Last a Lifetime.</h1>
        <button ref={buttonRef} className="btn-ghost">Explore Now</button>
        <div className={styles.scrollIndicator}>↓</div>
      </div>
    </section>
  )
}