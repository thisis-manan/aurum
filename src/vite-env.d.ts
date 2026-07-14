/// <reference types="vite/client" />

import type Lenis from 'lenis'

declare global {
  interface Window {
    lenis?: Lenis
  }
}

export {}
