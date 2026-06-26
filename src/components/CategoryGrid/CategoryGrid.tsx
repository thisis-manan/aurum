import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CATEGORIES } from '@/data/products'
import styles from './CategoryGrid.module.css'

gsap.registerPlugin(ScrollTrigger)

export default function CategoryGrid() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cells = gridRef.current?.querySelectorAll(`.${styles.categoryCell}`)
    
    if (cells) {
      gsap.fromTo(
        cells,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      )
    }
  }, [])

  return (
    <section className={`section container ${styles.categoryGrid}`}>
      <div className={styles.header}>
        <p className="eyebrow">THE COLLECTION</p>
        <h2 className="headline">Discover Our World</h2>
      </div>

      <div ref={gridRef} className={styles.grid}>
        {CATEGORIES.map((cat) => (
          <a
            key={cat.id}
            href={cat.href}
            className={`${styles.categoryCell} ${styles[cat.label.toLowerCase()]}`}
          >
            <img src={cat.imageUrl} alt={cat.label} className={styles.categoryImage} />
            <div className={styles.labelOverlay}>
              <h3>{cat.label}</h3>
              <span>EXPLORE &rarr;</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}