import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Craft.module.css'

gsap.registerPlugin(ScrollTrigger)

/**
 * Craft — three editorial acts, each with its own photograph.
 * Rows alternate image left / image right. Frames wipe open toward
 * the text, footage settles from a deep zoom with scroll parallax,
 * and every reveal replays in both scroll directions.
 */

const CHAPTERS = [
  {
    n: '01',
    title: 'Sourcing',
    body: 'Only recycled and fair-mined gold enters the atelier. Each ingot is traced back to its origin before a single tool touches it.',
    img: 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    n: '02',
    title: 'Shaping',
    body: 'Hands, not machines, set the pace. A single band can pass through the same artisan’s fingers over four hundred times.',
    img: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80',
  },
  {
    n: '03',
    title: 'Finishing',
    body: 'The final polish is done under natural morning light — the only light honest enough to reveal every imperfection.',
    img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80',
  },
]

export default function Craft() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>(`.${styles.row}`)

      if (reduced) {
        gsap.set(`.${styles.titleInner}`, { yPercent: 0 })
        rows.forEach((row) => {
          gsap.set(row.querySelector(`.${styles.frame}`), {
            clipPath: 'inset(0% 0% 0% 0%)',
          })
          gsap.set(row.querySelectorAll(`.${styles.rise}`), { opacity: 1, y: 0 })
          gsap.set(row.querySelector(`.${styles.img}`), { scale: 1.15 })
        })
        return
      }

      // section title rises out of a mask — replays both ways
      gsap.fromTo(
        `.${styles.titleInner}`,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: `.${styles.header}`,
            start: 'top 80%',
            toggleActions: 'play reverse play reverse',
          },
        }
      )

      rows.forEach((row, i) => {
        const frame = row.querySelector(`.${styles.frame}`)
        const img = row.querySelector(`.${styles.img}`)
        const items = row.querySelectorAll(`.${styles.rise}`)
        const rule = row.querySelector(`.${styles.rule}`)
        const alt = i % 2 === 1

        // frame wipes open toward the text column
        gsap.fromTo(
          frame,
          { clipPath: alt ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.4,
            ease: 'power4.inOut',
            scrollTrigger: {
              trigger: row,
              start: 'top 72%',
              toggleActions: 'play reverse play reverse',
            },
          }
        )

        // footage settles from a deep zoom as the frame opens
        gsap.fromTo(
          img,
          { scale: 1.45 },
          {
            scale: 1.15,
            duration: 2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: row,
              start: 'top 72%',
              toggleActions: 'play reverse play reverse',
            },
          }
        )

        // slow parallax inside the frame while the row scrolls past
        gsap.fromTo(
          img,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: {
              trigger: row,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        )

        // number → title → body stagger in
        gsap.fromTo(
          items,
          { opacity: 0, y: 46 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: row,
              start: 'top 68%',
              toggleActions: 'play reverse play reverse',
            },
          }
        )

        // gold divider draws itself
        gsap.fromTo(
          rule,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.1,
            ease: 'power3.inOut',
            transformOrigin: 'left center',
            scrollTrigger: {
              trigger: row,
              start: 'top 62%',
              toggleActions: 'play reverse play reverse',
            },
          }
        )
      })
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className={styles.craft}>
      <div className={styles.header}>
        <p className="eyebrow">THE MAKING</p>
        <h2 className={`headline ${styles.title}`}>
          <span className={styles.titleMask}>
            <span className={styles.titleInner}>Craft, in three acts.</span>
          </span>
        </h2>
      </div>

      <div className={styles.acts}>
        {CHAPTERS.map((c, i) => (
          <article
            key={c.n}
            className={`${styles.row} ${i % 2 === 1 ? styles.rowAlt : ''}`}
          >
            <div className={styles.mediaCol}>
              <div className={styles.frame}>
                <img className={styles.img} src={c.img} alt={c.title} loading="lazy" />
                <div className={styles.actTag} aria-hidden="true">
                  Act {c.n}
                </div>
              </div>
            </div>

            <div className={styles.textBlock}>
              <span className={`${styles.bigNum} ${styles.rise}`}>{c.n}</span>
              <h3 className={`${styles.chapterTitle} ${styles.rise}`}>{c.title}</h3>
              <p className={`${styles.chapterBody} ${styles.rise}`}>{c.body}</p>
              <div className={styles.rule} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
