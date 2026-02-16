import ElementWrapper from './ElementWrapper'

const FIXED_MODIFIER_VALUE = 2

/**
 * Trouble element renderer
 * Single text field for character's trouble aspect
 * 
 * @param {Object} props
 * @param {Object} props.element - Element data {id, type, text}
 * @param {boolean} props.isLocked - Whether card is locked
 * @param {Function} props.onUpdate - Called with updates object
 * @param {Function} props.onDelete - Called to delete element
 * @param {boolean} props.showDragHandle - Whether to show drag handle
 * @param {Object} props.dragHandleProps - Props applied to drag handle button
 */
function TroubleElement({
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
  const handleTextChange = (e) => {
    onUpdate({ text: e.target.value })
  }

  const textValue = element.text || ''
  const canToggleModifiers = typeof onToggleRollModifier === 'function' && typeof isRollModifierActive === 'function'
  const safeCardId = cardId || 'card'
  const safeElementId = element?.id || 'trouble'
  const normalizedLabel = typeof textValue === 'string' ? textValue.trim() : ''
  const modifier = normalizedLabel
    ? {
      id: `trouble:${safeCardId}:${safeElementId}`,
      label: normalizedLabel,
      value: FIXED_MODIFIER_VALUE,
      source: 'trouble',
      cardId: safeCardId,
      elementId: safeElementId
    }
    : null
  const isModifierActive = modifier ? isRollModifierActive?.(modifier.id) : false

  return (
    <ElementWrapper 
      title="Trouble" 
      isLocked={isLocked} 
      onDelete={onDelete}
      showDragHandle={showDragHandle}
      dragHandleProps={dragHandleProps}
    >
      {isLocked ? (
        canToggleModifiers && modifier ? (
          <button
            type="button"
            className={`single-modifier-chip ${isModifierActive ? 'is-active' : ''}`}
            onClick={() => onToggleRollModifier(modifier)}
            aria-pressed={Boolean(isModifierActive)}
          >
            {textValue}
          </button>
        ) : (
          <div className="single-modifier-text">{textValue || '---'}</div>
        )
      ) : (
        <div className="single-modifier-row">
          <input
            type="text"
            value={textValue}
            onChange={handleTextChange}
            placeholder="Enter trouble..."
            className="element-input"
            disabled={isLocked}
          />
          {canToggleModifiers && (
            <button
              type="button"
              className={`single-modifier-toggle ${isModifierActive ? 'is-active' : ''}`}
              onClick={() => {
                if (modifier) {
                  onToggleRollModifier(modifier)
                }
              }}
              disabled={!modifier}
              aria-pressed={Boolean(isModifierActive)}
              aria-label={modifier ? `Toggle ${modifier.label} modifier` : 'Modifier unavailable until trouble is filled'}
              title={modifier ? `Toggle ${modifier.label} +${FIXED_MODIFIER_VALUE}` : 'Enter a trouble to enable modifier'}
            >
              +{FIXED_MODIFIER_VALUE}
            </button>
          )}
        </div>
      )}
    </ElementWrapper>
  )
}

export default TroubleElement
