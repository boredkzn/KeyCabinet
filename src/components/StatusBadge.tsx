import { statusLabel, type KeyStatus } from '../data/mockKeys'

const STYLES: Record<KeyStatus, string> = {
  available: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  issued: 'bg-sky-100 text-sky-900 border-sky-300',
  overdue: 'bg-rose-100 text-rose-900 border-rose-300',
}

type Props = {
  status: KeyStatus
}

export function StatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold tracking-wide ${STYLES[status]}`}
      data-testid={`status-${status}`}
    >
      {statusLabel(status)}
    </span>
  )
}
