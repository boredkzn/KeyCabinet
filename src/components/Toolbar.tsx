import type { KeyStatus } from '../data/mockKeys'

type Props = {
  query: string
  statusFilter: 'all' | KeyStatus
  onQueryChange: (value: string) => void
  onStatusChange: (value: 'all' | KeyStatus) => void
  counts: { available: number; issued: number; overdue: number }
}

export function Toolbar({
  query,
  statusFilter,
  onQueryChange,
  onStatusChange,
  counts,
}: Props) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-[var(--kc-line)] bg-white/80 p-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="key-search">
          Поиск
        </label>
        <input
          id="key-search"
          className="w-full rounded-lg border border-[var(--kc-line)] px-3 py-2 text-sm outline-none focus:border-[var(--kc-steel)]"
          placeholder="Кабинет, название или сотрудник"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Статус</span>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['all', 'Все'],
              ['available', `Свободны (${counts.available})`],
              ['issued', `Выданы (${counts.issued})`],
              ['overdue', `Просрочены (${counts.overdue})`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                statusFilter === value
                  ? 'border-[var(--kc-steel)] bg-[var(--kc-steel)] text-white'
                  : 'border-[var(--kc-line)] bg-white text-[var(--kc-ink)]'
              }`}
              onClick={() => onStatusChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
