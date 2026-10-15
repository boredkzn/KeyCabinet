import { describe, expect, it } from 'vitest'
import { INITIAL_KEYS } from '../data/mockKeys'
import { countByStatus, filterKeys, issueKey, returnKey } from './keyActions'

describe('issueKey', () => {
  it('выдаёт свободный ключ сотруднику', () => {
    const next = issueKey(INITIAL_KEYS, 'k-101', 'Козлов Д.И.', '2026-10-13T12:00:00')
    const key = next.find((item) => item.id === 'k-101')
    expect(key?.status).toBe('issued')
    expect(key?.holder).toBe('Козлов Д.И.')
    expect(key?.issuedAt).toBe('2026-10-13T12:00:00')
  })

  it('бросает ошибку при пустом ФИО', () => {
    expect(() => issueKey(INITIAL_KEYS, 'k-101', '   ')).toThrow('Укажите ФИО сотрудника')
  })

  it('не выдаёт уже занятый ключ', () => {
    expect(() => issueKey(INITIAL_KEYS, 'k-205', 'Кто-то')).toThrow('Ключ уже выдан')
  })
})

describe('returnKey', () => {
  it('возвращает выданный ключ в шкаф', () => {
    const next = returnKey(INITIAL_KEYS, 'k-205')
    const key = next.find((item) => item.id === 'k-205')
    expect(key?.status).toBe('available')
    expect(key?.holder).toBeNull()
    expect(key?.issuedAt).toBeNull()
  })
})

describe('filterKeys и countByStatus', () => {
  it('фильтрует по статусу и поисковой строке', () => {
    const issued = filterKeys(INITIAL_KEYS, '', 'issued')
    expect(issued.every((k) => k.status === 'issued')).toBe(true)

    const byName = filterKeys(INITIAL_KEYS, 'сервер', 'all')
    expect(byName).toHaveLength(1)
    expect(byName[0].id).toBe('k-205')
  })

  it('считает ключи по статусам', () => {
    const counts = countByStatus(INITIAL_KEYS)
    expect(counts.available).toBe(2)
    expect(counts.issued).toBe(2)
    expect(counts.overdue).toBe(1)
  })
})
