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

// Theme modes
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
}
