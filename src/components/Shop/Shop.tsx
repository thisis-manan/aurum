import { useMemo, useState } from 'react'
import { PRODUCTS } from '@/data/products'
import ShopProductCard from './ShopProductCard'
import styles from './Shop.module.css'

const FILTERS = ['All', 'Rings', 'Necklaces', 'Bracelets', 'Earrings'] as const

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name'
const SORTS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A–Z' },
]

export default function Shop() {
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [sort, setSort] = useState<SortKey>('featured')

  const products = useMemo(() => {
    const list =
      activeFilter === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeFilter)
    const sorted = [...list]
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        break // featured = source order
    }
    return sorted
  }, [activeFilter, sort])

  return (
    <main className={`${styles.page} container`}>
      <header className={styles.header}>
        <p className="eyebrow">The Collection</p>
        <h1 className={`headline ${styles.title}`}>Shop</h1>

        <div className={styles.toolbar}>
          <span className={styles.count}>{products.length} products</span>
          <label>
            <span className="sr-only">Sort by</span>
            <select
              className={styles.sort}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`${styles.filterTab} ${activeFilter === f ? styles.active : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <p className={styles.empty}>No pieces in this category yet.</p>
      ) : (
        <div className={styles.grid}>
          {products.map((p) => (
            <ShopProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  )
}
