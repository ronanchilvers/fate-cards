import { useState, useEffect, useRef } from 'react'
import './App.css'
import Card from './components/Card'
import { safeGetJSON, safeSetJSON } from './utils/storage'
import { normalizeCards } from './utils/cardSchema'
import { cardTemplates } from './data/cardTemplates'
import { defaultCategories, defaultSkills, defaultSkillLevels, defaultSampleCard } from './data/defaults'
import { STORAGE_KEYS, THEME_MODES } from './constants'
import ErrorBoundary from './components/ErrorBoundary'
import { getCategoryColor } from './utils/colors'

function App() {
  const [cards, setCards] = useState([])
  const [categories, setCategories] = useState(defaultCategories)
  const [skills, setSkills] = useState(defaultSkills)
  const [skillLevels, setSkillLevels] = useState(defaultSkillLevels)
  const [showTemplateMenu, setShowTemplateMenu] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showSkillsAdmin, setShowSkillsAdmin] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [showSkillLevelsAdmin, setShowSkillLevelsAdmin] = useState(false)
  const [newSkillLevelName, setNewSkillLevelName] = useState('')
  const [themeMode, setThemeMode] = useState('system') // 'light', 'dark', or 'system'
  const [isDark, setIsDark] = useState(false) // computed dark mode state
  const [isLoaded, setIsLoaded] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [collapsedCategories, setCollapsedCategories] = useState([])
  const [lastExportFilename, setLastExportFilename] = useState('')
  const fileInputRef = useRef(null)

  // Load cards, categories, skills, skill levels, and theme mode from localStorage on mount
  useEffect(() => {
    const savedCards = safeGetJSON(STORAGE_KEYS.CARDS)
    const savedCategories = safeGetJSON(STORAGE_KEYS.CATEGORIES)
    const savedSkills = safeGetJSON(STORAGE_KEYS.SKILLS)
    const savedSkillLevels = safeGetJSON(STORAGE_KEYS.SKILL_LEVELS)
    const savedThemeMode = localStorage.getItem(STORAGE_KEYS.THEME_MODE)
    const savedCollapsedCategories = safeGetJSON(STORAGE_KEYS.COLLAPSED_CATEGORIES)
    const savedLastExportFilename = localStorage.getItem(STORAGE_KEYS.LAST_EXPORT_FILENAME)

    if (savedCards) {
      setCards(savedCards)
    } else {
      // Initialize with sample data
      setCards([defaultSampleCard])
    }

    if (savedCategories) {
      setCategories(savedCategories)
    }

    if (savedSkills) {
      setSkills(savedSkills)
    }

    if (savedSkillLevels) {
      setSkillLevels(savedSkillLevels)
    }

    if (savedThemeMode) {
      setThemeMode(savedThemeMode)
    }

    if (savedCollapsedCategories) {
      setCollapsedCategories(savedCollapsedCategories)
    }

    if (savedLastExportFilename) {
      setLastExportFilename(savedLastExportFilename)
    }

    setIsLoaded(true)
  }, [])

  // Save cards to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      safeSetJSON(STORAGE_KEYS.CARDS, cards)
    }
  }, [cards, isLoaded])

  // Save categories to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      safeSetJSON(STORAGE_KEYS.CATEGORIES, categories)
    }
  }, [categories, isLoaded])

  // Save skills to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      safeSetJSON(STORAGE_KEYS.SKILLS, skills)
    }
  }, [skills, isLoaded])

  // Save skill levels to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      safeSetJSON(STORAGE_KEYS.SKILL_LEVELS, skillLevels)
    }
  }, [skillLevels, isLoaded])

  // Save theme mode to localStorage whenever it changes (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fate-thememode', themeMode)
    }
  }, [themeMode, isLoaded])

  // Save collapsed categories to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      safeSetJSON(STORAGE_KEYS.COLLAPSED_CATEGORIES, collapsedCategories)
    }
  }, [collapsedCategories, isLoaded])

  // Save last export filename to localStorage whenever it changes (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.LAST_EXPORT_FILENAME, lastExportFilename)
    }
  }, [lastExportFilename, isLoaded])

  // Listen to system theme preference and update isDark
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const updateDarkMode = () => {
      if (themeMode === THEME_MODES.AUTO) {
        setIsDark(mediaQuery.matches)
      } else if (themeMode === THEME_MODES.DARK) {
        setIsDark(true)
      } else {
        setIsDark(false)
      }
    }

    updateDarkMode()
    mediaQuery.addEventListener('change', updateDarkMode)

    return () => mediaQuery.removeEventListener('change', updateDarkMode)
  }, [themeMode])

  const addCard = (category) => {
    const newCard = {
      id: crypto.randomUUID(),
      category,
      color: getCategoryColorWithDefaults(category),
      title: 'New Card',
      subtitle: '',
      elements: [],
      layout: 'auto'
    }
    setCards([...cards, newCard])
  }

  const addTemplateCard = (category, template) => {
    // Get template factory function and call it to generate fresh data with new IDs
    const templateFactory = cardTemplates[template] || cardTemplates['blank']
    const templateData = templateFactory()
    const newCard = {
      id: crypto.randomUUID(),
      category,
      color: getCategoryColorWithDefaults(category),
      layout: 'auto',
      ...templateData
    }
    setCards([...cards, newCard])
  }

  const addCardFromTemplate = () => {
    if (!selectedTemplate || !selectedCategory) {
      alert('Please select both a template and a category.')
      return
    }
    addTemplateCard(selectedCategory, selectedTemplate)
    setShowTemplateMenu(false)
    setSelectedTemplate('')
    setSelectedCategory('')
  }

  const duplicateCard = (cardToDuplicate) => {
    const newCard = {
      ...structuredClone(cardToDuplicate), // Deep clone using structuredClone
      id: crypto.randomUUID(),
      title: cardToDuplicate.title + ' (Copy)',
      locked: false, // Unlock the duplicate
      elements: cardToDuplicate.elements.map(el => ({
        ...el,
        id: crypto.randomUUID()
      }))
    }
    setCards([...cards, newCard])
  }

  const updateCard = (id, updatedCard) => {
    setCards(cards.map(card => card.id === id ? updatedCard : card))
  }

  const deleteCard = (id) => {
    setCards(cards.filter(card => card.id !== id))
  }

  // Helper to get category color with default colors
  const getCategoryColorWithDefaults = (category) => {
    const defaultColors = {
      'PCs': '#c53030',
      'NPCs': '#2c5282',
      'Scenes': '#ed8936'
    }
    return getCategoryColor(category, defaultColors)
  }

  const addCategory = () => {
    if (!newCategoryName.trim()) return

    if (categories.includes(newCategoryName.trim())) {
      alert('A category with this name already exists!')
      return
    }

    setCategories([...categories, newCategoryName.trim()])
    setNewCategoryName('')
    setShowAddCategory(false)
  }

  const deleteCategory = (category) => {
    const cardsInCategory = cards.filter(card => card.category === category).length

    if (cardsInCategory > 0) {
      alert(`Cannot delete category "${category}" because it contains ${cardsInCategory} card(s). Please move or delete the cards first.`)
      return
    }

    if (window.confirm(`Are you sure you want to delete the category "${category}"?`)) {
      setCategories(categories.filter(cat => cat !== category))
    }
  }

  const addSkill = () => {
    if (!newSkillName.trim()) return

    if (skills.includes(newSkillName.trim())) {
      alert('A skill with this name already exists!')
      return
    }

    setSkills([...skills, newSkillName.trim()].sort())
    setNewSkillName('')
  }

  const deleteSkill = (skillName) => {
    if (window.confirm(`Are you sure you want to delete the skill "${skillName}"?`)) {
      setSkills(skills.filter(s => s !== skillName))
    }
  }

  const addSkillLevelAtTop = () => {
    if (!newSkillLevelName.trim()) return

    if (skillLevels.some(level => level.label === newSkillLevelName.trim())) {
      alert('A skill level with this name already exists!')
      return
    }

    // Find the next available value (highest + 1)
    const maxValue = skillLevels.length > 0 ? Math.max(...skillLevels.map(l => l.value)) : -1
    const newLevel = { label: newSkillLevelName.trim(), value: maxValue + 1 }

    // Add and sort by value descending
    setSkillLevels([...skillLevels, newLevel].sort((a, b) => b.value - a.value))
    setNewSkillLevelName('')
  }

  const addSkillLevelAtBottom = () => {
    if (!newSkillLevelName.trim()) return

    if (skillLevels.some(level => level.label === newSkillLevelName.trim())) {
      alert('A skill level with this name already exists!')
      return
    }

    // Find the next available value (lowest - 1)
    const minValue = skillLevels.length > 0 ? Math.min(...skillLevels.map(l => l.value)) : 1
    const newLevel = { label: newSkillLevelName.trim(), value: minValue - 1 }

    // Add and sort by value descending
    setSkillLevels([...skillLevels, newLevel].sort((a, b) => b.value - a.value))
    setNewSkillLevelName('')
  }

  const deleteSkillLevel = (levelValue) => {
    const level = skillLevels.find(l => l.value === levelValue)
    if (!level) return
    if (window.confirm(`Are you sure you want to delete the skill level "${level.label}"?`)) {
      setSkillLevels(skillLevels.filter(l => l.value !== levelValue))
    }
  }

  const updateSkillLevelLabel = (levelValue, newLabel) => {
    setSkillLevels(skillLevels.map(level =>
      level.value === levelValue ? { ...level, label: newLabel } : level
    ))
  }

  const exportCards = async () => {
    const now = new Date()
    const timestamp = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0')
    const defaultFilename = lastExportFilename || `fate-cards-${timestamp}.json`
    
    const exportData = {
      cards,
      categories,
      skills,
      skillLevels
    }
    const dataStr = JSON.stringify(exportData, null, 2)
    
    // Try to use File System Access API if available
    if ('showSaveFilePicker' in window) {
      try {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: defaultFilename,
          types: [{
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] }
          }]
        })
        const writable = await fileHandle.createWritable()
        await writable.write(dataStr)
        await writable.close()
        setLastExportFilename(fileHandle.name)
        return
      } catch (err) {
        // User cancelled or error occurred, fall back to download link
        if (err.name === 'AbortError') {
          return
        }
      }
    }
    
    // Fallback for browsers that don't support File System Access API
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = defaultFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const importCards = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)
        const warnings = []

        // Handle old format (array of cards) or new format (object with cards, categories, skills, skillLevels)
        if (Array.isArray(importedData)) {
          // Old format - just cards; validate and normalize before setting
          const validCards = normalizeCards(importedData)
          if (validCards.length < importedData.length) {
            warnings.push(`${importedData.length - validCards.length} invalid cards were skipped.`)
          }
          setCards(validCards)
          warnings.push('Legacy format detected: categories, skills, and skill levels were not imported.')
        } else if (importedData.cards && Array.isArray(importedData.cards)) {
          // New format - validate and import all fields
          const validCards = normalizeCards(importedData.cards)
          if (validCards.length < importedData.cards.length) {
            warnings.push(`${importedData.cards.length - validCards.length} invalid cards were skipped.`)
          }
          setCards(validCards)

          // Import and validate categories
          if (importedData.categories && Array.isArray(importedData.categories)) {
            // Validate that all items are non-empty strings
            const validCategories = importedData.categories.filter(cat => 
              typeof cat === 'string' && cat.trim().length > 0
            )
            if (validCategories.length > 0) {
              setCategories(validCategories)
            } else {
              warnings.push('Categories were invalid and not imported.')
            }
          } else if (importedData.categories !== undefined) {
            warnings.push('Categories were invalid and not imported.')
          }

          // Import and validate skills
          if (importedData.skills && Array.isArray(importedData.skills)) {
            // Validate that all items are non-empty strings
            const validSkills = importedData.skills.filter(skill => 
              typeof skill === 'string' && skill.trim().length > 0
            )
            if (validSkills.length > 0) {
              setSkills(validSkills)
            } else {
              warnings.push('Skills were invalid and not imported.')
            }
          } else if (importedData.skills !== undefined) {
            warnings.push('Skills were invalid and not imported.')
          }

          // Import and validate skill levels
          if (importedData.skillLevels && Array.isArray(importedData.skillLevels)) {
            // Validate that all items have required properties
            const validSkillLevels = importedData.skillLevels.filter(level => 
              level && 
              typeof level === 'object' &&
              typeof level.label === 'string' && 
              level.label.trim().length > 0 &&
              typeof level.value === 'number' &&
              !isNaN(level.value)
            )
            if (validSkillLevels.length > 0) {
              setSkillLevels(validSkillLevels)
            } else {
              warnings.push('Skill levels were invalid and not imported.')
            }
          } else if (importedData.skillLevels !== undefined) {
            warnings.push('Skill levels were invalid and not imported.')
          }
        } else {
          alert('Invalid file format. Please select a valid Fate Cards JSON file.')
          event.target.value = ''
          return
        }

        // Show consolidated feedback to user
        if (warnings.length > 0) {
          alert('Import completed with warnings:\n\n' + warnings.join('\n'))
        }
      } catch (error) {
        alert('Error reading file. Please make sure it is a valid JSON file.')
      }
    }
    reader.readAsText(file)

    // Reset the file input so the same file can be imported again
    event.target.value = ''
  }

  const triggerImport = () => {
    fileInputRef.current?.click()
  }

  const resetAllData = () => {
    if (window.confirm('Are you sure you want to reset all data? This will delete all cards, restore default skills and skill levels, and cannot be undone.')) {
      // Clear localStorage
      localStorage.removeItem(STORAGE_KEYS.CARDS)
      localStorage.removeItem(STORAGE_KEYS.CATEGORIES)
      localStorage.removeItem(STORAGE_KEYS.SKILLS)
      localStorage.removeItem(STORAGE_KEYS.SKILL_LEVELS)
      localStorage.removeItem(STORAGE_KEYS.THEME_MODE)
      localStorage.removeItem(STORAGE_KEYS.LAST_EXPORT_FILENAME)

      // Reset to defaults
      setCards([])
      setCategories(defaultCategories)
      setSkills(defaultSkills)
      setSkillLevels(defaultSkillLevels)
      setThemeMode(THEME_MODES.AUTO)
      setLastExportFilename('')
    }
  }

  const openTemplateMenu = () => {
    setSelectedCategory(categories[0] || '')
    setShowTemplateMenu(true)
  }

  const toggleCategoryCollapse = (category) => {
    if (collapsedCategories.includes(category)) {
      setCollapsedCategories(collapsedCategories.filter(c => c !== category))
    } else {
      setCollapsedCategories([...collapsedCategories, category])
    }
  }

  const cycleThemeMode = () => {
    let newMode
    if (themeMode === THEME_MODES.LIGHT) {
      newMode = THEME_MODES.DARK
    } else if (themeMode === THEME_MODES.DARK) {
      newMode = THEME_MODES.AUTO
    } else {
      newMode = THEME_MODES.LIGHT
    }
    setThemeMode(newMode)
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, newMode)
  }

  const getThemeIcon = () => {
    if (themeMode === THEME_MODES.LIGHT) return '☀️'
    if (themeMode === THEME_MODES.DARK) return '🌙'
    return '🌓'
  }

  const getThemeTitle = () => {
    if (themeMode === THEME_MODES.LIGHT) return 'Light Mode (click for Dark)'
    if (themeMode === THEME_MODES.DARK) return 'Dark Mode (click for Auto)'
    return 'Auto Mode (click for Light)'
  }

  return (
    <div className={`app ${isDark ? 'dark-mode' : ''}`}>
      <header className="app-header">
        <h1>Fate RPG Cards</h1>
        <button
          className="hamburger-btn"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className={`app-actions ${showMobileMenu ? 'mobile-open' : ''}`}>
          <button onClick={() => { openTemplateMenu(); setShowMobileMenu(false); }} className="action-btn add-card-header">
            ➕ Card
          </button>
          <button onClick={() => { setShowAddCategory(true); setShowMobileMenu(false); }} className="action-btn category-btn">
            ➕ Category
          </button>
          <button onClick={() => { setShowSkillsAdmin(true); setShowMobileMenu(false); }} className="action-btn skills-btn">
            🎯 Skills
          </button>
          <button onClick={() => { setShowSkillLevelsAdmin(true); setShowMobileMenu(false); }} className="action-btn skills-btn">
            📊 Skill Levels
          </button>
          <button onClick={() => { exportCards(); setShowMobileMenu(false); }} className="action-btn export-btn">
            💾 Export
          </button>
          <button onClick={() => { triggerImport(); setShowMobileMenu(false); }} className="action-btn import-btn">
            📁 Import
          </button>
          <button onClick={() => { resetAllData(); setShowMobileMenu(false); }} className="action-btn reset-btn">
            🔄 Reset
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={importCards}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => { cycleThemeMode(); setShowMobileMenu(false); }}
            className="action-btn darkmode-btn"
            title={getThemeTitle()}
          >
            {getThemeIcon()}
          </button>

        </div>
      </header>

      {categories.map(category => (
        <div key={category} className={`category-section ${collapsedCategories.includes(category) ? 'collapsed' : ''}`}>
          <div
            className="category-header"
            style={{ backgroundColor: getCategoryColorWithDefaults(category), cursor: 'pointer' }}
            onClick={() => toggleCategoryCollapse(category)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem', transition: 'transform 0.2s', transform: collapsedCategories.includes(category) ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
              <h2>{category}</h2>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteCategory(category)
              }}
              className="delete-category-btn"
              title={cards.filter(c => c.category === category).length > 0 ? 'Cannot delete category with cards' : 'Delete category'}
            >
              ×
            </button>
          </div>

          {!collapsedCategories.includes(category) && (
            <ErrorBoundary>
            <div className="cards-container">
            {cards.filter(card => card.category === category).length === 0 ? (
              <p className="empty-category-message">
                Click the <strong>Add Card</strong> button above to add a card to this category
              </p>
            ) : (
              cards
                .filter(card => card.category === category)
                .map(card => (
                  <Card
                    key={card.id}
                    card={card}
                    onUpdate={updateCard}
                    onDelete={deleteCard}
                    onDuplicate={duplicateCard}
                    skills={skills}
                    skillLevels={skillLevels}
                    categories={categories}
                  />
                ))
            )}
            </div>
            </ErrorBoundary>
          )}
        </div>
      ))}

      {showTemplateMenu && (
        <div className="modal-overlay" onClick={() => setShowTemplateMenu(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Card</h3>
              <button onClick={() => setShowTemplateMenu(false)} className="modal-close">×</button>
            </div>
            <div className="template-selection">
              <div className="template-options">
                <div
                  onClick={() => setSelectedTemplate('standard-pc')}
                  className={`template-option ${selectedTemplate === 'standard-pc' ? 'selected' : ''}`}
                >
                  <div className="template-icon">👤</div>
                  <div className="template-info">
                    <h4>Standard PC</h4>
                    <p>Full character sheet with all Fate Core elements</p>
                  </div>
                </div>
                <div
                  onClick={() => setSelectedTemplate('quick-npc')}
                  className={`template-option ${selectedTemplate === 'quick-npc' ? 'selected' : ''}`}
                >
                  <div className="template-icon">🎭</div>
                  <div className="template-info">
                    <h4>Quick NPC</h4>
                    <p>Simplified character for NPCs and minor characters</p>
                  </div>
                </div>
                <div
                  onClick={() => setSelectedTemplate('scene')}
                  className={`template-option ${selectedTemplate === 'scene' ? 'selected' : ''}`}
                >
                  <div className="template-icon">🏛️</div>
                  <div className="template-info">
                    <h4>Scene</h4>
                    <p>Location or situation aspects and description</p>
                  </div>
                </div>
                <div
                  onClick={() => setSelectedTemplate('blank')}
                  className={`template-option ${selectedTemplate === 'blank' ? 'selected' : ''}`}
                >
                  <div className="template-icon">📄</div>
                  <div className="template-info">
                    <h4>Blank Card</h4>
                    <p>Empty card, build your own</p>
                  </div>
                </div>
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
                  onClick={addCardFromTemplate}
                  className="add-template-btn"
                  disabled={!selectedTemplate || !selectedCategory}
                >
                  Add Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddCategory && (
        <div className="modal-overlay" onClick={() => setShowAddCategory(false)}>
          <div className="modal-content small-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Category</h3>
              <button onClick={() => setShowAddCategory(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                placeholder="Enter category name..."
                className="category-input"
                autoFocus
              />
              <div className="modal-actions">
                <button onClick={() => setShowAddCategory(false)} className="cancel-btn">
                  Cancel
                </button>
                <button onClick={addCategory} className="confirm-btn">
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSkillsAdmin && (
        <div className="modal-overlay" onClick={() => setShowSkillsAdmin(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Manage Skills</h3>
              <button onClick={() => setShowSkillsAdmin(false)} className="modal-close">×</button>
            </div>
            <div className="skills-admin-body">
              <p className="skills-admin-description">
                These skills are available for all characters. Add custom skills for your game setting.
              </p>
              <div className="skills-list">
                {skills.map(skill => (
                  <div key={skill} className="skill-list-item">
                    <span>{skill}</span>
                    <button
                      onClick={() => deleteSkill(skill)}
                      className="skill-list-delete"
                      title="Delete skill"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="add-skill-section">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Enter new skill name..."
                  className="skill-input"
                />
                <button onClick={addSkill} className="add-skill-btn">
                  Add Skill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSkillLevelsAdmin && (
        <div className="modal-overlay" onClick={() => setShowSkillLevelsAdmin(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Manage Skill Levels</h3>
              <button onClick={() => setShowSkillLevelsAdmin(false)} className="modal-close">×</button>
            </div>
            <div className="skills-admin-body">
              <p className="skills-admin-description">
                These skill levels (the ladder) are used throughout your game. The numbers are automatically assigned.
              </p>
              <div className="skills-list">
                {skillLevels.map(level => (
                  <div key={level.value} className="skill-level-admin-item">
                    <span className="skill-level-value">{level.value >= 0 ? '+' : ''}{level.value}</span>
                    <input
                      type="text"
                      value={level.label}
                      onChange={(e) => updateSkillLevelLabel(level.value, e.target.value)}
                      className="skill-level-label-edit"
                    />
                    <button
                      onClick={() => deleteSkillLevel(level.value)}
                      className="skill-list-delete"
                      title="Delete skill level"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="add-skill-section">
                <input
                  type="text"
                  value={newSkillLevelName}
                  onChange={(e) => setNewSkillLevelName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkillLevelAtTop()}
                  placeholder="Enter new skill level name..."
                  className="skill-input"
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={addSkillLevelAtTop} className="add-skill-btn">
                    Add to Top
                  </button>
                  <button onClick={addSkillLevelAtBottom} className="add-skill-btn">
                    Add to Bottom
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
