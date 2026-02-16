import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SkillsElement from './SkillsElement'

describe('SkillsElement', () => {
  const defaultProps = {
    element: {
      id: '1',
      type: 'skills',
      items: [
        { name: 'Athletics', rating: 2 },
        { name: 'Stealth', rating: 1 }
      ]
    },
    skills: ['Athletics', 'Stealth', 'Academics', 'Lore'],
    skillLevels: [
      { value: 4, label: 'Superb' },
      { value: 3, label: 'Great' },
      { value: 2, label: 'Good' },
      { value: 1, label: 'Fair' },
      { value: 0, label: 'Average' }
    ],
    isLocked: false,
    onUpdate: vi.fn(),
    onDelete: vi.fn()
  }

  it('should render title', () => {
    render(<SkillsElement {...defaultProps} />)
    expect(screen.getByText('Skills')).toBeInTheDocument()
  })

  it('should render all existing skill levels in unlocked view', () => {
    render(<SkillsElement {...defaultProps} />)
    expect(screen.getByText(/Good \(\+2\)/)).toBeInTheDocument()
    expect(screen.getByText(/Fair \(\+1\)/)).toBeInTheDocument()
  })

  it('should render all skills in their levels', () => {
    render(<SkillsElement {...defaultProps} />)
    expect(screen.getByDisplayValue('Athletics')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Stealth')).toBeInTheDocument()
  })

  it('should show compact view when locked', () => {
    render(<SkillsElement {...defaultProps} isLocked={true} />)
    expect(screen.getByText('Skills')).toBeInTheDocument()
  })

  it('should hide add/remove buttons when locked', () => {
    render(<SkillsElement {...defaultProps} isLocked={true} />)
    expect(screen.queryByText('+ Add Level')).not.toBeInTheDocument()
    expect(screen.queryByText('+ Add Skill')).not.toBeInTheDocument()
  })

  it('should update skill name when changed', () => {
    const onUpdate = vi.fn()
    render(<SkillsElement {...defaultProps} onUpdate={onUpdate} />)
    
    fireEvent.change(screen.getByDisplayValue('Athletics'), {
      target: { value: 'Academics' }
    })
    
    expect(onUpdate).toHaveBeenCalled()
    const call = onUpdate.mock.calls[0][0]
    expect(call.items[0].name).toBe('Academics')
  })

  it('should add skill to level', () => {
    const onUpdate = vi.fn()
    render(<SkillsElement {...defaultProps} onUpdate={onUpdate} />)
    
    const addButtons = screen.getAllByText('+ Add Skill')
    fireEvent.click(addButtons[0])
    
    expect(onUpdate).toHaveBeenCalled()
    const call = onUpdate.mock.calls[0][0]
    expect(call.items.length).toBe(3)
  })

  it('should delete skill from level', () => {
    const onUpdate = vi.fn()
    render(<SkillsElement {...defaultProps} onUpdate={onUpdate} />)
    
    const deleteButtons = screen.getAllByRole('button').filter(
      btn => btn.className.includes('skill-delete-btn')
    )
    fireEvent.click(deleteButtons[0])
    
    expect(onUpdate).toHaveBeenCalled()
  })

  it('should remove entire level when level delete clicked', () => {
    const onUpdate = vi.fn()
    render(<SkillsElement {...defaultProps} onUpdate={onUpdate} />)
    
    const levelDeleteButtons = screen.getAllByRole('button').filter(
      btn => btn.className.includes('remove-level-btn')
    )
    fireEvent.click(levelDeleteButtons[0])
    
    expect(onUpdate).toHaveBeenCalled()
    const call = onUpdate.mock.calls[0][0]
    expect(call.items.length).toBe(1)
  })

  it('should show available levels dropdown', () => {
    render(<SkillsElement {...defaultProps} />)
    expect(screen.getByText('+ Add Level')).toBeInTheDocument()
  })

  it('should add new level when selected from dropdown', () => {
    const onUpdate = vi.fn()
    render(<SkillsElement {...defaultProps} onUpdate={onUpdate} />)
    
    const select = screen.getByDisplayValue('+ Add Level')
    fireEvent.change(select, { target: { value: '4' } })
    
    expect(onUpdate).toHaveBeenCalled()
    const call = onUpdate.mock.calls[0][0]
    expect(call.items[call.items.length - 1].rating).toBe(4)
  })

  it('should not show add level dropdown when all levels are used', () => {
    const allLevelsElement = {
      id: '1',
      type: 'skills',
      items: [
        { name: 'Skill1', rating: 4 },
        { name: 'Skill2', rating: 3 },
        { name: 'Skill3', rating: 2 },
        { name: 'Skill4', rating: 1 },
        { name: 'Skill5', rating: 0 }
      ]
    }
    render(
      <SkillsElement 
        {...defaultProps} 
        element={allLevelsElement}
      />
    )
    expect(screen.queryByText('+ Add Level')).not.toBeInTheDocument()
  })

  it('should handle empty items array', () => {
    const emptyElement = { id: '1', type: 'skills', items: [] }
    render(<SkillsElement {...defaultProps} element={emptyElement} />)
    expect(screen.getByText('Skills')).toBeInTheDocument()
  })

  it('should handle undefined items', () => {
    const undefinedElement = { id: '1', type: 'skills' }
    render(<SkillsElement {...defaultProps} element={undefinedElement} />)
    expect(screen.getByText('Skills')).toBeInTheDocument()
  })

  it('should handle empty skills array', () => {
    render(<SkillsElement {...defaultProps} skills={[]} />)
    expect(screen.getByText('Skills')).toBeInTheDocument()
  })

  it('should handle empty skillLevels array', () => {
    const noLevelsProps = { ...defaultProps, skillLevels: [] }
    render(<SkillsElement {...noLevelsProps} />)
    expect(screen.getByText('Skills')).toBeInTheDocument()
  })

  it('should show skill dropdown options', () => {
    render(<SkillsElement {...defaultProps} />)
    const select = screen.getByDisplayValue('Athletics')
    expect(select).toBeInTheDocument()
  })

  it('should include custom option in the skill dropdown', () => {
    render(<SkillsElement {...defaultProps} />)
    const options = screen.getAllByRole('option', { name: 'Custom...' })
    expect(options.length).toBeGreaterThan(0)
  })

  it('should allow entering a custom skill name', () => {
    const onUpdate = vi.fn()
    const element = {
      id: '1',
      type: 'skills',
      items: [{ name: 'Hacking', rating: 2 }]
    }
    render(<SkillsElement {...defaultProps} element={element} onUpdate={onUpdate} />)

    fireEvent.change(screen.getByLabelText('Custom skill name'), {
      target: { value: 'Hacking Pro' }
    })

    expect(onUpdate).toHaveBeenCalled()
    const call = onUpdate.mock.calls[0][0]
    expect(call.items[0].name).toBe('Hacking Pro')
  })

  it('should keep custom selection when the custom skill name is emptied', () => {
    const onUpdate = vi.fn()
    const element = {
      id: '1',
      type: 'skills',
      items: [{ name: 'Hacking', rating: 2 }]
    }
    render(<SkillsElement {...defaultProps} element={element} onUpdate={onUpdate} />)

    fireEvent.change(screen.getByLabelText('Custom skill name'), {
      target: { value: '' }
    })

    expect(onUpdate).toHaveBeenCalled()
    const call = onUpdate.mock.calls[0][0]
    expect(call.items[0].name).toBe('')
    expect(call.items[0].isCustom).toBe(true)
  })

  it('should render custom skill input when name is not in skills list', () => {
    const element = {
      id: '1',
      type: 'skills',
      items: [{ name: 'Hacking', rating: 2 }]
    }
    render(<SkillsElement {...defaultProps} element={element} />)
    expect(screen.getByLabelText('Custom skill name')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Hacking')).toBeInTheDocument()
  })

  it('should call onDelete when delete button clicked', () => {
    const onDelete = vi.fn()
    render(<SkillsElement {...defaultProps} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: /Delete Skills/i }))
    expect(onDelete).toHaveBeenCalled()
  })

  it('should show delete button when unlocked', () => {
    render(<SkillsElement {...defaultProps} isLocked={false} />)
    expect(screen.getByRole('button', { name: /Delete Skills/i })).toBeInTheDocument()
  })

  it('should hide delete button when locked', () => {
    render(<SkillsElement {...defaultProps} isLocked={true} />)
    expect(screen.queryByRole('button', { name: /Delete Skills/i })).not.toBeInTheDocument()
  })

  it('should format skill levels correctly with positive values', () => {
    render(<SkillsElement {...defaultProps} />)
    expect(screen.getByText(/Good \(\+2\)/)).toBeInTheDocument()
    expect(screen.getByText(/Fair \(\+1\)/)).toBeInTheDocument()
  })

  it('should format skill levels correctly with zero value', () => {
    const withZeroElement = {
      id: '1',
      type: 'skills',
      items: [{ name: 'Skill', rating: 0 }]
    }
    render(<SkillsElement {...defaultProps} element={withZeroElement} />)
    expect(screen.getByText(/Average \(\+0\)/)).toBeInTheDocument()
  })

  it('should sort existing ratings in descending order', () => {
    const unorderedElement = {
      id: '1',
      type: 'skills',
      items: [
        { name: 'Skill1', rating: 1 },
        { name: 'Skill2', rating: 3 },
        { name: 'Skill3', rating: 2 }
      ]
    }
    const { container } = render(<SkillsElement {...defaultProps} element={unorderedElement} />)
    const headers = container.querySelectorAll('.skill-level-header h5')
    expect(headers[0].textContent).toMatch(/Great \(\+3\)/)
    expect(headers[1].textContent).toMatch(/Good \(\+2\)/)
    expect(headers[2].textContent).toMatch(/Fair \(\+1\)/)
  })

  it('should update on prop change', () => {
    const { rerender } = render(<SkillsElement {...defaultProps} />)
    expect(screen.getByDisplayValue('Athletics')).toBeInTheDocument()
    
    const newProps = {
      ...defaultProps,
      element: {
        id: '1',
        type: 'skills',
        items: [
          { name: 'Academics', rating: 3 }
        ]
      }
    }
    rerender(<SkillsElement {...newProps} />)
    expect(screen.getByDisplayValue('Academics')).toBeInTheDocument()
  })

  it('should handle skill with undefined rating', () => {
    const undefinedRatingElement = {
      id: '1',
      type: 'skills',
      items: [{ name: 'Skill', rating: undefined }]
    }
    render(<SkillsElement {...defaultProps} element={undefinedRatingElement} />)
    expect(screen.getByText('Skills')).toBeInTheDocument()
  })

  it('should handle multiple skill levels', () => {
    const element = {
      id: '1',
      type: 'skills',
      items: [
        { name: 'Athletics', rating: 4 },
        { name: 'Burglary', rating: 3 },
        { name: 'Contacts', rating: 2 }
      ]
    }
    render(<SkillsElement {...defaultProps} element={element} />)
    expect(screen.getByText(/Superb/)).toBeInTheDocument()
    expect(screen.getByText(/Great/)).toBeInTheDocument()
    expect(screen.getByText(/Good/)).toBeInTheDocument()
  })

  it('should display locked view with skill groups', () => {
    render(<SkillsElement {...defaultProps} isLocked={true} />)
    const skillLevelGroups = document.querySelectorAll('.skill-level-group')
    expect(skillLevelGroups.length).toBeGreaterThan(0)
  })

  it('does not render click-to-roll rating button in locked view', () => {
    render(<SkillsElement {...defaultProps} isLocked={true} />)
    expect(screen.queryByRole('button', { name: '+2' })).not.toBeInTheDocument()
  })

  it('toggles locked skill modifier when callbacks are provided', () => {
    const onToggleRollModifier = vi.fn()
    render(
      <SkillsElement
        {...defaultProps}
        isLocked={true}
        cardId="card-1"
        onToggleRollModifier={onToggleRollModifier}
        isRollModifierActive={() => false}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Athletics' }))
    expect(onToggleRollModifier).toHaveBeenCalledWith(expect.objectContaining({
      id: 'skill:card-1:1:0',
      label: 'Athletics',
      value: 2
    }))
  })

  it('uses the skill level value for modifier payloads', () => {
    const onToggleRollModifier = vi.fn()
    render(
      <SkillsElement
        {...defaultProps}
        isLocked={true}
        cardId="card-1"
        onToggleRollModifier={onToggleRollModifier}
        isRollModifierActive={() => false}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Stealth' }))
    expect(onToggleRollModifier).toHaveBeenCalledWith(expect.objectContaining({
      id: 'skill:card-1:1:1',
      label: 'Stealth',
      value: 1
    }))
  })

  it('shows unlocked skill modifier toggle as active when selected', () => {
    render(
      <SkillsElement
        {...defaultProps}
        cardId="card-1"
        onToggleRollModifier={vi.fn()}
        isRollModifierActive={(id) => id === 'skill:card-1:1:0'}
      />
    )

    expect(screen.getByRole('button', { name: /toggle Athletics modifier/i })).toHaveClass('is-active')
  })
})
