import ElementWrapper from './ElementWrapper'

/**
 * Inventory element renderer
 * Editable list of inventory items
 *
 * @param {Object} props
 * @param {Object} props.element - Element data {id, type, items: Array<{id, name}>}
 * @param {boolean} props.isLocked - Whether card is locked
 * @param {Function} props.onUpdate - Called with updates object
 * @param {Function} props.onDelete - Called to delete element
 */
function InventoryElement({ element, isLocked, onUpdate, onDelete }) {
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
                ×
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
