import { useState } from 'react'
import Nav from './components/Nav/Nav'
import Hero from './components/Hero/Hero'
import DomeGallery from './components/Gallery/DomeGallery'
// Change the import to target your active 3D showcase file
import ProductShowcase from './components/ProductShowcase/ProductShowcase' 
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
  )
}

export default App