import type { OfficeKey } from '../data/mockKeys'

export function issueKey(
  keys: OfficeKey[],
  keyId: string,
  holder: string,
  issuedAt: string = new Date().toISOString(),
): OfficeKey[] {
  const name = holder.trim()
  if (!name) {
    throw new Error('Укажите ФИО сотрудника')
  }

  return keys.map((key) => {
    if (key.id !== keyId) return key
    if (key.status !== 'available') {
      throw new Error('Ключ уже выдан')
    }
    return {
      ...key,
      status: 'issued',
      holder: name,
      issuedAt,
    }
  })
}

export function returnKey(keys: OfficeKey[], keyId: string): OfficeKey[] {
  return keys.map((key) => {
    if (key.id !== keyId) return key
    if (key.status === 'available') {
      throw new Error('Ключ уже в шкафу')
    }
    return {
      ...key,
      status: 'available',
      holder: null,
      issuedAt: null,
    }
  })
}

export function filterKeys(
  keys: OfficeKey[],
  query: string,
  statusFilter: 'all' | OfficeKey['status'],
): OfficeKey[] {
  const q = query.trim().toLowerCase()
  return keys.filter((key) => {
    const matchesStatus = statusFilter === 'all' || key.status === statusFilter
    if (!matchesStatus) return false
    if (!q) return true
    return (
      key.room.toLowerCase().includes(q) ||
      key.label.toLowerCase().includes(q) ||
      (key.holder?.toLowerCase().includes(q) ?? false)
    )
  })
}

export function countByStatus(keys: OfficeKey[]) {
  return keys.reduce(
    (acc, key) => {
      acc[key.status] += 1
      return acc
    },
    { available: 0, issued: 0, overdue: 0 },
  )
}
