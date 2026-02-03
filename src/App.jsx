import { useState, useRef, useMemo } from 'react'
import './App.css'
import Card from './components/Card'
import ErrorBoundary from './components/ErrorBoundary'
import { 
  TemplateModal, 
  CategoryModal, 
  SkillsAdminModal, 
  SkillLevelsAdminModal 
} from './components/modals'
import { 
  useTheme, 
  useSkills, 
  useSkillLevels, 
  useCategories, 
  useCards 
} from './hooks'
import { FILE_CONSTRAINTS, STORAGE_KEYS } from './constants'

function App() {
  // Custom hooks for state management
  const theme = useTheme()
  const skillsHook = useSkills()
  const skillLevelsHook = useSkillLevels()
  const categoriesHook = useCategories()
  const cardsHook = useCards({ 
    getCategoryColor: categoriesHook.getCategoryColorWithDefaults 
  })

  // Modal visibility state (local - no persistence needed)
  const [showTemplateMenu, setShowTemplateMenu] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showSkillsAdmin, setShowSkillsAdmin] = useState(false)
  const [showSkillLevelsAdmin, setShowSkillLevelsAdmin] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Template modal state
  // File input ref for import
  const fileInputRef = useRef(null)

  // Last export filename state
  const [lastExportFilename, setLastExportFilename] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.LAST_EXPORT_FILENAME) || ''
  })

  const { cardsByCategory, cardCounts } = useMemo(() => {
    const byCategory = new Map()
    const counts = new Map()

    cardsHook.cards.forEach(card => {
      const existing = byCategory.get(card.category)
      if (existing) {
        existing.push(card)
      } else {
        byCategory.set(card.category, [card])
      }

      counts.set(card.category, (counts.get(card.category) || 0) + 1)
    })

    return { cardsByCategory: byCategory, cardCounts: counts }
  }, [cardsHook.cards])

  const openTemplateMenu = () => {
    setShowTemplateMenu(true)
  }

  const handleCreateCard = (category, templateKey) => {
    cardsHook.addCardFromTemplate(category, templateKey)
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
      cards: cardsHook.cards,
      categories: categoriesHook.categories,
      skills: skillsHook.skills,
      skillLevels: skillLevelsHook.skillLevels
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
        localStorage.setItem(STORAGE_KEYS.LAST_EXPORT_FILENAME, fileHandle.name)
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

    if (file.size > FILE_CONSTRAINTS.MAX_IMPORT_SIZE) {
      const maxSizeMb = Math.ceil(FILE_CONSTRAINTS.MAX_IMPORT_SIZE / (1024 * 1024))
      alert(`Import file is too large. Maximum size is ${maxSizeMb} MB.`)
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)
        const warnings = []

        // Handle old format (array of cards) or new format (object with cards, categories, skills, skillLevels)
        if (Array.isArray(importedData)) {
          // Old format - just cards
          const result = cardsHook.importCards(importedData)
          if (result.warning) warnings.push(result.warning)
          warnings.push('Legacy format detected: categories, skills, and skill levels were not imported.')
        } else if (importedData.cards && Array.isArray(importedData.cards)) {
          // New format - import all fields
          const cardsResult = cardsHook.importCards(importedData.cards)
          if (cardsResult.warning) warnings.push(cardsResult.warning)

          // Import categories
          if (importedData.categories) {
            const categoriesResult = categoriesHook.importCategories(importedData.categories)
            if (!categoriesResult.success && categoriesResult.warning) {
              warnings.push(categoriesResult.warning)
            }
          }

          // Import skills
          if (importedData.skills) {
            const skillsResult = skillsHook.importSkills(importedData.skills)
            if (!skillsResult.success && skillsResult.warning) {
              warnings.push(skillsResult.warning)
            }
          }

          // Import skill levels
          if (importedData.skillLevels) {
            const skillLevelsResult = skillLevelsHook.importSkillLevels(importedData.skillLevels)
            if (!skillLevelsResult.success && skillLevelsResult.warning) {
              warnings.push(skillLevelsResult.warning)
            }
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
      cardsHook.resetCards()
      categoriesHook.resetCategories()
      skillsHook.resetSkills()
      skillLevelsHook.resetSkillLevels()
      theme.resetTheme()
      setLastExportFilename('')
      localStorage.removeItem(STORAGE_KEYS.LAST_EXPORT_FILENAME)
    }
  }

  const handleDeleteCategory = (categoryName) => {
    const cardCount = cardCounts.get(categoryName) || 0
    if (cardCount > 0) {
      alert(`Cannot delete category "${categoryName}" because it contains ${cardCount} card(s). Please move or delete the cards first.`)
      return
    }

    if (window.confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      const result = categoriesHook.deleteCategory(categoryName, cardCount)
      if (!result.success && result.message) {
        alert(result.message)
      }
    }
  }

  return (
    <div className={`app ${theme.isDark ? 'dark-mode' : ''}`}>
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
            onClick={() => { theme.cycleThemeMode(); setShowMobileMenu(false); }}
            className="action-btn darkmode-btn"
            title={theme.getThemeTitle()}
          >
            {theme.getThemeIcon()}
          </button>
        </div>
      </header>

      {categoriesHook.categories.map(category => {
        const cardsForCategory = cardsByCategory.get(category) || []
        const cardCount = cardCounts.get(category) || 0

        return (
          <div key={category} className={`category-section ${categoriesHook.isCategoryCollapsed(category) ? 'collapsed' : ''}`}>
            <div
              className="category-header"
              style={{ backgroundColor: categoriesHook.getCategoryColorWithDefaults(category), cursor: 'pointer' }}
              onClick={() => categoriesHook.toggleCategoryCollapse(category)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem', transition: 'transform 0.2s', transform: categoriesHook.isCategoryCollapsed(category) ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                  ▼
                </span>
                <h2>{category}</h2>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteCategory(category)
                }}
                className="delete-category-btn"
                title={cardCount > 0 ? 'Cannot delete category with cards' : 'Delete category'}
              >
                ×
              </button>
            </div>

            {!categoriesHook.isCategoryCollapsed(category) && (
              <ErrorBoundary>
                <div className="cards-container">
                  {cardsForCategory.length === 0 ? (
                    <p className="empty-category-message">
                      Click the <strong>Add Card</strong> button above to add a card to this category
                    </p>
                  ) : (
                    cardsForCategory.map(card => (
                      <Card
                        key={card.id}
                        card={card}
                        onUpdate={cardsHook.updateCard}
                        onDelete={cardsHook.deleteCard}
                        onDuplicate={cardsHook.duplicateCard}
                        skills={skillsHook.skills}
                        skillLevels={skillLevelsHook.skillLevels}
                        categories={categoriesHook.categories}
                      />
                    ))
                  )}
                </div>
              </ErrorBoundary>
            )}
          </div>
        )
      })}

      <TemplateModal
        isOpen={showTemplateMenu}
        onClose={() => setShowTemplateMenu(false)}
        categories={categoriesHook.categories}
        onCreateCard={handleCreateCard}
        defaultCategory={categoriesHook.categories[0] || ''}
      />

      <CategoryModal
        isOpen={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        onAddCategory={(name) => {
          const result = categoriesHook.addCategory(name)
          if (result) {
            setShowAddCategory(false)
            return true
          }
          return false
        }}
      />

      <SkillsAdminModal
        isOpen={showSkillsAdmin}
        onClose={() => setShowSkillsAdmin(false)}
        skills={skillsHook.skills}
        onAddSkill={skillsHook.addSkill}
        onDeleteSkill={(skillName) => {
          if (window.confirm(`Are you sure you want to delete the skill "${skillName}"?`)) {
            skillsHook.deleteSkill(skillName)
          }
        }}
      />

      <SkillLevelsAdminModal
        isOpen={showSkillLevelsAdmin}
        onClose={() => setShowSkillLevelsAdmin(false)}
        skillLevels={skillLevelsHook.skillLevels}
        onAddLevelAtTop={skillLevelsHook.addSkillLevelAtTop}
        onAddLevelAtBottom={skillLevelsHook.addSkillLevelAtBottom}
        onDeleteLevel={(levelValue) => {
          const level = skillLevelsHook.getSkillLevelByValue(levelValue)
          if (!level) return
          if (window.confirm(`Are you sure you want to delete the skill level "${level.label}"?`)) {
            skillLevelsHook.deleteSkillLevel(levelValue)
          }
        }}
        onUpdateLabel={skillLevelsHook.updateSkillLevelLabel}
      />
    </div>
  )
}

export default App
