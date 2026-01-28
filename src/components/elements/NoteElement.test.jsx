import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import NoteElement from './NoteElement'

describe('NoteElement', () => {
  const defaultProps = {
    element: { id: '1', type: 'note', text: 'Test note' },
    isLocked: false,
    onUpdate: vi.fn(),
    onDelete: vi.fn()
  }

  it('should render with element text', () => {
    render(<NoteElement {...defaultProps} />)
    expect(screen.getByDisplayValue('Test note')).toBeInTheDocument()
  })

  it('should render title', () => {
    render(<NoteElement {...defaultProps} />)
    expect(screen.getByText('Note')).toBeInTheDocument()
  })

  it('should call onUpdate when text changes', () => {
    const onUpdate = vi.fn()
    render(<NoteElement {...defaultProps} onUpdate={onUpdate} />)
    
    fireEvent.change(screen.getByDisplayValue('Test note'), {
      target: { value: 'New note' }
    })
    
    expect(onUpdate).toHaveBeenCalledWith({ text: 'New note' })
  })

  it('should disable textarea when locked', () => {
    render(<NoteElement {...defaultProps} isLocked={true} />)
    expect(screen.getByDisplayValue('Test note')).toBeDisabled()
  })

  it('should hide delete button when locked', () => {
    render(<NoteElement {...defaultProps} isLocked={true} />)
    expect(screen.queryByText('×')).not.toBeInTheDocument()
  })

  it('should show delete button when unlocked', () => {
    render(<NoteElement {...defaultProps} />)
    expect(screen.getByText('×')).toBeInTheDocument()
  })

  it('should call onDelete when delete clicked', () => {
    const onDelete = vi.fn()
    render(<NoteElement {...defaultProps} onDelete={onDelete} />)
    fireEvent.click(screen.getByText('×'))
    expect(onDelete).toHaveBeenCalled()
  })

  it('should handle empty element text gracefully', () => {
    const emptyElement = { id: '1', type: 'note', text: '' }
    render(<NoteElement {...defaultProps} element={emptyElement} />)
    expect(screen.getByPlaceholderText('Enter notes...')).toHaveValue('')
  })

  it('should handle undefined element text', () => {
    const undefinedElement = { id: '1', type: 'note' }
    render(<NoteElement {...defaultProps} element={undefinedElement} />)
    expect(screen.getByPlaceholderText('Enter notes...')).toHaveValue('')
  })

  it('should have placeholder text', () => {
    render(<NoteElement {...defaultProps} />)
    expect(screen.getByPlaceholderText('Enter notes...')).toBeInTheDocument()
  })

  it('should apply element-textarea class', () => {
    render(<NoteElement {...defaultProps} />)
    const textarea = screen.getByDisplayValue('Test note')
    expect(textarea).toHaveClass('element-textarea')
  })

  it('should have 4 rows', () => {
    render(<NoteElement {...defaultProps} />)
    const textarea = screen.getByDisplayValue('Test note')
    expect(textarea).toHaveAttribute('rows', '4')
  })

  it('should allow input when not locked', () => {
    const onUpdate = vi.fn()
    render(<NoteElement {...defaultProps} isLocked={false} onUpdate={onUpdate} />)
    
    const textarea = screen.getByDisplayValue('Test note')
    expect(textarea).not.toBeDisabled()
    
    fireEvent.change(textarea, { target: { value: 'Updated' } })
    expect(onUpdate).toHaveBeenCalled()
  })

  it('should prevent input changes when locked', () => {
    const onUpdate = vi.fn()
    render(<NoteElement {...defaultProps} isLocked={true} onUpdate={onUpdate} />)
    
    const textarea = screen.getByDisplayValue('Test note')
    expect(textarea).toBeDisabled()
  })

  it('should handle null text gracefully', () => {
    const element = { id: '1', type: 'note', text: null }
    render(<NoteElement {...defaultProps} element={element} />)
    expect(screen.getByPlaceholderText('Enter notes...')).toHaveValue('')
  })

  it('should update on prop change', () => {
    const { rerender } = render(<NoteElement {...defaultProps} />)
    expect(screen.getByDisplayValue('Test note')).toBeInTheDocument()
    
    rerender(
      <NoteElement 
        {...defaultProps} 
        element={{ ...defaultProps.element, text: 'Updated note' }}
      />
    )
    expect(screen.getByDisplayValue('Updated note')).toBeInTheDocument()
  })

  it('should handle special characters', () => {
    const specialText = 'Note with @#$%^&*() characters'
    const element = { id: '1', type: 'note', text: specialText }
    render(<NoteElement {...defaultProps} element={element} />)
    expect(screen.getByDisplayValue(specialText)).toBeInTheDocument()
  })

  it('should handle multiple text changes', () => {
    const onUpdate = vi.fn()
    render(<NoteElement {...defaultProps} onUpdate={onUpdate} />)
    
    const textarea = screen.getByDisplayValue('Test note')
    fireEvent.change(textarea, { target: { value: 'First' } })
    fireEvent.change(textarea, { target: { value: 'Second' } })
    fireEvent.change(textarea, { target: { value: 'Third' } })
    
    expect(onUpdate).toHaveBeenCalledTimes(3)
  })
})