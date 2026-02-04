import ElementWrapper from './ElementWrapper'
import Icon from '../icons/Icon'

/**
 * Inventory element renderer
 * Editable list of inventory items
 *
 * @param {Object} props
 * @param {Object} props.element - Element data {id, type, items: Array<{id, name}>}
 * @param {boolean} props.isLocked - Whether card is locked
 * @param {Function} props.onUpdate - Called with updates object
 * @param {Function} props.onDelete - Called to delete element
 * @param {boolean} props.showDragHandle - Whether to show drag handle
 * @param {Object} props.dragHandleProps - Props applied to drag handle button
 */
function InventoryElement({ element, isLocked, onUpdate, onDelete, showDragHandle, dragHandleProps }) {
  const items = Array.isArray(element.items) ? element.items : []

  const updateItems = (nextItems) => {
    onUpdate({ items: nextItems })
  }

  const handleNameChange = (index, value) => {
    const nextItems = items.map((item, i) => (
      i === index ? { ...item, name: value } : item
    ))
    updateItems(nextItems)
  }

  const handleDeleteItem = (index) => {
    updateItems(items.filter((_, i) => i !== index))
  }

  const handleAddItem = () => {
    updateItems([
      ...items,
      { id: crypto.randomUUID(), name: '' }
    ])
  }

  return (
    <ElementWrapper
      title="Inventory"
      isLocked={isLocked}
      onDelete={onDelete}
      showDragHandle={showDragHandle}
      dragHandleProps={dragHandleProps}
    >
      {items.map((item, index) => {
        const name = typeof item?.name === 'string' ? item.name : ''
        const key = item?.id || `${element.id || 'inventory'}-${index}`

        return (
          <div key={key} className="inventory-item">
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              placeholder="Item name"
              className="element-input inventory-name"
              disabled={isLocked}
            />
            {!isLocked && (
              <button
                onClick={() => handleDeleteItem(index)}
                className="inventory-delete-btn"
                aria-label={`Delete inventory item ${index + 1}`}
              >
                <Icon name="delete" size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        )
      })}
      {!isLocked && (
        <button onClick={handleAddItem} className="add-item-btn">
          + Add Item
        </button>
      )}
    </ElementWrapper>
  )
}

export default InventoryElement
