import { useState, useEffect } from 'react'

/**
 * Modal for managing the skills list
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Called when modal should close
 * @param {Array<string>} props.skills - Current skills list
 * @param {Function} props.onAddSkill - Called with skill name to add
 * @param {Function} props.onDeleteSkill - Called with skill name to delete
 */
function SkillsAdminModal({ 
  isOpen, 
  onClose, 
  skills = [], 
  onAddSkill, 
  onDeleteSkill 
}) {
  const [newSkillName, setNewSkillName] = useState('')

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setNewSkillName('')
    }
  }, [isOpen])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleAdd = () => {
    const trimmed = newSkillName.trim()
    if (!trimmed) return

    const result = onAddSkill(trimmed)
    if (result !== false) {
      setNewSkillName('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAdd()
    }
  }

  const handleDelete = (skillName) => {
    if (window.confirm(`Are you sure you want to delete the skill "${skillName}"?`)) {
      onDeleteSkill(skillName)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Manage Skills</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="skills-admin-body">
          <p className="skills-admin-description">
            These skills are available for all characters. Add custom skills for your game setting.
          </p>
          <div className="skills-list">
            {skills.length > 0 ? (
              skills.map(skill => (
                <div key={skill} className="skill-list-item">
                  <span>{skill}</span>
                  <button
                    onClick={() => handleDelete(skill)}
                    className="skill-list-delete"
                    title="Delete skill"
                    aria-label={`Delete skill ${skill}`}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                No skills added yet
              </p>
            )}
          </div>
          <div className="add-skill-section">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter new skill name..."
              className="skill-input"
            />
            <button 
              onClick={handleAdd} 
              className="add-skill-btn"
              disabled={!newSkillName.trim()}
            >
              Add Skill
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkillsAdminModal