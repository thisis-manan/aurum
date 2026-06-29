import { useEffect, useState } from 'react'
import styles from './Nav.module.css'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let lastScrollY = 0

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Glass background after 80px
      setScrolled(currentScrollY > 80)

      // Hide when scrolling down past 300px
      if (currentScrollY > lastScrollY && currentScrollY > 300) {
        setHidden(true)
      } else {
        setHidden(false)
      }

      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''} ${hidden ? styles.hidden : ''}`}>
      <div className={`container ${styles.inner}`}>
        <a href="/" className={styles.logo}>AURUM</a>

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
      </div>
    </nav>
  )
}