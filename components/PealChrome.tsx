'use client'

import PealNav from './PealNav'
import type { PealNavLayout } from './peal-nav/routing'

export default function PealChrome({ layout }: { layout?: PealNavLayout }) {
  return (
    <header className="peal-chrome">
      <PealNav layout={layout} />
    </header>
  )
}