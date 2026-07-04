import { useState, useRef, useCallback, useEffect } from 'react'
import { PRODUCTS } from '@/data/products'
import type { Product } from '@/types'
import ProductCard from './SlideProductCard'
import styles from './ProductShowcase.module.css'

const FILTERS = ['All', 'Rings', 'Necklaces', 'Bracelets', 'Earrings']

const LERP_EASE = 0.038
const DRAG_SPEED = 0.75
const FRICTION = 0.978
const MAX_VELOCITY = 35
const VELOCITY_SAMPLE_WINDOW = 120

const MAX_ROTATE_Y = 62
const ARC_HEIGHT = 0 

const EDGE_CLONE_COUNT = 3

export default function ProductShowcase() {
  const [activeFilter, setActiveFilter] = useState('All')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const cardMeta = useRef<{ left: number; width: number }[]>([])

  const current = useRef(0)
  const target = useRef(0)
  const maxScroll = useRef(0)
  const rafId = useRef<number | null>(null)

  const isDragging = useRef(false)
  const startX = useRef(0)
  const startTarget = useRef(0)
  const velocity = useRef(0)
  const samples = useRef<{ x: number; t: number }[]>([])

  const clamp = (v: number) => Math.min(Math.max(v, 0), maxScroll.current)

  const filtered: Product[] =
    activeFilter === 'All'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeFilter)

  
  const displayItems: (Product & { _slotKey: string })[] =
    filtered.length > EDGE_CLONE_COUNT
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
  }, [])

  const tick = useCallback(() => {
    if (!isDragging.current) {
      if (Math.abs(velocity.current) > 0.05) {
        target.current = clamp(target.current + velocity.current)
        velocity.current *= FRICTION
      } else {
        velocity.current = 0
      }
    }

    current.current += (target.current - current.current) * LERP_EASE

    const grid = gridRef.current
    if (grid) {
      grid.style.transform = `translate3d(${-current.current}px, 0, 0)`
    }
    applyWheelTransforms()

    const settled =
      !isDragging.current &&
      Math.abs(velocity.current) < 0.05 &&
      Math.abs(target.current - current.current) < 0.05

    if (!settled) {
      rafId.current = requestAnimationFrame(tick)
    } else {
      current.current = target.current
      if (grid) grid.style.transform = `translate3d(${-current.current}px, 0, 0)`
      applyWheelTransforms()
      rafId.current = null
    }
  }, [applyWheelTransforms])

  const ensureLoop = useCallback(() => {
    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(tick)
    }
  }, [tick])

  
  const scrollToOpeningPosition = useCallback(() => {
    const realStartIndex = filtered.length > EDGE_CLONE_COUNT ? EDGE_CLONE_COUNT : 0
    const meta = cardMeta.current[realStartIndex]
    if (!meta) return
    const PEEK = 90 // px of the previous card left visible on load
    const offset = clamp(meta.left - PEEK)
    target.current = offset
    current.current = offset
  }, [filtered.length])

  useEffect(() => {
    measure()
    scrollToOpeningPosition()
    applyWheelTransforms()
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('resize', measure)
      if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    }
  }, [measure, applyWheelTransforms, scrollToOpeningPosition])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    isDragging.current = true
    velocity.current = 0
    startX.current = e.clientX
    startTarget.current = target.current
    samples.current = [{ x: e.clientX, t: performance.now() }]
    wrapper.classList.add(styles.dragging)
    wrapper.setPointerCapture(e.pointerId)
    ensureLoop()
  }, [ensureLoop])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return
    const dx = (e.clientX - startX.current) * DRAG_SPEED
    target.current = clamp(startTarget.current - dx)

    const now = performance.now()
    samples.current.push({ x: e.clientX, t: now })
    while (samples.current.length > 1 && now - samples.current[0].t > VELOCITY_SAMPLE_WINDOW) {
      samples.current.shift()
    }
  }, [])

  const endDrag = useCallback((e: React.PointerEvent) => {
    const wrapper = wrapperRef.current
    if (!wrapper || !isDragging.current) return
    isDragging.current = false
    wrapper.classList.remove(styles.dragging)
    wrapper.releasePointerCapture(e.pointerId)

    const buf = samples.current
    if (buf.length >= 2) {
      const first = buf[0]
      const last = buf[buf.length - 1]
      const dt = last.t - first.t
      if (dt > 0) {
        const raw = -((last.x - first.x) / dt) * 16 * DRAG_SPEED
        velocity.current = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, raw))
      }
    }
    ensureLoop()
  }, [ensureLoop])

  const handleFilter = (filter: string) => {
    setActiveFilter(filter)
    velocity.current = 0
    requestAnimationFrame(() => {
      measure()
      scrollToOpeningPosition()
      applyWheelTransforms()
    })
  }

  return (
    <section className={`section container ${styles.section}`}>
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

      <div
        className={styles.scrollWrapper}
        ref={wrapperRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <div className={styles.grid} ref={gridRef}>
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