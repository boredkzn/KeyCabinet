import { beforeEach, describe, expect, it, vi } from 'vitest'
import { INITIAL_KEYS } from '../data/mockKeys'
import { ApiError } from '../lib/apiErrors'
import {
  fetchKeys,
  getDataMode,
  issueKeyRemote,
  resetDemoKeys,
  returnKeyRemote,
} from './keysApi'

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: () => false,
  getSupabase: () => null,
}))

describe('keysApi (demo / без live Supabase)', () => {
  beforeEach(() => {
    resetDemoKeys(INITIAL_KEYS)
  })

  it('работает в режиме demo', () => {
    expect(getDataMode()).toBe('demo')
  })

  it('fetchKeys возвращает seed', async () => {
    const keys = await fetchKeys()
    expect(keys).toHaveLength(INITIAL_KEYS.length)
    expect(keys.find((k) => k.id === 'k-101')?.status).toBe('available')
  })

  it('issueKeyRemote выдаёт ключ', async () => {
    const next = await issueKeyRemote('k-101', 'Тестов Т.Т.')
    expect(next.find((k) => k.id === 'k-101')?.holder).toBe('Тестов Т.Т.')
    expect(next.find((k) => k.id === 'k-101')?.status).toBe('issued')
  })

  it('issueKeyRemote валидирует пустое ФИО', async () => {
    await expect(issueKeyRemote('k-101', '  ')).rejects.toBeInstanceOf(ApiError)
  })

  it('issueKeyRemote не выдаёт занятый ключ', async () => {
    await expect(issueKeyRemote('k-205', 'Кто-то')).rejects.toThrow('Ключ уже выдан')
  })

  it('returnKeyRemote возвращает ключ', async () => {
    const next = await returnKeyRemote('k-205')
    expect(next.find((k) => k.id === 'k-205')?.status).toBe('available')
    expect(next.find((k) => k.id === 'k-205')?.holder).toBeNull()
  })

  it('returnKeyRemote ошибка если уже свободен', async () => {
    await expect(returnKeyRemote('k-101')).rejects.toThrow('Ключ уже в шкафу')
  })
})

describe('keysApi с мок-клиентом Supabase', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('fetchKeys читает из from().select()', async () => {
    const rows = [
      {
        id: 'k-101',
        room: '101',
        label: 'Test',
        floor: 1,
        status: 'available' as const,
        holder: null,
        issued_at: null,
      },
    ]

    const maybeSingle = vi.fn()
    const order = vi.fn().mockResolvedValue({ data: rows, error: null })
    const select = vi.fn().mockReturnValue({ order, eq: vi.fn(), maybeSingle })
    const from = vi.fn().mockReturnValue({
      select,
      update: vi.fn(),
      insert: vi.fn(),
    })

    vi.doMock('../lib/supabase', () => ({
      isSupabaseConfigured: () => true,
      getSupabase: () => ({ from, auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) } }),
    }))

    const mod = await import('./keysApi')
    const keys = await mod.fetchKeys()
    expect(from).toHaveBeenCalledWith('office_keys')
    expect(keys[0].issuedAt).toBeNull()
    expect(keys[0].id).toBe('k-101')
  })

  it('пробрасывает ошибку PostgREST как ApiError 403', async () => {
    const order = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'permission denied for table office_keys', status: 403, code: '42501' },
    })
    const select = vi.fn().mockReturnValue({ order })
    const from = vi.fn().mockReturnValue({ select })

    vi.doMock('../lib/supabase', () => ({
      isSupabaseConfigured: () => true,
      getSupabase: () => ({ from }),
    }))

    const mod = await import('./keysApi')
    await expect(mod.fetchKeys()).rejects.toMatchObject({
      code: 'forbidden',
      status: 403,
    })
  })
})
