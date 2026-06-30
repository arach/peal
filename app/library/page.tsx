import SoundDesigner from '@/components/SoundDesigner'
import Header from '@/components/Header'
import ErrorBoundary from '@/components/ErrorBoundary'
import '@/styles/library.css'

export default function LibraryPage() {
  return (
    <>
      <Header variant="app" />
      {/* `dark` forces the Peal dark palette for the SoundDesigner subtree so the
          library matches the always-dark product surfaces (landing/docs/about). */}
      <div className="library dark">
        <main className="min-h-screen">
          <ErrorBoundary>
            <SoundDesigner />
          </ErrorBoundary>
        </main>
      </div>
    </>
  )
}
