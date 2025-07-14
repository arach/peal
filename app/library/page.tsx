import SoundDesigner from '@/components/SoundDesigner'
import Header from '@/components/Header'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function LibraryPage() {
  return (
    <>
      <Header variant="app" />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <ErrorBoundary>
          <SoundDesigner />
        </ErrorBoundary>
      </main>
    </>
  )
}