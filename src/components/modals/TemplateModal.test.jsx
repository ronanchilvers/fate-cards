import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TemplateModal from './TemplateModal'

describe('TemplateModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    categories: ['PCs', 'NPCs', 'Scenes'],
    onCreateCard: vi.fn(),
    defaultCategory: 'PCs'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(<TemplateModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('heading', { name: /Add Card/i })).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(<TemplateModal {...defaultProps} />)
    expect(screen.getByRole('heading', { name: /Add Card/i })).toBeInTheDocument()
  })

  it('should display all template options', () => {
    render(<TemplateModal {...defaultProps} />)
    expect(screen.getByText('Standard PC')).toBeInTheDocument()
    expect(screen.getByText('Quick NPC')).toBeInTheDocument()
    expect(screen.getByText('Scene')).toBeInTheDocument()
    expect(screen.getByText('Blank Card')).toBeInTheDocument()
  })

  it('should display category dropdown with all categories', () => {
    render(<TemplateModal {...defaultProps} />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('PCs')
    
    defaultProps.categories.forEach(cat => {
      expect(screen.getByRole('option', { name: cat })).toBeInTheDocument()
    })
  })

  it('should call onClose when close button clicked', () => {
    render(<TemplateModal {...defaultProps} />)
    fireEvent.click(screen.getByText('×'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should call onClose when backdrop clicked', () => {
    const { container } = render(<TemplateModal {...defaultProps} />)
    const overlay = container.querySelector('.modal-overlay')
    fireEvent.click(overlay)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should select template when clicked', () => {
    render(<TemplateModal {...defaultProps} />)
    const standardPcOption = screen.getByText('Standard PC').closest('.template-option')
    fireEvent.click(standardPcOption)
    expect(standardPcOption).toHaveClass('selected')
  })

  it('should call onCreateCard with correct params when Add Card clicked', () => {
    render(<TemplateModal {...defaultProps} />)
    
    // Select a template
    fireEvent.click(screen.getByText('Standard PC'))
    
    // Change category
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'NPCs' } })
    
    // Click add
    fireEvent.click(screen.getByRole('button', { name: /^Add Card$/ }))
    
    expect(defaultProps.onCreateCard).toHaveBeenCalledWith('NPCs', 'standard-pc')
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should disable Add Card button when no template selected', () => {
    render(<TemplateModal {...defaultProps} />)
    const addButton = screen.getByRole('button', { name: /^Add Card$/ })
    expect(addButton).toBeDisabled()
  })

  it('should enable Add Card button when template and category selected', () => {
    render(<TemplateModal {...defaultProps} />)
    fireEvent.click(screen.getByText('Standard PC'))
    const addButton = screen.getByRole('button', { name: /^Add Card$/ })
    expect(addButton).not.toBeDisabled()
  })

  it('should reset state when modal opens', () => {
    const { rerender } = render(<TemplateModal {...defaultProps} />)
    
    // Select a template
    fireEvent.click(screen.getByText('Standard PC'))
    const selectedOption = screen.getByText('Standard PC').closest('.template-option')
    expect(selectedOption).toHaveClass('selected')
    
    // Close modal
    rerender(<TemplateModal {...defaultProps} isOpen={false} />)
    
    // Reopen modal - should be reset
    rerender(<TemplateModal {...defaultProps} isOpen={true} />)
    const resetOption = screen.getByText('Standard PC').closest('.template-option')
    expect(resetOption).not.toHaveClass('selected')
  })

  it('should set default category from prop', () => {
    render(<TemplateModal {...defaultProps} defaultCategory="Scenes" />)
    expect(screen.getByRole('combobox')).toHaveValue('Scenes')
  })

  it('should handle empty categories gracefully', () => {
    render(<TemplateModal {...defaultProps} categories={[]} />)
    expect(screen.getByRole('heading', { name: /Add Card/i })).toBeInTheDocument()
    const select = screen.getByRole('combobox')
    expect(select.value).toBe('')
  })
})