import type { Product } from '@/types'
import styles from './ProductShowcase.module.css'

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className={styles.productCard}>
      <div className={styles.imageContainer}>
        <img
  src={product.imageUrl}
  alt={product.name}
  className={styles.productImage}
/>
        <button className={styles.quickAdd}>Quick Add</button>
      </div>

      <span className={styles.categoryLabel}>{product.category}</span>
      <p className={styles.productName}>{product.name}</p>
      <p className={styles.price}>₹ {product.price.toLocaleString('en-IN')}</p>
    </div>
  )
}