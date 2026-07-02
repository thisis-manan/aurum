import { useEffect, useState } from 'react'
import styles from './Nav.module.css'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let lastScrollY = 0

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      setScrolled(currentScrollY > 80)

      if (currentScrollY > lastScrollY && currentScrollY > 300) {
        setHidden(true)
      } else {
        setHidden(false)
      }

      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const closeMenu = () => {
    setMenuOpen(false)
  }

  return (
    <nav
      className={`${styles.nav} ${
        scrolled ? styles.scrolled : ''
      } ${hidden ? styles.hidden : ''}`}
    >
      <div className={styles.inner}>
        <a
          href="/"
          className={styles.logo}
          onClick={closeMenu}
        >
          AURUM
        </a>

        <div className={styles.links}>
          <a href="#">Rings</a>
          <a href="#">Necklaces</a>
          <a href="#">Bracelets</a>
          <a href="#">Earrings</a>
        </div>

        <div className={styles.actions}>
          <button>Search</button>
          <button>Bag 0</button>
        </div>

        <div className={styles.mobileActions}>
          <button className={styles.bagButton}>
            Bag 0
          </button>

          <button
            className={styles.mobileMenuButton}
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Toggle Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      <div
        className={`${styles.mobileMenu} ${
          menuOpen ? styles.mobileMenuOpen : ''
        }`}
      >
        <a href="#" onClick={closeMenu}>
          Rings
        </a>

        <a href="#" onClick={closeMenu}>
          Necklaces
        </a>

        <a href="#" onClick={closeMenu}>
          Bracelets
        </a>

        <a href="#" onClick={closeMenu}>
          Earrings
        </a>

        <button onClick={closeMenu}>
          Search
        </button>
      </div>
    </nav>
  )
}