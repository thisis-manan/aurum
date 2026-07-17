import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Story.module.css'

gsap.registerPlugin(ScrollTrigger)

/**
 * Story — parchment editorial statements (VERO language).
 * Huge mixed roman/italic serif lines with media tucked inline
 * between the words. Each line rises out of a masked row;
 * inline media scales open as it enters.
 */

export default function Story() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      const blocks = gsap.utils.toArray<HTMLElement>(`.${styles.statement}`)

      blocks.forEach((block) => {
        const lines = block.querySelectorAll(`.${styles.lineInner}`)
        const media = block.querySelectorAll(`.${styles.mediaInner}`)
        const assets = block.querySelectorAll(`.${styles.mediaAsset}`)

        if (reduced) {
          gsap.set(lines, { yPercent: 0 })
          gsap.set(media, { clipPath: 'inset(0% 0% 0% 0% round 999px)' })
          gsap.set(assets, { scale: 1.15 })
          return
        }

        gsap.fromTo(
          lines,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1.4,
            ease: 'power4.out',
            stagger: 0.12,
            scrollTrigger: {
              trigger: block,
              start: 'top 72%',
              toggleActions: 'play reverse play reverse',
            },
          }
        )

        // the media window wipes open left → right like a shutter
        gsap.fromTo(
          media,
          { clipPath: 'inset(0% 100% 0% 0% round 999px)' },
          {
            clipPath: 'inset(0% 0% 0% 0% round 999px)',
            duration: 1.5,
            ease: 'power4.inOut',
            delay: 0.45,
            scrollTrigger: {
              trigger: block,
              start: 'top 72%',
              toggleActions: 'play reverse play reverse',
            },
          }
        )

        // footage settles from a deep zoom as the shutter opens
        gsap.fromTo(
          assets,
          { scale: 1.6 },
          {
            scale: 1.15,
            duration: 2.2,
            ease: 'power3.out',
            delay: 0.45,
            scrollTrigger: {
              trigger: block,
              start: 'top 72%',
              toggleActions: 'play reverse play reverse',
            },
          }
        )

        // gentle parallax inside the window while scrolling past
        assets.forEach((a) => {
          gsap.fromTo(
            a,
            { yPercent: -7 },
            {
              yPercent: 7,
              ease: 'none',
              scrollTrigger: {
                trigger: block,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            }
          )
        })
      })
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className={styles.story}>
      {/* Statement I — with inline image swatch */}
      <div className={styles.statement}>
        <p className={styles.line}>
          <span className={styles.lineInner}>YOUR MOST</span>
        </p>
        <p className={styles.line}>
          <span className={styles.lineInner}>
            <em>precious</em>
            <span className={styles.media}>
              <span className={styles.mediaInner}>
                <img
                  className={styles.mediaAsset}
                  src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"
                  alt=""
                  loading="lazy"
                />
              </span>
            </span>
            METAL
          </span>
        </p>
      </div>

      {/* Statement II */}
      <div className={styles.statement}>
        <p className={styles.line}>
          <span className={styles.lineInner}>DESERVES TO</span>
        </p>
        <p className={styles.line}>
          <span className={styles.lineInner}>
            LAST <em>forever.</em>
          </span>
        </p>
      </div>

      {/* Statement III — with inline video swatch */}
      <div className={styles.statement}>
        <p className={styles.line}>
          <span className={styles.lineInner}>
            <em>where</em> INNOVATION
          </span>
        </p>
        <p className={styles.line}>
          <span className={styles.lineInner}>
            <em>meets</em>
            <span className={styles.media}>
              <span className={styles.mediaInner}>
                <video
                  className={styles.mediaAsset}
                  src="/videos/video1.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </span>
            </span>
            CRAFTSMANSHIP
          </span>
        </p>
      </div>
    </section>
  )
}
