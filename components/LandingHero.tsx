'use client'

import { useState } from 'react'
import { ArrowRight, Volume2, Sparkles, Code2, Package, Terminal } from 'lucide-react'
import HeroSoundGrid from './HeroSoundGrid'
import { isStaticBuild } from '@/utils/build'
import { getPublicUrl } from '@/utils/url'

type PkgManager = 'npm' | 'pnpm' | 'bun'

const installCommands: Record<PkgManager, string> = {
  npm: 'npm install @peal-sounds/peal',
  pnpm: 'pnpm add @peal-sounds/peal',
  bun: 'bun add @peal-sounds/peal',
}

const cliCommand = 'npx peal add success notification error'

const usageCode = `<span class="hl-cmt">// Play sounds in your app</span>
<span class="hl-kw">import</span> { <span class="hl-fn">play</span> } <span class="hl-kw">from</span> <span class="hl-str">'@peal-sounds/peal'</span>

<span class="hl-fn">play</span>(<span class="hl-str">'success'</span>)
<span class="hl-fn">play</span>(<span class="hl-str">'notification'</span>, { <span class="hl-key">volume</span>: <span class="hl-str">'loud'</span> })
<span class="hl-fn">play</span>(<span class="hl-str">'error'</span>, { <span class="hl-key">volume</span>: <span class="hl-str">'quiet'</span> })`

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="15" height="15">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="15" height="15">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function LandingHero() {
  const [pm, setPm] = useState<PkgManager>('pnpm')
  const [copied, setCopied] = useState<'install' | 'cli' | null>(null)

  const copy = async (text: string, key: 'install' | 'cli') => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const libraryHref = isStaticBuild ? getPublicUrl('/docs') : '/library'
  const studioHref = isStaticBuild ? getPublicUrl('/about') : '/studio'
  const docsHref = isStaticBuild ? getPublicUrl('/docs') : '/docs'

  return (
    <div className="landing-shell">
      <section className="landing-hero fade-in">
        <div className="landing-badge">
          <span className="landing-badge-dot" />
          UI sound library
        </div>

        <h1>
          Lightweight sounds
          <br />
          <span className="accent">for modern apps</span>
        </h1>

        <p className="landing-sub">
          Professional notification sounds, a CLI to drop them into any project,
          and a studio to design new ones — all on Web Audio.
        </p>

        <div className="landing-pillars">
          <div className="landing-pillar">
            <span className="landing-pillar-icon">
              <Package size={16} />
            </span>
            <h2>Drop-in library</h2>
            <p>Howler.js wrapper with volume presets. One import, works in browser and Node.</p>
          </div>
          <div className="landing-pillar">
            <span className="landing-pillar-icon">
              <Sparkles size={16} />
            </span>
            <h2>Sound studio</h2>
            <p>Design sounds with AI, live parameters, and exported Web Audio API code.</p>
          </div>
          <div className="landing-pillar">
            <span className="landing-pillar-icon">
              <Terminal size={16} />
            </span>
            <h2>CLI workflow</h2>
            <p>Add curated UI sounds to your repo with <code>npx peal add</code> — no manual wiring.</p>
          </div>
        </div>

        <div className="landing-install fade-in fade-in-delay-1">
          <div className="landing-install-surface">
            <div className="landing-install-head">
              <span>npm package</span>
              <span>@peal-sounds/peal</span>
            </div>
            <div className="landing-install-body">
              <div className="landing-install-tabs">
                {(['npm', 'pnpm', 'bun'] as PkgManager[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`landing-install-tab ${pm === p ? 'active' : ''}`}
                    onClick={() => setPm(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="landing-install-cmd">
                <code>
                  <span className="prompt">$</span>
                  {installCommands[pm]}
                </code>
                <button
                  type="button"
                  className="landing-install-copy"
                  onClick={() => copy(installCommands[pm], 'install')}
                  aria-label="Copy install command"
                >
                  {copied === 'install' ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>
            </div>
          </div>

          <div className="landing-hero-links">
            <a href={libraryHref} className="landing-btn landing-btn-primary">
              <Volume2 size={16} />
              Explore library
            </a>
            <a href={studioHref} className="landing-btn landing-btn-secondary">
              <Sparkles size={16} />
              Open studio
            </a>
            <a href={docsHref} className="landing-link">
              Read docs
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      <section className="landing-section fade-in fade-in-delay-1" id="sounds">
        <div className="landing-section-header">
          <div className="landing-kicker">Signature sounds</div>
          <h2>Click to preview</h2>
          <p>
            Six curated sounds from the Peal library. Play inline or view the integration code.
          </p>
        </div>
        <HeroSoundGrid variant="landing" />
      </section>

      <section className="landing-section fade-in fade-in-delay-2" id="integrate">
        <div className="landing-config-grid">
          <div>
            <div className="landing-kicker">CLI</div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Add sounds in one command
            </h2>
            <p style={{ color: 'var(--landing-text-dim)', fontSize: 14, lineHeight: 1.55, marginBottom: 16 }}>
              The Peal CLI copies WAV files and generates a ready-to-use module for your project.
            </p>
            <div className="landing-install-cmd" style={{ marginBottom: 12 }}>
              <code>
                <span className="prompt">$</span>
                {cliCommand}
              </code>
              <button
                type="button"
                className="landing-install-copy"
                onClick={() => copy(cliCommand, 'cli')}
                aria-label="Copy CLI command"
              >
                {copied === 'cli' ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
          </div>

          <div className="landing-code-block">
            <div className="landing-code-header">
              <span className="landing-code-dot landing-code-dot-red" />
              <span className="landing-code-dot landing-code-dot-yellow" />
              <span className="landing-code-dot landing-code-dot-green" />
              <span className="landing-code-filename">peal.ts</span>
            </div>
            <pre
              className="landing-code-pre"
              dangerouslySetInnerHTML={{ __html: usageCode }}
            />
            <div className="landing-terminal-out">
              <div className="ok">✓ success</div>
              <div className="ok">✓ notification</div>
              <div className="ok">✓ error</div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features fade-in fade-in-delay-2">
        <div>
          <h3 className="landing-bucket-label">Library</h3>
          <div className="landing-bucket-cards">
            <div className="landing-feature">
              <h3>Curated presets</h3>
              <p>Keyboard, mechanics, brands, and signature collections ready to browse.</p>
            </div>
            <div className="landing-feature">
              <h3>Quick generate</h3>
              <p>Spin up a polished starter set in one click when your library is empty.</p>
            </div>
            <div className="landing-feature">
              <h3>Export WAV</h3>
              <p>Download high-quality audio or copy integration snippets per sound.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="landing-bucket-label">Studio</h3>
          <div className="landing-bucket-cards">
            <div className="landing-feature">
              <h3>Live code editor</h3>
              <p>See Web Audio API implementation update as you tweak parameters.</p>
            </div>
            <div className="landing-feature">
              <h3>AI design</h3>
              <p>Describe a sound in natural language and refine it in the parameter panel.</p>
            </div>
            <div className="landing-feature">
              <h3>Dark IDE chrome</h3>
              <p>Same terminal-forward aesthetic as the rest of the product surfaces.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="landing-bucket-label">Developer UX</h3>
          <div className="landing-bucket-cards">
            <div className="landing-feature">
              <h3>Zero config playback</h3>
              <p><code>play(&apos;success&apos;)</code> with built-in volume levels.</p>
            </div>
            <div className="landing-feature">
              <h3>Cross-platform</h3>
              <p>Browser, Node, and desktop — powered by Howler.js under the hood.</p>
            </div>
            <div className="landing-feature">
              <h3>TypeScript first</h3>
              <p>Published types and a thin API surface you can tree-shake.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section fade-in fade-in-delay-2">
        <div className="landing-studio-card">
          <div>
            <div className="landing-kicker">Sound studio</div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 10 }}>
              Design audio like you design UI
            </h2>
            <p style={{ color: 'var(--landing-text-dim)', fontSize: 14, lineHeight: 1.55, marginBottom: 16 }}>
              Three-pane studio: code on the left, waveform in the center, AI + parameters on the right.
              The same dark chrome you see across Peal — not a separate marketing skin.
            </p>
            <a href={studioHref} className="landing-btn landing-btn-primary">
              <Code2 size={16} />
              Open studio
            </a>
          </div>
          <div className="landing-studio-preview" aria-hidden="true">
            <div className="landing-studio-preview-bar">
              <span className="landing-code-dot landing-code-dot-red" />
              <span className="landing-code-dot landing-code-dot-yellow" />
              <span className="landing-code-dot landing-code-dot-green" />
              <span style={{ marginLeft: 8 }}>peal — studio</span>
            </div>
            <div className="landing-studio-preview-pane">Web Audio API · live</div>
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <h2>Ready to ship better audio?</h2>
        <p>Install the package, add sounds with the CLI, or open the studio to design your own.</p>
        <div className="landing-cta-actions">
          <a href={libraryHref} className="landing-btn landing-btn-primary">
            Browse library
            <ArrowRight size={16} />
          </a>
          <a href={studioHref} className="landing-btn landing-btn-secondary">
            <Sparkles size={16} />
            Open studio
          </a>
          <a href={docsHref} className="landing-btn landing-btn-secondary">
            <Code2 size={16} />
            Docs
          </a>
        </div>
      </section>

      <footer className="landing-footer">
        <span>Peal — tech sound designer by <a href="https://github.com/arach">@arach</a></span>
        <nav className="landing-footer-links" aria-label="Footer">
          <a href={docsHref}>Docs</a>
          <a href="/about">About</a>
          <a href="https://github.com/arach/peal" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </footer>
    </div>
  )
}