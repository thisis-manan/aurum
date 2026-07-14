export interface Photo {
  slug: string
  category: 'Rings' | 'Necklaces' | 'Bracelets' | 'Earrings'
  top: string
  bottom: string
  name: string
  alt: string
  src: string
}

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`

export const RINGS: Photo[] = [
  { slug: 'soleil-ring', category: 'Rings', top: 'Soleil', bottom: 'Ring', name: 'Soleil Ring', alt: 'Gold solitaire ring', src: img('1605100804763-247f67b3557e') },
  { slug: 'aurora-ring', category: 'Rings', top: 'Aurora', bottom: 'Ring', name: 'Aurora Ring', alt: 'Diamond engagement ring', src: img('1515562141207-7a88fb7ce338') },
  { slug: 'halo-band', category: 'Rings', top: 'Halo', bottom: 'Band', name: 'Halo Band', alt: 'Diamond ring close up', src: img('1617038220319-276d3cfab638') },
  { slug: 'ember-ring', category: 'Rings', top: 'Ember', bottom: 'Ring', name: 'Ember Ring', alt: 'Gemstone ring', src: img('1610694955371-d4a3e0ce4b52') },
  { slug: 'vesper-ring', category: 'Rings', top: 'Vesper', bottom: 'Ring', name: 'Vesper Ring', alt: 'Precious ring', src: img('1602173574767-37ac01994b2a') },
  { slug: 'aurelia-ring', category: 'Rings', top: 'Aurelia', bottom: 'Ring', name: 'Aurelia Ring', alt: 'Solitaire ring', src: img('1492714485642-dd6df6baafa2') },
  { slug: 'lumen-ring', category: 'Rings', top: 'Lumen', bottom: 'Ring', name: 'Lumen Ring', alt: 'Halo ring', src: img('1611955167811-4711904bb9f8') },
  { slug: 'noir-ring', category: 'Rings', top: 'Noir', bottom: 'Ring', name: 'Noir Ring', alt: 'Twist band ring', src: img('1626122780071-c09d403b8e32') },
  { slug: 'celeste-band', category: 'Rings', top: 'Celeste', bottom: 'Band', name: 'Celeste Band', alt: 'Eternity band', src: img('1723802205505-2f88b2227718') },
  { slug: 'orin-signet', category: 'Rings', top: 'Orin', bottom: 'Signet', name: 'Orin Signet', alt: 'Signet ring', src: img('1608508644127-ba99d7732fee') },
]

export const NECKLACES: Photo[] = [
  { slug: 'arc-pendant', category: 'Necklaces', top: 'Arc', bottom: 'Pendant', name: 'Arc Pendant', alt: 'Diamond pendant necklace', src: img('1599643478518-a784e5dc4c8f') },
  { slug: 'celeste-necklace', category: 'Necklaces', top: 'Celeste', bottom: 'Necklace', name: 'Celeste Necklace', alt: 'Gold necklace', src: img('1596944924616-7b38e7cfac36') },
  { slug: 'aria-pendant', category: 'Necklaces', top: 'Aria', bottom: 'Pendant', name: 'Aria Pendant', alt: 'Pendant necklace', src: img('1603561591411-07134e71a2a9') },
  { slug: 'lyra-chain', category: 'Necklaces', top: 'Lyra', bottom: 'Chain', name: 'Lyra Chain', alt: 'Gold chain necklace', src: img('1589128777073-263566ae5e4d') },
  { slug: 'orion-pendant', category: 'Necklaces', top: 'Orion', bottom: 'Pendant', name: 'Orion Pendant', alt: 'Pendant', src: img('1600721391689-2564bb8055de') },
  { slug: 'serene-necklace', category: 'Necklaces', top: 'Serene', bottom: 'Necklace', name: 'Serene Necklace', alt: 'Layered necklace', src: img('1611107683227-e9060eccd846') },
  { slug: 'halcyon-chain', category: 'Necklaces', top: 'Halcyon', bottom: 'Chain', name: 'Halcyon Chain', alt: 'Fine chain', src: img('1623321673989-830eff0fd59f') },
  { slug: 'solstice-locket', category: 'Necklaces', top: 'Solstice', bottom: 'Locket', name: 'Solstice Locket', alt: 'Gold locket', src: img('1612150354898-a69132eb7c67') },
  { slug: 'amara-choker', category: 'Necklaces', top: 'Amara', bottom: 'Choker', name: 'Amara Choker', alt: 'Diamond choker', src: img('1620656798579-1984d9e87df7') },
  { slug: 'aveline-necklace', category: 'Necklaces', top: 'Aveline', bottom: 'Necklace', name: 'Aveline Necklace', alt: 'Diamond necklace', src: img('1611583027838-515a1087afdb') },
]

export const BRACELETS: Photo[] = [
  { slug: 'meridian-cuff', category: 'Bracelets', top: 'Meridian', bottom: 'Cuff', name: 'Meridian Cuff', alt: 'Gold bracelet cuff', src: img('1611591437281-460bfbe1220a') },
  { slug: 'solstice-cuff', category: 'Bracelets', top: 'Solstice', bottom: 'Cuff', name: 'Solstice Cuff', alt: 'Bracelet', src: img('1608042314453-ae338d80c427') },
  { slug: 'marisol-cuff', category: 'Bracelets', top: 'Marisol', bottom: 'Cuff', name: 'Marisol Cuff', alt: 'Sculptural cuff', src: img('1633810543462-77c4a3b13f07') },
  { slug: 'isolde-tennis', category: 'Bracelets', top: 'Isolde', bottom: 'Tennis', name: 'Isolde Tennis', alt: 'Tennis bracelet', src: img('1744472457504-f99a96ecbd3e') },
  { slug: 'faye-charm', category: 'Bracelets', top: 'Faye', bottom: 'Charm', name: 'Faye Charm', alt: 'Charm bracelet', src: img('1689397136362-dce64e557fcc') },
  { slug: 'tavi-bangle', category: 'Bracelets', top: 'Tavi', bottom: 'Bangle', name: 'Tavi Bangle', alt: 'Gold bangle', src: img('1767921777873-81818b812a4d') },
  { slug: 'nyla-link', category: 'Bracelets', top: 'Nyla', bottom: 'Link', name: 'Nyla Link', alt: 'Link bracelet', src: img('1703034390242-1174e133db0a') },
  { slug: 'mira-gem', category: 'Bracelets', top: 'Mira', bottom: 'Gem', name: 'Mira Gem', alt: 'Gemstone bracelet', src: img('1717605383946-96c6884c36b4') },
  { slug: 'aurelie-gold', category: 'Bracelets', top: 'Aurelie', bottom: 'Gold', name: 'Aurelie Gold', alt: 'Gold bracelet', src: img('1708221235482-a6e2a807198f') },
  { slug: 'ondine-bangle', category: 'Bracelets', top: 'Ondine', bottom: 'Bangle', name: 'Ondine Bangle', alt: 'Slim bangle', src: img('1573446238824-c28afa0cd312') },
]

export const EARRINGS: Photo[] = [
  { slug: 'veil-earrings', category: 'Earrings', top: 'Veil', bottom: 'Earrings', name: 'Veil Earrings', alt: 'Gold drop earrings', src: img('1535632066927-ab7c9ab60908') },
  { slug: 'muse-earrings', category: 'Earrings', top: 'Muse', bottom: 'Earrings', name: 'Muse Earrings', alt: 'Luxury earrings', src: img('1573408301185-9146fe634ad0') },
  { slug: 'nova-studs', category: 'Earrings', top: 'Nova', bottom: 'Studs', name: 'Nova Studs', alt: 'Diamond stud earrings', src: img('1631982690223-8aa4be0a2497') },
  { slug: 'ondine-drop', category: 'Earrings', top: 'Ondine', bottom: 'Drop', name: 'Ondine Drop', alt: 'Drop earrings', src: img('1671644730555-916aa8d8157f') },
  { slug: 'rhea-studs', category: 'Earrings', top: 'Rhea', bottom: 'Studs', name: 'Rhea Studs', alt: 'Stud earrings', src: img('1638854254875-a2416fe0fec2') },
  { slug: 'ines-hoops', category: 'Earrings', top: 'Ines', bottom: 'Hoops', name: 'Ines Hoops', alt: 'Hoop earrings', src: img('1767210338407-54b9264c326b') },
  { slug: 'celia-chandelier', category: 'Earrings', top: 'Celia', bottom: 'Chandelier', name: 'Celia Chandelier', alt: 'Chandelier earrings', src: img('1758995115555-766abbd9a491') },
  { slug: 'sable-cuffs', category: 'Earrings', top: 'Sable', bottom: 'Cuffs', name: 'Sable Cuffs', alt: 'Ear cuffs', src: img('1761479267937-4c5c7a903760') },
  { slug: 'astra-stars', category: 'Earrings', top: 'Astra', bottom: 'Stars', name: 'Astra Stars', alt: 'Star earrings', src: img('1561172478-a203d9c8290e') },
  { slug: 'larke-studs', category: 'Earrings', top: 'Larke', bottom: 'Studs', name: 'Larke Studs', alt: 'Diamond studs', src: img('1616121341778-0dd435d03d23') },
]

export const photos: Photo[] = [...RINGS, ...NECKLACES, ...BRACELETS, ...EARRINGS]

export const GALLERY_BY_CATEGORY = {
  Rings: RINGS,
  Necklaces: NECKLACES,
  Bracelets: BRACELETS,
  Earrings: EARRINGS,
} as const

export const CATEGORY_CLOCK_KEYS = ['ring', 'necklaces', 'bracelets', 'earrings'] as const

export function categoryFromProgress(progress: number): (typeof CATEGORY_CLOCK_KEYS)[number] {
  const idx = Math.min(3, Math.max(0, Math.floor(progress * 4)))
  return CATEGORY_CLOCK_KEYS[idx]
}

export function progressForCategory(key: string): number {
  const map: Record<string, number> = {
    ring: 0.125,
    necklaces: 0.375,
    bracelets: 0.625,
    earrings: 0.875,
  }
  return map[key] ?? 0.375
}
