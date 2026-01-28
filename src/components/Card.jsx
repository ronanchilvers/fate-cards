import { useState, useEffect } from 'react'
import './Card.css'
import { getPaleBackground, getMidToneBackground } from '../utils/colors'
import { createElementByType } from '../data/elementFactories'
import { ELEMENT_COMPONENTS } from './elements'
import { ELEMENT_TYPES } from '../constants'

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
    return createElementByType(type)
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

  /**
   * Render an element using the component registry
   * Falls back to unknown element message if component not found
   */
  const renderElement = (element) => {
    const ElementComponent = ELEMENT_COMPONENTS[element.type]
    
    if (!ElementComponent) {
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

    return (
      <ElementComponent
        key={element.id}
        element={element}
        isLocked={isLocked}
        onUpdate={(updates) => updateElement(element.id, updates)}
        onDelete={() => deleteElement(element.id)}
        skills={skills}
        skillLevels={skillLevels}
      />
    )
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
            <button onClick={() => addElement(ELEMENT_TYPES.HIGH_CONCEPT)}>High Concept</button>
            <button onClick={() => addElement(ELEMENT_TYPES.TROUBLE)}>Trouble</button>
            <button onClick={() => addElement(ELEMENT_TYPES.ASPECTS)}>Aspects List</button>
            <button onClick={() => addElement(ELEMENT_TYPES.SKILLS)}>Skill List</button>
            <button onClick={() => addElement(ELEMENT_TYPES.STRESS_TRACKS)}>Stress Tracks</button>
            <button onClick={() => addElement(ELEMENT_TYPES.CONSEQUENCES)}>Consequences List</button>
            <button onClick={() => addElement(ELEMENT_TYPES.FATE_POINTS)}>Fate Points</button>
            <button onClick={() => addElement(ELEMENT_TYPES.NOTE)}>Note</button>
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
                  <option value="single-column">1 Column</option>
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