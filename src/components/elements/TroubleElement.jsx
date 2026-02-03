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
 * @param {boolean} props.showDragHandle - Whether to show drag handle
 * @param {Object} props.dragHandleProps - Props applied to drag handle button
 */
function TroubleElement({ element, isLocked, onUpdate, onDelete, showDragHandle, dragHandleProps }) {
  const handleTextChange = (e) => {
    onUpdate({ text: e.target.value })
  }

  return (
    <ElementWrapper 
      title="Trouble" 
      isLocked={isLocked} 
      onDelete={onDelete}
      showDragHandle={showDragHandle}
      dragHandleProps={dragHandleProps}
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
