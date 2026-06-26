import { useRef, useState, useCallback } from "react"
import styles from "./Carousel.module.css"

interface Slide {
  id: number
  name: string
  subtitle: string
  imageUrl: string
}

const SLIDES: Slide[] = [
  {
    id: 1,
    name: "Soleil Collection",
    subtitle: "18k Yellow Gold · New Arrival",
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=80&fit=crop",
  },
  {
    id: 2,
    name: "The Arc Series",
    subtitle: "Platinum · Signature Series",
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1400&q=80&fit=crop",
  },
  {
    id: 3,
    name: "Nuit Profonde",
    subtitle: "Blue Sapphire · Limited Edition",
    imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1400&q=80&fit=crop",
  },
  {
    id: 4,
    name: "Maison Classique",
    subtitle: "Rose Gold · Heritage Est. 1892",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2070&auto=format&fit=crop",
  },
]

const SLIDE_GAP = 24

export default function Carousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, scrollLeft: 0 })

  const handleScroll = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const slideEl = track.querySelector<HTMLElement>(`.${styles.slide}`)
    if (!slideEl) return
    const slideWidth = slideEl.offsetWidth + SLIDE_GAP
    const idx = Math.round(track.scrollLeft / slideWidth)
    setActiveIndex(Math.max(0, Math.min(idx, SLIDES.length - 1)))
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current
    if (!track) return
    setIsDragging(true)
    dragStart.current = { x: e.clientX, scrollLeft: track.scrollLeft }
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const track = trackRef.current
    if (!track) return
    const delta = (e.clientX - dragStart.current.x) * 2
    track.scrollLeft = dragStart.current.scrollLeft - delta
  }, [isDragging])

  const stopDrag = useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <div className={styles.wrapper}>
      <div className={`container ${styles.header}`}>
        <div>
          <p className="eyebrow">THE AURUM EDIT</p>
          <h2 className="headline">A Story in Gold</h2>
        </div>
        <span className={styles.dragLabel}>&larr; Drag to Explore</span>
      </div>

      <div
        ref={trackRef}
        className={`${styles.track}${isDragging ? ` ${styles.dragging}` : ""}`}
        onScroll={handleScroll}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        {SLIDES.map((slide) => (
          <div key={slide.id} className={styles.slide}>
            <img src={slide.imageUrl} alt={slide.name} className={styles.slideImage} draggable={false} />
            <div className={styles.slideOverlay} />
            <div className={styles.slideContent}>
              <span className={styles.slideName}>{slide.name}</span>
              <span className={styles.slideSubtitle}>{slide.subtitle}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={`container ${styles.footerControls}`}>
        <div className={styles.dots}>
          {SLIDES.map((_, i) => (
            <span key={i} className={`${styles.dot}${i === activeIndex ? ` ${styles.active}` : ""}`} />
          ))}
        </div>
        <span className={styles.counter}>[{activeIndex + 1}/{SLIDES.length}]</span>
      </div>
    </div>
  )
}