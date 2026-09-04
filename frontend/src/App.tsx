import { About } from './components/About'
import { Contact } from './components/Contact'
import { CustomCursor } from './components/CustomCursor'
import { Experience } from './components/Experience'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Nav } from './components/Nav'
import { Projects } from './components/Projects'
import { Resume } from './components/Resume'
import { Skills } from './components/Skills'
import { SocialSidebar } from './components/SocialSidebar'
import { useScrollFlash } from './hooks/useScrollFlash'

function App() {
  useScrollFlash()

  return (
    <>
      <CustomCursor />
      <Nav />
      <SocialSidebar />
      <main>
        <Hero />
        <About />
        <Experience />
        <Skills />
        <Projects />
        <Resume />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
