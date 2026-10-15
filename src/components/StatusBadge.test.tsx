import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('показывает подпись статуса', () => {
    render(<StatusBadge status="overdue" />)
    expect(screen.getByText('Просрочен')).toBeInTheDocument()
    expect(screen.getByTestId('status-overdue')).toBeInTheDocument()
  })
})
