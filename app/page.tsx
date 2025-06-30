import SoundDesigner from '@/components/SoundDesigner'
import LandingHero from '@/components/LandingHero'

export default function Home() {
  return (
    <main className="min-h-screen bg-background dark:bg-gray-950">
      <LandingHero />
      <div id="sounds">
        <SoundDesigner />
      </div>
    </main>
  )
}