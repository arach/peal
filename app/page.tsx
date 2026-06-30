import '@/styles/landing.css'
import LandingHero from '@/components/LandingHero'
import WelcomeModal from '@/components/WelcomeModal'
import ErrorBoundary from '@/components/ErrorBoundary'
import LandingNav from '@/components/LandingNav'

export default function Home() {
  return (
    <div className="landing dark">
      <LandingNav />
      <main>
        <WelcomeModal variant="landing" />
        <ErrorBoundary>
          <LandingHero />
        </ErrorBoundary>
      </main>
    </div>
  )
}