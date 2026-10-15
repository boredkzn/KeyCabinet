import { INITIAL_KEYS } from '../data/mockKeys'
import { toApiError, ApiError } from '../lib/apiErrors'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'
import { rowToOfficeKey, type OfficeKey, type OfficeKeyRow } from '../types/keys'
import { issueKey as issueLocal, returnKey as returnLocal } from '../utils/keyActions'

/** In-memory demo store (когда нет VITE_SUPABASE_*). */
let demoKeys: OfficeKey[] = INITIAL_KEYS.map((k) => ({ ...k }))

export function resetDemoKeys(seed: OfficeKey[] = INITIAL_KEYS) {
  demoKeys = seed.map((k) => ({ ...k }))
}

export function getDataMode(): 'supabase' | 'demo' {
  return isSupabaseConfigured() ? 'supabase' : 'demo'
}

export async function fetchKeys(): Promise<OfficeKey[]> {
  const supabase = getSupabase()
  if (!supabase) {
    return demoKeys.map((k) => ({ ...k }))
  }

  const { data, error } = await supabase
    .from('office_keys')
    .select('id, room, label, floor, status, holder, issued_at')
    .order('room', { ascending: true })

  if (error) throw toApiError(error)
  return ((data ?? []) as OfficeKeyRow[]).map(rowToOfficeKey)
}

export async function issueKeyRemote(keyId: string, holder: string): Promise<OfficeKey[]> {
  const name = holder.trim()
  if (!name) {
    throw new ApiError('Укажите ФИО сотрудника', 400, 'validation')
  }

  const supabase = getSupabase()
  if (!supabase) {
    demoKeys = issueLocal(demoKeys, keyId, name)
    return demoKeys.map((k) => ({ ...k }))
  }

  const issuedAt = new Date().toISOString()

  const { data: current, error: readErr } = await supabase
    .from('office_keys')
    .select('id, status')
    .eq('id', keyId)
    .maybeSingle()

  if (readErr) throw toApiError(readErr)
  if (!current) throw new ApiError('Ключ не найден', 404, 'unknown')
  if (current.status !== 'available') {
    throw new ApiError('Ключ уже выдан', 400, 'validation')
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error: updErr } = await supabase
    .from('office_keys')
    .update({
      status: 'issued',
      holder: name,
      issued_at: issuedAt,
    })
    .eq('id', keyId)
    .eq('status', 'available')

  if (updErr) throw toApiError(updErr)

  const { error: checkoutErr } = await supabase.from('checkouts').insert({
    key_id: keyId,
    holder_name: name,
    issued_at: issuedAt,
    issued_by: user?.id ?? null,
  })

  if (checkoutErr) throw toApiError(checkoutErr)

  return fetchKeys()
}

export async function returnKeyRemote(keyId: string): Promise<OfficeKey[]> {
  const supabase = getSupabase()
  if (!supabase) {
    demoKeys = returnLocal(demoKeys, keyId)
    return demoKeys.map((k) => ({ ...k }))
  }

  const { data: current, error: readErr } = await supabase
    .from('office_keys')
    .select('id, status')
    .eq('id', keyId)
    .maybeSingle()

  if (readErr) throw toApiError(readErr)
  if (!current) throw new ApiError('Ключ не найден', 404, 'unknown')
  if (current.status === 'available') {
    throw new ApiError('Ключ уже в шкафу', 400, 'validation')
  }

  const returnedAt = new Date().toISOString()

  const { error: updErr } = await supabase
    .from('office_keys')
    .update({
      status: 'available',
      holder: null,
      issued_at: null,
    })
    .eq('id', keyId)
    .neq('status', 'available')

  if (updErr) throw toApiError(updErr)

  const { data: openCheckout } = await supabase
    .from('checkouts')
    .select('id')
    .eq('key_id', keyId)
    .is('returned_at', null)
    .order('issued_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (openCheckout?.id) {
    const { error: closeErr } = await supabase
      .from('checkouts')
      .update({ returned_at: returnedAt })
      .eq('id', openCheckout.id)
    if (closeErr) throw toApiError(closeErr)
  }

  return fetchKeys()
}
