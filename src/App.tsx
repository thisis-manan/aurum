import { useState } from 'react'
import Nav from './components/Nav/Nav'
import Hero from './components/Hero/Hero'
import Story from './components/Story/Story'
import Craft from './components/Craft/Craft'
import ClosingCTA from './components/ClosingCTA/ClosingCTA'
import FilmGrain from './components/Ambient/FilmGrain'
import DomeGallery from './components/Gallery/DomeGallery'
import ExploreByOccasion from './components/ExploreByOccasion/ExploreByOccasion'
import ProductShowcase from './components/ProductShowcase/ProductShowcase'
import Footer from './components/Footer/Footer'
import Intro from './components/Intro/Intro'
import CartDrawer from './components/CartDrawer/CartDrawer'
import { CartProvider } from './components/CartDrawer/CartContext'
import { CategoryProvider } from './context/CategoryContext'
import { useLenis } from './hooks/useLenis'

type BootPhase = 'preloader' | 'unveiling' | 'ready'

function App() {
  // preloader → unveiling (hero animates in UNDER the intro while it
  // fades away) → ready. The site is always mounted so there is no
  // hard cut or video restart when the intro leaves.
  const [bootPhase, setBootPhase] = useState<BootPhase>('preloader')
  useLenis(bootPhase === 'ready')

  return (
    <CartProvider>
      {bootPhase !== 'ready' && (
        <Intro
          onReveal={() => setBootPhase('unveiling')}
          onComplete={() => setBootPhase('ready')}
        />
      )}

      <CategoryProvider>
        <Nav />
        <Hero ready={bootPhase !== 'preloader'} />
        <Story />
        <Craft />
        <DomeGallery />
        <ExploreByOccasion />
        <ProductShowcase />
        <ClosingCTA />
        <Footer />
        <CartDrawer />
        <FilmGrain />
      </CategoryProvider>
    </CartProvider>
  )
}

export default App