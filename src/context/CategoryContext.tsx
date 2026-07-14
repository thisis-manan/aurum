import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export const CATEGORY_LABELS = ['All', 'Rings', 'Necklaces', 'Bracelets', 'Earrings'] as const
export type CategoryLabel = (typeof CATEGORY_LABELS)[number]
export type CategoryKey = 'all' | 'ring' | 'necklaces' | 'bracelets' | 'earrings'

const LABEL_TO_KEY: Record<CategoryLabel, CategoryKey> = {
  All: 'all',
  Rings: 'ring',
  Necklaces: 'necklaces',
  Bracelets: 'bracelets',
  Earrings: 'earrings',
}

const KEY_TO_LABEL: Record<CategoryKey, CategoryLabel> = {
  all: 'All',
  ring: 'Rings',
  necklaces: 'Necklaces',
  bracelets: 'Bracelets',
  earrings: 'Earrings',
}

type CategoryContextValue = {
  categoryKey: CategoryKey
  categoryLabel: CategoryLabel
  setCategoryKey: (key: CategoryKey) => void
  setCategoryLabel: (label: CategoryLabel) => void
}

const CategoryContext = createContext<CategoryContextValue | null>(null)

export function CategoryProvider({ children }: { children: ReactNode }) {
  // Defaulting showcase startup focus to 'All' pieces
  const [categoryKey, setCategoryKeyState] = useState<CategoryKey>('all')

  const setCategoryKey = useCallback((key: CategoryKey) => {
    setCategoryKeyState(key)
  }, [])

  const setCategoryLabel = useCallback((label: CategoryLabel) => {
    setCategoryKeyState(LABEL_TO_KEY[label])
  }, [])

  const value = useMemo(
    () => ({
      categoryKey,
      categoryLabel: KEY_TO_LABEL[categoryKey],
      setCategoryKey,
      setCategoryLabel,
    }),
    [categoryKey, setCategoryKey, setCategoryLabel]
  )

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
}

export function useCategory() {
  const ctx = useContext(CategoryContext)
  if (!ctx) throw new Error('useCategory must be used within CategoryProvider')
  return ctx
}