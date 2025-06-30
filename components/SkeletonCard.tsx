export default function SkeletonCard() {
  return (
    <div className="relative bg-white dark:bg-gray-900/50 rounded-xl border-2 border-gray-200 dark:border-gray-800 animate-pulse">
      <div className="p-4">
        {/* Waveform skeleton */}
        <div className="h-20 bg-blue-50 dark:bg-gray-900/50 rounded-lg mb-3"></div>
        
        {/* Tags skeleton */}
        <div className="flex gap-1 mb-3 min-h-[24px]">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-20"></div>
        </div>
        
        {/* Actions skeleton */}
        <div className="flex gap-2">
          <div className="flex-1 h-9 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="w-9 h-9 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="w-9 h-9 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="w-9 h-9 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}