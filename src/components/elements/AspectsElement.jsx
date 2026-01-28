import ElementWrapper from './ElementWrapper'

/**
 * Aspects element renderer
 * Dynamic list of aspect text fields
 * 
 * @param {Object} props
 * @param {Object} props.element - Element data {id, type, items: string[]}
 * @param {boolean} props.isLocked - Whether card is locked
 * @param {Function} props.onUpdate - Called with updates object
 * @param {Function} props.onDelete - Called to delete element
 */
function AspectsElement({ element, isLocked, onUpdate, onDelete }) {
  const handleItemChange = (index, value) => {
    const newItems = [...(element.items || [])]
    newItems[index] = value
    onUpdate({ items: newItems })
  }

  const handleDeleteItem = (index) => {
    const newItems = (element.items || []).filter((_, i) => i !== index)
    onUpdate({ items: newItems })
  }

  const handleAddItem = () => {
    onUpdate({ items: [...(element.items || []), ''] })
  }

  const items = element.items || []

  return (
    <ElementWrapper 
      title="Aspects" 
      isLocked={isLocked} 
      onDelete={onDelete}
    >
      {items.map((item, index) => (
        <div key={index} className="aspect-item">
          <span className="aspect-bullet">📋</span>
          <input
            type="text"
            value={item || ''}
            onChange={(e) => handleItemChange(index, e.target.value)}
            placeholder="---"
            className="element-input"
            disabled={isLocked}
          />
          {!isLocked && (
            <button
              onClick={() => handleDeleteItem(index)}
              className="aspect-delete-btn"
              aria-label={`Delete aspect ${index + 1}`}
            >
              ×
            </button>
          )}
        </div>
      ))}
      {!isLocked && (
        <button onClick={handleAddItem} className="add-item-btn">
          + Add Aspect
        </button>
      )}
    </ElementWrapper>
  )
}

export default AspectsElement