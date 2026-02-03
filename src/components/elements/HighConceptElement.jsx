import ElementWrapper from './ElementWrapper'

/**
 * High Concept element renderer
 * Single text field for character's core concept
 * 
 * @param {Object} props
 * @param {Object} props.element - Element data {id, type, text}
 * @param {boolean} props.isLocked - Whether card is locked
 * @param {Function} props.onUpdate - Called with updates object
 * @param {Function} props.onDelete - Called to delete element
 * @param {boolean} props.showDragHandle - Whether to show drag handle
 * @param {Object} props.dragHandleProps - Props applied to drag handle button
 */
function HighConceptElement({ element, isLocked, onUpdate, onDelete, showDragHandle, dragHandleProps }) {
  const handleTextChange = (e) => {
    onUpdate({ text: e.target.value })
  }

  return (
    <ElementWrapper 
      title="High Concept" 
      isLocked={isLocked} 
      onDelete={onDelete}
      showDragHandle={showDragHandle}
      dragHandleProps={dragHandleProps}
    >
      <input
        type="text"
        value={element.text || ''}
        onChange={handleTextChange}
        placeholder="Enter high concept..."
        className="element-input"
        disabled={isLocked}
      />
    </ElementWrapper>
  )
}

export default HighConceptElement
