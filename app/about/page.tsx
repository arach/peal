'use client'

import '@/styles/about.css'
import { useState } from 'react'
import Link from 'next/link'
import {
  Feather,
  Globe,
  SlidersHorizontal,
  PackageCheck,
  MousePointerClick,
  AudioWaveform,
  Gamepad2,
  Sparkles,
  Heart,
  Mail,
  Copy,
  Check,
} from 'lucide-react'

function GithubMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}
import { isStaticBuild } from '@/utils/build'
import Header from '@/components/Header'

const reasons = [
  {
    icon: Feather,
    title: 'Lightweight',
    body: "Tiny, tree-shakeable files that won't bloat your bundle.",
  },
  {
    icon: Globe,
    title: 'Cross-platform',
    body: 'Plays everywhere Howler.js runs — every modern browser and Electron.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Customizable',
    body: 'A built-in Studio for designing sounds tuned to your brand.',
  },
  {
    icon: PackageCheck,
    title: 'No dependencies',
    body: 'Add only the sounds you need — Peal stays out of your way.',
  },
]

const categories = [
  {
    icon: MousePointerClick,
    title: 'UI Sounds',
    body: 'Clicks, toggles, notifications, and feedback for user interfaces.',
  },
  {
    icon: AudioWaveform,
    title: 'Ambient',
    body: 'Background textures and atmospheric audio for immersive states.',
  },
  {
    icon: Gamepad2,
    title: 'Game',
    body: 'Power-ups, achievements, and action cues for games.',
  },
  {
    icon: Sparkles,
    title: 'Custom',
    body: 'Design sounds tailored to your brand in the Peal Studio.',
  },
]

const installSnippet = `// Install Howler.js
npm install howler

// Use Peal sounds
import { Howl } from 'howler'

const sound = new Howl({
  src: ['/sounds/success.wav']
})

sound.play()`

export default function AboutPage() {
  const [copied, setCopied] = useState(false)

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(installSnippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="about">
      <Header />
      <main className="about-shell">
        <header className="about-hero">
          <div className="about-kicker">About</div>
          <h1>
            Great interfaces deserve <span className="accent">great sound.</span>
          </h1>
          <p>
            Peal is a lightweight sound-effect library for modern web and desktop apps — a small,
            dependency-free toolkit and studio for crafting audio feedback that feels like part of the
            product, not bolted on.
          </p>
        </header>

        <section className="about-section">
          <div className="about-section-head">
            <h2>Why Peal?</h2>
            <p>A focused toolkit that does one thing well: make your app sound considered.</p>
          </div>
          <div className="about-points">
            {reasons.map(({ icon: Icon, title, body }) => (
              <div key={title} className="about-point">
                <span className="about-point-icon">
                  <Icon />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section">
          <div className="about-section-head">
            <h2>Sound categories</h2>
            <p>From interface feedback to game cues — start from a curated set, then make it yours.</p>
          </div>
          <div className="about-cards">
            {categories.map(({ icon: Icon, title, body }) => (
              <article key={title} className="about-card">
                <span className="about-card-icon">
                  <Icon />
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        {!isStaticBuild && (
          <section className="about-section">
            <div className="about-section-head">
              <h2>How to use</h2>
              <p>Peal sounds are plain audio files — drop them into any Howler.js setup.</p>
            </div>
            <div className="about-code">
              <div className="about-code-head">
                <span>example.js</span>
                <button
                  type="button"
                  onClick={copySnippet}
                  className="about-code-copy"
                  aria-label="Copy code"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <pre>
                <span className="hl-cmt">{'// Install Howler.js'}</span>
                {'\nnpm install howler\n\n'}
                <span className="hl-cmt">{'// Use Peal sounds'}</span>
                {'\n'}
                <span className="hl-kw">import</span>
                {' { Howl } '}
                <span className="hl-kw">from</span> <span className="hl-str">{"'howler'"}</span>
                {'\n\n'}
                <span className="hl-kw">const</span>
                {' sound = '}
                <span className="hl-kw">new</span> <span className="hl-fn">Howl</span>
                {'({\n  src: ['}
                <span className="hl-str">{"'/sounds/success.wav'"}</span>
                {']\n})\n\nsound.'}
                <span className="hl-fn">play</span>
                {'()'}
              </pre>
            </div>
          </section>
        )}

        <section className="about-section">
          <div className="about-section-head">
            <h2>Made with Peal</h2>
            <p>Shipped something that sounds great? We&apos;d love to feature it.</p>
          </div>
          <div className="about-callout">
            <span className="about-callout-icon">
              <Heart />
            </span>
            <div>
              <h3>Use the credit badge</h3>
              <p>
                You&apos;re welcome to add <code>Audio by Peal</code> to your project&apos;s credits.
                Tell us what you built and we may showcase it here.
              </p>
            </div>
          </div>
        </section>

        {!isStaticBuild && (
          <section className="about-section">
            <div className="about-section-head">
              <h2>Get in touch</h2>
              <p>Questions, ideas, or a project to share — we read everything.</p>
            </div>
            <div className="about-contact-actions">
              <a
                href="mailto:hello@peal.app"
                className="about-btn about-btn-primary"
              >
                <Mail size={16} />
                Email us
              </a>
              <a
                href="https://github.com/arach/peal"
                target="_blank"
                rel="noopener noreferrer"
                className="about-btn about-btn-secondary"
              >
                <GithubMark />
                GitHub
              </a>
            </div>
          </section>
        )}

        <footer className="about-footnote">
          <span>Peal — audio feedback toolkit for the web.</span>
          <span>
            <Link href="/docs">Docs</Link>
            {'  ·  '}
            <a href="https://www.npmjs.com/package/@peal-sounds/peal" target="_blank" rel="noopener noreferrer">
              npm
            </a>
          </span>
        </footer>
      </main>
    </div>
  )
}
