import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ElementWrapper from './ElementWrapper'

describe('ElementWrapper', () => {
  it('renders title and children', () => {
    render(
      <ElementWrapper title="High Concept" isLocked={false}>
        <div>Child content</div>
      </ElementWrapper>
    )

    expect(screen.getByText('High Concept')).toBeInTheDocument()
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('shows delete button when unlocked and onDelete is provided', () => {
    const onDelete = vi.fn()
    render(
      <ElementWrapper title="Note" isLocked={false} onDelete={onDelete}>
        <div>Content</div>
      </ElementWrapper>
    )

    const deleteButton = screen.getByRole('button', { name: 'Delete Note' })
    expect(deleteButton).toBeInTheDocument()

    fireEvent.click(deleteButton)
    expect(onDelete).toHaveBeenCalled()
  })

  it('hides delete button when locked', () => {
    const onDelete = vi.fn()
    render(
      <ElementWrapper title="Inventory" isLocked={true} onDelete={onDelete}>
        <div>Content</div>
      </ElementWrapper>
    )

    expect(screen.queryByRole('button', { name: 'Delete Inventory' })).not.toBeInTheDocument()
  })

  it('shows drag handle when enabled and applies drag handle props', () => {
    const onDragClick = vi.fn()
    render(
      <ElementWrapper
        title="Skills"
        isLocked={false}
        showDragHandle={true}
        dragHandleProps={{ onClick: onDragClick, 'data-testid': 'drag-handle' }}
      >
        <div>Content</div>
      </ElementWrapper>
    )

    const dragHandle = screen.getByRole('button', { name: 'Drag Skills' })
    expect(dragHandle).toBeInTheDocument()
    expect(dragHandle).toHaveAttribute('data-testid', 'drag-handle')

    fireEvent.click(dragHandle)
    expect(onDragClick).toHaveBeenCalled()
  })

  it('applies locked and custom class names', () => {
    const { container, rerender } = render(
      <ElementWrapper title="Stress" isLocked={false} className="extra-class">
        <div>Content</div>
      </ElementWrapper>
    )

    expect(container.firstChild).toHaveClass('card-element')
    expect(container.firstChild).toHaveClass('extra-class')
    expect(container.firstChild).not.toHaveClass('locked')

    rerender(
      <ElementWrapper title="Stress" isLocked={true} className="extra-class">
        <div>Content</div>
      </ElementWrapper>
    )

    expect(container.firstChild).toHaveClass('locked')
  })
})