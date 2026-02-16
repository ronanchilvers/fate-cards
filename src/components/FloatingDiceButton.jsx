import { useState } from 'react'
import Icon from './icons/Icon'
import './FloatingDiceButton.css'

const formatSignedValue = (value) => {
  return value > 0 ? `+${value}` : `${value}`
}

function FloatingDiceButton({ onClick, disabled = false, isDark = false, modifiers = [] }) {
  const [isPressed, setIsPressed] = useState(false)
  const safeModifiers = Array.isArray(modifiers) ? modifiers : []

  const handleClick = () => {
    if (disabled) return
    setIsPressed(true)
    onClick?.()
    setTimeout(() => setIsPressed(false), 200)
  }

  const handleKeyDown = (e) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div className="floating-dice-control">
      {safeModifiers.length > 0 && (
        <div className="floating-modifier-stack" aria-live="polite">
          {safeModifiers.map((modifier) => {
            const label = typeof modifier?.label === 'string' && modifier.label.trim()
              ? modifier.label.trim()
              : 'Modifier'
            const value = Number.isFinite(modifier?.value) ? modifier.value : 2
            const key = typeof modifier?.id === 'string' && modifier.id ? modifier.id : `${label}-${value}`
            return (
              <div key={key} className="floating-modifier-item" title={`${label} ${formatSignedValue(value)}`}>
                <span className="floating-modifier-label">{label}</span>
                <span className="floating-modifier-value">{formatSignedValue(value)}</span>
              </div>
            )
          })}
        </div>
      )}
      <button
        className={`floating-dice-button ${disabled ? 'is-disabled' : ''} ${isPressed ? 'is-pressed' : ''}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label="Roll Fate Dice"
        aria-disabled={disabled}
        title="Roll Fate Dice"
        type="button"
      >
        <Icon name="rollDice" className="floating-dice-icon" aria-hidden="true" />
      </button>
    </div>
  )
}

export default FloatingDiceButton
