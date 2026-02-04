import { useState, useEffect, useRef } from 'react'
import './Card.css'
import './modals/ModalBase.css'
import { getPaleBackground, getMidToneBackground, normalizeColorToHex } from '../utils/colors'
import { createElementByType } from '../data/elementFactories'
import { ELEMENT_COMPONENTS } from './elements'
import { ELEMENT_TYPES } from '../constants'
import Icon from './icons/Icon'

function Card({ card, onUpdate, onDelete, onDuplicate, skills, skillLevels, categories }) {
  const [showElementMenu, setShowElementMenu] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isLocked, setIsLocked] = useState(card.locked || false)
  const [draggedElementId, setDraggedElementId] = useState(null)
  const [dragOverElementId, setDragOverElementId] = useState(null)
  const [pointerDragId, setPointerDragId] = useState(null)
  const elementRefs = useRef(new Map())
  const pointerDragIdRef = useRef(null)
  const dragHandlePressedRef = useRef(false)
  
  // Sync locked state when card prop changes
  useEffect(() => {
    setIsLocked(card.locked || false)
  }, [card.locked])

  useEffect(() => {
    if (isLocked) {
      setDraggedElementId(null)
      setDragOverElementId(null)
      setPointerDragId(null)
      pointerDragIdRef.current = null
    }
  }, [isLocked])
  
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
    const normalizedColor = normalizeColorToHex(settingsColor) || card.color || '#1f2937'
    updateCard({
      title: settingsTitle,
      subtitle: settingsSubtitle,
      color: normalizedColor,
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

  const moveElementToIndex = (sourceId, insertIndex) => {
    if (!sourceId || insertIndex == null) return
    const elements = card.elements || []
    const fromIndex = elements.findIndex(el => el.id === sourceId)
    if (fromIndex === -1) return

    const clampedIndex = Math.max(0, Math.min(insertIndex, elements.length))
    let adjustedIndex = clampedIndex
    if (fromIndex < clampedIndex) {
      adjustedIndex = clampedIndex - 1
    }

    if (adjustedIndex === fromIndex) return

    const nextElements = [...elements]
    const [moved] = nextElements.splice(fromIndex, 1)
    const finalIndex = Math.max(0, Math.min(adjustedIndex, nextElements.length))
    nextElements.splice(finalIndex, 0, moved)

    updateCard({ elements: nextElements })
  }

  const resetDragState = () => {
    setDraggedElementId(null)
    setDragOverElementId(null)
    setPointerDragId(null)
    pointerDragIdRef.current = null
  }

  const handleDragStart = (event, elementId) => {
    if (isLocked) return
    if (!dragHandlePressedRef.current) {
      event.preventDefault()
      return
    }
    dragHandlePressedRef.current = false
    setDraggedElementId(elementId)
    setDragOverElementId(null)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', elementId)
  }

  const handleDragOver = (event, elementId) => {
    if (isLocked) return
    event.preventDefault()
    if (dragOverElementId !== elementId) {
      setDragOverElementId(elementId)
    }
    event.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (event, elementId) => {
    if (isLocked) return
    event.preventDefault()
    const sourceId = event.dataTransfer.getData('text/plain') || draggedElementId
    if (!sourceId || sourceId === elementId) {
      setDragOverElementId(null)
      setDraggedElementId(null)
      return
    }

    const elements = card.elements || []
    const insertIndex = elements.findIndex(el => el.id === elementId)
    if (insertIndex === -1) {
      resetDragState()
      return
    }
    moveElementToIndex(sourceId, insertIndex)
    resetDragState()
  }

  const handleDropAtEnd = (event) => {
    if (isLocked) return
    event.preventDefault()
    const sourceId = event.dataTransfer.getData('text/plain') || draggedElementId
    if (!sourceId) {
      setDragOverElementId(null)
      setDraggedElementId(null)
      return
    }

    const elements = card.elements || []
    moveElementToIndex(sourceId, elements.length)
    resetDragState()
  }

  const handleDragEnd = () => {
    resetDragState()
  }

  const getPointerInsertIndex = (clientX, clientY) => {
    const elements = card.elements || []
    const rects = elements
      .map((element, index) => {
        const node = elementRefs.current.get(element.id)
        if (!node) return null
        return { id: element.id, index, rect: node.getBoundingClientRect() }
      })
      .filter(Boolean)

    if (rects.length === 0) return null

    const columnCandidates = rects.filter(({ rect }) => clientX >= rect.left && clientX <= rect.right)
    const candidates = columnCandidates.length > 0 ? columnCandidates : rects

    candidates.sort((a, b) => a.rect.top - b.rect.top)

    let lastCandidate = null
    for (const candidate of candidates) {
      const midpoint = candidate.rect.top + candidate.rect.height / 2
      if (clientY < midpoint) {
        return candidate.index
      }
      lastCandidate = candidate
    }

    return lastCandidate ? lastCandidate.index + 1 : null
  }

  const getInsertPreviewId = (insertIndex) => {
    const elements = card.elements || []
    if (insertIndex == null) return null
    if (insertIndex >= elements.length) return 'end'
    return elements[insertIndex]?.id || null
  }

  const handlePointerDown = (event, elementId) => {
    if (isLocked || event.pointerType === 'mouse') return
    event.preventDefault()
    event.stopPropagation()
    pointerDragIdRef.current = elementId
    setPointerDragId(elementId)
    setDraggedElementId(elementId)
    setDragOverElementId(null)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!pointerDragIdRef.current) return
    event.preventDefault()
    const insertIndex = getPointerInsertIndex(event.clientX, event.clientY)
    const previewId = getInsertPreviewId(insertIndex)
    const nextTarget = previewId === pointerDragIdRef.current ? null : previewId
    setDragOverElementId(nextTarget)
  }

  const handlePointerUp = (event) => {
    if (!pointerDragIdRef.current) return
    event.preventDefault()
    const sourceId = pointerDragIdRef.current
    const insertIndex = getPointerInsertIndex(event.clientX, event.clientY)
    moveElementToIndex(sourceId, insertIndex)
    resetDragState()
  }

  const handlePointerCancel = () => {
    if (!pointerDragIdRef.current) return
    resetDragState()
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
                aria-label="Delete element"
              >
                <Icon name="delete" size={16} aria-hidden="true" />
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
        showDragHandle={!isLocked}
        dragHandleProps={!isLocked ? {
          onMouseDown: () => {
            dragHandlePressedRef.current = true
          },
          onMouseUp: () => {
            dragHandlePressedRef.current = false
          },
          onMouseLeave: () => {
            dragHandlePressedRef.current = false
          },
          onPointerDown: (event) => handlePointerDown(event, element.id),
          onPointerMove: handlePointerMove,
          onPointerUp: handlePointerUp,
          onPointerCancel: handlePointerCancel
        } : undefined}
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
                aria-label="Delete card"
              >
                <Icon name="delete" size={16} aria-hidden="true" />
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
                  aria-label="Add element"
                >
                  <Icon name="add" size={18} aria-hidden="true" />
                </button>
                <button 
                  onClick={() => onDuplicate(card)}
                  className="card-icon-btn"
                  title="Duplicate card"
                  aria-label="Duplicate card"
                >
                  <Icon name="duplicate" size={16} aria-hidden="true" />
                </button>
              </>
            )}
            {!isLocked && (
              <button 
                onClick={openSettings}
                className="card-icon-btn"
                title="Card settings"
                aria-label="Card settings"
              >
                <Icon name="settings" size={16} aria-hidden="true" />
              </button>
            )}
            <button 
              onClick={toggleLock}
              className="card-icon-btn"
              title={isLocked ? "Unlock card" : "Lock card"}
              aria-label={isLocked ? "Unlock card" : "Lock card"}
            >
              <Icon name={isLocked ? 'lock' : 'unlock'} size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

      {showElementMenu && !isLocked && (
        <div className="element-menu">
          <div className="element-menu-header">
            <h4>Add Element</h4>
            <button onClick={() => setShowElementMenu(false)} aria-label="Close element menu">
              <Icon name="close" size={16} aria-hidden="true" />
            </button>
          </div>
          <div className="element-menu-options">
            <button onClick={() => addElement(ELEMENT_TYPES.ASPECTS)}>Aspects List</button>
            <button onClick={() => addElement(ELEMENT_TYPES.CONSEQUENCES)}>Consequences List</button>
            <button onClick={() => addElement(ELEMENT_TYPES.FATE_POINTS)}>Fate Points</button>
            <button onClick={() => addElement(ELEMENT_TYPES.HIGH_CONCEPT)}>High Concept</button>
            <button onClick={() => addElement(ELEMENT_TYPES.INVENTORY)}>Inventory</button>
            <button onClick={() => addElement(ELEMENT_TYPES.NOTE)}>Note</button>
            <button onClick={() => addElement(ELEMENT_TYPES.SKILLS)}>Skill List</button>
            <button onClick={() => addElement(ELEMENT_TYPES.STRESS_TRACKS)}>Stress Tracks</button>
            <button onClick={() => addElement(ELEMENT_TYPES.TROUBLE)}>Trouble</button>
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
            {card.elements.map(element => (
              <div
                key={element.id}
                className={[
                  'card-element-drag-wrapper',
                  !isLocked ? 'draggable' : '',
                  draggedElementId === element.id ? 'dragging' : '',
                  dragOverElementId === element.id ? 'drag-over' : ''
                ].filter(Boolean).join(' ')}
                draggable={!isLocked}
                onDragStart={(event) => handleDragStart(event, element.id)}
                onDragOver={(event) => handleDragOver(event, element.id)}
                onDragLeave={() => {
                  if (dragOverElementId === element.id) {
                    setDragOverElementId(null)
                  }
                }}
                onDrop={(event) => handleDrop(event, element.id)}
                onDragEnd={handleDragEnd}
                ref={(node) => {
                  if (node) {
                    elementRefs.current.set(element.id, node)
                  } else {
                    elementRefs.current.delete(element.id)
                  }
                }}
              >
                {renderElement(element)}
              </div>
            ))}
            {!isLocked && card.elements.length > 0 && (
              <div
                className={[
                  'card-elements-dropzone',
                  draggedElementId || pointerDragId ? 'active' : '',
                  dragOverElementId === 'end' ? 'drag-over' : ''
                ].filter(Boolean).join(' ')}
                onDragOver={(event) => handleDragOver(event, 'end')}
                onDragLeave={() => {
                  if (dragOverElementId === 'end') {
                    setDragOverElementId(null)
                  }
                }}
                onDrop={handleDropAtEnd}
                onDragEnd={handleDragEnd}
              />
            )}
          </div>

          {card.elements.length === 0 && !isLocked && (
            <p className="card-placeholder">
              Click the Add Element button to add elements to this card
            </p>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content card-settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Card Properties</h3>
              <button onClick={() => setShowSettings(false)} className="modal-close" aria-label="Close modal">
                <Icon name="close" size={20} aria-hidden="true" />
              </button>
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
