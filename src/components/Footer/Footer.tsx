import styles from './Footer.module.css'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

export default function Footer() {
  const ref = useScrollAnimation()
  
  return (
    <footer ref={ref as React.RefObject<HTMLElement>} className={styles.footer}>
      <div className="container">
        <div className={styles.brand}>
          <h2>AURUM</h2>
          <p>Fine Jewellery Since 2024</p>
        </div>

        <div className="divider-gold" style={{ margin: 'var(--space-4) 0' }}></div>

        <div className={styles.links}>
          <div>
            <h4>Shop</h4>
            <a href="#">Rings</a>
            <a href="#">Necklaces</a>
            <a href="#">Bracelets</a>
            <a href="#">Earrings</a>
          </div>
          <div>
            <h4>About</h4>
            <a href="#">Our Story</a>
            <a href="#">Craftsmen</a>
            <a href="#">Sustainability</a>
            <a href="#">Contact</a>
          </div>
          <div>
            <h4>Care</h4>
            <a href="#">Jewellery Care</a>
            <a href="#">Sizing Guide</a>
            <a href="#">Returns</a>
            <a href="#">FAQ</a>
          </div>
          <div>
            <h4>Legal</h4>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>

        <div className="divider-gold" style={{ margin: 'var(--space-4) 0' }}></div>

        <div className={styles.newsletter}>
          <input type="email" placeholder="Email address" />
          <button className="btn-text">Subscribe</button>
        </div>

        <p className={styles.copyright}>© 2026 AURUM. All Rights Reserved.</p>
      </div>
    </footer>
  )
}