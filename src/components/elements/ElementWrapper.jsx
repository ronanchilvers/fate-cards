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
 */
function ElementWrapper({ 
  title, 
  children, 
  isLocked, 
  onDelete,
  headerExtra = null,
  className = ''
}) {
  return (
    <div className={`card-element ${isLocked ? 'locked' : ''} ${className}`.trim()}>
      <div className="element-header">
        <h4>{title}</h4>
        {headerExtra}
        {!isLocked && onDelete && (
          <button 
            onClick={onDelete}
            className="element-delete-btn"
            aria-label={`Delete ${title}`}
          >
            ×
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

export default ElementWrapper