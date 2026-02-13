import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ToastContainer from './ToastContainer'

describe('ToastContainer', () => {
  it('renders alert toasts with title and message', () => {
    render(
      <ToastContainer
        toasts={[
          { id: 'a1', kind: 'alert', title: 'Saved', message: 'All good', tone: 'info' }
        ]}
      />
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Saved')).toBeInTheDocument()
    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('renders confirm toasts in overlay with buttons', () => {
    render(
      <ToastContainer
        toasts={[
          { id: 'c1', kind: 'confirm', title: 'Delete', message: 'Are you sure?' }
        ]}
      />
    )

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Ok$/ })).toBeInTheDocument()
  })

  it('calls onConfirmChoice when confirm buttons are clicked', () => {
    const onConfirmChoice = vi.fn()
    render(
      <ToastContainer
        onConfirmChoice={onConfirmChoice}
        toasts={[
          { id: 'c2', kind: 'confirm', title: 'Reset', message: 'Confirm?' }
        ]}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    expect(onConfirmChoice).toHaveBeenCalledWith('c2', false)

    fireEvent.click(screen.getByRole('button', { name: /^Ok$/ }))
    expect(onConfirmChoice).toHaveBeenCalledWith('c2', true)
  })

  it('renders dice result toasts with breakdown and total', () => {
    render(
      <ToastContainer
        toasts={[
          { id: 'd1', kind: 'diceResult', breakdown: '+ - 0 +', total: '+2', duration: 0 }
        ]}
      />
    )

    expect(screen.getByText('Dice Roll')).toBeInTheDocument()
    expect(screen.getByText('+ - 0 +')).toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('shows progress bar when duration is positive', () => {
    render(
      <ToastContainer
        toasts={[
          { id: 'a2', kind: 'alert', message: 'Timed', duration: 1500 }
        ]}
      />
    )

    const progress = document.querySelector('.toast-progress-bar')
    expect(progress).toBeInTheDocument()
    expect(progress).toHaveAttribute('style', expect.stringContaining('1500ms'))
  })

  it('calls onDismiss when an alert toast is clicked', () => {
    const onDismiss = vi.fn()
    render(
      <ToastContainer
        onDismiss={onDismiss}
        toasts={[
          { id: 'a3', kind: 'alert', message: 'Dismiss me', duration: 0 }
        ]}
      />
    )

    fireEvent.click(screen.getByRole('status'))
    expect(onDismiss).toHaveBeenCalledWith('a3')
  })

  it('handles non-array toasts safely', () => {
    render(<ToastContainer toasts={null} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})