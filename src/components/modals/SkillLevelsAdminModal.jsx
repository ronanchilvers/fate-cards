import { useState, useEffect } from 'react'

/**
 * Modal for managing skill levels (the Fate ladder)
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Called when modal should close
 * @param {Array} props.skillLevels - Current skill levels [{label, value}, ...]
 * @param {Function} props.onAddLevelAtTop - Called with label to add at top
 * @param {Function} props.onAddLevelAtBottom - Called with label to add at bottom
 * @param {Function} props.onDeleteLevel - Called with value to delete
 * @param {Function} props.onUpdateLabel - Called with (value, newLabel) to update
 */
function SkillLevelsAdminModal({ 
  isOpen, 
  onClose, 
  skillLevels = [],
  onAddLevelAtTop,
  onAddLevelAtBottom,
  onDeleteLevel,
  onUpdateLabel
}) {
  const [newLevelName, setNewLevelName] = useState('')

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setNewLevelName('')
    }
  }, [isOpen])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleAddTop = () => {
    const trimmed = newLevelName.trim()
    if (!trimmed) return

    const result = onAddLevelAtTop(trimmed)
    if (result !== false) {
      setNewLevelName('')
    }
  }

  const handleAddBottom = () => {
    const trimmed = newLevelName.trim()
    if (!trimmed) return

    const result = onAddLevelAtBottom(trimmed)
    if (result !== false) {
      setNewLevelName('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddTop()
    }
  }

  const handleDelete = (level) => {
    if (window.confirm(`Are you sure you want to delete the skill level "${level.label}"?`)) {
      onDeleteLevel(level.value)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Manage Skill Levels</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="skills-admin-body">
          <p className="skills-admin-description">
            These skill levels (the ladder) are used throughout your game. The numbers are automatically assigned.
          </p>
          <div className="skills-list">
            {skillLevels.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                No skill levels added yet
              </p>
            ) : (
              skillLevels.map(level => (
                <div key={level.value} className="skill-level-admin-item">
                  <span className="skill-level-value">
                    {level.value >= 0 ? '+' : ''}{level.value}
                  </span>
                  <input
                    type="text"
                    value={level.label}
                    onChange={(e) => onUpdateLabel(level.value, e.target.value)}
                    className="skill-level-label-edit"
                  />
                  <button
                    onClick={() => handleDelete(level)}
                    className="skill-list-delete"
                    title="Delete skill level"
                    aria-label={`Delete skill level ${level.label}`}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="add-skill-section">
            <input
              type="text"
              value={newLevelName}
              onChange={(e) => setNewLevelName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter new skill level name..."
              className="skill-input"
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={handleAddTop} 
                className="add-skill-btn"
                disabled={!newLevelName.trim()}
              >
                Add to Top
              </button>
              <button 
                onClick={handleAddBottom} 
                className="add-skill-btn"
                disabled={!newLevelName.trim()}
              >
                Add to Bottom
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkillLevelsAdminModal