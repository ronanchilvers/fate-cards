import { useState, useEffect, useRef } from 'react'
import './App.css'
import Card from './components/Card'
import { normalizeCards } from './utils/cardSchema'

function App() {
  const [cards, setCards] = useState([])
  const [categories, setCategories] = useState(['PCs', 'NPCs', 'Scenes'])
  const [skills, setSkills] = useState([
    'Athletics', 'Burglary', 'Contacts', 'Crafts', 'Deceive', 'Drive',
    'Empathy', 'Fight', 'Investigate', 'Lore', 'Notice', 'Physique',
    'Provoke', 'Rapport', 'Resources', 'Shoot', 'Stealth', 'Will'
  ])
  const [skillLevels, setSkillLevels] = useState([
    { label: 'Legendary', value: 8 },
    { label: 'Epic', value: 7 },
    { label: 'Fantastic', value: 6 },
    { label: 'Superb', value: 5 },
    { label: 'Great', value: 4 },
    { label: 'Good', value: 3 },
    { label: 'Fair', value: 2 },
    { label: 'Average', value: 1 },
    { label: 'Mediocre', value: 0 },
    { label: 'Poor', value: -1 },
    { label: 'Terrible', value: -2 },
    { label: 'Catastrophic', value: -3 },
    { label: 'Horrifying', value: -4 }
  ])
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
    const savedCards = localStorage.getItem('fate-cards')
    const savedCategories = localStorage.getItem('fate-categories')
    const savedSkills = localStorage.getItem('fate-skills')
    const savedSkillLevels = localStorage.getItem('fate-skill-levels')
    const savedThemeMode = localStorage.getItem('fate-thememode')
    const savedCollapsedCategories = localStorage.getItem('fate-collapsed-categories')
    const savedLastExportFilename = localStorage.getItem('fate-last-export-filename')

    if (savedCards) {
      try {
        setCards(JSON.parse(savedCards))
      } catch (err) {
        console.error('Failed to parse saved cards:', err)
        localStorage.removeItem('fate-cards')
      }
    } else {
      // Initialize with sample data
      setCards([
        {
          id: '1',
          category: 'PCs',
          color: '#c53030',
          title: 'Darv',
          subtitle: 'Crew member on the survey ship Challenger',
          layout: 'auto',
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
              tracks: [
                { name: 'Physical Stress', boxes: [
                  { checked: false, value: 1 },
                  { checked: false, value: 1 },
                  { checked: false, value: 1 },
                  { checked: false, value: 1 }
                ]},
                { name: 'Mental Stress', boxes: [
                  { checked: false, value: 1 },
                  { checked: false, value: 1 },
                  { checked: false, value: 1 },
                  { checked: false, value: 1 }
                ]}
              ]
            },
            {
              id: '1-6',
              type: 'consequences',
              items: [
                { label: 'Mild (2)', text: '---' },
                { label: 'Moderate (4)', text: '---' },
                { label: 'Severe (6)', text: '---' }
              ]
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
      try {
        setCategories(JSON.parse(savedCategories))
      } catch (err) {
        console.error('Failed to parse saved categories:', err)
        localStorage.removeItem('fate-categories')
      }
    }

    if (savedSkills) {
      try {
        setSkills(JSON.parse(savedSkills))
      } catch (err) {
        console.error('Failed to parse saved skills:', err)
        localStorage.removeItem('fate-skills')
      }
    }

    if (savedSkillLevels) {
      try {
        setSkillLevels(JSON.parse(savedSkillLevels))
      } catch (err) {
        console.error('Failed to parse saved skill levels:', err)
        localStorage.removeItem('fate-skill-levels')
      }
    }

    if (savedThemeMode) {
      setThemeMode(savedThemeMode)
    }

    if (savedCollapsedCategories) {
      try {
        setCollapsedCategories(JSON.parse(savedCollapsedCategories))
      } catch (err) {
        console.error('Failed to parse saved collapsed categories:', err)
        localStorage.removeItem('fate-collapsed-categories')
      }
    }

    if (savedLastExportFilename) {
      setLastExportFilename(savedLastExportFilename)
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

  // Save skill levels to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fate-skill-levels', JSON.stringify(skillLevels))
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
      localStorage.setItem('fate-collapsed-categories', JSON.stringify(collapsedCategories))
    }
  }, [collapsedCategories, isLoaded])

  // Save last export filename to localStorage whenever it changes (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fate-last-export-filename', lastExportFilename)
    }
  }, [lastExportFilename, isLoaded])

  // Listen to system theme preference and update isDark
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const updateDarkMode = () => {
      if (themeMode === 'system') {
        setIsDark(mediaQuery.matches)
      } else if (themeMode === 'dark') {
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
            tracks: [
              { name: 'Physical Stress', boxes: [
                { checked: false, value: 1 },
                { checked: false, value: 1 },
                { checked: false, value: 1 },
                { checked: false, value: 1 }
              ]},
              { name: 'Mental Stress', boxes: [
                { checked: false, value: 1 },
                { checked: false, value: 1 },
                { checked: false, value: 1 },
                { checked: false, value: 1 }
              ]}
            ]
          },
          {
            id: Date.now().toString() + '-6',
            type: 'consequences',
            items: [
              { label: 'Mild (2)', text: '---' },
              { label: 'Moderate (4)', text: '---' },
              { label: 'Severe (6)', text: '---' }
            ]
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
          {
            id: Date.now().toString() + '-6',
            type: 'consequences',
            items: [
              { label: 'Mild (2)', text: '---' },
              { label: 'Moderate (4)', text: '---' },
              { label: 'Severe (6)', text: '---' }
            ]
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

        // Handle old format (array of cards) or new format (object with cards, skills, skillLevels)
        if (Array.isArray(importedData)) {
          // Old format - just cards; validate and normalize before setting
          const validCards = normalizeCards(importedData)
          if (validCards.length < importedData.length) {
            alert(`${importedData.length - validCards.length} invalid cards were skipped during import.`)
          }
          setCards(validCards)
        } else if (importedData.cards && Array.isArray(importedData.cards)) {
          // New format - cards, skills, and skill levels; validate and normalize cards before setting
          const validCards = normalizeCards(importedData.cards)
          if (validCards.length < importedData.cards.length) {
            alert(`${importedData.cards.length - validCards.length} invalid cards were skipped during import.`)
          }
          setCards(validCards)
          if (importedData.skills && Array.isArray(importedData.skills)) {
            setSkills(importedData.skills)
          }
          if (importedData.skillLevels && Array.isArray(importedData.skillLevels)) {
            setSkillLevels(importedData.skillLevels)
          }
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

  const resetAllData = () => {
    if (window.confirm('Are you sure you want to reset all data? This will delete all cards, restore default skills and skill levels, and cannot be undone.')) {
      // Clear localStorage
      localStorage.removeItem('fate-cards')
      localStorage.removeItem('fate-categories')
      localStorage.removeItem('fate-skills')
      localStorage.removeItem('fate-skill-levels')
      localStorage.removeItem('fate-thememode')

      // Reset to defaults
      setCards([])
      setCategories(['PCs', 'NPCs', 'Scenes'])
      setSkills([
        'Athletics', 'Burglary', 'Contacts', 'Crafts', 'Deceive', 'Drive',
        'Empathy', 'Fight', 'Investigate', 'Lore', 'Notice', 'Physique',
        'Provoke', 'Rapport', 'Resources', 'Shoot', 'Stealth', 'Will'
      ])
      setSkillLevels([
        { label: 'Legendary', value: 8 },
        { label: 'Epic', value: 7 },
        { label: 'Fantastic', value: 6 },
        { label: 'Superb', value: 5 },
        { label: 'Great', value: 4 },
        { label: 'Good', value: 3 },
        { label: 'Fair', value: 2 },
        { label: 'Average', value: 1 },
        { label: 'Mediocre', value: 0 },
        { label: 'Poor', value: -1 },
        { label: 'Terrible', value: -2 },
        { label: 'Catastrophic', value: -3 },
        { label: 'Horrifying', value: -4 }
      ])
      setThemeMode('system')
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
    if (themeMode === 'light') {
      setThemeMode('dark')
    } else if (themeMode === 'dark') {
      setThemeMode('system')
    } else {
      setThemeMode('light')
    }
  }

  const getThemeIcon = () => {
    if (themeMode === 'light') return '☀️'
    if (themeMode === 'dark') return '🌙'
    return '💻' // system
  }

  const getThemeTitle = () => {
    if (themeMode === 'light') return 'Light Mode (click for Dark)'
    if (themeMode === 'dark') return 'Dark Mode (click for System)'
    return 'System Mode (click for Light)'
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
            style={{ backgroundColor: getCategoryColor(category), cursor: 'pointer' }}
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
