import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AspectsElement from './AspectsElement'

describe('AspectsElement', () => {
  const defaultProps = {
    element: { id: '1', type: 'aspects', items: ['Aspect 1', 'Aspect 2'] },
    isLocked: false,
    onUpdate: vi.fn(),
    onDelete: vi.fn()
  }

  it('should render all aspect items', () => {
    render(<AspectsElement {...defaultProps} />)
    expect(screen.getByDisplayValue('Aspect 1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Aspect 2')).toBeInTheDocument()
  })

  it('should render title', () => {
    render(<AspectsElement {...defaultProps} />)
    expect(screen.getByText('Aspects')).toBeInTheDocument()
  })

  it('should call onUpdate when aspect text changes', () => {
    const onUpdate = vi.fn()
    render(<AspectsElement {...defaultProps} onUpdate={onUpdate} />)
    
    fireEvent.change(screen.getByDisplayValue('Aspect 1'), {
      target: { value: 'Updated Aspect' }
    })
    
    expect(onUpdate).toHaveBeenCalledWith({
      items: ['Updated Aspect', 'Aspect 2']
    })
  })

  it('should add new aspect when add button clicked', () => {
    const onUpdate = vi.fn()
    render(<AspectsElement {...defaultProps} onUpdate={onUpdate} />)
    
    fireEvent.click(screen.getByText('+ Add Aspect'))
    
    expect(onUpdate).toHaveBeenCalledWith({
      items: ['Aspect 1', 'Aspect 2', '']
    })
  })

  it('should delete aspect when delete button clicked', () => {
    const onUpdate = vi.fn()
    render(<AspectsElement {...defaultProps} onUpdate={onUpdate} />)
    
    const deleteButtons = screen.getAllByRole('button').filter(
      btn => btn.className.includes('aspect-delete-btn')
    )
    fireEvent.click(deleteButtons[0])
    
    expect(onUpdate).toHaveBeenCalledWith({
      items: ['Aspect 2']
    })
  })

  it('should hide add/delete buttons when locked', () => {
    render(<AspectsElement {...defaultProps} isLocked={true} />)
    expect(screen.queryByText('+ Add Aspect')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete aspect/i })).not.toBeInTheDocument()
  })

  it('should render plain locked text when locked', () => {
    render(<AspectsElement {...defaultProps} isLocked={true} />)
    expect(screen.getByText('Aspect 1')).toBeInTheDocument()
    expect(screen.getByText('Aspect 2')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('Aspect 1')).not.toBeInTheDocument()
  })

  it('should render title in header', () => {
    render(<AspectsElement {...defaultProps} />)
    expect(screen.getByText('Aspects')).toBeInTheDocument()
  })

  it('should show delete button when unlocked', () => {
    render(<AspectsElement {...defaultProps} />)
    const deleteButtons = screen.getAllByRole('button').filter(
      btn => btn.className.includes('aspect-delete-btn')
    )
    expect(deleteButtons.length).toBeGreaterThan(0)
  })

  it('should call onDelete when element delete clicked', () => {
    const onDelete = vi.fn()
    render(<AspectsElement {...defaultProps} onDelete={onDelete} />)
    const deleteButton = screen.getByRole('button', { name: /delete Aspects/i })
    fireEvent.click(deleteButton)
    expect(onDelete).toHaveBeenCalled()
  })

  it('should handle empty items array', () => {
    const element = { id: '1', type: 'aspects', items: [] }
    render(<AspectsElement {...defaultProps} element={element} />)
    expect(screen.getByText('+ Add Aspect')).toBeInTheDocument()
  })

  it('should handle undefined items array', () => {
    const element = { id: '1', type: 'aspects' }
    render(<AspectsElement {...defaultProps} element={element} />)
    expect(screen.getByText('+ Add Aspect')).toBeInTheDocument()
  })

  it('should handle null items gracefully', () => {
    const element = { id: '1', type: 'aspects', items: null }
    render(<AspectsElement {...defaultProps} element={element} />)
    expect(screen.getByText('+ Add Aspect')).toBeInTheDocument()
  })

  it('should delete correct aspect by index', () => {
    const onUpdate = vi.fn()
    const element = { id: '1', type: 'aspects', items: ['A', 'B', 'C'] }
    render(<AspectsElement {...defaultProps} element={element} onUpdate={onUpdate} />)
    
    const deleteButtons = screen.getAllByRole('button').filter(
      btn => btn.className.includes('aspect-delete-btn')
    )
    fireEvent.click(deleteButtons[1])
    
    expect(onUpdate).toHaveBeenCalledWith({
      items: ['A', 'C']
    })
  })

  it('should allow multiple changes', () => {
    const onUpdate = vi.fn()
    render(<AspectsElement {...defaultProps} onUpdate={onUpdate} />)
    
    fireEvent.change(screen.getByDisplayValue('Aspect 1'), {
      target: { value: 'Changed 1' }
    })
    fireEvent.change(screen.getByDisplayValue('Aspect 2'), {
      target: { value: 'Changed 2' }
    })
    
    expect(onUpdate).toHaveBeenCalledTimes(2)
  })

  it('should show aspect bullet icon', () => {
    const { container } = render(<AspectsElement {...defaultProps} />)
    const bullets = container.querySelectorAll('.aspect-bullet')
    expect(bullets.length).toBe(2)
  })

  it('should have placeholder for inputs', () => {
    render(<AspectsElement {...defaultProps} />)
    const inputs = screen.getAllByPlaceholderText('---')
    expect(inputs.length).toBe(2)
  })

  it('should apply aspect-item class to items', () => {
    const { container } = render(<AspectsElement {...defaultProps} />)
    const aspectItems = container.querySelectorAll('.aspect-item')
    expect(aspectItems.length).toBe(2)
  })

  it('toggles locked aspect modifier when callbacks are provided', () => {
    const onToggleRollModifier = vi.fn()
    const isRollModifierActive = vi.fn().mockReturnValue(false)
    render(
      <AspectsElement
        {...defaultProps}
        isLocked={true}
        cardId="card-1"
        onToggleRollModifier={onToggleRollModifier}
        isRollModifierActive={isRollModifierActive}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Aspect 1' }))

    expect(onToggleRollModifier).toHaveBeenCalledWith(expect.objectContaining({
      id: 'aspect:card-1:1:0',
      label: 'Aspect 1',
      value: 2
    }))
  })

  it('shows unlocked aspect modifier button as active when selected', () => {
    const isRollModifierActive = vi.fn().mockImplementation((id) => id === 'aspect:card-1:1:0')
    render(
      <AspectsElement
        {...defaultProps}
        cardId="card-1"
        onToggleRollModifier={vi.fn()}
        isRollModifierActive={isRollModifierActive}
      />
    )

    expect(screen.getByRole('button', { name: /toggle Aspect 1 modifier/i })).toHaveClass('is-active')
  })
})
