'use client'

import { useEffect, useState } from 'react'
import {
  BYOK_PROVIDERS,
  BYOK_PROVIDER_IDS,
  OPEN_BYOK_EVENT,
  type ByokProvider,
} from '@/lib/byok'
import { useByok, useByokModelCatalog } from '@/lib/useByok'
import { KeyIcon, CheckIcon } from '@/components/icons/PealStudioIcon'

const MODEL_DATALIST_ID = 'peal-byok-models'

export function ByokDialog({ onClose }: { onClose: () => void }) {
  const byok = useByok()
  const catalog = useByokModelCatalog()
  const provider: ByokProvider =
    byok.provider ?? BYOK_PROVIDER_IDS.find((id) => byok.keys[id]) ?? 'openai'
  const def = BYOK_PROVIDERS[provider]
  const savedKey = byok.keys[provider] ?? ''
  const [keyDraft, setKeyDraft] = useState(savedKey)
  const [modelDraft, setModelDraft] = useState(byok.models[provider] ?? '')

  // Re-sync drafts when the selection or stored values change.
  useEffect(() => {
    setKeyDraft(savedKey)
    setModelDraft(byok.models[provider] ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, savedKey, byok.models[provider]])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const keyDirty = keyDraft.trim() !== savedKey
  const modelDirty = modelDraft.trim() !== (byok.models[provider] ?? '')
  const models = catalog[provider] ?? []

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="API keys"
        className="peal-instruments w-full max-w-[400px] rounded-lg border border-[var(--peal-surface-4,#232327)] bg-[var(--peal-surface-1,#1c1c1e)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--peal-surface-4,#232327)] px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#4a9eff]">
            <KeyIcon size={13} />
            API Keys
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-100"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 px-4 py-4">
          <p className="text-[11px] leading-relaxed text-gray-400">
            Bring your own key to try the AI features. Keys are stored in this browser
            only and sent with each request — never saved on the server.
          </p>

          {/* Provider picker */}
          <div>
            <div className="mb-1.5 text-[10px] font-mono uppercase tracking-[0.14em] text-gray-500">
              Provider
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {BYOK_PROVIDER_IDS.map((id) => {
                const active = id === provider
                const keyed = Boolean(byok.keys[id])
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => byok.setProvider(id)}
                    className={`peal-inst-pad px-2 py-1.5 text-[10px] ${active ? 'peal-inst-pad--active' : ''}`}
                  >
                    {BYOK_PROVIDERS[id].label}
                    {keyed ? ' ·' : ''}
                  </button>
                )
              })}
            </div>
            <div className="mt-1 text-[10px] text-gray-500">{def.unlocks}</div>
          </div>

          {/* API key for selected provider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="byok-key"
                className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--peal-surface-text-strong,#e5e7eb)]"
              >
                {def.label} API key
              </label>
              <a
                href={def.consoleUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-mono text-[#4a9eff] hover:underline"
              >
                Get a key ↗
              </a>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="byok-key"
                type="password"
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
                placeholder={def.placeholder}
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 rounded border border-[var(--peal-surface-4,#232327)] bg-[var(--peal-surface-0,#111113)] px-2.5 py-1.5 font-mono text-[11px] text-gray-200 outline-none placeholder:text-gray-600 focus:border-[#4a9eff]/60"
              />
              {keyDirty ? (
                <button
                  type="button"
                  onClick={() => byok.setKey(provider, keyDraft)}
                  disabled={!keyDraft.trim()}
                  className="peal-inst-pad peal-inst-pad--active px-3 py-1.5 text-[10px]"
                >
                  Save
                </button>
              ) : savedKey ? (
                <button
                  type="button"
                  onClick={() => byok.clearKey(provider)}
                  className="peal-inst-pad px-3 py-1.5 text-[10px]"
                >
                  Clear
                </button>
              ) : null}
            </div>
            {savedKey && !keyDirty ? (
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                <CheckIcon size={11} />
                Saved in this browser — sent with each request
              </div>
            ) : null}
          </div>

          {/* Model for selected provider */}
          <div className="space-y-1.5">
            <label
              htmlFor="byok-model"
              className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--peal-surface-text-strong,#e5e7eb)]"
            >
              Model
              <span className="ml-2 normal-case tracking-normal text-gray-500">
                optional — blank uses the default
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="byok-model"
                type="text"
                value={modelDraft}
                onChange={(e) => setModelDraft(e.target.value)}
                placeholder={def.defaultModel}
                list={MODEL_DATALIST_ID}
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 rounded border border-[var(--peal-surface-4,#232327)] bg-[var(--peal-surface-0,#111113)] px-2.5 py-1.5 font-mono text-[11px] text-gray-200 outline-none placeholder:text-gray-600 focus:border-[#4a9eff]/60"
              />
              {modelDirty ? (
                <button
                  type="button"
                  onClick={() => byok.setModel(provider, modelDraft)}
                  className="peal-inst-pad peal-inst-pad--active px-3 py-1.5 text-[10px]"
                >
                  Save
                </button>
              ) : null}
            </div>
            <datalist id={MODEL_DATALIST_ID}>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name ?? m.id}
                </option>
              ))}
            </datalist>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Mount once inside the studio — listens for `peal:open-byok-settings`. */
export function ByokSettingsHost() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener(OPEN_BYOK_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_BYOK_EVENT, onOpen)
  }, [])

  if (!open) return null
  return <ByokDialog onClose={() => setOpen(false)} />
}
