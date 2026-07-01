import { useState } from 'react';
import styles from './CategoryGrid.module.css';

export default function CategoryGrid() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleCategoryClick = (categoryName: string) => {
    console.log(`Navigating to ${categoryName} collection...`);
  };

  const categories = [
    { id: 'RINGS', name: 'RINGS', heightClass: styles.heightRings, gridClass: styles.cardRings, img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop' },
    { id: 'NECKLACES', name: 'NECKLACES', heightClass: styles.heightNecklaces, gridClass: styles.cardNecklaces, img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop' },
    { id: 'BRACELETS', name: 'BRACELETS', heightClass: styles.heightBracelets, gridClass: styles.cardBracelets, img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop' },
    { id: 'EARRINGS', name: 'EARRINGS', heightClass: styles.heightEarrings, gridClass: styles.cardEarrings, img: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=600&auto=format&fit=crop' }
  ];

  return (
    <section className={styles.gridSection}>
      <div className={styles.container}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '40px', textAlign: 'left' }}>
          <span className={styles.eyebrow}>NEW COLLECTION</span>
          <h2 className={styles.heading}>Discover Our World</h2>
        </div>

        {/* Asymmetric Gallery Grid Layout */}
        <div className={styles.grid}>
          {categories.map((cat) => (
            <div 
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              onMouseEnter={() => setHoveredCard(cat.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`${styles.galleryCard} ${cat.gridClass}`}
              style={{ 
                opacity: hoveredCard && hoveredCard !== cat.id ? 0.4 : 1
              }}
            >
              <div className={`${styles.imgWrapper} ${cat.heightClass}`}>
                <img 
                  src={cat.img} 
                  alt={cat.name} 
                  className={styles.galleryImg} 
                />
                <div className={styles.exploreOverlay}>Explore Collection +</div>
              </div>
              <div><span className={styles.categoryTitle}>{cat.name}</span></div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
