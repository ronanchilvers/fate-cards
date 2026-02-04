import { iconMap } from './iconMap'

const DEFAULT_SIZE = 16
const DEFAULT_STROKE = 1.75

function Icon({
  name,
  size = DEFAULT_SIZE,
  className = '',
  ariaLabel,
  ariaHidden,
  title,
  strokeWidth = DEFAULT_STROKE,
  ...rest
}) {
  const LucideIcon = iconMap[name]

  if (!LucideIcon) return null

  const explicitAriaHidden = rest['aria-hidden']
  const shouldHide = ariaLabel ? false : (ariaHidden ?? explicitAriaHidden ?? true)
  const { ['aria-hidden']: _ariaHidden, ...svgProps } = rest

  return (
    <LucideIcon
      size={size}
      className={className || undefined}
      strokeWidth={strokeWidth}
      aria-label={ariaLabel}
      aria-hidden={shouldHide}
      role={ariaLabel ? 'img' : undefined}
      title={title}
      {...svgProps}
    />
  )
}

export default Icon
