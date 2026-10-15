import { useMemo, useState } from 'react'
import { KeyCard } from './components/KeyCard'
import { Toolbar } from './components/Toolbar'
import { INITIAL_KEYS, type KeyStatus, type OfficeKey } from './data/mockKeys'
import { countByStatus, filterKeys, issueKey, returnKey } from './utils/keyActions'

type LoadState = 'idle' | 'loading' | 'success' | 'error'

async function simulateLatency(ms = 350) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

export default function App() {
  const [keys, setKeys] = useState<OfficeKey[]>(INITIAL_KEYS)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | KeyStatus>('all')
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [banner, setBanner] = useState<string | null>(null)

  const visible = useMemo(
    () => filterKeys(keys, query, statusFilter),
    [keys, query, statusFilter],
  )
  const counts = useMemo(() => countByStatus(keys), [keys])

  async function handleIssue(keyId: string, holder: string) {
    setLoadState('loading')
    setBanner(null)
    try {
      await simulateLatency()
      setKeys((prev) => issueKey(prev, keyId, holder))
      setLoadState('success')
      setBanner('Ключ выдан')
    } catch (err) {
      setLoadState('error')
      setBanner(err instanceof Error ? err.message : 'Не удалось выдать ключ')
      throw err
    }
  }

  async function handleReturn(keyId: string) {
    setLoadState('loading')
    setBanner(null)
    try {
      await simulateLatency()
      setKeys((prev) => returnKey(prev, keyId))
      setLoadState('success')
      setBanner('Ключ возвращён в шкаф')
    } catch (err) {
      setLoadState('error')
      setBanner(err instanceof Error ? err.message : 'Не удалось принять ключ')
      throw err
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2 border-b border-[var(--kc-line)] pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--kc-steel)]">
            Офис · ресепшен
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-ink)] sm:text-4xl">
            KeyCabinet
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-600 sm:text-base">
            Учёт выдачи ключей кабинетов: кто взял, когда вернуть, что просрочено.
          </p>
        </div>
        <p className="text-sm text-slate-500" data-testid="load-state">
          Состояние: {loadState}
        </p>
      </header>

      {banner && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            loadState === 'error'
              ? 'border-rose-300 bg-rose-50 text-rose-800'
              : 'border-emerald-300 bg-emerald-50 text-emerald-900'
          }`}
          role="status"
        >
          {banner}
        </div>
      )}

      <Toolbar
        query={query}
        statusFilter={statusFilter}
        onQueryChange={setQuery}
        onStatusChange={setStatusFilter}
        counts={counts}
      />

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--kc-line)] bg-white/60 p-8 text-center text-slate-600">
          Ничего не найдено. Сбросьте фильтр или измените запрос.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visible.map((officeKey) => (
            <KeyCard
              key={officeKey.id}
              officeKey={officeKey}
              busy={loadState === 'loading'}
              onIssue={handleIssue}
              onReturn={handleReturn}
            />
          ))}
        </div>
      )}

      <footer className="mt-auto border-t border-[var(--kc-line)] pt-4 text-xs text-slate-500">
        ДЗ4 · Зарипов Шамиль · React + Vite + Tailwind · mock-данные
      </footer>
    </div>
  )
}
