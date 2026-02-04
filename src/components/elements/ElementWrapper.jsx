import Icon from '../icons/Icon'

/**
 * ElementWrapper - Base component providing common element structure
 * Includes header with title and delete button
 * 
 * @param {Object} props
 * @param {string} props.title - Element title (e.g., "High Concept")
 * @param {React.ReactNode} props.children - Element content
 * @param {boolean} props.isLocked - Whether card is locked
 * @param {Function} props.onDelete - Called when delete button clicked
 * @param {React.ReactNode} props.headerExtra - Extra content for header (optional)
 * @param {string} props.className - Additional CSS classes (optional)
 * @param {boolean} props.showDragHandle - Whether to show drag handle (optional)
 * @param {Object} props.dragHandleProps - Props applied to drag handle button (optional)
 */
function ElementWrapper({ 
  title, 
  children, 
  isLocked, 
  onDelete,
  headerExtra = null,
  className = '',
  showDragHandle = false,
  dragHandleProps = {}
}) {
  const resolvedDragHandleProps = {
    'data-drag-handle': true,
    type: 'button',
    ...dragHandleProps
  }

  return (
    <div className={`card-element ${isLocked ? 'locked' : ''} ${className}`.trim()}>
      <div className="element-header">
        <div className="element-header-left">
          {showDragHandle && (
            <button
              className="element-drag-handle"
              aria-label={`Drag ${title}`}
              title="Drag to reorder"
              {...resolvedDragHandleProps}
            >
              <Icon name="dragHandle" className="element-drag-handle-icon" size={14} aria-hidden="true" />
            </button>
          )}
          <h4>{title}</h4>
        </div>
        <div className="element-header-actions">
          {headerExtra}
          {!isLocked && onDelete && (
            <button 
              onClick={onDelete}
              className="element-delete-btn"
              aria-label={`Delete ${title}`}
            >
              <Icon name="delete" size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

export default ElementWrapper
