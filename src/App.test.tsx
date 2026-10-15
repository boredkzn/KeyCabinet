import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetDemoKeys } from './api/keysApi'
import { INITIAL_KEYS } from './data/mockKeys'
import App from './App'

vi.mock('./lib/supabase', () => ({
  isSupabaseConfigured: () => false,
  getSupabase: () => null,
}))

describe('App KeyCabinet', () => {
  beforeEach(() => {
    resetDemoKeys(INITIAL_KEYS)
  })

  it('отображает заголовок, demo-баннер и карточки ключей', async () => {
    render(<App />)
    expect(screen.getByText('KeyCabinet')).toBeInTheDocument()
    expect(await screen.findByTestId('demo-mode-banner')).toBeInTheDocument()
    expect(await screen.findByTestId('key-card-k-101')).toBeInTheDocument()
    expect(screen.getByTestId('key-card-k-310')).toBeInTheDocument()
    expect(screen.getByTestId('data-mode')).toHaveTextContent('demo')
  })

  it('фильтрует список по статусу «Свободны»', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByTestId('key-card-k-101')
    await user.click(screen.getByRole('button', { name: /Свободны \(2\)/ }))
    expect(screen.getByTestId('key-card-k-101')).toBeInTheDocument()
    expect(screen.queryByTestId('key-card-k-205')).not.toBeInTheDocument()
  })

  it('выдаёт свободный ключ и показывает успех', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByTestId('key-card-k-101')
    const input = screen.getByLabelText('ФИО для ключа 101')
    await user.type(input, 'Новиков Е.А.')
    await user.click(screen.getByTestId('key-card-k-101').querySelector('button')!)
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Ключ выдан')
    })
    expect(screen.getByText(/Новиков Е.А./)).toBeInTheDocument()
  })

  it('показывает ошибку валидации при пустом ФИО', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByTestId('key-card-k-101')
    await user.click(screen.getByTestId('key-card-k-101').querySelector('button')!)
    expect(await screen.findByRole('alert')).toHaveTextContent('Укажите ФИО сотрудника')
  })
})
