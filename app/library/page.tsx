import SoundDesigner from '@/components/SoundDesigner'
import LibraryHeader from '@/components/LibraryHeader'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function LibraryPage() {
  return (
    <>
      <LibraryHeader />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <ErrorBoundary>
          <SoundDesigner />
        </ErrorBoundary>
      </main>
    </>
  )
}