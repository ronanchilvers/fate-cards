import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Card from './Card'
import { ELEMENT_TYPES } from '../constants'

vi.mock('./icons/Icon', () => ({
  default: (props) => <span data-testid="icon" {...props} />
}))

vi.mock('../data/elementFactories', () => ({
  createElementByType: vi.fn(() => ({ id: 'new-el', type: 'note', text: '' }))
}))

vi.mock('./elements', async () => {
  const { ELEMENT_TYPES: TYPES } = await vi.importActual('../constants')
  const Stub = ({ element, onDelete, onUpdate, showDragHandle, dragHandleProps }) => (
    <div data-testid={`element-${element.type}`}>
      <button type="button" onClick={() => onUpdate({ text: 'updated' })}>Update</button>
      {onDelete ? (
        <button type="button" onClick={onDelete}>Delete element</button>
      ) : null}
      {showDragHandle ? (
        <button type="button" {...dragHandleProps}>Drag</button>
      ) : null}
    </div>
  )

  return {
    ELEMENT_COMPONENTS: {
      [TYPES.NOTE]: Stub,
      [TYPES.ASPECTS]: Stub,
      [TYPES.CONSEQUENCES]: Stub,
      [TYPES.FATE_POINTS]: Stub,
      [TYPES.HIGH_CONCEPT]: Stub,
      [TYPES.INVENTORY]: Stub,
      [TYPES.SKILLS]: Stub,
      [TYPES.STRESS_TRACKS]: Stub,
      [TYPES.TROUBLE]: Stub
    }
  }
})

describe('Card', () => {
  const baseCard = {
    id: 'card-1',
    title: 'Test Card',
    subtitle: 'Subtitle',
    category: 'PCs',
    color: '#c53030',
    layout: 'auto',
    locked: false,
    elements: []
  }

  const baseProps = {
    card: baseCard,
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    onDuplicate: vi.fn(),
    skills: ['Athletics'],
    skillLevels: [{ value: 1, label: 'Fair' }],
    categories: ['PCs', 'NPCs']
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders title, subtitle, and placeholder when empty', () => {
    render(<Card {...baseProps} />)

    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Subtitle')).toBeInTheDocument()
    expect(screen.getByText('Click the Add Element button to add elements to this card')).toBeInTheDocument()
  })

  it('calls onDelete and onDuplicate when header actions are clicked', () => {
    render(<Card {...baseProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete card' }))
    expect(baseProps.onDelete).toHaveBeenCalledWith('card-1')

    fireEvent.click(screen.getByRole('button', { name: 'Duplicate card' }))
    expect(baseProps.onDuplicate).toHaveBeenCalledWith(baseCard)
  })

  it('toggles lock state and hides add actions', () => {
    render(<Card {...baseProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Lock card' }))
    expect(baseProps.onUpdate).toHaveBeenCalledWith('card-1', expect.objectContaining({ locked: true }))

    expect(screen.queryByRole('button', { name: 'Add element' })).not.toBeInTheDocument()
  })

  it('adds an element from the element menu', () => {
    render(<Card {...baseProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Add element' }))
    fireEvent.click(screen.getByRole('button', { name: 'Note' }))

    const [id, updated] = baseProps.onUpdate.mock.calls[0]
    expect(id).toBe('card-1')
    expect(updated.elements).toHaveLength(1)
    expect(updated.elements[0]).toMatchObject({ id: 'new-el', type: ELEMENT_TYPES.NOTE })
  })

  it('opens settings modal and saves updated title', () => {
    render(<Card {...baseProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Card settings' }))
    const titleInput = screen.getByDisplayValue('Test Card')
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } })

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(baseProps.onUpdate).toHaveBeenCalledWith(
      'card-1',
      expect.objectContaining({ title: 'Updated Title' })
    )
  })

  it('renders elements and deletes an element', () => {
    const cardWithElement = {
      ...baseCard,
      elements: [{ id: 'el-1', type: ELEMENT_TYPES.NOTE, text: '' }]
    }

    render(<Card {...baseProps} card={cardWithElement} />)

    expect(screen.getByTestId('element-note')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Delete element' }))
    expect(baseProps.onUpdate).toHaveBeenCalledWith(
      'card-1',
      expect.objectContaining({ elements: [] })
    )
  })
})