import Nav from './components/Nav/Nav'
import Hero from './components/Hero/Hero'
import ProductShowcase from './components/ProductShowcase/ProductShowcase'
import Footer from './components/Footer/Footer'
import Intro from './components/Intro/Intro'
import { useLenis } from './hooks/useLenis'

// Single-page AURUM layout, top to bottom:
//   Intro            → splash/counter intro, plays once per browser
//                       session (sessionStorage), then reveals everything
//                       below via a circular wipe
//   Nav + Hero       → the fixed nav over the full-screen hero
//   ProductShowcase  → "Our Pieces" — the ONLY gallery/scroll section.
//                       Its radial clock dial drives categories (Rings,
//                       Necklaces, Earrings, Bracelets) and About.
//   Footer           → closing footer
function App() {
  // Smooth scrolling for the whole page
  useLenis()

  return (
    <>
      <Intro />
      <Nav />
      <Hero />
      <ProductShowcase />
      <Footer />
    </>
  )
}

export default App
