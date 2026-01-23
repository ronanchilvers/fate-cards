import { useState, useEffect, useRef } from 'react'
import './App.css'
import Card from './components/Card'

function App() {
  const [cards, setCards] = useState([])
  const [categories, setCategories] = useState(['PCs', 'NPCs', 'Scenes'])
  const [skills, setSkills] = useState([
    'Athletics', 'Burglary', 'Contacts', 'Crafts', 'Deceive', 'Drive',
    'Empathy', 'Fight', 'Investigate', 'Lore', 'Notice', 'Physique',
    'Provoke', 'Rapport', 'Resources', 'Shoot', 'Stealth', 'Will'
  ])
  const [showTemplateMenu, setShowTemplateMenu] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showSkillsAdmin, setShowSkillsAdmin] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const fileInputRef = useRef(null)

  // Load cards, categories, skills, and dark mode from localStorage on mount
  useEffect(() => {
    const savedCards = localStorage.getItem('fate-cards')
    const savedCategories = localStorage.getItem('fate-categories')
    const savedSkills = localStorage.getItem('fate-skills')
    const savedDarkMode = localStorage.getItem('fate-darkmode')
    
    if (savedCards) {
      setCards(JSON.parse(savedCards))
    } else {
      // Initialize with sample data
      setCards([
        {
          id: '1',
          category: 'PCs',
          color: '#c53030',
          title: 'Darv',
          subtitle: 'Insatiably curious explorer with a flair for electronics',
          elements: [
            {
              id: '1-1',
              type: 'high-concept',
              text: 'Insatiably curious explorer with a flair for electronics'
            },
            {
              id: '1-2',
              type: 'trouble',
              text: 'I always have to see for myself'
            },
            {
              id: '1-3',
              type: 'aspects',
              items: ['Excellent Lateral Thinker', 'I Notice What Others Miss', 'Good Pilot']
            },
            {
              id: '1-4',
              type: 'skills',
              items: [
                { name: 'Notice', rating: 4 },
                { name: 'Investigate', rating: 3 },
                { name: 'Crafts', rating: 3 },
                { name: 'Physique', rating: 2 },
                { name: 'Will', rating: 2 },
                { name: 'Lore', rating: 2 },
                { name: 'Deceive', rating: 1 },
                { name: 'Shoot', rating: 1 },
                { name: 'Rapport', rating: 1 },
                { name: 'Resources', rating: 1 }
              ]
            },
            {
              id: '1-5',
              type: 'stress-tracks',
              physical: [false, false, false, false],
              mental: [false, false, false, false]
            },
            {
              id: '1-6',
              type: 'consequences',
              mild: { slots: 2, text: '---' },
              moderate: { slots: 4, text: '---' },
              severe: { slots: 6, text: '---' }
            },
            {
              id: '1-7',
              type: 'fate-points',
              current: 3,
              refresh: 3
            }
          ]
        }
      ])
    }
    
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories))
    }
    
    if (savedSkills) {
      setSkills(JSON.parse(savedSkills))
    }
    
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true')
    }
    
    setIsLoaded(true)
  }, [])

  // Save cards to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fate-cards', JSON.stringify(cards))
    }
  }, [cards, isLoaded])

  // Save categories to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fate-categories', JSON.stringify(categories))
    }
  }, [categories, isLoaded])

  // Save skills to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fate-skills', JSON.stringify(skills))
    }
  }, [skills, isLoaded])

  // Save dark mode to localStorage whenever it changes (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fate-darkmode', darkMode.toString())
    }
  }, [darkMode, isLoaded])

  const addCard = (category) => {
    const newCard = {
      id: Date.now().toString(),
      category,
      color: getCategoryColor(category),
      title: 'New Card',
      subtitle: '',
      elements: [],
      layout: 'auto'
    }
    setCards([...cards, newCard])
  }

  const addTemplateCard = (category, template) => {
    const templates = {
      'standard-pc': {
        title: 'New Character',
        subtitle: 'Player Character',
        elements: [
          {
            id: Date.now().toString() + '-1',
            type: 'high-concept',
            text: ''
          },
          {
            id: Date.now().toString() + '-2',
            type: 'trouble',
            text: ''
          },
          {
            id: Date.now().toString() + '-3',
            type: 'aspects',
            items: ['', '', '']
          },
          {
            id: Date.now().toString() + '-4',
            type: 'skills',
            items: []
          },
          {
            id: Date.now().toString() + '-5',
            type: 'stress-tracks',
            physical: [false, false, false, false],
            mental: [false, false, false, false]
          },
          {
            id: Date.now().toString() + '-6',
            type: 'consequences',
            mild: { slots: 2, text: '---' },
            moderate: { slots: 4, text: '---' },
            severe: { slots: 6, text: '---' }
          },
          {
            id: Date.now().toString() + '-7',
            type: 'fate-points',
            current: 3,
            refresh: 3
          }
        ]
      },
      'quick-npc': {
        title: 'New NPC',
        subtitle: 'Non-Player Character',
        elements: [
          {
            id: Date.now().toString() + '-1',
            type: 'high-concept',
            text: ''
          },
          {
            id: Date.now().toString() + '-2',
            type: 'trouble',
            text: ''
          },
          {
            id: Date.now().toString() + '-3',
            type: 'aspects',
            items: ['']
          },
          {
            id: Date.now().toString() + '-4',
            type: 'skills',
            items: []
          },
          {
            id: Date.now().toString() + '-5',
            type: 'stress-tracks',
            physical: [false, false, false, false],
            mental: [false, false, false, false]
          },
          {
            id: Date.now().toString() + '-6',
            type: 'consequences',
            mild: { slots: 2, text: '---' },
            moderate: { slots: 4, text: '---' },
            severe: { slots: 6, text: '---' }
          }
        ]
      },
      'scene': {
        title: 'New Scene',
        subtitle: 'Location or Situation',
        elements: [
          {
            id: Date.now().toString() + '-1',
            type: 'high-concept',
            text: ''
          },
          {
            id: Date.now().toString() + '-2',
            type: 'aspects',
            items: ['', '']
          },
          {
            id: Date.now().toString() + '-3',
            type: 'note',
            text: ''
          }
        ]
      },
      'blank': {
        title: 'New Card',
        subtitle: '',
        elements: []
      }
    }

    const templateData = templates[template] || templates['blank']
    const newCard = {
      id: Date.now().toString(),
      category,
      color: getCategoryColor(category),
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
      ...JSON.parse(JSON.stringify(cardToDuplicate)), // Deep clone
      id: Date.now().toString(),
      title: cardToDuplicate.title + ' (Copy)',
      locked: false, // Unlock the duplicate
      elements: cardToDuplicate.elements.map(el => ({
        ...el,
        id: Date.now().toString() + '-' + Math.random()
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

  const getCategoryColor = (category) => {
    // Generate a consistent color based on category name
    const defaultColors = {
      'PCs': '#c53030',
      'NPCs': '#2c5282',
      'Scenes': '#ed8936'
    }
    
    if (defaultColors[category]) {
      return defaultColors[category]
    }
    
    // Generate a color based on the category name hash
    let hash = 0
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    const hue = Math.abs(hash % 360)
    const saturation = 60 + (Math.abs(hash) % 20) // 60-80%
    const lightness = 35 + (Math.abs(hash >> 8) % 15) // 35-50%
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
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

  const exportCards = () => {
    const dataStr = JSON.stringify(cards, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `fate-cards-${new Date().toISOString().split('T')[0]}.json`
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
        const importedCards = JSON.parse(e.target.result)
        if (Array.isArray(importedCards)) {
          setCards(importedCards)
          alert(`Successfully imported ${importedCards.length} card(s)!`)
        } else {
          alert('Invalid file format. Please select a valid Fate Cards JSON file.')
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

  const openTemplateMenu = () => {
    setSelectedCategory(categories[0] || '')
    setShowTemplateMenu(true)
  }

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <header className="app-header">
        <h1>Fate RPG Cards</h1>
        <div className="app-actions">
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="action-btn darkmode-btn"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={openTemplateMenu} className="action-btn add-card-header">
            ➕ Add Card
          </button>
          <button onClick={() => setShowAddCategory(true)} className="action-btn category-btn">
            ➕ Add Category
          </button>
          <button onClick={() => setShowSkillsAdmin(true)} className="action-btn skills-btn">
            🎯 Manage Skills
          </button>
          <button onClick={exportCards} className="action-btn export-btn">
            💾 Export Cards
          </button>
          <button onClick={triggerImport} className="action-btn import-btn">
            📁 Import Cards
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={importCards}
            style={{ display: 'none' }}
          />
        </div>
      </header>
      
      {categories.map(category => (
        <div key={category} className="category-section">
          <div className="category-header" style={{ backgroundColor: getCategoryColor(category) }}>
            <h2>{category}</h2>
            <button 
              onClick={() => deleteCategory(category)}
              className="delete-category-btn"
              title={cards.filter(c => c.category === category).length > 0 ? 'Cannot delete category with cards' : 'Delete category'}
            >
              ×
            </button>
          </div>
          
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
                    categories={categories}
                  />
                ))
            )}
          </div>
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
    </div>
  )
}

export default App