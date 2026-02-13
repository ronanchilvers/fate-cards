import { render } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import FateDiceRoller from './FateDiceRoller'

vi.mock('three', () => ({
  Vector3: class Vector3 {
    constructor() {}
    clone() { return this }
    applyQuaternion() { return this }
    dot() { return 0 }
  },
  SRGBColorSpace: 'srgb',
  VSMShadowMap: 'vsm'
}))

vi.mock('cannon-es', () => ({}))

vi.mock('three-stdlib', () => ({
  RoundedBoxGeometry: function RoundedBoxGeometry() {}
}))

describe('FateDiceRoller', () => {
  let originalGetContext

  beforeEach(() => {
    originalGetContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null)
  })

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext
  })

  it('renders the roller container and stage', () => {
    const { container } = render(<FateDiceRoller rollId={0} />)

    const wrapper = container.querySelector('.fate-dice-roller')
    const stage = container.querySelector('.fate-dice-stage')

    expect(wrapper).toBeInTheDocument()
    expect(stage).toBeInTheDocument()
    expect(wrapper).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders without crashing when rollId changes', () => {
    const { rerender, container } = render(<FateDiceRoller rollId={0} />)
    rerender(<FateDiceRoller rollId={1} />)

    const wrapper = container.querySelector('.fate-dice-roller')
    expect(wrapper).toBeInTheDocument()
  })
})