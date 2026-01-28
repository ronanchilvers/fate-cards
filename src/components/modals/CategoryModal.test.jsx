import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CategoryModal from './CategoryModal'

describe('CategoryModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onAddCategory: vi.fn().mockReturnValue(true)
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(<CategoryModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('heading', { name: /Add New Category/i })).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(<CategoryModal {...defaultProps} />)
    expect(screen.getByRole('heading', { name: /Add New Category/i })).toBeInTheDocument()
  })

  it('should focus input on open', () => {
    render(<CategoryModal {...defaultProps} />)
    expect(screen.getByPlaceholderText('Enter category name...')).toHaveFocus()
  })

  it('should call onClose when close button clicked', () => {
    render(<CategoryModal {...defaultProps} />)
    fireEvent.click(screen.getByText('×'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should call onClose when Cancel clicked', () => {
    render(<CategoryModal {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should call onAddCategory with trimmed name', () => {
    render(<CategoryModal {...defaultProps} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter category name...'), {
      target: { value: '  New Category  ' }
    })
    fireEvent.click(screen.getByRole('button', { name: /Add Category/i }))
    
    expect(defaultProps.onAddCategory).toHaveBeenCalledWith('New Category')
  })

  it('should close modal after successful add', () => {
    render(<CategoryModal {...defaultProps} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter category name...'), {
      target: { value: 'New Category' }
    })
    fireEvent.click(screen.getByRole('button', { name: /Add Category/i }))
    
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should not close modal if onAddCategory returns false', () => {
    const props = {
      ...defaultProps,
      onAddCategory: vi.fn().mockReturnValue(false)
    }
    render(<CategoryModal {...props} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter category name...'), {
      target: { value: 'Duplicate' }
    })
    fireEvent.click(screen.getByRole('button', { name: /Add Category/i }))
    
    expect(props.onClose).not.toHaveBeenCalled()
  })

  it('should submit on Enter key', () => {
    render(<CategoryModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Enter category name...')
    fireEvent.change(input, { target: { value: 'New Category' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(defaultProps.onAddCategory).toHaveBeenCalledWith('New Category')
  })

  it('should disable Add button when input is empty', () => {
    render(<CategoryModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: /Add Category/i })).toBeDisabled()
  })

  it('should enable Add button when input has text', () => {
    render(<CategoryModal {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText('Enter category name...'), {
      target: { value: 'Category' }
    })
    expect(screen.getByRole('button', { name: /Add Category/i })).not.toBeDisabled()
  })

  it('should disable Add button when input is only whitespace', () => {
    render(<CategoryModal {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText('Enter category name...'), {
      target: { value: '   ' }
    })
    expect(screen.getByRole('button', { name: /Add Category/i })).toBeDisabled()
  })

  it('should reset input when modal closes and reopens', () => {
    const { rerender } = render(<CategoryModal {...defaultProps} />)
    
    // Type something
    fireEvent.change(screen.getByPlaceholderText('Enter category name...'), {
      target: { value: 'Test Category' }
    })
    expect(screen.getByPlaceholderText('Enter category name...')).toHaveValue('Test Category')
    
    // Close modal
    rerender(<CategoryModal {...defaultProps} isOpen={false} />)
    
    // Reopen modal
    rerender(<CategoryModal {...defaultProps} isOpen={true} />)
    
    // Input should be empty
    expect(screen.getByPlaceholderText('Enter category name...')).toHaveValue('')
  })

  it('should not submit when input is empty', () => {
    render(<CategoryModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Enter category name...')
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(defaultProps.onAddCategory).not.toHaveBeenCalled()
  })

  it('should call onClose when backdrop clicked', () => {
    const { container } = render(<CategoryModal {...defaultProps} />)
    const overlay = container.querySelector('.modal-overlay')
    fireEvent.click(overlay)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })
})