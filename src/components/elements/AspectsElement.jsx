import ElementWrapper from './ElementWrapper'
import Icon from '../icons/Icon'

const FIXED_MODIFIER_VALUE = 2

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
function AspectsElement({
  element,
  isLocked,
  onUpdate,
  onDelete,
  showDragHandle,
  dragHandleProps,
  onToggleRollModifier,
  isRollModifierActive,
  cardId
}) {
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
  const canToggleModifiers = typeof onToggleRollModifier === 'function' && typeof isRollModifierActive === 'function'
  const safeCardId = cardId || 'card'
  const safeElementId = element?.id || 'aspects'

  const getAspectModifier = (item, index) => {
    const label = typeof item === 'string' ? item.trim() : ''
    if (!label) return null

    return {
      id: `aspect:${safeCardId}:${safeElementId}:${index}`,
      label,
      value: FIXED_MODIFIER_VALUE,
      source: 'aspects',
      cardId: safeCardId,
      elementId: safeElementId,
      itemIndex: index
    }
  }

  return (
    <ElementWrapper 
      title="Aspects" 
      isLocked={isLocked} 
      onDelete={onDelete}
      showDragHandle={showDragHandle}
      dragHandleProps={dragHandleProps}
    >
      {items.map((item, index) => {
        const modifier = getAspectModifier(item, index)
        const isActive = modifier ? isRollModifierActive?.(modifier.id) : false

        if (isLocked) {
          return (
            <div key={index} className="aspect-item">
              <Icon name="aspectBullet" className="aspect-bullet" size={12} aria-hidden="true" />
              {canToggleModifiers && modifier ? (
                <button
                  type="button"
                  className={`aspect-modifier-chip ${isActive ? 'is-active' : ''}`}
                  onClick={() => onToggleRollModifier(modifier)}
                  aria-pressed={Boolean(isActive)}
                >
                  {item}
                </button>
              ) : (
                <span className="aspect-locked-text">{item || '---'}</span>
              )}
            </div>
          )
        }

        return (
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
            {canToggleModifiers && (
              <button
                type="button"
                className={`aspect-modifier-toggle ${isActive ? 'is-active' : ''}`}
                onClick={() => {
                  if (modifier) {
                    onToggleRollModifier(modifier)
                  }
                }}
                disabled={!modifier}
                aria-pressed={Boolean(isActive)}
                aria-label={modifier ? `Toggle ${modifier.label} modifier` : 'Modifier unavailable until aspect is filled'}
                title={modifier ? `Toggle ${modifier.label} +${FIXED_MODIFIER_VALUE}` : 'Enter an aspect to enable modifier'}
              >
                +{FIXED_MODIFIER_VALUE}
              </button>
            )}
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
        )
      })}
      {!isLocked && (
        <button onClick={handleAddItem} className="add-item-btn">
          + Add Aspect
        </button>
      )}
    </ElementWrapper>
  )
}

export default AspectsElement
