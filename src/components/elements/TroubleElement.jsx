import ElementWrapper from './ElementWrapper'

/**
 * Trouble element renderer
 * Single text field for character's trouble aspect
 * 
 * @param {Object} props
 * @param {Object} props.element - Element data {id, type, text}
 * @param {boolean} props.isLocked - Whether card is locked
 * @param {Function} props.onUpdate - Called with updates object
 * @param {Function} props.onDelete - Called to delete element
 */
function TroubleElement({ element, isLocked, onUpdate, onDelete }) {
  const handleTextChange = (e) => {
    onUpdate({ text: e.target.value })
  }

  return (
    <ElementWrapper 
      title="Trouble" 
      isLocked={isLocked} 
      onDelete={onDelete}
    >
      <input
        type="text"
        value={element.text || ''}
        onChange={handleTextChange}
        placeholder="Enter trouble..."
        className="element-input"
        disabled={isLocked}
      />
    </ElementWrapper>
  )
}

export default TroubleElement