import { useEffect, useState } from 'react'
import styles from './ClockMenu.module.css'

/**
 * ClockMenu — the shared radial "clock" dial navigation from meech213.com.
 *
 * Five pages sit at fixed points along an arc anchored at the bottom-centre of
 * the viewport. The active page (current route) lights up in place, and the
 * clock hand rotates to point directly at it. Slot geometry + styling are
 * lifted from the original.
 */

type Page = {
  key: string
  label: string
  route: string
  sub: string[]
  slot: { left: number; top: number } // % within the dial viewport
}

// Each page pinned to one arc slot (positions from the original nth-child rules).
const PAGES: Page[] = [
  { key: 'about', label: 'About', route: 'about', sub: [], slot: { left: 12.14, top: 79.47 } },
  { key: 'ring', label: 'Ring', route: 'ring', sub: [/** 'Brands', 'Magazines', 'Personal'*/], slot: { left: 23.13, top: 47.23 } },
  { key: 'necklaces', label: 'Necklaces', route: 'necklaces', sub: [/**'Beauty', 'Brands', 'Artiste', 'Fashion', 'Magazines'**/], slot: { left: 50, top: 32 } },
  { key: 'earrings', label: 'Earrings', route: 'earrings', sub: [], slot: { left: 76.87, top: 47.23 } },
  { key: 'bracelets', label: 'Bracelets', route: '', sub: [], slot: { left: 87.86, top: 79.47 } },
]

// Dial anchor (transform-origin of the hands) and its 2:1 aspect (W = 2·H),
// so we must scale the horizontal delta when aiming the hand.
const CENTER = { left: 50, top: 84 }
const ASPECT = 2

function aimDeg(slot: { left: number; top: number }) {
  const dx = (slot.left - CENTER.left) * ASPECT
  const dy = slot.top - CENTER.top
  return (Math.atan2(dy, dx) * 180) / Math.PI
}

const routeToKey: Record<string, string> = {
  '': 'bracelets',
  necklacess: 'necklaces',
  about: 'about',
  ring: 'ring',
  earrings: 'earrings',
}

function currentKey() {
  const route = window.location.hash.replace(/^#\/?/, '')
  return routeToKey[route] ?? 'necklaces'
}

export default function ClockMenu() {
  const [activeKey, setActiveKey] = useState(currentKey())

  useEffect(() => {
    const onHash = () => setActiveKey(currentKey())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const activePage = PAGES.find((p) => p.key === activeKey) ?? PAGES[2]
  const aim = aimDeg(activePage.slot)

  const go = (route: string) => (e: React.MouseEvent) => {
    e.preventDefault()
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
                  onClick={go(page.route)}
                >
                  {page.label}
                </a>
                {isActive && page.sub.length > 0 && (
                  <ul className={styles.subnavPanel}>
                    {page.sub.map((label) => (
                      <li key={label} className={styles.subnavItem}>
                        <button type="button" className={styles.subnavLink}>
                          {label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>

        {/* Hands point at the active page's slot; --aim drives the rotation. */}
        <div className={styles.clock} aria-hidden="true" style={{ '--aim': aim } as React.CSSProperties}>
          <span className={`${styles.hand} ${styles.handMinute}`} />
          <span className={`${styles.hand} ${styles.handHour}`} />
          <span className={styles.pin} />
        </div>
      </div>
    </nav>
  )
}
