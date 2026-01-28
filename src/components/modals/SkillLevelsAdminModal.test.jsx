import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import SkillLevelsAdminModal from './SkillLevelsAdminModal'

describe('SkillLevelsAdminModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    skillLevels: [
      { label: 'Superb', value: 5 },
      { label: 'Great', value: 4 },
      { label: 'Good', value: 3 }
    ],
    onAddLevelAtTop: vi.fn().mockReturnValue(true),
    onAddLevelAtBottom: vi.fn().mockReturnValue(true),
    onDeleteLevel: vi.fn(),
    onUpdateLabel: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(<SkillLevelsAdminModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('heading', { name: /Manage Skill Levels/i })).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    expect(screen.getByRole('heading', { name: /Manage Skill Levels/i })).toBeInTheDocument()
  })

  it('should display all skill levels with formatted values', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    expect(screen.getByText('+5')).toBeInTheDocument()
    expect(screen.getByText('+4')).toBeInTheDocument()
    expect(screen.getByText('+3')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Superb')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Great')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Good')).toBeInTheDocument()
  })

  it('should call onAddLevelAtTop when Add to Top clicked', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter new skill level name...'), {
      target: { value: 'Epic' }
    })
    fireEvent.click(screen.getByRole('button', { name: /Add to Top/i }))
    
    expect(defaultProps.onAddLevelAtTop).toHaveBeenCalledWith('Epic')
  })

  it('should call onAddLevelAtBottom when Add to Bottom clicked', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter new skill level name...'), {
      target: { value: 'Terrible' }
    })
    fireEvent.click(screen.getByRole('button', { name: /Add to Bottom/i }))
    
    expect(defaultProps.onAddLevelAtBottom).toHaveBeenCalledWith('Terrible')
  })

  it('should call onUpdateLabel when label edited', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    
    const labelInput = screen.getByDisplayValue('Superb')
    fireEvent.change(labelInput, { target: { value: 'Legendary' } })
    
    expect(defaultProps.onUpdateLabel).toHaveBeenCalledWith(5, 'Legendary')
  })

  it('should call onDeleteLevel with confirmation', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    
    const deleteButtons = screen.getAllByTitle('Delete skill level')
    fireEvent.click(deleteButtons[0])
    
    expect(window.confirm).toHaveBeenCalled()
    expect(defaultProps.onDeleteLevel).toHaveBeenCalledWith(5)
  })

  it('should not delete if confirmation cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<SkillLevelsAdminModal {...defaultProps} />)
    
    const deleteButtons = screen.getAllByTitle('Delete skill level')
    fireEvent.click(deleteButtons[0])
    
    expect(defaultProps.onDeleteLevel).not.toHaveBeenCalled()
  })

  it('should disable Add buttons when input is empty', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: /Add to Top/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Add to Bottom/i })).toBeDisabled()
  })

  it('should enable Add buttons when input has text', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText('Enter new skill level name...'), {
      target: { value: 'New Level' }
    })
    expect(screen.getByRole('button', { name: /Add to Top/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /Add to Bottom/i })).not.toBeDisabled()
  })

  it('should disable Add buttons when input is only whitespace', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText('Enter new skill level name...'), {
      target: { value: '   ' }
    })
    expect(screen.getByRole('button', { name: /Add to Top/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Add to Bottom/i })).toBeDisabled()
  })

  it('should format negative values correctly', () => {
    const propsWithNegative = {
      ...defaultProps,
      skillLevels: [{ label: 'Terrible', value: -2 }]
    }
    render(<SkillLevelsAdminModal {...propsWithNegative} />)
    expect(screen.getByText('-2')).toBeInTheDocument()
  })

  it('should trim whitespace when adding level at top', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter new skill level name...'), {
      target: { value: '  New Level  ' }
    })
    fireEvent.click(screen.getByRole('button', { name: /Add to Top/i }))
    
    expect(defaultProps.onAddLevelAtTop).toHaveBeenCalledWith('New Level')
  })

  it('should trim whitespace when adding level at bottom', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter new skill level name...'), {
      target: { value: '  New Level  ' }
    })
    fireEvent.click(screen.getByRole('button', { name: /Add to Bottom/i }))
    
    expect(defaultProps.onAddLevelAtBottom).toHaveBeenCalledWith('New Level')
  })

  it('should not add level if name is only whitespace', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Enter new skill level name...')
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(defaultProps.onAddLevelAtTop).not.toHaveBeenCalled()
  })

  it('should clear input after successful add at top', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Enter new skill level name...')
    fireEvent.change(input, { target: { value: 'New Level' } })
    fireEvent.click(screen.getByRole('button', { name: /Add to Top/i }))
    
    expect(input).toHaveValue('')
  })

  it('should clear input after successful add at bottom', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Enter new skill level name...')
    fireEvent.change(input, { target: { value: 'New Level' } })
    fireEvent.click(screen.getByRole('button', { name: /Add to Bottom/i }))
    
    expect(input).toHaveValue('')
  })

  it('should not clear input if add at top returns false', () => {
    const props = {
      ...defaultProps,
      onAddLevelAtTop: vi.fn().mockReturnValue(false)
    }
    render(<SkillLevelsAdminModal {...props} />)
    
    const input = screen.getByPlaceholderText('Enter new skill level name...')
    fireEvent.change(input, { target: { value: 'Duplicate' } })
    fireEvent.click(screen.getByRole('button', { name: /Add to Top/i }))
    
    expect(input).toHaveValue('Duplicate')
  })

  it('should not clear input if add at bottom returns false', () => {
    const props = {
      ...defaultProps,
      onAddLevelAtBottom: vi.fn().mockReturnValue(false)
    }
    render(<SkillLevelsAdminModal {...props} />)
    
    const input = screen.getByPlaceholderText('Enter new skill level name...')
    fireEvent.change(input, { target: { value: 'Duplicate' } })
    fireEvent.click(screen.getByRole('button', { name: /Add to Bottom/i }))
    
    expect(input).toHaveValue('Duplicate')
  })

  it('should submit to Add to Top on Enter key', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Enter new skill level name...')
    fireEvent.change(input, { target: { value: 'New Level' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(defaultProps.onAddLevelAtTop).toHaveBeenCalledWith('New Level')
  })

  it('should handle empty skill levels list', () => {
    render(<SkillLevelsAdminModal {...defaultProps} skillLevels={[]} />)
    expect(screen.getByText(/No skill levels added yet/i)).toBeInTheDocument()
  })

  it('should call onClose when close button clicked', () => {
    const { container } = render(<SkillLevelsAdminModal {...defaultProps} />)
    const closeButton = container.querySelector('.modal-close')
    fireEvent.click(closeButton)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should call onClose when backdrop clicked', () => {
    const { container } = render(<SkillLevelsAdminModal {...defaultProps} />)
    const overlay = container.querySelector('.modal-overlay')
    fireEvent.click(overlay)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should reset input when modal closes and reopens', () => {
    const { rerender } = render(<SkillLevelsAdminModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Enter new skill level name...')
    fireEvent.change(input, { target: { value: 'Test Level' } })
    expect(input).toHaveValue('Test Level')
    
    rerender(<SkillLevelsAdminModal {...defaultProps} isOpen={false} />)
    rerender(<SkillLevelsAdminModal {...defaultProps} isOpen={true} />)
    
    expect(screen.getByPlaceholderText('Enter new skill level name...')).toHaveValue('')
  })

  it('should display confirmation message before deleting', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    
    const deleteButtons = screen.getAllByTitle('Delete skill level')
    fireEvent.click(deleteButtons[0])
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the skill level "Superb"?')
  })

  it('should handle skill levels with zero value', () => {
    const propsWithZero = {
      ...defaultProps,
      skillLevels: [{ label: 'Average', value: 0 }]
    }
    render(<SkillLevelsAdminModal {...propsWithZero} />)
    expect(screen.getByText('+0')).toBeInTheDocument()
  })
})