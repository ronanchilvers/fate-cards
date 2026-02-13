import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FILE_CONSTRAINTS, STORAGE_KEYS } from './constants'

vi.mock('./hooks', () => ({
  useTheme: vi.fn(),
  useSkills: vi.fn(),
  useSkillLevels: vi.fn(),
  useCategories: vi.fn(),
  useCards: vi.fn(),
  useToast: vi.fn()
}))

vi.mock('./components/Card', () => ({
  default: ({ card, onDelete }) => (
    <button type="button" onClick={() => onDelete(card.id)} aria-label={`Delete ${card.title}`}>
      Delete card
    </button>
  )
}))

vi.mock('./components/icons/Icon', () => ({
  default: (props) => <span data-testid="icon" {...props} />
}))

vi.mock('./components/FateDiceRoller', () => ({
  default: () => null
}))

vi.mock('./components/FloatingDiceButton', () => ({
  default: () => null
}))

vi.mock('./components/modals', () => ({
  TemplateModal: () => null,
  CategoryModal: () => null,
  SkillsAdminModal: () => null,
  SkillLevelsAdminModal: () => null
}))

import App from './App'
import * as hooks from './hooks'

describe('App', () => {
  let fileReaderInstance

  const createHooks = (overrides = {}) => {
    const theme = {
      isDark: false,
      cycleThemeMode: vi.fn(),
      getThemeTitle: () => 'Theme',
      getThemeIcon: () => 'themeAuto',
      resetTheme: vi.fn()
    }

    const toast = {
      confirm: vi.fn().mockResolvedValue(true),
      diceResult: vi.fn(),
      alert: vi.fn()
    }

    const skillsHook = {
      skills: ['Fight'],
      addSkill: vi.fn(),
      deleteSkill: vi.fn(),
      importSkills: vi.fn().mockReturnValue({ success: true }),
      resetSkills: vi.fn()
    }

    const skillLevelsHook = {
      skillLevels: [{ value: 1, label: 'Fair' }],
      addSkillLevelAtTop: vi.fn(),
      addSkillLevelAtBottom: vi.fn(),
      deleteSkillLevel: vi.fn(),
      getSkillLevelByValue: vi.fn(),
      updateSkillLevelLabel: vi.fn(),
      importSkillLevels: vi.fn().mockReturnValue({ success: true }),
      resetSkillLevels: vi.fn()
    }

    const categoriesHook = {
      categories: ['PCs'],
      addCategory: vi.fn(),
      deleteCategory: vi.fn().mockReturnValue({ success: true }),
      resetCategories: vi.fn(),
      toggleCategoryCollapse: vi.fn(),
      isCategoryCollapsed: vi.fn().mockReturnValue(false),
      getCategoryColorWithDefaults: vi.fn().mockReturnValue('#c53030'),
      importCategories: vi.fn().mockReturnValue({ success: true })
    }

    const cardsHook = {
      cards: [{ id: 'card-1', title: 'Card One', category: 'PCs', color: '#c53030', elements: [] }],
      updateCard: vi.fn(),
      deleteCard: vi.fn(),
      duplicateCard: vi.fn(),
      resetCards: vi.fn(),
      importCards: vi.fn().mockReturnValue({ success: true, count: 1 }),
      getCardsByCategory: vi.fn()
    }

    const resolvedTheme = { ...theme, ...overrides.theme }
    const resolvedToast = { ...toast, ...overrides.toast }
    const resolvedSkillsHook = { ...skillsHook, ...overrides.skillsHook }
    const resolvedSkillLevelsHook = { ...skillLevelsHook, ...overrides.skillLevelsHook }
    const resolvedCategoriesHook = { ...categoriesHook, ...overrides.categoriesHook }
    const resolvedCardsHook = { ...cardsHook, ...overrides.cardsHook }

    hooks.useTheme.mockReturnValue(resolvedTheme)
    hooks.useToast.mockReturnValue(resolvedToast)
    hooks.useSkills.mockReturnValue(resolvedSkillsHook)
    hooks.useSkillLevels.mockReturnValue(resolvedSkillLevelsHook)
    hooks.useCategories.mockReturnValue(resolvedCategoriesHook)
    hooks.useCards.mockReturnValue(resolvedCardsHook)

    return {
      theme: resolvedTheme,
      toast: resolvedToast,
      skillsHook: resolvedSkillsHook,
      skillLevelsHook: resolvedSkillLevelsHook,
      categoriesHook: resolvedCategoriesHook,
      cardsHook: resolvedCardsHook
    }
  }

  beforeEach(() => {
    localStorage.clear()
    fileReaderInstance = null
    function FileReaderMock() {
      fileReaderInstance = { readAsText: vi.fn(), onload: null }
      return fileReaderInstance
    }
    global.FileReader = FileReaderMock
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete window.showSaveFilePicker
  })

  it('exports cards via File System Access API when available', async () => {
    const { cardsHook, categoriesHook, skillsHook, skillLevelsHook } = createHooks()
    const write = vi.fn()
    const close = vi.fn()
    const createWritable = vi.fn().mockResolvedValue({ write, close })
    window.showSaveFilePicker = vi.fn().mockResolvedValue({
      name: 'fate-export.json',
      createWritable
    })

    render(<App />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Export' }))
    })

    expect(window.showSaveFilePicker).toHaveBeenCalled()
    expect(createWritable).toHaveBeenCalled()
    expect(write).toHaveBeenCalled()

    const [payload] = write.mock.calls[0]
    const parsed = JSON.parse(payload)
    expect(parsed.cards).toEqual(cardsHook.cards)
    expect(parsed.categories).toEqual(categoriesHook.categories)
    expect(parsed.skills).toEqual(skillsHook.skills)
    expect(parsed.skillLevels).toEqual(skillLevelsHook.skillLevels)

    expect(localStorage.getItem(STORAGE_KEYS.LAST_EXPORT_FILENAME)).toBe('fate-export.json')
  })

  it('imports legacy card arrays and shows warning', async () => {
    const { cardsHook } = createHooks()
    cardsHook.importCards.mockReturnValue({ success: true, count: 1, warning: 'skipped' })

    const { container } = render(<App />)
    const input = container.querySelector('input[type="file"]')

    const file = new File([JSON.stringify([{ id: '1', title: 'Legacy' }])], 'legacy.json', { type: 'application/json' })
    fireEvent.change(input, { target: { files: [file] } })

    await act(async () => {
      fileReaderInstance.onload({ target: { result: JSON.stringify([{ id: '1', title: 'Legacy' }]) } })
    })

    expect(cardsHook.importCards).toHaveBeenCalled()
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Legacy format detected'))
  })

  it('imports new format and aggregates warnings', async () => {
    const { cardsHook, categoriesHook, skillsHook, skillLevelsHook } = createHooks()
    cardsHook.importCards.mockReturnValue({ success: true, count: 1, warning: 'Cards warning' })
    categoriesHook.importCategories.mockReturnValue({ success: false, warning: 'Categories warning' })
    skillsHook.importSkills = vi.fn().mockReturnValue({ success: false, warning: 'Skills warning' })
    skillLevelsHook.importSkillLevels = vi.fn().mockReturnValue({ success: false, warning: 'Levels warning' })

    const { container } = render(<App />)
    const input = container.querySelector('input[type="file"]')
    const payload = {
      cards: [{ id: '1', title: 'Card' }],
      categories: ['PCs'],
      skills: ['Fight'],
      skillLevels: [{ label: 'Fair', value: 1 }]
    }

    fireEvent.change(input, { target: { files: [new File([JSON.stringify(payload)], 'data.json', { type: 'application/json' })] } })

    await act(async () => {
      fileReaderInstance.onload({ target: { result: JSON.stringify(payload) } })
    })

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Import completed with warnings'))
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Cards warning'))
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Categories warning'))
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Skills warning'))
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Levels warning'))
  })

  it('alerts on invalid JSON during import', async () => {
    createHooks()

    const { container } = render(<App />)
    const input = container.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [new File(['{'], 'bad.json', { type: 'application/json' })] } })

    await act(async () => {
      fileReaderInstance.onload({ target: { result: '{' } })
    })

    expect(window.alert).toHaveBeenCalledWith('Error reading file. Please make sure it is a valid JSON file.')
  })

  it('resets all data after confirmation', async () => {
    const { cardsHook, categoriesHook, skillsHook, skillLevelsHook, theme, toast } = createHooks()
    localStorage.setItem(STORAGE_KEYS.LAST_EXPORT_FILENAME, 'old.json')

    render(<App />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    })

    expect(toast.confirm).toHaveBeenCalled()
    expect(cardsHook.resetCards).toHaveBeenCalled()
    expect(categoriesHook.resetCategories).toHaveBeenCalled()
    expect(skillsHook.resetSkills).toHaveBeenCalled()
    expect(skillLevelsHook.resetSkillLevels).toHaveBeenCalled()
    expect(theme.resetTheme).toHaveBeenCalled()
    expect(localStorage.getItem(STORAGE_KEYS.LAST_EXPORT_FILENAME)).toBeNull()
  })

  it('blocks category deletion when cards exist', async () => {
    const { toast, categoriesHook } = createHooks({
      cardsHook: {
        cards: [{ id: 'card-1', title: 'Card One', category: 'PCs', color: '#c53030', elements: [] }],
        updateCard: vi.fn(),
        deleteCard: vi.fn(),
        duplicateCard: vi.fn(),
        resetCards: vi.fn(),
        importCards: vi.fn().mockReturnValue({ success: true, count: 1 })
      }
    })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Cannot delete category with cards' }))

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Cannot delete category'))
    expect(toast.confirm).not.toHaveBeenCalled()
    expect(categoriesHook.deleteCategory).not.toHaveBeenCalled()
  })

  it('deletes category after confirmation when empty', async () => {
    const { categoriesHook, toast } = createHooks({
      cardsHook: {
        cards: [],
        updateCard: vi.fn(),
        deleteCard: vi.fn(),
        duplicateCard: vi.fn(),
        resetCards: vi.fn(),
        importCards: vi.fn().mockReturnValue({ success: true, count: 0 })
      }
    })

    render(<App />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Delete category' }))
    })

    expect(toast.confirm).toHaveBeenCalled()
    expect(categoriesHook.deleteCategory).toHaveBeenCalledWith('PCs', 0)
  })

  it('deletes a card after confirmation', async () => {
    const { cardsHook, toast } = createHooks()

    render(<App />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Delete Card One' }))
    })

    expect(toast.confirm).toHaveBeenCalled()
    expect(cardsHook.deleteCard).toHaveBeenCalledWith('card-1')
  })

  it('rejects oversized imports before reading the file', () => {
    createHooks()
    const { container } = render(<App />)
    const input = container.querySelector('input[type="file"]')

    const oversizeBytes = FILE_CONSTRAINTS.MAX_IMPORT_SIZE + 1
    const oversizeFile = new File(
      [new ArrayBuffer(oversizeBytes)],
      'oversize.json',
      { type: 'application/json' }
    )

    fireEvent.change(input, { target: { files: [oversizeFile] } })

    const maxSizeMb = Math.ceil(FILE_CONSTRAINTS.MAX_IMPORT_SIZE / (1024 * 1024))
    expect(window.alert).toHaveBeenCalledWith(
      `Import file is too large. Maximum size is ${maxSizeMb} MB.`
    )
  })
})