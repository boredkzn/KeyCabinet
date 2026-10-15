import { useState } from 'react'
import type { OfficeKey } from '../data/mockKeys'
import { StatusBadge } from './StatusBadge'

type Props = {
  officeKey: OfficeKey
  busy: boolean
  onIssue: (keyId: string, holder: string) => Promise<void>
  onReturn: (keyId: string) => Promise<void>
}

export function KeyCard({ officeKey, busy, onIssue, onReturn }: Props) {
  const [holder, setHolder] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const disabled = busy || pending

  async function handleIssue() {
    setLocalError(null)
    setPending(true)
    try {
      await onIssue(officeKey.id, holder)
      setHolder('')
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Ошибка выдачи')
    } finally {
      setPending(false)
    }
  }

  async function handleReturn() {
    setLocalError(null)
    setPending(true)
    try {
      await onReturn(officeKey.id)
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Ошибка возврата')
    } finally {
      setPending(false)
    }
  }

  return (
    <article
      className="flex flex-col gap-3 rounded-xl border border-[var(--kc-line)] bg-white/90 p-4 shadow-sm"
      data-testid={`key-card-${officeKey.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-[var(--kc-ink)]">
            Каб. {officeKey.room}
          </h3>
          <p className="text-sm text-[var(--kc-steel)]">{officeKey.label}</p>
          <p className="mt-1 text-xs text-slate-500">Этаж {officeKey.floor}</p>
        </div>
        <StatusBadge status={officeKey.status} />
      </div>

      {officeKey.holder && (
        <p className="text-sm">
          У кого: <strong>{officeKey.holder}</strong>
          {officeKey.issuedAt && (
            <span className="ml-2 text-xs text-slate-500">
              с {new Date(officeKey.issuedAt).toLocaleString('ru-RU')}
            </span>
          )}
        </p>
      )}

      {officeKey.status === 'available' ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="min-w-0 flex-1 rounded-lg border border-[var(--kc-line)] px-3 py-2 text-sm outline-none focus:border-[var(--kc-steel)]"
            placeholder="ФИО сотрудника"
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
            disabled={disabled}
            aria-label={`ФИО для ключа ${officeKey.room}`}
          />
          <button
            type="button"
            className="rounded-lg bg-[var(--kc-steel)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2f4766] disabled:opacity-50"
            onClick={handleIssue}
            disabled={disabled}
          >
            {pending ? 'Выдача…' : 'Выдать'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="rounded-lg bg-[var(--kc-accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#d85a3c] disabled:opacity-50 sm:self-start"
          onClick={handleReturn}
          disabled={disabled}
        >
          {pending ? 'Возврат…' : 'Принять возврат'}
        </button>
      )}

      {localError && (
        <p className="text-sm text-rose-700" role="alert">
          {localError}
        </p>
      )}
    </article>
  )
}
