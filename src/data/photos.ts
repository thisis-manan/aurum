// Stock jewellery photos (Unsplash). The dome renders only the images, so the
// name/category fields are cosmetic metadata — kept for the data shape.
export interface Photo {
  slug: string
  category: string
  /** Top name label (data-top-name). */
  top: string
  /** Bottom name label (data-bottom-name). */
  bottom: string
  /** Combined display name. */
  name: string
  alt: string
  src: string
}

// Unsplash delivery: auto-format (webp), cropped, ~900px wide. All verified to
// return 200 with `Access-Control-Allow-Origin: *` (required for WebGL textures).
const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`

export const photos: Photo[] = [
  { slug: 'soleil-ring', category: 'Rings', top: 'Soleil', bottom: 'Ring', name: 'Soleil Ring', alt: 'Gold solitaire ring', src: img('1605100804763-247f67b3557e') },
  { slug: 'arc-pendant', category: 'Necklaces', top: 'Arc', bottom: 'Pendant', name: 'Arc Pendant', alt: 'Diamond pendant necklace', src: img('1599643478518-a784e5dc4c8f') },
  { slug: 'meridian-cuff', category: 'Bracelets', top: 'Meridian', bottom: 'Cuff', name: 'Meridian Cuff', alt: 'Gold bracelet cuff', src: img('1611591437281-460bfbe1220a') },
  { slug: 'veil-earrings', category: 'Earrings', top: 'Veil', bottom: 'Earrings', name: 'Veil Earrings', alt: 'Gold drop earrings', src: img('1535632066927-ab7c9ab60908') },
  { slug: 'aurora-ring', category: 'Rings', top: 'Aurora', bottom: 'Ring', name: 'Aurora Ring', alt: 'Diamond engagement ring', src: img('1515562141207-7a88fb7ce338') },
  { slug: 'lumen-set', category: 'Bespoke', top: 'Lumen', bottom: 'Set', name: 'Lumen Set', alt: 'Fine jewellery set', src: img('1602751584552-8ba73aad10e1') },
  { slug: 'celeste-necklace', category: 'Necklaces', top: 'Celeste', bottom: 'Necklace', name: 'Celeste Necklace', alt: 'Gold necklace', src: img('1596944924616-7b38e7cfac36') },
  { slug: 'halo-band', category: 'Rings', top: 'Halo', bottom: 'Band', name: 'Halo Band', alt: 'Diamond ring close up', src: img('1617038220319-276d3cfab638') },
  { slug: 'muse-earrings', category: 'Earrings', top: 'Muse', bottom: 'Earrings', name: 'Muse Earrings', alt: 'Luxury earrings', src: img('1573408301185-9146fe634ad0') },
  { slug: 'atelier-detail', category: 'Bespoke', top: 'Atelier', bottom: 'Detail', name: 'Atelier Detail', alt: 'Jewellery detail', src: img('1588444837495-c6cfeb53f32d') },
  { slug: 'aria-pendant', category: 'Necklaces', top: 'Aria', bottom: 'Pendant', name: 'Aria Pendant', alt: 'Pendant necklace', src: img('1603561591411-07134e71a2a9') },
  { slug: 'ember-ring', category: 'Rings', top: 'Ember', bottom: 'Ring', name: 'Ember Ring', alt: 'Gemstone ring', src: img('1610694955371-d4a3e0ce4b52') },
  { slug: 'nova-studs', category: 'Earrings', top: 'Nova', bottom: 'Studs', name: 'Nova Studs', alt: 'Diamond stud earrings', src: img('1631982690223-8aa4be0a2497') },
  { slug: 'lyra-chain', category: 'Necklaces', top: 'Lyra', bottom: 'Chain', name: 'Lyra Chain', alt: 'Gold chain necklace', src: img('1589128777073-263566ae5e4d') },
  { slug: 'vesper-ring', category: 'Rings', top: 'Vesper', bottom: 'Ring', name: 'Vesper Ring', alt: 'Precious ring', src: img('1602173574767-37ac01994b2a') },
  { slug: 'solstice-cuff', category: 'Bracelets', top: 'Solstice', bottom: 'Cuff', name: 'Solstice Cuff', alt: 'Bracelet', src: img('1608042314453-ae338d80c427') },
  { slug: 'orion-pendant', category: 'Necklaces', top: 'Orion', bottom: 'Pendant', name: 'Orion Pendant', alt: 'Pendant', src: img('1600721391689-2564bb8055de') },
]

export const photoCategories = ['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Bespoke'] as const
