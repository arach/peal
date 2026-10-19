import Link from 'next/link'

const SCREENS = [
  { stage: 'start', title: 'Start', blurb: 'Empty state: one big composer — “What are you making sounds for?”' },
  { stage: 'plan', title: 'Plan', blurb: 'The brief becomes a sound palette plus a list of sounds to confirm.' },
  { stage: 'composing', title: 'Composing', blurb: 'Sound cards stream into the conversation as each one is composed.' },
  { stage: 'detail', title: 'Inspect & compare', blurb: 'Cards open as pages on the right — stereo waveform, versions, layers; compare two.' },
  { stage: 'export', title: 'Review & export', blurb: 'Loudness balance across the set, round-robin takes, WAV pack, JSON, CLI.' },
]

export default function DesignIndex() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 font-sans">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Peal · design</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Sound sets — conversation-first</h1>
      <p className="mt-3 text-gray-500">
        Prototype of a Codex-style Peal: projects and conversations on the left, a chat with inline sound cards in the
        middle, pages spun up on the right. The agent is scripted; every sound is a real patch from the ebook-reader run.
      </p>
      <Link href="/studio" className="mt-6 inline-block rounded-lg bg-[#4a9eff] px-4 py-2 font-medium text-[#06121f]">
        Open the prototype →
      </Link>
      <h2 className="mt-12 text-sm font-semibold uppercase tracking-[0.14em] text-gray-500">Journey · new set for a new app</h2>
      <ol className="mt-4 divide-y divide-gray-200 dark:divide-gray-800 border-y border-gray-200 dark:border-gray-800">
        {SCREENS.map((s, i) => (
          <li key={s.stage} className="flex items-baseline gap-4 py-4">
            <span className="font-mono text-xs text-gray-500">{String(i + 1).padStart(2, '0')}</span>
            <div className="flex-1">
              <Link href={`/studio?stage=${s.stage}`} className="font-medium hover:text-[#4a9eff]">{s.title}</Link>
              <p className="text-sm text-gray-500">{s.blurb}</p>
            </div>
          </li>
        ))}
      </ol>
    </main>
  )
}
