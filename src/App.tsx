import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Exhibit from './components/Exhibit'
import Visit from './components/Visit'
import Mission from './components/Mission'
import SiteFooter from './components/SiteFooter'
import './index.css'

function App() {
  return (
    <div className="w-full min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Exhibit />
        <Visit />
        <Mission />
      </main>
      <SiteFooter />
    </div>
  )
}

export default App
