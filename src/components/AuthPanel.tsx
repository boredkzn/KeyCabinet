import { useState } from 'react'
import {
  signInWithPassword,
  signOut,
  signUpWithPassword,
  type AuthSnapshot,
} from '../api/authApi'
import { toApiError } from '../lib/apiErrors'

type Props = {
  auth: AuthSnapshot
  onAuthChange: (snap: AuthSnapshot) => void
  onError: (message: string) => void
}

export function AuthPanel({ auth, onAuthChange, onError }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  if (auth.demo) {
    return (
      <div
        className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
        data-testid="demo-mode-banner"
      >
        <strong>Demo-режим:</strong> нет{' '}
        <code className="text-xs">VITE_SUPABASE_URL</code> /{' '}
        <code className="text-xs">VITE_SUPABASE_ANON_KEY</code>. Данные в памяти;
        скопируйте <code className="text-xs">.env.example</code> →{' '}
        <code className="text-xs">.env.local</code> после создания проекта в Supabase.
      </div>
    )
  }

  async function run(action: 'in' | 'up') {
    setBusy(true)
    try {
      const snap =
        action === 'in'
          ? await signInWithPassword(email, password)
          : await signUpWithPassword(email, password)
      onAuthChange(snap)
    } catch (err) {
      onError(toApiError(err).message)
    } finally {
      setBusy(false)
    }
  }

  async function handleSignOut() {
    setBusy(true)
    try {
      await signOut()
      onAuthChange({ user: null, session: null, demo: false })
    } catch (err) {
      onError(toApiError(err).message)
    } finally {
      setBusy(false)
    }
  }

  if (auth.user) {
    return (
      <div
        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--kc-line)] bg-white/80 px-3 py-2 text-sm"
        data-testid="auth-signed-in"
      >
        <span>
          Вошли: <strong>{auth.user.email}</strong>
        </span>
        <button
          type="button"
          className="rounded-lg border border-[var(--kc-line)] px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
          onClick={handleSignOut}
          disabled={busy}
        >
          Выйти
        </button>
      </div>
    )
  }

  return (
    <form
      className="flex flex-col gap-2 rounded-lg border border-[var(--kc-line)] bg-white/80 p-3 sm:flex-row sm:items-end"
      data-testid="auth-form"
      onSubmit={(e) => {
        e.preventDefault()
        void run('in')
      }}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="auth-email">
          Email
        </label>
        <input
          id="auth-email"
          type="email"
          autoComplete="username"
          required
          className="rounded-lg border border-[var(--kc-line)] px-3 py-2 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="auth-password">
          Пароль
        </label>
        <input
          id="auth-password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          className="rounded-lg border border-[var(--kc-line)] px-3 py-2 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-[var(--kc-steel)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          disabled={busy}
        >
          Войти
        </button>
        <button
          type="button"
          className="rounded-lg border border-[var(--kc-line)] px-4 py-2 text-sm disabled:opacity-50"
          disabled={busy}
          onClick={() => void run('up')}
        >
          Регистрация
        </button>
      </div>
    </form>
  )
}
