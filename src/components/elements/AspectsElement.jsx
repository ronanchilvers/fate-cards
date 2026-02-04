import ElementWrapper from './ElementWrapper'
import Icon from '../icons/Icon'

/**
 * Aspects element renderer
 * Dynamic list of aspect text fields
 * 
 * @param {Object} props
 * @param {Object} props.element - Element data {id, type, items: string[]}
 * @param {boolean} props.isLocked - Whether card is locked
 * @param {Function} props.onUpdate - Called with updates object
 * @param {Function} props.onDelete - Called to delete element
 * @param {boolean} props.showDragHandle - Whether to show drag handle
 * @param {Object} props.dragHandleProps - Props applied to drag handle button
 */
function AspectsElement({ element, isLocked, onUpdate, onDelete, showDragHandle, dragHandleProps }) {
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
      showDragHandle={showDragHandle}
      dragHandleProps={dragHandleProps}
    >
      {items.map((item, index) => (
        <div key={index} className="aspect-item">
          <Icon name="aspectBullet" className="aspect-bullet" size={12} aria-hidden="true" />
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
              <Icon name="delete" size={14} aria-hidden="true" />
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
