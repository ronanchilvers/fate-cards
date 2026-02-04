import { useState, useEffect } from 'react'
import Icon from '../icons/Icon'
import './ModalBase.css'
import './TemplateModal.css'

/**
 * Modal for selecting a card template and category when creating new cards
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Called when modal should close
 * @param {Array<string>} props.categories - Available categories
 * @param {Function} props.onCreateCard - Called with (category, templateKey) when card created
 * @param {string} props.defaultCategory - Initially selected category
 */
function TemplateModal({ 
  isOpen, 
  onClose, 
  categories = [], 
  onCreateCard,
  defaultCategory = ''
}) {
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory || (categories.length > 0 ? categories[0] : ''))

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTemplate('')
      setSelectedCategory(defaultCategory || (categories.length > 0 ? categories[0] : ''))
    }
  }, [isOpen, defaultCategory, categories])

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle create button
  const handleCreate = () => {
    if (!selectedTemplate || !selectedCategory) {
      alert('Please select both a template and a category.')
      return
    }
    onCreateCard(selectedCategory, selectedTemplate)
    onClose()
  }

  if (!isOpen) return null

  const templates = [
    {
      key: 'standard-pc',
      icon: 'templateStandard',
      title: 'Standard PC',
      description: 'Full character sheet with all Fate Core elements'
    },
    {
      key: 'quick-npc',
      icon: 'templateQuick',
      title: 'Quick NPC',
      description: 'Simplified character for NPCs and minor characters'
    },
    {
      key: 'scene',
      icon: 'templateScene',
      title: 'Scene',
      description: 'Location or situation aspects and description'
    },
    {
      key: 'blank',
      icon: 'templateBlank',
      title: 'Blank Card',
      description: 'Empty card, build your own'
    }
  ]

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Card</h3>
          <button onClick={onClose} className="modal-close" aria-label="Close modal">
            <Icon name="close" size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="template-selection">
          <div className="template-options">
            {templates.map(template => (
              <div
                key={template.key}
                onClick={() => setSelectedTemplate(template.key)}
                className={`template-option ${selectedTemplate === template.key ? 'selected' : ''}`}
              >
                <div className="template-icon">
                  <Icon name={template.icon} size={32} aria-hidden="true" />
                </div>
                <div className="template-info">
                  <h4>{template.title}</h4>
                  <p>{template.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="template-controls">
            <div className="category-selector">
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCreate}
              className="add-template-btn"
              disabled={!selectedTemplate || !selectedCategory}
            >
              Add Card
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplateModal
