import SoundDesigner from '@/components/SoundDesigner'
import Header from '@/components/Header'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function LibraryPage() {
  return (
    <>
      <Header variant="app" />
      <main className="min-h-screen bg-[#111113] text-gray-100">
        <ErrorBoundary>
          <SoundDesigner />
        </ErrorBoundary>
      </main>
    </>
  )
}