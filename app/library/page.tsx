import SoundDesigner from '@/components/SoundDesigner'
import Header from '@/components/Header'
import ErrorBoundary from '@/components/ErrorBoundary'
import PealAppShell from '@/components/PealAppShell'
import '@/styles/library.css'

export default function LibraryPage() {
  return (
    <PealAppShell className="library peal-app-shell">
      <Header variant="app" />
      <main className="min-h-screen">
        <ErrorBoundary>
          <SoundDesigner />
        </ErrorBoundary>
      </main>
    </PealAppShell>
  )
}
