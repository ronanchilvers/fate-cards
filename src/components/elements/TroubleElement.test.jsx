import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TroubleElement from './TroubleElement'

describe('TroubleElement', () => {
  const defaultProps = {
    element: { id: '1', type: 'trouble', text: 'Test Trouble' },
    isLocked: false,
    onUpdate: vi.fn(),
    onDelete: vi.fn()
  }

  it('should render with element text', () => {
    render(<TroubleElement {...defaultProps} />)
    expect(screen.getByDisplayValue('Test Trouble')).toBeInTheDocument()
  })

  it('should render title', () => {
    render(<TroubleElement {...defaultProps} />)
    expect(screen.getByText('Trouble')).toBeInTheDocument()
  })

  it('should call onUpdate when text changes', () => {
    const onUpdate = vi.fn()
    render(<TroubleElement {...defaultProps} onUpdate={onUpdate} />)
    
    fireEvent.change(screen.getByDisplayValue('Test Trouble'), {
      target: { value: 'New Trouble' }
    })
    
    expect(onUpdate).toHaveBeenCalledWith({ text: 'New Trouble' })
  })

  it('should render locked text when locked', () => {
    render(<TroubleElement {...defaultProps} isLocked={true} />)
    expect(screen.getByText('Test Trouble')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('Test Trouble')).not.toBeInTheDocument()
  })

  it('should hide delete button when locked', () => {
    render(<TroubleElement {...defaultProps} isLocked={true} />)
    expect(screen.queryByRole('button', { name: /delete trouble/i })).not.toBeInTheDocument()
  })

  it('should show delete button when unlocked', () => {
    render(<TroubleElement {...defaultProps} />)
    expect(screen.getByRole('button', { name: /delete trouble/i })).toBeInTheDocument()
  })

  it('should call onDelete when delete clicked', () => {
    const onDelete = vi.fn()
    render(<TroubleElement {...defaultProps} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: /delete trouble/i }))
    expect(onDelete).toHaveBeenCalled()
  })

  it('should handle empty element text gracefully', () => {
    const emptyElement = { id: '1', type: 'trouble', text: '' }
    render(<TroubleElement {...defaultProps} element={emptyElement} />)
    expect(screen.getByPlaceholderText('Enter trouble...')).toHaveValue('')
  })

  it('should handle undefined element text', () => {
    const undefinedElement = { id: '1', type: 'trouble' }
    render(<TroubleElement {...defaultProps} element={undefinedElement} />)
    expect(screen.getByPlaceholderText('Enter trouble...')).toHaveValue('')
  })

  it('should have correct placeholder text', () => {
    render(<TroubleElement {...defaultProps} />)
    expect(screen.getByPlaceholderText('Enter trouble...')).toBeInTheDocument()
  })

  it('should apply element-input class to input', () => {
    render(<TroubleElement {...defaultProps} />)
    const input = screen.getByDisplayValue('Test Trouble')
    expect(input).toHaveClass('element-input')
  })

  it('should handle multiple text changes', () => {
    const onUpdate = vi.fn()
    render(<TroubleElement {...defaultProps} onUpdate={onUpdate} />)
    
    const input = screen.getByDisplayValue('Test Trouble')
    
    fireEvent.change(input, { target: { value: 'First Change' } })
    fireEvent.change(input, { target: { value: 'Second Change' } })
    fireEvent.change(input, { target: { value: 'Third Change' } })
    
    expect(onUpdate).toHaveBeenCalledTimes(3)
    expect(onUpdate).toHaveBeenLastCalledWith({ text: 'Third Change' })
  })

  it('should allow input when not locked', () => {
    const onUpdate = vi.fn()
    render(<TroubleElement {...defaultProps} isLocked={false} onUpdate={onUpdate} />)
    
    const input = screen.getByDisplayValue('Test Trouble')
    expect(input).not.toBeDisabled()
    
    fireEvent.change(input, { target: { value: 'Updated' } })
    expect(onUpdate).toHaveBeenCalled()
  })

  it('should prevent input changes when locked', () => {
    const onUpdate = vi.fn()
    render(<TroubleElement {...defaultProps} isLocked={true} onUpdate={onUpdate} />)

    expect(screen.queryByDisplayValue('Test Trouble')).not.toBeInTheDocument()
    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('should update on prop change', () => {
    const { rerender } = render(<TroubleElement {...defaultProps} />)
    expect(screen.getByDisplayValue('Test Trouble')).toBeInTheDocument()
    
    rerender(
      <TroubleElement 
        {...defaultProps} 
        element={{ ...defaultProps.element, text: 'Updated Trouble' }}
      />
    )
    expect(screen.getByDisplayValue('Updated Trouble')).toBeInTheDocument()
  })

  it('toggles locked trouble modifier when callbacks are provided', () => {
    const onToggleRollModifier = vi.fn()
    render(
      <TroubleElement
        {...defaultProps}
        isLocked={true}
        cardId="card-1"
        onToggleRollModifier={onToggleRollModifier}
        isRollModifierActive={() => false}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Test Trouble' }))
    expect(onToggleRollModifier).toHaveBeenCalledWith(expect.objectContaining({
      id: 'trouble:card-1:1',
      label: 'Test Trouble',
      value: 2
    }))
  })

  it('shows unlocked trouble modifier button as active when selected', () => {
    render(
      <TroubleElement
        {...defaultProps}
        cardId="card-1"
        onToggleRollModifier={vi.fn()}
        isRollModifierActive={(id) => id === 'trouble:card-1:1'}
      />
    )

    expect(screen.getByRole('button', { name: /toggle Test Trouble modifier/i })).toHaveClass('is-active')
  })
})
