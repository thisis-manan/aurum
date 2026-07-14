import type { CSSProperties } from 'react'
import type { Product } from '@/types'
import styles from './ProductShowcase.module.css'
import { useCart } from '../CartDrawer/CartContext'

const WIDTH_VARIANTS = [300, 360, 270, 340, 310, 350]
const ASPECT_VARIANTS = ['3 / 4.6', '4 / 5.8', '1 / 1.4', '3 / 5', '1 / 1.3', '4 / 6']

export default function DragProductCard({
  product,
  index = 0,
}: {
  product: Product
  index?: number
}) {
  const width = WIDTH_VARIANTS[(index * 3 + 1) % WIDTH_VARIANTS.length]
  const aspect = ASPECT_VARIANTS[(index * 2 + 2) % ASPECT_VARIANTS.length]

  const cardVars = {
    '--card-rot': '0deg',
    '--stagger-y': '0px',
    width: `${width}px`,
  } as CSSProperties

  const { addItem } = useCart()

  const handleQuickAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
    })
  }

  return (
    <div className={`${styles.productCard} ${styles.slideCard}`} style={cardVars}>
      <div className={styles.imageContainer} style={{ aspectRatio: aspect }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className={styles.productImage}
          draggable={false}
        />
        <button className={styles.quickAdd} onClick={handleQuickAdd}>Quick Add</button>
      </div>

      <span className={styles.categoryLabel}>{product.category}</span>
      <p className={styles.productName}>{product.name}</p>
      <p className={styles.price}>₹ {product.price.toLocaleString('en-IN')}</p>
    </div>
  )
}