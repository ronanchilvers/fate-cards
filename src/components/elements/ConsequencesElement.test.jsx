import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ConsequencesElement from './ConsequencesElement'

describe('ConsequencesElement', () => {
  const defaultProps = {
    element: {
      id: '1',
      type: 'consequences',
      items: [
        { label: 'Mild (2)', text: 'Bruised ribs' },
        { label: 'Moderate (4)', text: 'Broken arm' }
      ]
    },
    isLocked: false,
    onUpdate: vi.fn(),
    onDelete: vi.fn()
  }

  it('should render all consequences', () => {
    render(<ConsequencesElement {...defaultProps} />)
    expect(screen.getByDisplayValue('Mild (2)')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Moderate (4)')).toBeInTheDocument()
  })

  it('should render consequence descriptions', () => {
    render(<ConsequencesElement {...defaultProps} />)
    expect(screen.getByDisplayValue('Bruised ribs')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Broken arm')).toBeInTheDocument()
  })

  it('should render title', () => {
    render(<ConsequencesElement {...defaultProps} />)
    expect(screen.getByText('Consequences')).toBeInTheDocument()
  })

  it('should call onUpdate when label changes', () => {
    const onUpdate = vi.fn()
    render(<ConsequencesElement {...defaultProps} onUpdate={onUpdate} />)
    
    fireEvent.change(screen.getByDisplayValue('Mild (2)'), {
      target: { value: 'Mild (2) - Updated' }
    })
    
    expect(onUpdate).toHaveBeenCalled()
  })

  it('should call onUpdate when text changes', () => {
    const onUpdate = vi.fn()
    render(<ConsequencesElement {...defaultProps} onUpdate={onUpdate} />)
    
    fireEvent.change(screen.getByDisplayValue('Bruised ribs'), {
      target: { value: 'Severe bruising' }
    })
    
    expect(onUpdate).toHaveBeenCalled()
  })

  it('should add consequence when add button clicked', () => {
    const onUpdate = vi.fn()
    render(<ConsequencesElement {...defaultProps} onUpdate={onUpdate} />)
    
    fireEvent.click(screen.getByText('+ Add Consequence'))
    
    expect(onUpdate).toHaveBeenCalledWith({
      items: [
        { label: 'Mild (2)', text: 'Bruised ribs' },
        { label: 'Moderate (4)', text: 'Broken arm' },
        { label: 'New', text: '---' }
      ]
    })
  })

  it('should delete consequence when delete button clicked', () => {
    const onUpdate = vi.fn()
    render(<ConsequencesElement {...defaultProps} onUpdate={onUpdate} />)
    
    const deleteButtons = screen.getAllByRole('button').filter(
      btn => btn.className.includes('consequence-delete-btn')
    )
    fireEvent.click(deleteButtons[0])
    
    expect(onUpdate).toHaveBeenCalledWith({
      items: [{ label: 'Moderate (4)', text: 'Broken arm' }]
    })
  })

  it('should show delete button when unlocked', () => {
    render(<ConsequencesElement {...defaultProps} />)
    const deleteButtons = screen.getAllByRole('button').filter(
      btn => btn.className.includes('consequence-delete-btn')
    )
    expect(deleteButtons.length).toBeGreaterThan(0)
  })

  it('should hide delete button when locked', () => {
    render(<ConsequencesElement {...defaultProps} isLocked={true} />)
    expect(screen.queryByRole('button', { name: /delete consequence/i })).not.toBeInTheDocument()
  })

  it('should show add button when unlocked', () => {
    render(<ConsequencesElement {...defaultProps} />)
    expect(screen.getByText('+ Add Consequence')).toBeInTheDocument()
  })

  it('should hide add button when locked', () => {
    render(<ConsequencesElement {...defaultProps} isLocked={true} />)
    expect(screen.queryByText('+ Add Consequence')).not.toBeInTheDocument()
  })

  it('should disable text input when locked', () => {
    render(<ConsequencesElement {...defaultProps} isLocked={true} />)
    expect(screen.getByDisplayValue('Bruised ribs')).toBeDisabled()
  })

  it('should show locked labels when locked', () => {
    render(<ConsequencesElement {...defaultProps} isLocked={true} />)
    expect(screen.getByText('Mild (2)')).toBeInTheDocument()
    expect(screen.getByText('Moderate (4)')).toBeInTheDocument()
  })

  it('should hide element delete button when locked', () => {
    render(<ConsequencesElement {...defaultProps} isLocked={true} />)
    expect(screen.queryByRole('button', { name: /Delete Consequences/i })).not.toBeInTheDocument()
  })

  it('should show element delete button when unlocked', () => {
    render(<ConsequencesElement {...defaultProps} />)
    expect(screen.getByRole('button', { name: /Delete Consequences/i })).toBeInTheDocument()
  })

  it('should call onDelete when element delete clicked', () => {
    const onDelete = vi.fn()
    render(<ConsequencesElement {...defaultProps} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: /Delete Consequences/i }))
    expect(onDelete).toHaveBeenCalled()
  })

  it('should handle empty items array', () => {
    const emptyProps = { ...defaultProps, element: { ...defaultProps.element, items: [] } }
    render(<ConsequencesElement {...emptyProps} />)
    expect(screen.getByText('+ Add Consequence')).toBeInTheDocument()
  })

  it('should handle undefined items', () => {
    const undefinedProps = { ...defaultProps, element: { id: '1', type: 'consequences' } }
    render(<ConsequencesElement {...undefinedProps} />)
    expect(screen.getByText('+ Add Consequence')).toBeInTheDocument()
  })

  it('should handle null items gracefully', () => {
    const nullProps = { ...defaultProps, element: { id: '1', type: 'consequences', items: null } }
    render(<ConsequencesElement {...nullProps} />)
    expect(screen.getByText('+ Add Consequence')).toBeInTheDocument()
  })

  it('should handle consequences with empty label', () => {
    const emptyLabelProps = {
      ...defaultProps,
      element: {
        ...defaultProps.element,
        items: [{ label: '', text: 'Text' }]
      }
    }
    render(<ConsequencesElement {...emptyLabelProps} />)
    expect(screen.getByDisplayValue('')).toBeInTheDocument()
  })

  it('should handle consequences with empty text', () => {
    const emptyTextProps = {
      ...defaultProps,
      element: {
        ...defaultProps.element,
        items: [{ label: 'Label', text: '' }]
      }
    }
    render(<ConsequencesElement {...emptyTextProps} />)
    const inputs = screen.getAllByDisplayValue('')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('should apply consequence-item class', () => {
    const { container } = render(<ConsequencesElement {...defaultProps} />)
    const items = container.querySelectorAll('.consequence-item')
    expect(items.length).toBe(2)
  })

  it('should apply consequence-label-input class', () => {
    const { container } = render(<ConsequencesElement {...defaultProps} />)
    const inputs = container.querySelectorAll('.consequence-label-input')
    expect(inputs.length).toBe(2)
  })

  it('should apply element-input class to text fields', () => {
    render(<ConsequencesElement {...defaultProps} />)
    const inputs = screen.getAllByDisplayValue('Bruised ribs', 'Broken arm')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('should have placeholder text for label input', () => {
    const { container } = render(<ConsequencesElement {...defaultProps} />)
    const labelInputs = container.querySelectorAll('.consequence-label-input')
    expect(labelInputs[0]).toHaveAttribute('placeholder', 'Label')
  })

  it('should have placeholder text for description input', () => {
    render(<ConsequencesElement {...defaultProps} />)
    const inputs = screen.getAllByPlaceholderText('Consequence description')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('should update on prop change', () => {
    const { rerender } = render(<ConsequencesElement {...defaultProps} />)
    expect(screen.getByDisplayValue('Bruised ribs')).toBeInTheDocument()
    
    const newProps = {
      ...defaultProps,
      element: {
        ...defaultProps.element,
        items: [{ label: 'Severe (6)', text: 'Permanent injury' }]
      }
    }
    rerender(<ConsequencesElement {...newProps} />)
    expect(screen.getByDisplayValue('Permanent injury')).toBeInTheDocument()
  })

  it('should delete correct consequence by index', () => {
    const onUpdate = vi.fn()
    const multiProps = {
      ...defaultProps,
      element: {
        ...defaultProps.element,
        items: [
          { label: 'A', text: '1' },
          { label: 'B', text: '2' },
          { label: 'C', text: '3' }
        ]
      },
      onUpdate
    }
    render(<ConsequencesElement {...multiProps} />)
    
    const deleteButtons = screen.getAllByRole('button').filter(
      btn => btn.className.includes('consequence-delete-btn')
    )
    fireEvent.click(deleteButtons[1])
    
    expect(onUpdate).toHaveBeenCalledWith({
      items: [
        { label: 'A', text: '1' },
        { label: 'C', text: '3' }
      ]
    })
  })

  it('should handle multiple consequence updates', () => {
    const onUpdate = vi.fn()
    render(<ConsequencesElement {...defaultProps} onUpdate={onUpdate} />)
    
    const labelInputs = screen.getAllByPlaceholderText('Label')
    fireEvent.change(labelInputs[0], { target: { value: 'New Label' } })
    fireEvent.change(labelInputs[1], { target: { value: 'Another Label' } })
    
    expect(onUpdate).toHaveBeenCalledTimes(2)
  })

  it('should allow input when not locked', () => {
    const onUpdate = vi.fn()
    render(<ConsequencesElement {...defaultProps} isLocked={false} onUpdate={onUpdate} />)
    
    const textInputs = screen.getAllByPlaceholderText('Consequence description')
    fireEvent.change(textInputs[0], { target: { value: 'Updated' } })
    
    expect(onUpdate).toHaveBeenCalled()
  })

  it('should prevent input when locked', () => {
    const onUpdate = vi.fn()
    render(<ConsequencesElement {...defaultProps} isLocked={true} onUpdate={onUpdate} />)
    
    const textInputs = screen.getAllByPlaceholderText('Consequence description')
    fireEvent.change(textInputs[0], { target: { value: 'Should not update' } })
    
    expect(textInputs[0]).toBeDisabled()
  })

  it('should handle consequences with special characters', () => {
    const specialProps = {
      ...defaultProps,
      element: {
        ...defaultProps.element,
        items: [{ label: 'Mild (2) - @#$%', text: 'Special chars: !@#$%^&*()' }]
      }
    }
    render(<ConsequencesElement {...specialProps} />)
    expect(screen.getByDisplayValue('Mild (2) - @#$%')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Special chars: !@#$%^&*()')).toBeInTheDocument()
  })
})