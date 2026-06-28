import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const cardCss = fs.readFileSync(path.resolve(__dirname, 'Card.css'), 'utf8')

describe('Card dark mode text colors', () => {
  it('keeps locked inventory, note, and consequence fields readable when disabled', () => {
    expect(cardCss).toContain(`.dark-mode .card-element.locked .element-input:disabled,
.dark-mode .card-element.locked .element-textarea:disabled,
.dark-mode .card-element.locked .consequence-text-locked:disabled {
  color: var(--slate-100);
}`)
  })
})
