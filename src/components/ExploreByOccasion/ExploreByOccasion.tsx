import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import "./ExploreByOccasion.css";

interface Occasion {
  id: string;
  title: string;
  tagline: string;
  image: string;
}

// All image URLs verified to load — real Unsplash CDN links.
const occasions: Occasion[] = [
  {
    id: "wedding",
    title: "Wedding",
    tagline: "Rings that begin forever",
    image:
      "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?fm=jpg&q=85&w=1000&auto=format&fit=crop",
  },
  {
    id: "birthday",
    title: "Birthday",
    tagline: "Sparkle made for celebrating",
    image:
      "https://images.unsplash.com/photo-1654700194896-6318cdc3b184?fm=jpg&q=85&w=1000&auto=format&fit=crop",
  },
  {
    id: "anniversary",
    title: "Anniversary",
    tagline: "Marking the years that matter",
    image:
      "https://images.unsplash.com/photo-1680200256120-8ac04eb6f01d?fm=jpg&q=85&w=1000&auto=format&fit=crop",
  },
  {
    id: "festive",
    title: "Festive",
    tagline: "Tradition, dressed in gold",
    image:
      "https://images.unsplash.com/photo-1549315309-f0857a904065?fm=jpg&q=85&w=1000&auto=format&fit=crop",
  },
  {
    id: "engagement",
    title: "Engagement",
    tagline: "The moment before yes",
    image:
      "https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?fm=jpg&q=85&w=1000&auto=format&fit=crop",
  },
  {
    id: "casual",
    title: "Casual",
    tagline: "Everyday, effortlessly worn",
    image:
      "https://images.unsplash.com/photo-1641290748359-1d944fc8359a?fm=jpg&q=85&w=1000&auto=format&fit=crop",
  },
];

const OccasionCard = ({
  occasion,
  index,
  wide,
  banner,
}: {
  occasion: Occasion;
  index: number;
  wide?: boolean;
  banner?: boolean;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.a
      ref={ref}
      href={`#${occasion.id}`}
      className={`occ2-card ${
        wide ? "occ2-card--wide" : banner ? "occ2-card--banner" : "occ2-card--regular"
      }`}
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 18,
        mass: 0.8,
        delay: index * 0.12,
      }}
    >
      <img
        src={occasion.image}
        alt={occasion.title}
        className="occ2-card__image"
        loading="lazy"
      />
      <div className="occ2-card__scrim" />
      <div className="occ2-card__label">
        <span className="occ2-card__title">{occasion.title}</span>
        <span className="occ2-card__tagline">{occasion.tagline}</span>
        <span className="occ2-card__underline" />
      </div>
    </motion.a>
  );
};

const ExploreByOccasion = () => {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  return (
    <section className="occ2-section">
      <div className="occ2-container">
        <div ref={headerRef} className="occ2-header">
          <motion.span
            className="occ2-eyebrow"
            initial={{ opacity: 0, y: 10 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Curated Just For You
          </motion.span>
          <motion.h2
            className="occ2-heading"
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          >
            Explore by Occasion
          </motion.h2>
          <motion.p
            className="occ2-subheading"
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            From the first ring to the last dance — find the piece that fits your moment.
          </motion.p>
        </div>

        <div className="occ2-grid">
          {occasions.map((occasion, i) => (
            <OccasionCard
              occasion={occasion}
              index={i}
              // Anniversary becomes the tall wide feature card
              wide={occasion.id === "anniversary"}
              // Casual is last in the dense grid flow — give it the
              // full-width banner treatment instead of leaving it orphaned
              banner={occasion.id === "casual"}
              key={occasion.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreByOccasion;