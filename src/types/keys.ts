export type KeyStatus = 'available' | 'issued' | 'overdue'

export type OfficeKey = {
  id: string
  room: string
  label: string
  floor: number
  status: KeyStatus
  holder: string | null
  issuedAt: string | null
}

export type OfficeKeyRow = {
  id: string
  room: string
  label: string
  floor: number
  status: KeyStatus
  holder: string | null
  issued_at: string | null
}

export function rowToOfficeKey(row: OfficeKeyRow): OfficeKey {
  return {
    id: row.id,
    room: row.room,
    label: row.label,
    floor: row.floor,
    status: row.status,
    holder: row.holder,
    issuedAt: row.issued_at,
  }
}
