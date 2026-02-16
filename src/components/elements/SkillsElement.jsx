import ElementWrapper from './ElementWrapper'
import Icon from '../icons/Icon'

const CUSTOM_SKILL_VALUE = '__custom__'
const CUSTOM_SKILL_LABEL = 'Custom...'
const CUSTOM_SKILL_DEFAULT_NAME = 'Custom Skill'

const formatSignedValue = (value) => {
  return value > 0 ? `+${value}` : `${value}`
}

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
function SkillsElement({
  element,
  skills = [],
  skillLevels = [],
  isLocked,
  onUpdate,
  onDelete,
  showDragHandle,
  dragHandleProps,
  onToggleRollModifier,
  isRollModifierActive,
  cardId
}) {
  // Defensive: ensure items is an array
  const items = element.items || []
  const canToggleModifiers = typeof onToggleRollModifier === 'function' && typeof isRollModifierActive === 'function'
  const safeCardId = cardId || 'card'
  const safeElementId = element?.id || 'skills'

  const getSkillModifier = (skill, index) => {
    const rawName = typeof skill?.name === 'string' ? skill.name.trim() : ''
    if (!rawName) return null
    const numericRating = Number(skill?.rating)
    const modifierValue = Number.isFinite(numericRating) ? numericRating : 0

    return {
      id: `skill:${safeCardId}:${safeElementId}:${index}`,
      label: rawName,
      value: modifierValue,
      source: 'skills',
      cardId: safeCardId,
      elementId: safeElementId,
      itemIndex: index
    }
  }

  const itemsWithIndex = items.map((skill, index) => ({
    skill,
    index
  }))
  
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
  const existingRatings = [...new Set(itemsWithIndex.map(({ skill }) => skill.rating || 0))].sort((a, b) => b - a)
  const existingLevels = existingRatings
    .map(rating => allSkillLevels.find(level => level.value === rating))
    .filter(Boolean)

  // Group skills by rating
  const skillsByRating = {}
  existingRatings.forEach(rating => {
    skillsByRating[rating] = itemsWithIndex.filter(({ skill }) => skill.rating === rating)
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
                <span className="skill-level-rating">{level.ratingLabel}</span>
              </div>
              <div className="skill-level-list">
                {!canToggleModifiers
                  ? levelSkills.map(({ skill }) => skill.name || '---').join(', ')
                  : levelSkills.map(({ skill, index }) => {
                    const modifier = getSkillModifier(skill, index)
                    const skillName = skill.name || '---'
                    if (!modifier) {
                      return (
                        <span key={`empty-${safeElementId}-${index}`} className="skill-modifier-chip is-empty">
                          {skillName}
                        </span>
                      )
                    }

                    const isActive = isRollModifierActive(modifier.id)
                    return (
                      <button
                        key={modifier.id}
                        type="button"
                        className={`skill-modifier-chip ${isActive ? 'is-active' : ''}`}
                        onClick={() => onToggleRollModifier(modifier)}
                        aria-pressed={isActive}
                      >
                        {skillName}
                      </button>
                    )
                  })}
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
            {levelSkills.map(({ skill, index: globalIndex }, skillIndex) => {
              const skillOptions = skills || []
              const isCustomSkill = Boolean(skill.isCustom) || (Boolean(skill.name) && !skillOptions.includes(skill.name))
              const selectValue = isCustomSkill ? CUSTOM_SKILL_VALUE : (skill.name || '')
              const customInputValue = skill.name || ''
              const modifier = getSkillModifier(skill, globalIndex)
              const isModifierActive = modifier ? isRollModifierActive?.(modifier.id) : false
              const modifierValueLabel = modifier ? formatSignedValue(modifier.value) : ''
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
                  {canToggleModifiers && (
                    <button
                      type="button"
                      className={`skill-modifier-toggle ${isModifierActive ? 'is-active' : ''}`}
                      onClick={() => {
                        if (modifier) {
                          onToggleRollModifier(modifier)
                        }
                      }}
                      disabled={!modifier}
                      aria-pressed={Boolean(isModifierActive)}
                      aria-label={modifier ? `Toggle ${modifier.label} modifier` : 'Modifier unavailable until skill is named'}
                      title={modifier ? `Toggle ${modifier.label} ${modifierValueLabel}` : 'Enter a skill name to enable modifier'}
                    >
                      {modifier ? modifierValueLabel : '+0'}
                    </button>
                  )}
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
