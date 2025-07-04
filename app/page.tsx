import LandingHero from '@/components/LandingHero'
import WelcomeModal from '@/components/WelcomeModal'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <WelcomeModal />
      <ErrorBoundary>
        <LandingHero />
      </ErrorBoundary>
    </main>
  )
}