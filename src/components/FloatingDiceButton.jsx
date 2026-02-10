import { useState } from 'react'
import Icon from './icons/Icon'
import './FloatingDiceButton.css'

function FloatingDiceButton({ onClick, disabled = false, isDark = false }) {
  const [isPressed, setIsPressed] = useState(false)

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
  )
}

export default FloatingDiceButton