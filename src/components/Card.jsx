import { useState, useEffect } from 'react'
import './Card.css'

function Card({ card, onUpdate, onDelete, onDuplicate, skills, skillLevels, categories }) {
  const [showElementMenu, setShowElementMenu] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isLocked, setIsLocked] = useState(card.locked || false)
  
  // Sync locked state when card prop changes
  useEffect(() => {
    setIsLocked(card.locked || false)
  }, [card.locked])
  
  // Settings form state
  const [settingsTitle, setSettingsTitle] = useState(card.title)
  const [settingsSubtitle, setSettingsSubtitle] = useState(card.subtitle)
  const [settingsColor, setSettingsColor] = useState(card.color)
  const [settingsCategory, setSettingsCategory] = useState(card.category)
  const [settingsLayout, setSettingsLayout] = useState(card.layout || 'auto')

  const updateCard = (updates) => {
    onUpdate(card.id, { ...card, ...updates })
  }

  // Color palette for card settings
  const colorPalette = [
    '#c53030', '#9c1c8f', '#5b21b6', '#3730a3', '#1e40af', '#1e3a8a', 
    '#0369a1', '#0e7490', '#115e59', '#166534', '#15803d', '#4d7c0f',
    '#ca8a04', '#ea580c', '#f97316', '#dc2626', '#991b1b', '#451a03',
    '#1f2937', '#374151'
  ]

  // Convert hex color to pale background color
  const getPaleBackground = (hexColor) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)
    
    // Mix with white (90% white, 10% original color) for a very pale shade
    const paleR = Math.round(r * 0.1 + 255 * 0.9)
    const paleG = Math.round(g * 0.1 + 255 * 0.9)
    const paleB = Math.round(b * 0.1 + 255 * 0.9)
    
    return `rgb(${paleR}, ${paleG}, ${paleB})`
  }

  // Get mid-tone color between title bar and card background (50/50 mix)
  const getMidToneBackground = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)
    
    // Mix with white (50% white, 50% original color) for mid-tone
    const midR = Math.round(r * 0.5 + 255 * 0.5)
    const midG = Math.round(g * 0.5 + 255 * 0.5)
    const midB = Math.round(b * 0.5 + 255 * 0.5)
    
    return `rgb(${midR}, ${midG}, ${midB})`
  }

  const toggleLock = () => {
    const newLockedState = !isLocked
    setIsLocked(newLockedState)
    updateCard({ locked: newLockedState })
  }

  const openSettings = () => {
    setSettingsTitle(card.title)
    setSettingsSubtitle(card.subtitle)
    setSettingsColor(card.color)
    setSettingsCategory(card.category)
    setSettingsLayout(card.layout || 'auto')
    setShowSettings(true)
  }

  const saveSettings = () => {
    updateCard({
      title: settingsTitle,
      subtitle: settingsSubtitle,
      color: settingsColor,
      category: settingsCategory,
      layout: settingsLayout
    })
    setShowSettings(false)
  }

  const addElement = (elementType) => {
    const newElement = createNewElement(elementType)
    updateCard({
      elements: [...card.elements, newElement]
    })
    setShowElementMenu(false)
  }

  const createNewElement = (type) => {
    const id = crypto.randomUUID()
    const elements = {
      'high-concept': {
        id,
        type: 'high-concept',
        text: ''
      },
      'trouble': {
        id,
        type: 'trouble',
        text: ''
      },
      'aspects': {
        id,
        type: 'aspects',
        items: ['', '', '']
      },
      'skills': {
        id,
        type: 'skills',
        items: []
      },
      'stress-tracks': {
        id,
        type: 'stress-tracks',
        tracks: [
          { name: 'Physical Stress', boxes: [
            { checked: false, value: 1 },
            { checked: false, value: 2 },
            { checked: false, value: 3 },
            { checked: false, value: 4 }
          ]},
          { name: 'Mental Stress', boxes: [
            { checked: false, value: 1 },
            { checked: false, value: 2 },
            { checked: false, value: 3 },
            { checked: false, value: 4 }
          ]}
        ]
      },
      'consequences': {
        id,
        type: 'consequences',
        items: [
          { label: 'Mild (2)', text: '---' },
          { label: 'Moderate (4)', text: '---' },
          { label: 'Severe (6)', text: '---' }
        ]
      },
      'note': {
        id,
        type: 'note',
        text: ''
      },
      'fate-points': {
        id,
        type: 'fate-points',
        current: 3,
        refresh: 3
      },
      'game-tools': {
        id,
        type: 'game-tools',
        dice: []
      }
    }
    return elements[type] || elements['note']
  }

  const updateElement = (elementId, updates) => {
    const newElements = card.elements.map(el =>
      el.id === elementId ? { ...el, ...updates } : el
    )
    updateCard({ elements: newElements })
  }

  const deleteElement = (elementId) => {
    updateCard({
      elements: card.elements.filter(el => el.id !== elementId)
    })
  }

  const renderElement = (element) => {
    switch (element.type) {
      case 'high-concept':
        return (
          <div key={element.id} className={`card-element ${isLocked ? 'locked' : ''}`}>
            <div className="element-header">
              <h4>High Concept</h4>
              {!isLocked && (
                <button 
                  onClick={() => deleteElement(element.id)}
                  className="element-delete-btn"
                >
                  ×
                </button>
              )}
            </div>
            <input
              type="text"
              value={element.text}
              onChange={(e) => updateElement(element.id, { text: e.target.value })}
              placeholder="Enter high concept..."
              className="element-input"
              disabled={isLocked}
            />
          </div>
        )

      case 'trouble':
        return (
          <div key={element.id} className={`card-element ${isLocked ? 'locked' : ''}`}>
            <div className="element-header">
              <h4>Trouble</h4>
              {!isLocked && (
                <button 
                  onClick={() => deleteElement(element.id)}
                  className="element-delete-btn"
                >
                  ×
                </button>
              )}
            </div>
            <input
              type="text"
              value={element.text}
              onChange={(e) => updateElement(element.id, { text: e.target.value })}
              placeholder="Enter trouble..."
              className="element-input"
              disabled={isLocked}
            />
          </div>
        )

      case 'aspects':
        return (
          <div key={element.id} className={`card-element ${isLocked ? 'locked' : ''}`}>
            <div className="element-header">
              <h4>Aspects</h4>
              {!isLocked && (
                <button 
                  onClick={() => deleteElement(element.id)}
                  className="element-delete-btn"
                >
                  ×
                </button>
              )}
            </div>
            {element.items.map((item, index) => (
              <div key={index} className="aspect-item">
                <span className="aspect-bullet">📋</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...element.items]
                    newItems[index] = e.target.value
                    updateElement(element.id, { items: newItems })
                  }}
                  placeholder="---"
                  className="element-input"
                  disabled={isLocked}
                />
                {!isLocked && (
                  <button
                    onClick={() => {
                      const newItems = element.items.filter((_, i) => i !== index)
                      updateElement(element.id, { items: newItems })
                    }}
                    className="aspect-delete-btn"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {!isLocked && (
              <button 
                onClick={() => updateElement(element.id, { items: [...element.items, ''] })}
                className="add-item-btn"
              >
                + Add Aspect
              </button>
            )}
          </div>
        )

      case 'skills':
        // Use centralized skill levels with formatted labels
        const allSkillLevels = skillLevels.map(level => ({
          value: level.value,
          label: `${level.label} (${level.value >= 0 ? '+' : ''}${level.value})`
        }))

        // Get unique rating levels that exist in items
        const existingRatings = [...new Set(element.items.map(skill => skill.rating))].sort((a, b) => b - a)
        const existingLevels = existingRatings.map(rating => 
          allSkillLevels.find(level => level.value === rating)
        ).filter(Boolean)

        // Group skills by rating
        const skillsByRating = {}
        existingRatings.forEach(rating => {
          skillsByRating[rating] = element.items.filter(skill => skill.rating === rating)
        })

        if (isLocked) {
          // Locked view: compact grouped display
          return (
            <div key={element.id} className={`card-element locked`}>
              <div className="element-header">
                <h4>Skills</h4>
              </div>
              {existingLevels.map(level => {
                const levelSkills = skillsByRating[level.value]
                if (levelSkills.length === 0) return null
                
                return (
                  <div key={level.value} className="skill-level-group">
                    <span className="skill-level-label">{level.label}:</span>
                    <span className="skill-level-list">
                      {levelSkills.map(skill => skill.name).join(', ')}
                    </span>
                  </div>
                )
              })}
            </div>
          )
        }

        // Get available levels to add (not currently in use)
        const availableLevels = allSkillLevels.filter(level => 
          !existingRatings.includes(level.value)
        )

        // Unlocked view: organized by level sections
        return (
          <div key={element.id} className={`card-element`}>
            <div className="element-header">
              <h4>Skills</h4>
              <button 
                onClick={() => deleteElement(element.id)}
                className="element-delete-btn"
              >
                ×
              </button>
            </div>
            {existingLevels.map(level => {
              const levelSkills = skillsByRating[level.value]
              
              return (
                <div key={level.value} className="skill-level-section">
                  <div className="skill-level-header">
                    <h5>{level.label}</h5>
                    <button
                      onClick={() => {
                        // Remove all skills at this level
                        const newItems = element.items.filter(skill => skill.rating !== level.value)
                        updateElement(element.id, { items: newItems })
                      }}
                      className="remove-level-btn"
                      title="Remove this level"
                    >
                      ×
                    </button>
                  </div>
                  {levelSkills.map((skill, skillIndex) => {
                    const globalIndex = element.items.findIndex(s => s === skill)
                    return (
                      <div key={skillIndex} className="skill-item">
                        <select
                          value={skill.name}
                          onChange={(e) => {
                            const newItems = [...element.items]
                            newItems[globalIndex].name = e.target.value
                            updateElement(element.id, { items: newItems })
                          }}
                          className="skill-name-select"
                        >
                          <option value="">Select skill...</option>
                          {skills.map(skillName => (
                            <option key={skillName} value={skillName}>{skillName}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            const newItems = element.items.filter((_, i) => i !== globalIndex)
                            updateElement(element.id, { items: newItems })
                          }}
                          className="skill-delete-btn"
                        >
                          ×
                        </button>
                      </div>
                    )
                  })}
                  <button 
                    onClick={() => updateElement(element.id, { 
                      items: [...element.items, { name: '', rating: level.value }] 
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
                      updateElement(element.id, { 
                        items: [...element.items, { name: '', rating }] 
                      })
                      e.target.value = '' // Reset dropdown
                    }
                  }}
                  className="add-level-select"
                  defaultValue=""
                >
                  <option value="" disabled>+ Add Level</option>
                  {availableLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )

      case 'stress-tracks':
        return (
          <div key={element.id} className={`card-element ${isLocked ? 'locked' : ''}`}>
            <div className="element-header">
              <h4>Stress Tracks</h4>
              {!isLocked && (
                <button 
                  onClick={() => deleteElement(element.id)}
                  className="element-delete-btn"
                >
                  ×
                </button>
              )}
            </div>
            {element.tracks.map((track, trackIndex) => (
              <div key={trackIndex} className="stress-track">
                <div className="stress-track-header">
                  {!isLocked ? (
                    <input
                      type="text"
                      value={track.name}
                      onChange={(e) => {
                        const newTracks = [...element.tracks]
                        newTracks[trackIndex] = { ...track, name: e.target.value }
                        updateElement(element.id, { tracks: newTracks })
                      }}
                      className="stress-track-name-input"
                      placeholder="Track name"
                    />
                  ) : (
                    <label>{track.name}</label>
                  )}
                  {!isLocked && (
                    <div className="stress-track-controls">
                      <button
                        onClick={() => {
                          const newTracks = [...element.tracks]
                          newTracks[trackIndex] = { 
                            ...track, 
                            boxes: [...track.boxes, { checked: false, value: 1 }] 
                          }
                          updateElement(element.id, { tracks: newTracks })
                        }}
                        className="stress-control-btn"
                        title="Add box"
                      >
                        +
                      </button>
                      <button
                        onClick={() => {
                          if (track.boxes.length > 1) {
                            const newTracks = [...element.tracks]
                            newTracks[trackIndex] = { 
                              ...track, 
                              boxes: track.boxes.slice(0, -1) 
                            }
                            updateElement(element.id, { tracks: newTracks })
                          }
                        }}
                        className="stress-control-btn"
                        title="Remove box"
                        disabled={track.boxes.length <= 1}
                      >
                        −
                      </button>
                      <button
                        onClick={() => {
                          const newTracks = element.tracks.filter((_, i) => i !== trackIndex)
                          updateElement(element.id, { tracks: newTracks })
                        }}
                        className="stress-control-btn stress-delete-btn"
                        title="Delete track"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                <div className="stress-boxes">
                  {track.boxes.map((box, boxIndex) => (
                    <div 
                      key={boxIndex}
                      className={`stress-box ${box.checked ? 'checked' : ''} ${isLocked ? 'locked' : ''}`}
                      onClick={() => {
                        const newTracks = [...element.tracks]
                        const newBoxes = [...track.boxes]
                        newBoxes[boxIndex] = { ...box, checked: !box.checked }
                        newTracks[trackIndex] = { ...track, boxes: newBoxes }
                        updateElement(element.id, { tracks: newTracks })
                      }}
                    >
                      {!isLocked ? (
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={box.value}
                          onChange={(e) => {
                            e.stopPropagation()
                            const newTracks = [...element.tracks]
                            const newBoxes = [...track.boxes]
                            newBoxes[boxIndex] = { ...box, value: parseInt(e.target.value) || 1 }
                            newTracks[trackIndex] = { ...track, boxes: newBoxes }
                            updateElement(element.id, { tracks: newTracks })
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="stress-box-value"
                        />
                      ) : (
                        <span>{box.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!isLocked && (
              <button
                onClick={() => {
                  const newTracks = [...element.tracks, { 
                    name: 'New Track', 
                    boxes: [
                      { checked: false, value: 1 },
                      { checked: false, value: 2 },
                      { checked: false, value: 3 }
                    ] 
                  }]
                  updateElement(element.id, { tracks: newTracks })
                }}
                className="add-stress-track-btn"
              >
                + Add Track
              </button>
            )}
          </div>
        )

      case 'consequences':
        return (
          <div key={element.id} className={`card-element ${isLocked ? 'locked' : ''}`}>
            <div className="element-header">
              <h4>Consequences</h4>
              {!isLocked && (
                <button 
                  onClick={() => deleteElement(element.id)}
                  className="element-delete-btn"
                >
                  ×
                </button>
              )}
            </div>
            {element.items.map((consequence, index) => (
              <div key={index} className="consequence-item">
                <div className="consequence-label-row">
                  {!isLocked ? (
                    <>
                      <input
                        type="text"
                        value={consequence.label}
                        onChange={(e) => {
                          const newItems = [...element.items]
                          newItems[index] = { ...consequence, label: e.target.value }
                          updateElement(element.id, { items: newItems })
                        }}
                        className="consequence-label-input"
                        placeholder="Label"
                      />
                      <button
                        onClick={() => {
                          const newItems = element.items.filter((_, i) => i !== index)
                          updateElement(element.id, { items: newItems })
                        }}
                        className="consequence-delete-btn"
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <label>{consequence.label}</label>
                  )}
                </div>
                <input
                  type="text"
                  value={consequence.text}
                  onChange={(e) => {
                    const newItems = [...element.items]
                    newItems[index] = { ...consequence, text: e.target.value }
                    updateElement(element.id, { items: newItems })
                  }}
                  className="element-input"
                  disabled={isLocked}
                />
              </div>
            ))}
            {!isLocked && (
              <button
                onClick={() => {
                  const newItems = [...element.items, { label: 'New', text: '---' }]
                  updateElement(element.id, { items: newItems })
                }}
                className="add-item-btn"
              >
                + Add Consequence
              </button>
            )}
          </div>
        )

      case 'note':
        return (
          <div key={element.id} className={`card-element ${isLocked ? 'locked' : ''}`}>
            <div className="element-header">
              <h4>Note</h4>
              {!isLocked && (
                <button 
                  onClick={() => deleteElement(element.id)}
                  className="element-delete-btn"
                >
                  ×
                </button>
              )}
            </div>
            <textarea
              value={element.text}
              onChange={(e) => updateElement(element.id, { text: e.target.value })}
              placeholder="Enter notes..."
              className="element-textarea"
              rows="4"
              disabled={isLocked}
            />
          </div>
        )

      case 'fate-points':
        return (
          <div key={element.id} className={`card-element ${isLocked ? 'locked' : ''}`}>
            <div className="element-header">
              <h4>Fate Points</h4>
              {isLocked ? (
                <span className="refresh-label">Refresh {element.refresh}</span>
              ) : (
                <button 
                  onClick={() => deleteElement(element.id)}
                  className="element-delete-btn"
                >
                  ×
                </button>
              )}
            </div>
            <div className="fate-points">
              {Array.from({ length: Math.min(element.current, element.refresh) }).map((_, i) => (
                <div 
                  key={i} 
                  className="fate-point filled"
                  onClick={isLocked ? () => updateElement(element.id, { 
                    current: Math.max(0, element.current - 1) 
                  }) : undefined}
                  style={isLocked ? { cursor: 'pointer' } : undefined}
                >●</div>
              ))}
              {Array.from({ length: Math.max(0, element.refresh - element.current) }).map((_, i) => (
                <div key={i + element.current} className="fate-point empty">○</div>
              ))}
              {element.current > element.refresh && Array.from({ length: element.current - element.refresh }).map((_, i) => (
                <div 
                  key={i + element.refresh} 
                  className="fate-point filled"
                  onClick={isLocked ? () => updateElement(element.id, { 
                    current: Math.max(0, element.current - 1) 
                  }) : undefined}
                  style={isLocked ? { cursor: 'pointer' } : undefined}
                >●</div>
              ))}
            </div>
            {!isLocked && (
              <div className="fate-points-controls">
                <button onClick={() => updateElement(element.id, { 
                  current: Math.max(0, element.current - 1) 
                })}>-</button>
                <span>{element.current} / </span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={element.refresh}
                  onChange={(e) => updateElement(element.id, { 
                    refresh: Math.max(0, Math.min(10, parseInt(e.target.value) || 0))
                  })}
                  className="refresh-input"
                />
                <button onClick={() => updateElement(element.id, { 
                  current: element.current + 1
                })}>+</button>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div key={element.id} className="card-element">
            <div className="element-header">
              <h4>Unknown Element</h4>
              {!isLocked && (
                <button 
                  onClick={() => deleteElement(element.id)}
                  className="element-delete-btn"
                >
                  ×
                </button>
              )}
            </div>
            <p className="card-placeholder">Element type "{element.type}" is not supported.</p>
          </div>
        )
    }
  }

  return (
    <>
      <div className={`card ${card.layout === '2-column' ? 'two-column' : card.layout === 'auto' ? 'auto-column' : ''}`} style={{ borderColor: card.color, backgroundColor: getPaleBackground(card.color) }}>
        <div className="card-header" style={{ backgroundColor: card.color }}>
          <div className="card-header-left">
            {!isLocked && (
              <button 
                onClick={() => onDelete(card.id)}
                className="card-icon-btn"
                title="Delete card"
              >
                ✖
              </button>
            )}
          </div>
          <div className="card-title-section">
            <h3>{card.title}</h3>
          </div>
          <div className="card-header-actions">
            {!isLocked && (
              <>
                <button 
                  onClick={() => setShowElementMenu(!showElementMenu)}
                  className="card-icon-btn card-add-btn"
                  title="Add element"
                >
                  +
                </button>
                <button 
                  onClick={() => onDuplicate(card)}
                  className="card-icon-btn"
                  title="Duplicate card"
                >
                  📋
                </button>
              </>
            )}
            {!isLocked && (
              <button 
                onClick={openSettings}
                className="card-icon-btn"
                title="Card settings"
              >
                ⚙️
              </button>
            )}
            <button 
              onClick={toggleLock}
              className="card-icon-btn"
              title={isLocked ? "Unlock card" : "Lock card"}
            >
              {isLocked ? '🔒' : '🔓'}
            </button>
          </div>
        </div>

      {showElementMenu && !isLocked && (
        <div className="element-menu">
          <div className="element-menu-header">
            <h4>Add Element</h4>
            <button onClick={() => setShowElementMenu(false)}>×</button>
          </div>
          <div className="element-menu-options">
            <button onClick={() => addElement('high-concept')}>High Concept</button>
            <button onClick={() => addElement('trouble')}>Trouble</button>
            <button onClick={() => addElement('aspects')}>Aspects List</button>
            <button onClick={() => addElement('skills')}>Skill List</button>
            <button onClick={() => addElement('stress-tracks')}>Stress Tracks</button>
            <button onClick={() => addElement('consequences')}>Consequences List</button>
            <button onClick={() => addElement('fate-points')}>Fate Points</button>
            <button onClick={() => addElement('note')}>Note</button>
          </div>
        </div>
      )}

        {card.subtitle && (
          <div className="card-subtitle-bar" style={{ backgroundColor: getMidToneBackground(card.color) }}>
            {card.subtitle}
          </div>
        )}

        <div className="card-body">
          <div className="card-elements" style={{ color: card.color }}>
            {card.elements.map(element => renderElement(element))}
          </div>

          {card.elements.length === 0 && !isLocked && (
            <p className="card-placeholder">
              Click the + button to add elements to this card
            </p>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content card-settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Card Properties</h3>
              <button onClick={() => setShowSettings(false)} className="modal-close">×</button>
            </div>
            <div className="card-settings-body">
              <div className="settings-field">
                <label>Title</label>
                <input
                  type="text"
                  value={settingsTitle}
                  onChange={(e) => setSettingsTitle(e.target.value)}
                  className="settings-input"
                />
              </div>

              <div className="settings-field">
                <label>Subtitle</label>
                <input
                  type="text"
                  value={settingsSubtitle}
                  onChange={(e) => setSettingsSubtitle(e.target.value)}
                  className="settings-input"
                  placeholder="Optional subtitle..."
                />
              </div>

              <div className="settings-field">
                <label>Color</label>
                <div className="color-palette">
                  {colorPalette.map(color => (
                    <div
                      key={color}
                      className={`color-swatch ${settingsColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSettingsColor(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="settings-field">
                <label>Layout</label>
                <select
                  value={settingsLayout}
                  onChange={(e) => setSettingsLayout(e.target.value)}
                  className="settings-select"
                >
                  <option value="auto">Auto</option>
                  <option value="1-column">1 Column</option>
                  <option value="2-column">2 Columns</option>
                </select>
              </div>

              <div className="settings-field">
                <label>Category</label>
                <select
                  value={settingsCategory}
                  onChange={(e) => setSettingsCategory(e.target.value)}
                  className="settings-select"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="settings-actions">
                <button onClick={() => setShowSettings(false)} className="cancel-btn">
                  Cancel
                </button>
                <button onClick={saveSettings} className="confirm-btn">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Card