import ElementWrapper from './ElementWrapper'

/**
 * Consequences element renderer
 * Manages list of consequences with labels and descriptions
 * 
 * @param {Object} props
 * @param {Object} props.element - Element data {id, type, items: Array<{label, text}>}
 * @param {boolean} props.isLocked - Whether card is locked
 * @param {Function} props.onUpdate - Called with updates object
 * @param {Function} props.onDelete - Called to delete element
 */
function ConsequencesElement({ element, isLocked, onUpdate, onDelete }) {
  const items = element.items || []

  const handleLabelChange = (index, newLabel) => {
    const newItems = [...items]
    newItems[index] = { ...items[index], label: newLabel }
    onUpdate({ items: newItems })
  }

  const handleTextChange = (index, newText) => {
    const newItems = [...items]
    newItems[index] = { ...items[index], text: newText }
    onUpdate({ items: newItems })
  }

  const handleDeleteItem = (index) => {
    const newItems = items.filter((_, i) => i !== index)
    onUpdate({ items: newItems })
  }

  const handleAddItem = () => {
    onUpdate({ items: [...items, { label: 'New', text: '---' }] })
  }

  return (
    <ElementWrapper 
      title="Consequences" 
      isLocked={isLocked} 
      onDelete={onDelete}
    >
      {items.map((consequence, index) => (
        <div key={index} className="consequence-item">
          <div className="consequence-label-row">
            {!isLocked ? (
              <>
                <input
                  type="text"
                  value={consequence.label || ''}
                  onChange={(e) => handleLabelChange(index, e.target.value)}
                  className="consequence-label-input"
                  placeholder="Label"
                />
                <button
                  onClick={() => handleDeleteItem(index)}
                  className="consequence-delete-btn"
                  aria-label={`Delete consequence ${index + 1}`}
                >
                  ×
                </button>
              </>
            ) : (
              <label>{consequence.label || ''}</label>
            )}
          </div>
          <input
            type="text"
            value={consequence.text || ''}
            onChange={(e) => handleTextChange(index, e.target.value)}
            className="element-input"
            placeholder="Consequence description"
            disabled={isLocked}
          />
        </div>
      ))}
      {!isLocked && (
        <button
          onClick={handleAddItem}
          className="add-item-btn"
        >
          + Add Consequence
        </button>
      )}
    </ElementWrapper>
  )
}

export default ConsequencesElement