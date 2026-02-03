import ElementWrapper from './ElementWrapper'

/**
 * Note element renderer
 * Multi-line text area for notes
 * 
 * @param {Object} props
 * @param {Object} props.element - Element data {id, type, text}
 * @param {boolean} props.isLocked - Whether card is locked
 * @param {Function} props.onUpdate - Called with updates object
 * @param {Function} props.onDelete - Called to delete element
 * @param {boolean} props.showDragHandle - Whether to show drag handle
 * @param {Object} props.dragHandleProps - Props applied to drag handle button
 */
function NoteElement({ element, isLocked, onUpdate, onDelete, showDragHandle, dragHandleProps }) {
  const handleTextChange = (e) => {
    onUpdate({ text: e.target.value })
  }

  return (
    <ElementWrapper 
      title="Note" 
      isLocked={isLocked} 
      onDelete={onDelete}
      showDragHandle={showDragHandle}
      dragHandleProps={dragHandleProps}
    >
      <textarea
        value={element.text || ''}
        onChange={handleTextChange}
        placeholder="Enter notes..."
        className="element-textarea"
        rows="4"
        disabled={isLocked}
      />
    </ElementWrapper>
  )
}

export default NoteElement
