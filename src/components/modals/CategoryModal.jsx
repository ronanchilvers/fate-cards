import { useState, useEffect, useRef } from 'react'
import Icon from '../icons/Icon'

/**
 * Modal for adding a new category
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Called when modal should close
 * @param {Function} props.onAddCategory - Called with category name when added, should return true/false for success
 */
function CategoryModal({ isOpen, onClose, onAddCategory }) {
  const [categoryName, setCategoryName] = useState('')
  const inputRef = useRef(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCategoryName('')
    }
  }, [isOpen])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleSubmit = () => {
    const trimmed = categoryName.trim()
    if (!trimmed) return

    const result = onAddCategory(trimmed)
    if (result !== false) {
      onClose()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content small-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Category</h3>
          <button onClick={onClose} className="modal-close" aria-label="Close modal">
            <Icon name="close" size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="modal-body">
          <input
            ref={inputRef}
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter category name..."
            className="category-input"
          />
          <div className="modal-actions">
            <button onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              className="confirm-btn"
              disabled={!categoryName.trim()}
            >
              Add Category
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryModal
