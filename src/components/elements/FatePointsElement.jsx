import ElementWrapper from './ElementWrapper'

/**
 * Fate Points element renderer
 * Visual fate point tracker with refresh value
 * 
 * @param {Object} props
 * @param {Object} props.element - Element data {id, type, current, refresh}
 * @param {boolean} props.isLocked - Whether card is locked
 * @param {Function} props.onUpdate - Called with updates object
 * @param {Function} props.onDelete - Called to delete element
 * @param {boolean} props.showDragHandle - Whether to show drag handle
 * @param {Object} props.dragHandleProps - Props applied to drag handle button
 */
function FatePointsElement({ element, isLocked, onUpdate, onDelete, showDragHandle, dragHandleProps }) {
  const handleDecrement = () => {
    onUpdate({ current: Math.max(0, element.current - 1) })
  }

  const handleIncrement = () => {
    onUpdate({ current: element.current + 1 })
  }

  const handleRefreshChange = (e) => {
    const value = Math.max(0, Math.min(10, parseInt(e.target.value) || 0))
    onUpdate({ refresh: value })
  }

  // Render fate point tokens
  const renderTokens = () => {
    const tokens = []
    const current = element.current || 0
    const refresh = element.refresh || 3
    const filled = Math.min(current, refresh)
    const empty = Math.max(0, refresh - current)
    const extra = Math.max(0, current - refresh)

    // Filled tokens up to refresh
    for (let i = 0; i < filled; i++) {
      tokens.push(
        <div 
          key={`filled-${i}`}
          className="fate-point filled"
          onClick={isLocked ? handleDecrement : undefined}
          style={isLocked ? { cursor: 'pointer' } : undefined}
        >
          ●
        </div>
      )
    }

    // Empty tokens up to refresh
    for (let i = 0; i < empty; i++) {
      tokens.push(
        <div key={`empty-${i}`} className="fate-point empty">○</div>
      )
    }

    // Extra tokens beyond refresh
    for (let i = 0; i < extra; i++) {
      tokens.push(
        <div 
          key={`extra-${i}`}
          className="fate-point filled"
          onClick={isLocked ? handleDecrement : undefined}
          style={isLocked ? { cursor: 'pointer' } : undefined}
        >
          ●
        </div>
      )
    }

    return tokens
  }

  const headerExtra = isLocked ? (
    <span className="refresh-label">Refresh {element.refresh || 3}</span>
  ) : null

  return (
    <ElementWrapper 
      title="Fate Points" 
      isLocked={isLocked} 
      onDelete={onDelete}
      headerExtra={headerExtra}
      showDragHandle={showDragHandle}
      dragHandleProps={dragHandleProps}
    >
      <div className="fate-points">
        {renderTokens()}
      </div>
      {!isLocked && (
        <div className="fate-points-controls">
          <button onClick={handleDecrement}>-</button>
          <span>{element.current || 0} / </span>
          <input
            type="number"
            min="0"
            max="10"
            value={element.refresh || 3}
            onChange={handleRefreshChange}
            className="refresh-input"
          />
          <button onClick={handleIncrement}>+</button>
        </div>
      )}
    </ElementWrapper>
  )
}

export default FatePointsElement
