import { useState, useRef, useCallback, useLayoutEffect } from 'react'
import { PRODUCTS } from '@/data/products'
import type { Product } from '@/types'
import ProductCard from './SlideProductCard'
import styles from './ProductShowcase.module.css'
import { useSectionScrollLock } from './useSectionScrollLock'

const FILTERS = ['All', 'Rings', 'Necklaces', 'Bracelets', 'Earrings']

const LERP_EASE = 0.038
const FRICTION = 0.978
const SCROLL_TO_HORIZONTAL = 1.2

const MAX_ROTATE_Y = 62
const ARC_HEIGHT = 0

const EDGE_CLONE_COUNT = 3

const MIN_ITEMS_FOR_LOOP = EDGE_CLONE_COUNT * 2

export default function ProductShowcase() {
  const [activeFilter, setActiveFilter] = useState('All')
  const sectionRef = useRef<HTMLElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const cardMeta = useRef<{ left: number; width: number }[]>([])

  const current = useRef(0)
  const target = useRef(0)
  const maxScroll = useRef(0)
  const rafId = useRef<number | null>(null)
  const velocity = useRef(0)

  const clamp = (v: number) => Math.min(Math.max(v, 0), maxScroll.current)

  const filtered: Product[] =
    activeFilter === 'All'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeFilter)

  console.log('[catalog-debug]', { totalProducts: PRODUCTS.length, filteredCount: filtered.length, activeFilter })

  const enableCarousel = filtered.length >= MIN_ITEMS_FOR_LOOP

  const displayItems: (Product & { _slotKey: string })[] =
    enableCarousel
      ? [
          ...filtered.slice(-EDGE_CLONE_COUNT).map((p) => ({ ...p, _slotKey: `head-clone-${p.id}` })),
          ...filtered.map((p) => ({ ...p, _slotKey: `real-${p.id}` })),
          ...filtered.slice(0, EDGE_CLONE_COUNT).map((p) => ({ ...p, _slotKey: `tail-clone-${p.id}` })),
        ]
      : filtered.map((p) => ({ ...p, _slotKey: `real-${p.id}` }))

  const measure = useCallback(() => {
    const wrapper = wrapperRef.current
    const grid = gridRef.current
    if (!wrapper || !grid) return
    maxScroll.current = Math.max(0, grid.scrollWidth - wrapper.clientWidth)
    target.current = clamp(target.current)

    cardMeta.current = cardRefs.current.map((el) =>
      el ? { left: el.offsetLeft, width: el.offsetWidth } : { left: 0, width: 0 }
    )
  }, [])

  const applyWheelTransforms = useCallback(() => {
    if (!enableCarousel) return // static grid — no rotate/arc transform needed
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const wrapperWidth = wrapper.clientWidth
    const centerX = wrapperWidth / 2

    cardRefs.current.forEach((el, i) => {
      if (!el) return
      const meta = cardMeta.current[i]
      if (!meta) return

      const cardCenter = meta.left + meta.width / 2 - current.current
      const offset = cardCenter - centerX
      const ratio = Math.max(-1.6, Math.min(1.6, offset / centerX))
      const absRatio = Math.min(Math.abs(ratio), 1)

      const rotateY = -ratio * MAX_ROTATE_Y
      const arcY = absRatio * ARC_HEIGHT

      el.style.transform = `translateY(${arcY}px) rotateY(${rotateY}deg)`
    })
  }, [enableCarousel])

  const applyGridTransform = useCallback(() => {
    const grid = gridRef.current
    if (!grid) return
    grid.style.transform = `translate3d(${-current.current}px, 0, 0)`
  }, [])

  const tick = useCallback(() => {
    if (Math.abs(velocity.current) > 0.05) {
      target.current = clamp(target.current + velocity.current)
      velocity.current *= FRICTION
    } else {
      velocity.current = 0
    }

    current.current += (target.current - current.current) * LERP_EASE

    applyGridTransform()
    applyWheelTransforms()

    const settled =
      Math.abs(velocity.current) < 0.05 &&
      Math.abs(target.current - current.current) < 0.05

    if (!settled) {
      rafId.current = requestAnimationFrame(tick)
    } else {
      current.current = target.current
      applyGridTransform()
      applyWheelTransforms()
      rafId.current = null
    }
  }, [applyWheelTransforms, applyGridTransform])

  const ensureLoop = useCallback(() => {
    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(tick)
    }
  }, [tick])

  const scrollToOpeningPosition = useCallback(() => {
    const realStartIndex = filtered.length > EDGE_CLONE_COUNT ? EDGE_CLONE_COUNT : 0
    const meta = cardMeta.current[realStartIndex]
    if (!meta) return
    const PEEK = 90
    const offset = clamp(meta.left - PEEK)
    target.current = offset
    current.current = offset
  }, [filtered.length])

  useLayoutEffect(() => {
    measure()
    scrollToOpeningPosition()
    applyGridTransform()
    applyWheelTransforms()

    window.addEventListener('resize', measure)

    const grid = gridRef.current
    let ro: ResizeObserver | null = null
    if (grid && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        measure()
        scrollToOpeningPosition()
        applyGridTransform()
        applyWheelTransforms()
      })
      ro.observe(grid)
    }

    return () => {
      window.removeEventListener('resize', measure)
      if (ro) ro.disconnect()
      if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    }
  }, [measure, applyWheelTransforms, applyGridTransform, scrollToOpeningPosition])
  const onDelta = useCallback((dy: number) => {
    velocity.current = 0
    target.current = clamp(target.current + dy * SCROLL_TO_HORIZONTAL)
    console.log('[carousel-debug]', { dy, target: target.current, current: current.current, maxScroll: maxScroll.current })
    ensureLoop()
  }, [ensureLoop])

  const getProgress = useCallback(() => ({
    progress: target.current,
    max: maxScroll.current,
  }), [])

  // Real painted bounds of the cards, including their CSS transforms
  // (stagger translateY, rotate tilt, 3D rotateY, etc). The section's own
  // getBoundingClientRect() does NOT grow to fit transformed children, so
  // handing the lock hook the section rect alone caused it to dock the
  // carousel too high/low and clip cards that visually sit above/below the
  // section's untransformed box (e.g. rotated/staggered slideCards).
  const getContentRect = useCallback(() => {
    const els = cardRefs.current.filter((el): el is HTMLDivElement => el !== null)
    if (els.length === 0) return null

    let top = Infinity
    let bottom = -Infinity
    for (const el of els) {
      const r = el.getBoundingClientRect()
      if (r.top < top) top = r.top
      if (r.bottom > bottom) bottom = r.bottom
    }
    if (!isFinite(top) || !isFinite(bottom)) return null
    return { top, height: bottom - top }
  }, [])

  useSectionScrollLock({
    sectionRef,
    onDelta,
    getProgress,
    enabled: enableCarousel,
    getContentRect,
  })

  const handleFilter = (filter: string) => {
    setActiveFilter(filter)
    velocity.current = 0
    requestAnimationFrame(() => {
      measure()
      scrollToOpeningPosition()
      applyGridTransform()
      applyWheelTransforms()
    })
  }

  return (
    <section ref={sectionRef} className={`section container ${styles.section}`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Our Pieces</h2>
          <p className={styles.subtitle}>Fine Jewellery</p>
        </div>

        <div className={styles.filters}>
          {FILTERS.map((filter) => (
            <button
              key={filter}
              className={`${styles.filterTab} ${activeFilter === filter ? styles.active : ''}`}
              onClick={() => handleFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.scrollWrapper} ref={wrapperRef}>
        <div className={`${styles.grid} ${enableCarousel ? '' : styles.gridStatic}`} ref={gridRef}>
          {displayItems.map((product, index) => (
            <div
              key={product._slotKey}
              ref={(el) => { cardRefs.current[index] = el }}
              className={styles.wheelCardSlot}
              aria-hidden={product._slotKey.startsWith('real-') ? undefined : true}
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}