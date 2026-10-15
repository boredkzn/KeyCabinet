import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App KeyCabinet', () => {
  it('отображает заголовок и карточки ключей', () => {
    render(<App />)
    expect(screen.getByText('KeyCabinet')).toBeInTheDocument()
    expect(screen.getByTestId('key-card-k-101')).toBeInTheDocument()
    expect(screen.getByTestId('key-card-k-310')).toBeInTheDocument()
  })

  it('фильтрует список по статусу «Свободны»', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Свободны \(2\)/ }))
    expect(screen.getByTestId('key-card-k-101')).toBeInTheDocument()
    expect(screen.queryByTestId('key-card-k-205')).not.toBeInTheDocument()
  })

  it('выдаёт свободный ключ и показывает успех', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByLabelText('ФИО для ключа 101')
    await user.type(input, 'Новиков Е.А.')
    await user.click(screen.getByTestId('key-card-k-101').querySelector('button')!)
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Ключ выдан')
    })
    expect(screen.getByText(/Новиков Е.А./)).toBeInTheDocument()
  })
})
