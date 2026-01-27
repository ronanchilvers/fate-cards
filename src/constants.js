/**
 * Application-wide constants for Fate Cards
 * Centralizes magic strings to improve maintainability and reduce errors
 */

// localStorage keys
export const STORAGE_KEYS = {
  CARDS: 'fate-cards',
  CATEGORIES: 'fate-categories',
  SKILLS: 'fate-skills',
  SKILL_LEVELS: 'fate-skill-levels',
  THEME_MODE: 'fate-thememode',
  COLLAPSED_CATEGORIES: 'fate-collapsed-categories',
  LAST_EXPORT_FILENAME: 'fate-last-export-filename'
}

// Card element types
export const ELEMENT_TYPES = {
  HIGH_CONCEPT: 'high-concept',
  TROUBLE: 'trouble',
  ASPECTS: 'aspects',
  SKILLS: 'skills',
  STRESS_TRACKS: 'stress-tracks',
  CONSEQUENCES: 'consequences',
  NOTE: 'note',
  FATE_POINTS: 'fate-points',
  GAME_TOOLS: 'game-tools' // Currently unused - consider removing if not planned
}

// Card layout options
export const LAYOUTS = {
  AUTO: 'auto',
  SINGLE_COLUMN: 'single-column',
  TWO_COLUMN: '2-column'
}

// Theme modes
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
}

// Card template keys
export const TEMPLATE_KEYS = {
  STANDARD_PC: 'standard-pc',
  QUICK_NPC: 'quick-npc',
  CONDENSED_PC: 'condensed-pc',
  LOCATION: 'location',
  ORGANIZATION: 'organization',
  BLANK: 'blank'
}

// Default category colors (matching defaults.js)
export const DEFAULT_CATEGORY_COLORS = {
  PLAYER_CHARACTERS: '#4a90e2',
  NPCS: '#e74c3c',
  LOCATIONS: '#27ae60',
  ORGANIZATIONS: '#9b59b6',
  UNCATEGORIZED: '#95a5a6'
}

// Default category names
export const DEFAULT_CATEGORY_NAMES = {
  PLAYER_CHARACTERS: 'Player Characters',
  NPCS: 'NPCs',
  LOCATIONS: 'Locations',
  ORGANIZATIONS: 'Organizations',
  UNCATEGORIZED: 'Uncategorized'
}

// File constraints
export const FILE_CONSTRAINTS = {
  MAX_IMPORT_SIZE: 5 * 1024 * 1024, // 5MB
  EXPORT_EXTENSION: '.json',
  EXPORT_MIME_TYPE: 'application/json'
}

// Skill system defaults
export const SKILL_DEFAULTS = {
  MIN_RATING: 0,
  MAX_RATING: 8,
  DEFAULT_RATING: 1
}