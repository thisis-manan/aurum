import { useEffect, useState } from 'react'
import { useCategory } from '../../context/CategoryContext'
import styles from './ClockMenu.module.css'

type Page = {
  key: string
  label: string
  route: string
  sub: string[]
  slot: { left: number; top: number }
}

const PAGES: Page[] = [
  { key: 'about', label: 'About', route: 'about', sub: [], slot: { left: 12.14, top: 88 } },
  { key: 'ring', label: 'Ring', route: 'ring', sub: [], slot: { left: 23.13, top: 62 } },
  { key: 'necklaces', label: 'Necklaces', route: 'necklaces', sub: [], slot: { left: 50, top: 48 } },
  { key: 'earrings', label: 'Earrings', route: 'earrings', sub: [], slot: { left: 76.87, top: 62 } },
  { key: 'bracelets', label: 'Bracelets', route: '', sub: [], slot: { left: 87.86, top: 88 } },
]

const JEWELRY_KEYS = ['ring', 'necklaces', 'earrings', 'bracelets'] as const

const CENTER = { left: 50, top: 92 }
const ASPECT = 2

function aimDeg(slot: { left: number; top: number }) {
  const dx = (slot.left - CENTER.left) * ASPECT
  const dy = slot.top - CENTER.top
  return (Math.atan2(dy, dx) * 180) / Math.PI
}

function lerpAim(a: number, b: number, t: number) {
  let diff = b - a
  if (diff > 180) diff -= 360
  if (diff < -180) diff += 360
  return a + diff * t
}

const routeToKey: Record<string, string> = {
  '': 'bracelets',
  necklaces: 'necklaces',
  about: 'about',
  ring: 'ring',
  earrings: 'earrings',
}

function currentKey() {
  const route = window.location.hash.replace(/^#\/?/, '')
  return routeToKey[route] ?? 'necklaces'
}

export interface ClockMenuProps {
  galleryProgress?: number
}

export default function ClockMenu({ galleryProgress }: ClockMenuProps) {
  const { categoryKey, setCategoryKey } = useCategory()
  const controlled = galleryProgress !== undefined
  const [hashKey, setHashKey] = useState(currentKey())

  useEffect(() => {
    if (controlled) return
    const onHash = () => setHashKey(currentKey())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [controlled])

  let activeKey = controlled ? categoryKey : hashKey
  let aim = aimDeg(PAGES.find((p) => p.key === activeKey)?.slot ?? PAGES[2].slot)

  if (controlled) {
    const progress = galleryProgress ?? 0
    const segIdx = Math.min(3, Math.max(0, Math.floor(progress * 4)))
    const segT = (progress * 4) % 1
    activeKey = JEWELRY_KEYS[segIdx]
    const cur = PAGES.find((p) => p.key === JEWELRY_KEYS[segIdx])!
    const nxt = PAGES.find((p) => p.key === JEWELRY_KEYS[(segIdx + 1) % 4])!
    aim = lerpAim(aimDeg(cur.slot), aimDeg(nxt.slot), segT)
  }

  const go = (route: string, key: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (JEWELRY_KEYS.includes(key as (typeof JEWELRY_KEYS)[number])) {
      setCategoryKey(key as (typeof JEWELRY_KEYS)[number])
      return
    }
    window.location.hash = route ? `#/${route}` : '#/'
  }

  return (
    <nav className={styles.clockMenu} aria-label="Primary">
      <div className={styles.viewport}>
        <ul className={styles.dial}>
          {PAGES.map((page) => {
            const isActive = page.key === activeKey
            return (
              <li
                key={page.key}
                className={styles.item}
                data-active={isActive}
                style={
                  {
                    '--slot-left': `${page.slot.left}%`,
                    '--slot-top': `${page.slot.top}%`,
                  } as React.CSSProperties
                }
              >
                <a
                  className={styles.primaryLink}
                  href={page.route ? `#/${page.route}` : '#/'}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={go(page.route, page.key)}
                >
                  {page.label}
                </a>
              </li>
            )
          })}
        </ul>

        <div className={`${styles.clock} ${controlled ? styles.clockSynced : ''}`} aria-hidden="true" style={{ '--aim': aim } as React.CSSProperties}>
          <span className={`${styles.hand} ${styles.handMinute}`} />
          <span className={`${styles.hand} ${styles.handHour}`} />
          <span className={styles.pin} />
        </div>
      </div>
    </nav>
  )
}
