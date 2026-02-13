import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Icon from './Icon'

vi.mock('./iconMap', () => ({
  iconMap: {
    warning: (props) => <svg data-testid="lucide-icon" {...props} />
  }
}))

describe('Icon', () => {
  it('returns null for unknown icon name', () => {
    const { container } = render(<Icon name="does-not-exist" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the icon when name exists', () => {
    render(<Icon name="warning" />)
    expect(screen.getByTestId('lucide-icon')).toBeInTheDocument()
  })

  it('defaults aria-hidden to true when no ariaLabel is provided', () => {
    render(<Icon name="warning" />)
    const icon = screen.getByTestId('lucide-icon')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(icon).not.toHaveAttribute('role')
  })

  it('sets aria-hidden to false and role img when ariaLabel is provided', () => {
    render(<Icon name="warning" ariaLabel="Warning icon" />)
    const icon = screen.getByTestId('lucide-icon')
    expect(icon).toHaveAttribute('aria-hidden', 'false')
    expect(icon).toHaveAttribute('role', 'img')
    expect(icon).toHaveAttribute('aria-label', 'Warning icon')
  })

  it('allows explicit ariaHidden to override default', () => {
    render(<Icon name="warning" ariaHidden={false} />)
    const icon = screen.getByTestId('lucide-icon')
    expect(icon).toHaveAttribute('aria-hidden', 'false')
  })

  it('forwards extra props to the icon', () => {
    render(<Icon name="warning" data-qa="icon" title="Alert" />)
    const icon = screen.getByTestId('lucide-icon')
    expect(icon).toHaveAttribute('data-qa', 'icon')
    expect(icon).toHaveAttribute('title', 'Alert')
  })

  it('applies size and strokeWidth defaults', () => {
    render(<Icon name="warning" />)
    const icon = screen.getByTestId('lucide-icon')
    expect(icon).toHaveAttribute('size', '16')
    expect(icon).toHaveAttribute('stroke-width', '1.75')
  })

  it('applies custom size and strokeWidth', () => {
    render(<Icon name="warning" size={24} strokeWidth={2} />)
    const icon = screen.getByTestId('lucide-icon')
    expect(icon).toHaveAttribute('size', '24')
    expect(icon).toHaveAttribute('stroke-width', '2')
  })
})