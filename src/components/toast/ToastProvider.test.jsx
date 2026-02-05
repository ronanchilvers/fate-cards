import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import ToastProvider from './ToastProvider'
import { useToast } from '../../hooks'

const TriggerAlert = ({ options }) => {
  const toast = useToast()

  return (
    <button type="button" onClick={() => toast.alert(options)}>
      Notify
    </button>
  )
}

const TriggerConfirm = ({ options, onResult }) => {
  const toast = useToast()

  const handleClick = async () => {
    const result = await toast.confirm(options)
    onResult(result)
  }

  return (
    <button type="button" onClick={handleClick}>
      Ask
    </button>
  )
}

describe('ToastProvider', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders an alert toast and allows dismiss', () => {
    render(
      <ToastProvider>
        <TriggerAlert options={{ title: 'Saved', message: 'Your changes were saved.', duration: 0 }} />
      </ToastProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /Notify/i }))

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Saved')).toBeInTheDocument()
    expect(screen.getByText('Your changes were saved.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^Ok$/ }))

    expect(screen.queryByText('Saved')).not.toBeInTheDocument()
  })

  it('auto-dismisses alert toast after duration', () => {
    vi.useFakeTimers()

    render(
      <ToastProvider>
        <TriggerAlert options={{ message: 'Auto hide', duration: 2000 }} />
      </ToastProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /Notify/i }))

    expect(screen.getByText('Auto hide')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.queryByText('Auto hide')).not.toBeInTheDocument()
  })

  it('resolves confirm toast with true on confirm', async () => {
    const handleResult = vi.fn()

    render(
      <ToastProvider>
        <TriggerConfirm options={{ title: 'Delete', message: 'Are you sure?' }} onResult={handleResult} />
      </ToastProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /Ask/i }))

    const confirmButton = screen.getByRole('button', { name: /^Ok$/ })
    fireEvent.click(confirmButton)

    await act(async () => {})

    expect(handleResult).toHaveBeenCalledWith(true)
  })

  it('resolves confirm toast with false on cancel', async () => {
    const handleResult = vi.fn()

    render(
      <ToastProvider>
        <TriggerConfirm options={{ title: 'Delete', message: 'Are you sure?' }} onResult={handleResult} />
      </ToastProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /Ask/i }))

    const cancelButton = screen.getByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButton)

    await act(async () => {})

    expect(handleResult).toHaveBeenCalledWith(false)
  })

  it('queues confirm toasts one at a time', async () => {
    const results = []
    const handleFirst = vi.fn((value) => results.push(['first', value]))
    const handleSecond = vi.fn((value) => results.push(['second', value]))

    render(
      <ToastProvider>
        <TriggerConfirm options={{ title: 'First', message: 'Confirm first?' }} onResult={handleFirst} />
        <TriggerConfirm options={{ title: 'Second', message: 'Confirm second?' }} onResult={handleSecond} />
      </ToastProvider>
    )

    const askButtons = screen.getAllByRole('button', { name: /Ask/i })
    fireEvent.click(askButtons[0])
    fireEvent.click(askButtons[1])

    expect(screen.getByText('Confirm first?')).toBeInTheDocument()
    expect(screen.queryByText('Confirm second?')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^Ok$/ }))
    await act(async () => {})

    expect(handleFirst).toHaveBeenCalledWith(true)
    expect(screen.getByText('Confirm second?')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    await act(async () => {})

    expect(handleSecond).toHaveBeenCalledWith(false)
  })
})
