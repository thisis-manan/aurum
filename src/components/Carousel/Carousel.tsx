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

export default function Carousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const isDraggingRef = useRef(false)
  const dragStart = useRef({ x: 0, scrollLeft: 0 })

  const handleScroll = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const slides = Array.from(track.querySelectorAll<HTMLElement>(`.${styles.slide}`))
    if (slides.length === 0) return
    // Active slide = the one whose centre is closest to the viewport centre
    const viewportCenter = track.scrollLeft + track.clientWidth / 2
    let closest = 0
    let smallest = Infinity
    slides.forEach((el, i) => {
      const slideCenter = el.offsetLeft + el.offsetWidth / 2
      const distance = Math.abs(slideCenter - viewportCenter)
      if (distance < smallest) {
        smallest = distance
        closest = i
      }
    })
    setActiveIndex(closest)
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current
    if (!track) return
    isDraggingRef.current = true
    setIsDragging(true)
    dragStart.current = { x: e.clientX, scrollLeft: track.scrollLeft }
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    const track = trackRef.current
    if (!track) return
    const delta = (e.clientX - dragStart.current.x) * 2
    track.scrollLeft = dragStart.current.scrollLeft - delta
  }, [])

  const stopDrag = useCallback(() => {
    isDraggingRef.current = false
    setIsDragging(false)
  }, [])

  return (
    <div className={styles.wrapper}>
      <div className={`container ${styles.header}`}>
        <div>
          <p className={styles.eyebrow}>THE AURUM EDIT</p>
          <h2 className={styles.title}>A Story in Gold</h2>
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
        {SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            className={`${styles.slide}${i === activeIndex ? "" : ` ${styles.dimmed}`}`}
          >
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
