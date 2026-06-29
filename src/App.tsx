import Nav from './components/Nav/Nav'
import Hero from './components/Hero/Hero'
import CategoryGrid from './components/CategoryGrid/CategoryGrid'
import ProductShowcase from './components/ProductShowcase/ProductShowcase'
import Carousel from './components/Carousel/Carousel'
import Footer from './components/Footer/Footer'
import { useLenis } from './hooks/useLenis'

function App() {
  // Initialize smooth scrolling for the entire site
  useLenis()

  return (
    <>
      <Nav />

      <main>
        <Hero />
        <CategoryGrid />
        <ProductShowcase />
        <Carousel />
      </main>

      <Footer />
    </>
  )
}

export default App