import { useState } from 'react'
import type { Product } from '@/types'
import { useCart } from '../CartDrawer/CartContext'
import styles from './Shop.module.css'

/**
 * Clean aligned shop-grid card: image with a wishlist heart and a hover
 * "Add to Bag" bar, then category / name / price. "Add to Bag" adds the item
 * to the shared cart (opens the drawer); the wishlist heart is decorative.
 */
export default function ShopProductCard({ product }: { product: Product }) {
  const [wished, setWished] = useState(false)
  const { addItem } = useCart()

  const addToBag = () =>
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
    })

  return (
    <article className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={product.imageUrl} alt={product.name} className={styles.image} loading="lazy" />

        <button
          type="button"
          className={`${styles.wishlist} ${wished ? styles.active : ''}`}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wished}
          onClick={() => setWished((w) => !w)}
        >
          {wished ? '♥' : '♡'}
        </button>

        <button type="button" className={styles.quickAdd} onClick={addToBag}>
          Add to Bag
        </button>
      </div>

      <p className={styles.category}>{product.category}</p>
      <h3 className={styles.name}>{product.name}</h3>
      <p className={styles.price}>₹ {product.price.toLocaleString('en-IN')}</p>
    </article>
  )
}
