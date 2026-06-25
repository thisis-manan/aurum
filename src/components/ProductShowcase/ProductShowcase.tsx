import { useState } from 'react'
import { PRODUCTS } from '@/data/products'
import type { Product } from '@/types'
import ProductCard from './ProductCard'
import styles from './ProductShowcase.module.css'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

const FILTERS = ['All', 'Rings', 'Necklaces', 'Bracelets']

export default function ProductShowcase() {
  const [activeFilter, setActiveFilter] = useState('All')
  const gridRef = useScrollAnimation()

  const filtered: Product[] =
    activeFilter === 'All'
      ? PRODUCTS
      : PRODUCTS.filter(p => p.category === activeFilter)

  return (
    <section className={styles.section}>
      {/* Header row */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Our Pieces</h2>
          <p className={styles.subtitle}>Fine Jewellery</p>
        </div>

        {/* Filter tabs */}
        <div className={styles.filters}>
          {FILTERS.map(filter => (
            <button
              key={filter}
              className={`${styles.filterTab} ${activeFilter === filter ? styles.active : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div ref={gridRef} className={styles.grid}>
        {filtered.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}