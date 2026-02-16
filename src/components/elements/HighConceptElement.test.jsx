import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import HighConceptElement from './HighConceptElement'

describe('HighConceptElement', () => {
  const defaultProps = {
    element: { id: '1', type: 'high-concept', text: 'Test Concept' },
    isLocked: false,
    onUpdate: vi.fn(),
    onDelete: vi.fn()
  }

  it('should render with element text', () => {
    render(<HighConceptElement {...defaultProps} />)
    expect(screen.getByDisplayValue('Test Concept')).toBeInTheDocument()
  })

  it('should render title', () => {
    render(<HighConceptElement {...defaultProps} />)
    expect(screen.getByText('High Concept')).toBeInTheDocument()
  })

  it('should call onUpdate when text changes', () => {
    const onUpdate = vi.fn()
    render(<HighConceptElement {...defaultProps} onUpdate={onUpdate} />)
    
    fireEvent.change(screen.getByDisplayValue('Test Concept'), {
      target: { value: 'New Concept' }
    })
    
    expect(onUpdate).toHaveBeenCalledWith({ text: 'New Concept' })
  })

  it('should render locked text when locked', () => {
    render(<HighConceptElement {...defaultProps} isLocked={true} />)
    expect(screen.getByText('Test Concept')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('Test Concept')).not.toBeInTheDocument()
  })

  it('should hide delete button when locked', () => {
    render(<HighConceptElement {...defaultProps} isLocked={true} />)
    expect(screen.queryByRole('button', { name: /delete high concept/i })).not.toBeInTheDocument()
  })

  it('should show delete button when unlocked', () => {
    render(<HighConceptElement {...defaultProps} />)
    expect(screen.getByRole('button', { name: /delete high concept/i })).toBeInTheDocument()
  })

  it('should call onDelete when delete clicked', () => {
    const onDelete = vi.fn()
    render(<HighConceptElement {...defaultProps} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: /delete high concept/i }))
    expect(onDelete).toHaveBeenCalled()
  })

  it('should handle empty text gracefully', () => {
    const element = { id: '1', type: 'high-concept', text: '' }
    render(<HighConceptElement {...defaultProps} element={element} />)
    expect(screen.getByDisplayValue('')).toBeInTheDocument()
  })

  it('should handle null text gracefully', () => {
    const element = { id: '1', type: 'high-concept', text: null }
    render(<HighConceptElement {...defaultProps} element={element} />)
    expect(screen.getByDisplayValue('')).toBeInTheDocument()
  })

  it('should have placeholder text', () => {
    render(<HighConceptElement {...defaultProps} />)
    expect(screen.getByPlaceholderText('Enter high concept...')).toBeInTheDocument()
  })

  it('should apply element-input class to input', () => {
    render(<HighConceptElement {...defaultProps} />)
    const input = screen.getByDisplayValue('Test Concept')
    expect(input).toHaveClass('element-input')
  })

  it('should handle multiple text changes', () => {
    const onUpdate = vi.fn()
    render(<HighConceptElement {...defaultProps} onUpdate={onUpdate} />)
    
    const input = screen.getByDisplayValue('Test Concept')
    
    fireEvent.change(input, { target: { value: 'First Change' } })
    fireEvent.change(input, { target: { value: 'Second Change' } })
    fireEvent.change(input, { target: { value: 'Third Change' } })
    
    expect(onUpdate).toHaveBeenCalledTimes(3)
    expect(onUpdate).toHaveBeenLastCalledWith({ text: 'Third Change' })
  })

  it('should allow input when not locked', () => {
    const onUpdate = vi.fn()
    render(<HighConceptElement {...defaultProps} isLocked={false} onUpdate={onUpdate} />)
    
    const input = screen.getByDisplayValue('Test Concept')
    expect(input).not.toBeDisabled()
    
    fireEvent.change(input, { target: { value: 'Updated' } })
    expect(onUpdate).toHaveBeenCalled()
  })

  it('should prevent input changes when locked', () => {
    const onUpdate = vi.fn()
    render(<HighConceptElement {...defaultProps} isLocked={true} onUpdate={onUpdate} />)

    expect(screen.queryByDisplayValue('Test Concept')).not.toBeInTheDocument()
    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('toggles locked high concept modifier when callbacks are provided', () => {
    const onToggleRollModifier = vi.fn()
    const isRollModifierActive = vi.fn().mockReturnValue(false)
    render(
      <HighConceptElement
        {...defaultProps}
        isLocked={true}
        cardId="card-1"
        onToggleRollModifier={onToggleRollModifier}
        isRollModifierActive={isRollModifierActive}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Test Concept' }))
    expect(onToggleRollModifier).toHaveBeenCalledWith(expect.objectContaining({
      id: 'high-concept:card-1:1',
      label: 'Test Concept',
      value: 2
    }))
  })

  it('shows unlocked high concept modifier button as active when selected', () => {
    render(
      <HighConceptElement
        {...defaultProps}
        cardId="card-1"
        onToggleRollModifier={vi.fn()}
        isRollModifierActive={(id) => id === 'high-concept:card-1:1'}
      />
    )

    expect(screen.getByRole('button', { name: /toggle Test Concept modifier/i })).toHaveClass('is-active')
  })
})
