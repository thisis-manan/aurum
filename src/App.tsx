import { useState } from 'react'
import Nav from './components/Nav/Nav'
import Hero from './components/Hero/Hero'
import DomeGallery from './components/Gallery/DomeGallery'
// Change the import to target your active 3D showcase file
import ProductShowcase from './components/ProductShowcase/ProductShowcase' 
import ProductShowcase from './components/ProductShowcase/ProductShowcase'
import ExploreByOccasion from './components/ExploreByOccasion/ExploreByOccasion'
import Footer from './components/Footer/Footer'
import IntroOverlay from './components/Intro/IntroOverlay'
import Intro from './components/Intro/Intro'
import { CategoryProvider } from './context/CategoryContext'
import { useLenis } from './hooks/useLenis'

type BootPhase = 'typography' | 'preloader' | 'ready'

function App() {
  const [bootPhase, setBootPhase] = useState<BootPhase>('typography')
  useLenis(bootPhase === 'ready')

  return (
    <>
      {bootPhase === 'typography' && (
        <IntroOverlay onComplete={() => setBootPhase('preloader')} />
      )}
      {bootPhase === 'preloader' && (
        <Intro onComplete={() => setBootPhase('ready')} />
      )}
      
      {/* Strictly mount main site components ONLY when bootPhase is 'ready' */}
      {bootPhase === 'ready' && (
        <CategoryProvider>
          <Nav />
          <Hero ready={bootPhase === 'ready'} />
          <DomeGallery />
          {/* Swap the component instance here */}
          <ProductShowcase /> 
          <Footer />
        </CategoryProvider>
      )}
    </>
import CartDrawer from './components/CartDrawer/CartDrawer'
import { CartProvider } from './components/CartDrawer/CartContext'
import { useLenis } from './hooks/useLenis'

// Single-page AURUM layout, top to bottom:
//   Intro              → splash/counter intro, plays on every load, then
//                         reveals everything below via a circular wipe
//   Nav + Hero         → the fixed nav over the full-screen video hero
//   DomeGallery        → the WebGL photo dome (centrepiece, drag to explore)
//   ExploreByOccasion  → occasion-based category cards
//   ProductShowcase    → scrollable "Our Pieces" product showcase section
//   Footer             → closing footer
//   CartDrawer         → slide-in bag drawer, fixed, sits above everything
function App() {
  useLenis()

  return (
    <CartProvider>
      <Intro />
      <Nav />
      <Hero />
      <DomeGallery />
      <ExploreByOccasion />
      <ProductShowcase />
      <Footer />
      <CartDrawer />
    </CartProvider>
  )
}

export default App