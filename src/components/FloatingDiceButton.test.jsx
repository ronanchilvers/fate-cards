import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import FloatingDiceButton from './FloatingDiceButton'

vi.mock('./icons/Icon', () => ({
  default: (props) => <svg data-testid="dice-icon" {...props} />
}))

describe('FloatingDiceButton', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the button with aria-label and title', () => {
    render(<FloatingDiceButton />)
    const button = screen.getByRole('button', { name: 'Roll Fate Dice' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('title', 'Roll Fate Dice')
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<FloatingDiceButton onClick={onClick} />)

    fireEvent.click(screen.getByRole('button', { name: 'Roll Fate Dice' }))
    expect(onClick).toHaveBeenCalled()
  })

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn()
    render(<FloatingDiceButton onClick={onClick} disabled />)

    fireEvent.click(screen.getByRole('button', { name: 'Roll Fate Dice' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('marks disabled state with attributes and class', () => {
    render(<FloatingDiceButton disabled />)
    const button = screen.getByRole('button', { name: 'Roll Fate Dice' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button.className).toContain('is-disabled')
  })

  it('handles Enter and Space key presses', () => {
    const onClick = vi.fn()
    render(<FloatingDiceButton onClick={onClick} />)

    const button = screen.getByRole('button', { name: 'Roll Fate Dice' })
    fireEvent.keyDown(button, { key: 'Enter' })
    fireEvent.keyDown(button, { key: ' ' })

    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('ignores keyboard interaction when disabled', () => {
    const onClick = vi.fn()
    render(<FloatingDiceButton onClick={onClick} disabled />)

    const button = screen.getByRole('button', { name: 'Roll Fate Dice' })
    fireEvent.keyDown(button, { key: 'Enter' })
    fireEvent.keyDown(button, { key: ' ' })

    expect(onClick).not.toHaveBeenCalled()
  })

  it('toggles pressed class briefly on click', () => {
    vi.useFakeTimers()
    render(<FloatingDiceButton />)

    const button = screen.getByRole('button', { name: 'Roll Fate Dice' })
    act(() => {
      fireEvent.click(button)
    })
    expect(button.className).toContain('is-pressed')

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(button.className).not.toContain('is-pressed')
  })
})