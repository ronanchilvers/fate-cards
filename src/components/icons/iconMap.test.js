import { describe, it, expect } from 'vitest'
import { iconMap } from './iconMap'

describe('iconMap', () => {
  it('exports a non-empty icon map', () => {
    expect(iconMap).toBeDefined()
    expect(typeof iconMap).toBe('object')
    expect(Object.keys(iconMap).length).toBeGreaterThan(0)
  })

  it('maps expected keys to components', () => {
    const requiredKeys = [
      'add',
      'remove',
      'close',
      'delete',
      'settings',
      'duplicate',
      'lock',
      'unlock',
      'themeLight',
      'themeDark',
      'themeAuto',
      'chevronDown',
      'chevronRight',
      'dragHandle',
      'skills',
      'skillLevels',
      'export',
      'import',
      'reset',
      'templateStandard',
      'templateQuick',
      'templateScene',
      'templateBlank',
      'rollDice',
      'aspectBullet',
      'fatePoint',
      'fatePointFilled',
      'fatePointEmpty',
      'warning'
    ]

    requiredKeys.forEach((key) => {
      expect(iconMap[key]).toBeDefined()
      expect(['function', 'object']).toContain(typeof iconMap[key])
    })
  })
})