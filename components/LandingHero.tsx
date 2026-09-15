'use client'

import { useState } from 'react'
import { ArrowRight, Volume2, Sparkles, Code2, Folder, Music, Mic, Play } from 'lucide-react'
import HeroSoundGrid from './HeroSoundGrid'
import LandingSoundDeck from './LandingSoundDeck'
import LandingStudioShots from './LandingStudioShots'
import { getPublicUrl } from '@/utils/url'

type PkgManager = 'npm' | 'pnpm' | 'bun'

const installCommands: Record<PkgManager, string> = {
  npm: 'npm install @peal-sounds/peal',
  pnpm: 'pnpm add @peal-sounds/peal',
  bun: 'bun add @peal-sounds/peal',
}

const addSoundsCommand = `peal add \\
  click \\
  success \\
  error`

function quickStartCommand(pm: PkgManager) {
  return `${installCommands[pm]}\n\n${addSoundsCommand}`
}

const usageCode = `<span class="hl-kw">import</span> peal <span class="hl-kw">from</span> <span class="hl-str">'./peal'</span>

peal.<span class="hl-fn">play</span>(<span class="hl-str">'success'</span>)
peal.<span class="hl-fn">play</span>(<span class="hl-str">'notification'</span>)
peal.<span class="hl-fn">play</span>(<span class="hl-str">'error'</span>, { volume: <span class="hl-key">0.5</span> })`

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
  const [pm, setPm] = useState<PkgManager>('bun')
  const [copied, setCopied] = useState<'install' | 'cli' | null>(null)
  const [copyStatus, setCopyStatus] = useState('')

  const copy = async (text: string, key: 'install' | 'cli') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setCopyStatus('Command copied.')
      setTimeout(() => setCopied(null), 2000)
    } catch {
      setCopyStatus('Could not copy. Select the command and copy it manually.')
    }
  }

  const libraryHref = getPublicUrl('/library')
  const studioHref = getPublicUrl('/studio')
  const voiceHref = getPublicUrl('/studio/voice')
  const musicHref = getPublicUrl('/studio/music')
  const docsHref = getPublicUrl('/docs')

  const studioViews = [
    {
      id: 'sfx',
      label: 'SFX',
      hint: 'Web Audio + AI design',
      href: studioHref,
      image: getPublicUrl('/images/studio/sfx.png'),
      openLabel: 'Open SFX studio',
    },
    {
      id: 'voice',
      label: 'Voice',
      hint: 'Deck, mixer, TTS capture',
      href: voiceHref,
      image: getPublicUrl('/images/studio/voice.png'),
      openLabel: 'Open Voice deck',
    },
    {
      id: 'music',
      label: 'Music',
      hint: 'Strudel editor + copilot',
      href: musicHref,
      image: getPublicUrl('/images/studio/music.png'),
      openLabel: 'Open Music beats',
    },
  ] as const

  return (
    <>
      <section className="landing-band landing-band--hero">
        <div className="landing-band-inner landing-hero-split">
          <div className="landing-hero landing-hero--instrument">
            <p className="landing-hero-eyebrow">UI sounds for the things you build</p>
            <h1>A little sound.<br /><span className="accent">A little more life.</span></h1>
            <p className="landing-sub">Find a sound you like, make it your own, and add it to your app. A small detail that makes the whole thing feel better.</p>
            <div className="landing-hero-links">
              <a href={libraryHref} className="landing-btn landing-btn-primary">Explore sounds <ArrowRight size={16} /></a>
              <a href={studioHref} className="landing-btn landing-btn-secondary">Open studio</a>
            </div>
            <div className="landing-quick-command">
              <code><span>$</span> bunx @peal-sounds/peal add <b>success</b></code>
              <button type="button" onClick={() => copy('bunx @peal-sounds/peal add success', 'install')} aria-label="Copy quick start command">{copied === 'install' ? <CheckIcon /> : <CopyIcon />}</button>
            </div>
            <p className="landing-copy-status" role="status">{copyStatus}</p>
            <div className="landing-hero-notes"><span><Code2 size={13} /> Open source</span><span><Folder size={13} /> Yours to keep</span><span><Volume2 size={13} /> Ready to play</span></div>
          </div>
          <LandingSoundDeck />
        </div>
      </section>

      <section className="landing-band landing-band--sounds fade-in fade-in-delay-1" id="sounds">
        <div className="landing-band-inner">
          <div className="landing-sound-section">
            <div className="landing-section-header landing-section-header--sounds">
              <div className="landing-section-header-copy">
                <div className="landing-kicker">From the collection</div>
                <h2>A few favorites.</h2>
                <p>
                  A click, a chime, a little hello. Play a few and see what feels right.
                </p>
              </div>
              <div className="landing-sound-legend" aria-hidden>
                <span className="landing-sound-legend-item">
                  <Play size={12} />
                  Press play
                </span>
                <span className="landing-sound-legend-item">
                  <Code2 size={12} />
                  View code
                </span>
              </div>
            </div>
            <div className="landing-sound-shelf">
              <HeroSoundGrid variant="landing" />
            </div>
          </div>
        </div>
      </section>

      <section className="landing-band landing-band--integrate fade-in fade-in-delay-2" id="integrate">
        <div className="landing-band-inner landing-band-inner--narrow">
          <div className="landing-integrate">
          <div className="landing-kicker">For developers</div>
          <h2 className="landing-integrate-title">Make it part of your app.</h2>
          <p className="landing-integrate-lead">
            The Peal CLI copies WAV files and generates a ready-to-use module for your project.
          </p>
          <div className="landing-install-tabs" aria-label="Package manager">
            {(['bun', 'npm', 'pnpm'] as PkgManager[]).map(p => <button key={p} type="button" className={`landing-install-tab ${pm === p ? 'active' : ''}`} aria-pressed={pm === p} onClick={() => setPm(p)}>{p}</button>)}
          </div>
          <div className="landing-install-cmd landing-install-cmd--multiline">
            <code>
              <span className="prompt">$</span>
              {quickStartCommand(pm)}
            </code>
            <button
              type="button"
              className="landing-install-copy"
              onClick={() => copy(quickStartCommand(pm), 'cli')}
              aria-label="Copy CLI command"
            >
              {copied === 'cli' ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
          <p className="landing-integrate-after">
            Then import and call <code>play()</code> in your app.
          </p>
          <pre
            className="landing-code-snippet"
            dangerouslySetInnerHTML={{ __html: usageCode }}
          />
          </div>
        </div>
      </section>

      <section className="landing-band landing-band--features fade-in fade-in-delay-2">
        <div className="landing-band-inner">
          <div className="landing-features">
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
              <h3>Music leg</h3>
              <p>Editor + REPL, dual AI sessions, improv loop, version history, smart follow-up chips.</p>
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
          </div>
        </div>
      </section>

      <section className="landing-band landing-band--studio fade-in fade-in-delay-2">
          <div className="landing-band-inner landing-bottom-studio">
            <div className="landing-bottom-copy">
              <div className="landing-kicker">Sound studio</div>
              <h2 className="landing-bottom-title">Design audio like you design UI</h2>
              <p className="landing-bottom-lead">
                Three studio legs — SFX, Voice deck, and Music. Music ships a managed Strudel engine,
                editor + live REPL, AI copilot with improv loop, and a grounded curriculum
                for lyricless beats that evolve bar to bar.
              </p>
            </div>
            <div className="landing-bottom-studio-actions">
              <a href={studioHref} className="landing-btn landing-btn-primary">
                <Code2 size={16} />
                Open SFX studio
              </a>
              <a href={voiceHref} className="landing-btn landing-btn-secondary">
                <Mic size={16} />
                Voice deck
              </a>
              <a href={musicHref} className="landing-btn landing-btn-secondary">
                <Music size={16} />
                Music beats
              </a>
            </div>
          </div>

          <div className="landing-band-inner">
            <LandingStudioShots views={studioViews} />
          </div>

          <div className="landing-band-inner landing-bottom-ship-wrap">
          <div className="landing-bottom-ship">
            <div className="landing-bottom-ship-copy">
              <h3>Ready to ship better audio?</h3>
              <p>Install the package, add sounds with the CLI, or open the studio to design your own.</p>
            </div>
            <div className="landing-bottom-paths">
              <a href={libraryHref} className="landing-bottom-path landing-bottom-path--primary">
                <span className="landing-bottom-path-label">
                  Browse library
                  <ArrowRight size={14} />
                </span>
                <span className="landing-bottom-path-hint">Signature sounds & presets</span>
              </a>
              <a href={studioHref} className="landing-bottom-path">
                <span className="landing-bottom-path-label">
                  Open studio
                  <Sparkles size={14} />
                </span>
                <span className="landing-bottom-path-hint">SFX · Voice · Music</span>
              </a>
              <a href={docsHref} className="landing-bottom-path">
                <span className="landing-bottom-path-label">
                  Docs
                  <Code2 size={14} />
                </span>
                <span className="landing-bottom-path-hint">CLI, API & guides</span>
              </a>
            </div>
          </div>
          </div>
      </section>

      <footer className="landing-band landing-band--footer">
        <div className="landing-band-inner landing-footer">
          <span>Peal — tech sound designer by <a href="https://github.com/arach">@arach</a></span>
          <nav className="landing-footer-links" aria-label="Footer">
            <a href={docsHref}>Docs</a>
            <a href="/about">About</a>
            <a href="https://github.com/arach/peal" target="_blank" rel="noopener noreferrer">GitHub</a>
          </nav>
        </div>
      </footer>
    </>
  )
}