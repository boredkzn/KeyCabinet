import type { KeyStatus, OfficeKey } from '../types/keys'

export type { KeyStatus, OfficeKey }

export const INITIAL_KEYS: OfficeKey[] = [
  {
    id: 'k-101',
    room: '101',
    label: 'Переговорная Север',
    floor: 1,
    status: 'available',
    holder: null,
    issuedAt: null,
  },
  {
    id: 'k-205',
    room: '205',
    label: 'Серверная',
    floor: 2,
    status: 'issued',
    holder: 'Иванов А.П.',
    issuedAt: '2026-10-13T09:15:00',
  },
  {
    id: 'k-310',
    room: '310',
    label: 'Архив',
    floor: 3,
    status: 'overdue',
    holder: 'Петрова М.С.',
    issuedAt: '2026-10-10T14:00:00',
  },
  {
    id: 'k-112',
    room: '112',
    label: 'Склад канцелярии',
    floor: 1,
    status: 'available',
    holder: null,
    issuedAt: null,
  },
  {
    id: 'k-220',
    room: '220',
    label: 'Кабинет HR',
    floor: 2,
    status: 'issued',
    holder: 'Сидоров К.В.',
    issuedAt: '2026-10-13T11:40:00',
  },
]

export function statusLabel(status: KeyStatus): string {
  switch (status) {
    case 'available':
      return 'Свободен'
    case 'issued':
      return 'Выдан'
    case 'overdue':
      return 'Просрочен'
  }
}
