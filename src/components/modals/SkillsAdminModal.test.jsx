import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SkillsAdminModal from './SkillsAdminModal'

describe('SkillsAdminModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    skills: ['Athletics', 'Burglary', 'Contacts'],
    onAddSkill: vi.fn().mockReturnValue(true),
    onDeleteSkill: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(<SkillsAdminModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('heading', { name: /Manage Skills/i })).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(<SkillsAdminModal {...defaultProps} />)
    expect(screen.getByRole('heading', { name: /Manage Skills/i })).toBeInTheDocument()
  })

  it('should display all skills', () => {
    render(<SkillsAdminModal {...defaultProps} />)
    defaultProps.skills.forEach(skill => {
      expect(screen.getByText(skill)).toBeInTheDocument()
    })
  })

  it('should call onAddSkill when adding skill', () => {
    render(<SkillsAdminModal {...defaultProps} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter new skill name...'), {
      target: { value: 'New Skill' }
    })
    fireEvent.click(screen.getByRole('button', { name: /Add Skill/i }))
    
    expect(defaultProps.onAddSkill).toHaveBeenCalledWith('New Skill')
  })

  it('should clear input after successful add', () => {
    render(<SkillsAdminModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Enter new skill name...')
    fireEvent.change(input, { target: { value: 'New Skill' } })
    fireEvent.click(screen.getByRole('button', { name: /Add Skill/i }))
    
    expect(input).toHaveValue('')
  })

  it('should call onDeleteSkill with confirmation', () => {
    render(<SkillsAdminModal {...defaultProps} />)
    
    const deleteButtons = screen.getAllByTitle('Delete skill')
    fireEvent.click(deleteButtons[0])
    
    expect(window.confirm).toHaveBeenCalled()
    expect(defaultProps.onDeleteSkill).toHaveBeenCalledWith('Athletics')
  })

  it('should not delete if confirmation cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<SkillsAdminModal {...defaultProps} />)
    
    const deleteButtons = screen.getAllByTitle('Delete skill')
    fireEvent.click(deleteButtons[0])
    
    expect(defaultProps.onDeleteSkill).not.toHaveBeenCalled()
  })

  it('should add skill on Enter key', () => {
    render(<SkillsAdminModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Enter new skill name...')
    fireEvent.change(input, { target: { value: 'New Skill' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(defaultProps.onAddSkill).toHaveBeenCalledWith('New Skill')
  })

  it('should disable Add button when input is empty', () => {
    render(<SkillsAdminModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: /Add Skill/i })).toBeDisabled()
  })

  it('should enable Add button when input has text', () => {
    render(<SkillsAdminModal {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText('Enter new skill name...'), {
      target: { value: 'Skill' }
    })
    expect(screen.getByRole('button', { name: /Add Skill/i })).not.toBeDisabled()
  })

  it('should disable Add button when input is only whitespace', () => {
    render(<SkillsAdminModal {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText('Enter new skill name...'), {
      target: { value: '   ' }
    })
    expect(screen.getByRole('button', { name: /Add Skill/i })).toBeDisabled()
  })

  it('should call onClose when close button clicked', () => {
    const { container } = render(<SkillsAdminModal {...defaultProps} />)
    const closeButton = container.querySelector('.modal-close')
    fireEvent.click(closeButton)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should call onClose when backdrop clicked', () => {
    const { container } = render(<SkillsAdminModal {...defaultProps} />)
    const overlay = container.querySelector('.modal-overlay')
    fireEvent.click(overlay)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should reset input when modal closes and reopens', () => {
    const { rerender } = render(<SkillsAdminModal {...defaultProps} />)
    
    // Type something
    fireEvent.change(screen.getByPlaceholderText('Enter new skill name...'), {
      target: { value: 'Test Skill' }
    })
    expect(screen.getByPlaceholderText('Enter new skill name...')).toHaveValue('Test Skill')
    
    // Close modal
    rerender(<SkillsAdminModal {...defaultProps} isOpen={false} />)
    
    // Reopen modal
    rerender(<SkillsAdminModal {...defaultProps} isOpen={true} />)
    
    // Input should be empty
    expect(screen.getByPlaceholderText('Enter new skill name...')).toHaveValue('')
  })

  it('should handle empty skills list gracefully', () => {
    render(<SkillsAdminModal {...defaultProps} skills={[]} />)
    expect(screen.getByText(/No skills added yet/i)).toBeInTheDocument()
  })

  it('should not submit when input is empty on Enter key', () => {
    render(<SkillsAdminModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Enter new skill name...')
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(defaultProps.onAddSkill).not.toHaveBeenCalled()
  })

  it('should not clear input if onAddSkill returns false', () => {
    const props = {
      ...defaultProps,
      onAddSkill: vi.fn().mockReturnValue(false)
    }
    render(<SkillsAdminModal {...props} />)
    
    const input = screen.getByPlaceholderText('Enter new skill name...')
    fireEvent.change(input, { target: { value: 'Duplicate Skill' } })
    fireEvent.click(screen.getByRole('button', { name: /Add Skill/i }))
    
    expect(input).toHaveValue('Duplicate Skill')
  })

  it('should trim whitespace when adding skill', () => {
    render(<SkillsAdminModal {...defaultProps} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter new skill name...'), {
      target: { value: '  New Skill  ' }
    })
    fireEvent.click(screen.getByRole('button', { name: /Add Skill/i }))
    
    expect(defaultProps.onAddSkill).toHaveBeenCalledWith('New Skill')
  })

  it('should display confirmation message before deleting', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<SkillsAdminModal {...defaultProps} />)
    
    const deleteButtons = screen.getAllByTitle('Delete skill')
    fireEvent.click(deleteButtons[0])
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the skill "Athletics"?')
  })
})