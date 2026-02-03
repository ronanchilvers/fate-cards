import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import InventoryElement from './InventoryElement'

describe('InventoryElement', () => {
  const defaultProps = {
    element: {
      id: '1',
      type: 'inventory',
      items: [
        { id: 'item-1', name: 'Rope' },
        { id: 'item-2', name: 'Torch' }
      ]
    },
    isLocked: false,
    onUpdate: vi.fn(),
    onDelete: vi.fn()
  }

  it('should render inventory items', () => {
    render(<InventoryElement {...defaultProps} />)
    expect(screen.getByDisplayValue('Rope')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Torch')).toBeInTheDocument()
  })

  it('should update item name', () => {
    const onUpdate = vi.fn()
    render(<InventoryElement {...defaultProps} onUpdate={onUpdate} />)

    fireEvent.change(screen.getByDisplayValue('Rope'), {
      target: { value: 'Silk Rope' }
    })

    expect(onUpdate).toHaveBeenCalledWith({
      items: [
        { id: 'item-1', name: 'Silk Rope' },
        { id: 'item-2', name: 'Torch' }
      ]
    })
  })

  it('should add a new item', () => {
    const onUpdate = vi.fn()
    render(<InventoryElement {...defaultProps} onUpdate={onUpdate} />)

    fireEvent.click(screen.getByText('+ Add Item'))

    const call = onUpdate.mock.calls[0][0]
    expect(call.items).toHaveLength(3)
    expect(call.items[2]).toEqual(expect.objectContaining({ name: '' }))
  })

  it('should delete an item', () => {
    const onUpdate = vi.fn()
    render(<InventoryElement {...defaultProps} onUpdate={onUpdate} />)

    const deleteButtons = screen.getAllByRole('button').filter(
      (btn) => btn.className.includes('inventory-delete-btn')
    )

    fireEvent.click(deleteButtons[0])

    expect(onUpdate).toHaveBeenCalledWith({
      items: [{ id: 'item-2', name: 'Torch' }]
    })
  })

  it('should hide controls when locked', () => {
    render(<InventoryElement {...defaultProps} isLocked={true} />)
    expect(screen.queryByText('+ Add Item')).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/delete inventory item/i)).not.toBeInTheDocument()
  })

  it('should disable inputs when locked', () => {
    render(<InventoryElement {...defaultProps} isLocked={true} />)
    expect(screen.getByDisplayValue('Rope')).toBeDisabled()
  })

  it('should handle missing items array', () => {
    const element = { id: '1', type: 'inventory' }
    render(<InventoryElement {...defaultProps} element={element} />)
    expect(screen.getByText('+ Add Item')).toBeInTheDocument()
  })
})
