import { Product, Category } from '../types'

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Soleil Ring',
    price: '₹ 48,000',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600',
    category: 'Rings',
  },
  {
    id: 'p2',
    name: 'Arc Pendant',
    price: '₹ 62,000',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600',
    category: 'Necklaces',
  },
  {
    id: 'p3',
    name: 'Meridian Cuff',
    price: '₹ 35,000',
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600',
    category: 'Bracelets',
  },
  {
    id: 'p4',
    name: 'Veil Earrings',
    price: '₹ 28,500',
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600',
    category: 'Earrings',
  },
]

export const CATEGORIES: Category[] = [
  {
    id: 'c1',
    label: 'Rings',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
    href: '/rings',
  },
  {
    id: 'c2',
    label: 'Necklaces',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
    href: '/necklaces',
  },
  {
    id: 'c3',
    label: 'Bracelets',
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
    href: '/bracelets',
  },
  {
    id: 'c4',
    label: 'Earrings',
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
    href: '/earrings',
  },
]