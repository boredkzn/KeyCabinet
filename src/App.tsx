import { useEffect, useMemo, useState } from 'react'
import { getAuthSnapshot, onAuthChange, type AuthSnapshot } from './api/authApi'
import { fetchKeys, getDataMode, issueKeyRemote, returnKeyRemote } from './api/keysApi'
import { AuthPanel } from './components/AuthPanel'
import { KeyCard } from './components/KeyCard'
import { Toolbar } from './components/Toolbar'
import { INITIAL_KEYS, type KeyStatus, type OfficeKey } from './data/mockKeys'
import { toApiError } from './lib/apiErrors'
import { countByStatus, filterKeys } from './utils/keyActions'

type LoadState = 'idle' | 'loading' | 'success' | 'error'

export default function App() {
  const [keys, setKeys] = useState<OfficeKey[]>(INITIAL_KEYS)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | KeyStatus>('all')
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [banner, setBanner] = useState<string | null>(null)
  const [auth, setAuth] = useState<AuthSnapshot>({
    user: null,
    session: null,
    demo: getDataMode() === 'demo',
  })
  const [bootDone, setBootDone] = useState(false)

  const visible = useMemo(
    () => filterKeys(keys, query, statusFilter),
    [keys, query, statusFilter],
  )
  const counts = useMemo(() => countByStatus(keys), [keys])
  const mode = getDataMode()
  const needsAuth = mode === 'supabase' && !auth.user

  useEffect(() => {
    let cancelled = false
    const unsub = onAuthChange((snap) => {
      if (!cancelled) setAuth(snap)
    })

    async function boot() {
      setLoadState('loading')
      try {
        const snap = await getAuthSnapshot()
        if (cancelled) return
        setAuth(snap)
        const list = await fetchKeys()
        if (cancelled) return
        setKeys(list)
        setLoadState('success')
      } catch (err) {
        if (cancelled) return
        const apiErr = toApiError(err)
        setLoadState('error')
        setBanner(apiErr.message)
      } finally {
        if (!cancelled) setBootDone(true)
      }
    }

    void boot()
    return () => {
      cancelled = true
      unsub()
    }
  }, [])

  async function reloadKeys() {
    const list = await fetchKeys()
    setKeys(list)
  }

  async function handleIssue(keyId: string, holder: string) {
    if (needsAuth) {
      const msg = 'Требуется вход (401). Войдите или зарегистрируйтесь.'
      setLoadState('error')
      setBanner(msg)
      throw new Error(msg)
    }
    setLoadState('loading')
    setBanner(null)
    try {
      const next = await issueKeyRemote(keyId, holder)
      setKeys(next)
      setLoadState('success')
      setBanner('Ключ выдан')
    } catch (err) {
      const apiErr = toApiError(err)
      setLoadState('error')
      setBanner(apiErr.message)
      throw apiErr
    }
  }

  async function handleReturn(keyId: string) {
    if (needsAuth) {
      const msg = 'Требуется вход (401). Войдите или зарегистрируйтесь.'
      setLoadState('error')
      setBanner(msg)
      throw new Error(msg)
    }
    setLoadState('loading')
    setBanner(null)
    try {
      const next = await returnKeyRemote(keyId)
      setKeys(next)
      setLoadState('success')
      setBanner('Ключ возвращён в шкаф')
    } catch (err) {
      const apiErr = toApiError(err)
      setLoadState('error')
      setBanner(apiErr.message)
      throw apiErr
    }
  }

  async function handleAuthChange(snap: AuthSnapshot) {
    setAuth(snap)
    setBanner(null)
    try {
      await reloadKeys()
      setLoadState('success')
    } catch (err) {
      const apiErr = toApiError(err)
      setLoadState('error')
      setBanner(apiErr.message)
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
        <div className="text-right text-sm text-slate-500">
          <p data-testid="load-state">Состояние: {loadState}</p>
          <p data-testid="data-mode">Режим: {mode === 'demo' ? 'demo' : 'supabase'}</p>
        </div>
      </header>

      <AuthPanel auth={auth} onAuthChange={handleAuthChange} onError={(m) => {
        setLoadState('error')
        setBanner(m)
      }} />

      {banner && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            loadState === 'error'
              ? 'border-rose-300 bg-rose-50 text-rose-800'
              : 'border-emerald-300 bg-emerald-50 text-emerald-900'
          }`}
          role="status"
          data-testid="app-banner"
        >
          {banner}
        </div>
      )}

      {needsAuth && bootDone && (
        <div
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
          role="alert"
          data-testid="auth-required"
        >
          Backend подключён. Для чтения/записи ключей войдите (RLS требует{' '}
          <code>authenticated</code>).
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
        ДЗ5 · Зарипов Шамиль · React + Vite + Tailwind + Supabase
        {mode === 'demo' ? ' · demo без .env' : ' · live API'}
      </footer>
    </div>
  )
}
