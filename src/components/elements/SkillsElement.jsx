import ElementWrapper from './ElementWrapper'
import Icon from '../icons/Icon'

const CUSTOM_SKILL_VALUE = '__custom__'
const CUSTOM_SKILL_LABEL = 'Custom...'
const CUSTOM_SKILL_DEFAULT_NAME = 'Custom Skill'

/**
 * Skills element renderer
 * Complex element managing skills by Fate skill ladder levels
 * 
 * @param {Object} props
 * @param {Object} props.element - Element data {id, type, items: Array<{name, rating}>}
 * @param {Array<string>} props.skills - Available skill names
 * @param {Array<Object>} props.skillLevels - Skill ladder levels [{value, label}, ...]
 * @param {boolean} props.isLocked - Whether card is locked
 * @param {Function} props.onUpdate - Called with updates object
 * @param {Function} props.onDelete - Called to delete element
 * @param {boolean} props.showDragHandle - Whether to show drag handle
 * @param {Object} props.dragHandleProps - Props applied to drag handle button
 */
function SkillsElement({ element, skills = [], skillLevels = [], isLocked, onUpdate, onDelete, showDragHandle, dragHandleProps, onRollDice }) {
  // Defensive: ensure items is an array
  const items = element.items || []
  
  // Build formatted skill levels
  const allSkillLevels = (skillLevels || []).map(level => {
    const ratingLabel = `${level.value >= 0 ? '+' : ''}${level.value}`
    return {
      value: level.value,
      label: level.label,
      ratingLabel,
      displayLabel: `${level.label} (${ratingLabel})`
    }
  })

  // Get unique rating levels that exist in items
  const existingRatings = [...new Set(items.map(skill => skill.rating || 0))].sort((a, b) => b - a)
  const existingLevels = existingRatings
    .map(rating => allSkillLevels.find(level => level.value === rating))
    .filter(Boolean)

  // Group skills by rating
  const skillsByRating = {}
  existingRatings.forEach(rating => {
    skillsByRating[rating] = items.filter(skill => skill.rating === rating)
  })

  if (isLocked) {
    // Locked view: compact grouped display
    return (
      <ElementWrapper 
        title="Skills" 
        isLocked={isLocked} 
        onDelete={onDelete}
        showDragHandle={showDragHandle}
        dragHandleProps={dragHandleProps}
      >
        {existingLevels.map(level => {
          const levelSkills = skillsByRating[level.value] || []
          if (levelSkills.length === 0) return null
          
          return (
            <div key={level.value} className="skill-level-group">
              <div className="skill-level-heading">
                <Icon name="aspectBullet" className="aspect-bullet" size={12} aria-hidden="true" />
                <span className="skill-level-name">{level.label}</span>
                {onRollDice ? (
                  <button
                    className="skill-level-rating clickable"
                    onClick={() => onRollDice(level.value)}
                    title={`Roll dice with ${level.ratingLabel} skill bonus`}
                    aria-label={`Roll dice with ${level.displayLabel}`}
                  >
                    {level.ratingLabel}
                  </button>
                ) : (
                  <span className="skill-level-rating">{level.ratingLabel}</span>
                )}
              </div>
              <div className="skill-level-list">
                {levelSkills.map(skill => skill.name || '---').join(', ')}
              </div>
            </div>
          )
        })}
      </ElementWrapper>
    )
  }

  // Get available levels to add (not currently in use)
  const availableLevels = allSkillLevels.filter(level => 
    !existingRatings.includes(level.value)
  )

  // Unlocked view: organized by level sections
  return (
    <ElementWrapper 
      title="Skills" 
      isLocked={isLocked} 
      onDelete={onDelete}
      showDragHandle={showDragHandle}
      dragHandleProps={dragHandleProps}
    >
      {existingLevels.map(level => {
        const levelSkills = skillsByRating[level.value] || []
        
        return (
          <div key={level.value} className="skill-level-section">
            <div className="skill-level-header">
              <h5>{level.displayLabel}</h5>
              <button
                onClick={() => {
                  // Remove all skills at this level
                  const newItems = items.filter(skill => skill.rating !== level.value)
                  onUpdate({ items: newItems })
                }}
                className="remove-level-btn"
                title="Remove this level"
                aria-label={`Remove ${level.displayLabel}`}
              >
                <Icon name="delete" size={14} aria-hidden="true" />
              </button>
            </div>
            {levelSkills.map((skill, skillIndex) => {
              const globalIndex = items.findIndex(s => s === skill)
              const skillOptions = skills || []
              const isCustomSkill = Boolean(skill.isCustom) || (Boolean(skill.name) && !skillOptions.includes(skill.name))
              const selectValue = isCustomSkill ? CUSTOM_SKILL_VALUE : (skill.name || '')
              const customInputValue = skill.name || ''
              return (
                <div key={skillIndex} className="skill-item">
                  <div className="skill-name-field">
                    <select
                      value={selectValue}
                      onChange={(e) => {
                        const value = e.target.value
                        const newItems = [...items]
                        if (!newItems[globalIndex]) return
                        if (value === CUSTOM_SKILL_VALUE) {
                          const customName = isCustomSkill && skill.name ? skill.name : CUSTOM_SKILL_DEFAULT_NAME
                          newItems[globalIndex] = { ...newItems[globalIndex], name: customName, isCustom: true }
                          onUpdate({ items: newItems })
                          return
                        }
                        newItems[globalIndex] = { ...newItems[globalIndex], name: value, isCustom: false }
                        onUpdate({ items: newItems })
                      }}
                      className="skill-name-select"
                    >
                      <option value="">Select skill...</option>
                      {skillOptions.map(skillName => (
                        <option key={skillName} value={skillName}>{skillName}</option>
                      ))}
                      <option value={CUSTOM_SKILL_VALUE}>{CUSTOM_SKILL_LABEL}</option>
                    </select>
                    {selectValue === CUSTOM_SKILL_VALUE && (
                      <input
                        type="text"
                        value={customInputValue}
                        onChange={(e) => {
                          const value = e.target.value
                          const newItems = [...items]
                          if (newItems[globalIndex]) {
                            newItems[globalIndex] = { ...newItems[globalIndex], name: value, isCustom: true }
                            onUpdate({ items: newItems })
                          }
                        }}
                        className="skill-name-select skill-name-custom"
                        placeholder="Custom skill"
                        aria-label="Custom skill name"
                      />
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const newItems = items.filter((_, i) => i !== globalIndex)
                      onUpdate({ items: newItems })
                    }}
                    className="skill-delete-btn"
                    aria-label="Remove skill"
                  >
                    <Icon name="delete" size={14} aria-hidden="true" />
                  </button>
                </div>
              )
            })}
            <button 
              onClick={() => onUpdate({ 
                items: [...items, { name: '', rating: level.value }] 
              })}
              className="add-skill-to-level-btn"
            >
              + Add Skill
            </button>
          </div>
        )
      })}
      {availableLevels.length > 0 && (
        <div className="add-level-section">
          <select
            onChange={(e) => {
              const rating = parseInt(e.target.value)
              if (!isNaN(rating)) {
                // Add a level by adding an empty skill at that rating
                onUpdate({ 
                  items: [...items, { name: '', rating }] 
                })
                e.target.value = '' // Reset dropdown
              }
            }}
            className="add-level-select"
            defaultValue=""
          >
            <option value="" disabled>+ Add Level</option>
            {availableLevels.map(level => (
              <option key={level.value} value={level.value}>{level.displayLabel}</option>
            ))}
          </select>
        </div>
      )}
    </ElementWrapper>
  )
}

export default SkillsElement
