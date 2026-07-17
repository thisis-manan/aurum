import { useEffect, useRef, useState } from 'react'
import { PRODUCTS } from '@/data/products'
import { CATEGORY_LABELS, useCategory } from '@/context/CategoryContext'
import ProductCard from './SlideProductCard'
import styles from './ProductShowcase.module.css'

const MAX_ROTATE_Y = 62
const CATEGORY_ORDER = ['Rings', 'Necklaces', 'Bracelets', 'Earrings']

export default function ProductShowcase() {
  // 1. Default the category context to 'All' on mount for the continuous flow
  const { categoryLabel, setCategoryLabel } = useCategory()
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  
  const [currentVisibleCategory, setCurrentVisibleCategory] = useState('Rings')

  // Group items sequentially across categories if 'All' is active
  const items = (() => {
    if (categoryLabel === 'All') {
      return [...PRODUCTS].sort((a, b) => {
        return CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
      })
    }
    return PRODUCTS.filter((p) => p.category === categoryLabel)
  })()

  cardRefs.current = cardRefs.current.slice(0, items.length)

  const applyWheelTransforms = () => {
    const wrapper = scrollRef.current
    if (!wrapper) return
    const centerX = wrapper.clientWidth / 2
    const scrollLeft = wrapper.scrollLeft

    cardRefs.current.forEach((el) => {
      if (!el) return
      const cardCenter = el.offsetLeft + el.offsetWidth / 2 - scrollLeft
      const offset = cardCenter - centerX
      const ratio = Math.max(-1.6, Math.min(1.6, offset / centerX))
      const absRatio = Math.min(Math.abs(ratio), 1)
      el.style.transform = `translateY(${absRatio * 0}px) rotateY(${-ratio * MAX_ROTATE_Y}deg)`
    })
  }

  const handleScroll = () => {
    const wrapper = scrollRef.current
    if (!wrapper) return

    applyWheelTransforms()

    if (categoryLabel === 'All') {
      const scrollLeft = wrapper.scrollLeft
      const centerX = wrapper.clientWidth / 2
      let closestCategory = currentVisibleCategory
      let minDistance = Infinity

      cardRefs.current.forEach((el, i) => {
        if (!el || !items[i]) return
        const cardCenter = el.offsetLeft + el.offsetWidth / 2 - scrollLeft
        const distance = Math.abs(cardCenter - centerX)

        if (distance < minDistance) {
          minDistance = distance
          closestCategory = items[i].category
        }
      })

      if (closestCategory !== currentVisibleCategory) {
        setCurrentVisibleCategory(closestCategory)
      }
    }
  }

  // Set default category to 'All' when component mounts
  useEffect(() => {
    setCategoryLabel('All')
  }, [setCategoryLabel])

  useEffect(() => {
    const wrapper = scrollRef.current
    if (!wrapper) return
    
    applyWheelTransforms()
    wrapper.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', applyWheelTransforms)
    return () => {
      wrapper.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', applyWheelTransforms)
    }
  }, [categoryLabel, items.length, currentVisibleCategory])

  // 2. SMART SCROLL TRAP RELEASE MANIPULATION
  useEffect(() => {
    const wrapper = scrollRef.current
    if (!wrapper) return

    const handleWheelConversion = (e: WheelEvent) => {
      if (e.deltaY === 0) return

      const scrollLeft = wrapper.scrollLeft
      const maxScrollLeft = wrapper.scrollWidth - wrapper.clientWidth

      // Check if we are moving forward and have horizontal runway left
      const canScrollRight = e.deltaY > 0 && scrollLeft < maxScrollLeft - 1
      // Check if we are moving backward and have horizontal runway left
      const canScrollLeft = e.deltaY < 0 && scrollLeft > 1

      if (canScrollRight || canScrollLeft) {
        // Intercept and convert to premium horizontal glide
        e.preventDefault()
        wrapper.scrollLeft += e.deltaY * 0.85
      }
      // If we hit the bounds (0 or max), e.preventDefault() is NOT called, 
      // allowing Lenis to smoothly carry the viewport down to the footer!
    }

    wrapper.addEventListener('wheel', handleWheelConversion, { passive: false })
    return () => {
      wrapper.removeEventListener('wheel', handleWheelConversion)
    }
  }, [categoryLabel, items.length])

  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0, behavior: 'auto' })
    applyWheelTransforms()
  }, [categoryLabel])

  return (
    <section className={`container ${styles.section}`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Our Pieces</h2>
          <p className={styles.subtitle}>Fine Jewellery</p>
        </div>

        <div className={styles.filters}>
          {CATEGORY_LABELS.map((filter) => {
            const isTabActive =
              categoryLabel === filter ||
              (categoryLabel === 'All' && currentVisibleCategory === filter)

            return (
              <button
                key={filter}
                className={`${styles.filterTab} ${isTabActive ? styles.active : ''}`}
                onClick={() => setCategoryLabel(filter)}
              >
                {filter}
              </button>
            )
          })}
        </div>
      </div>

      <div 
        className={styles.scrollWrapper} 
        ref={scrollRef}
        data-lenis-prevent
        style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
      >
        <div className={styles.grid} style={{ transformStyle: 'preserve-3d' }}>
          {items.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              ref={(el) => { cardRefs.current[index] = el }}
              className={styles.wheelCardSlot}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}