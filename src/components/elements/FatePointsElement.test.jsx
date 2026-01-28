import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FatePointsElement from './FatePointsElement'

describe('FatePointsElement', () => {
  const defaultProps = {
    element: { id: '1', type: 'fate-points', current: 3, refresh: 3 },
    isLocked: false,
    onUpdate: vi.fn(),
    onDelete: vi.fn()
  }

  it('should render correct number of fate point tokens', () => {
    render(<FatePointsElement {...defaultProps} />)
    const filled = screen.getAllByText('●')
    expect(filled).toHaveLength(3)
  })

  it('should render title', () => {
    render(<FatePointsElement {...defaultProps} />)
    expect(screen.getByText('Fate Points')).toBeInTheDocument()
  })

  it('should decrement current when minus clicked', () => {
    const onUpdate = vi.fn()
    render(<FatePointsElement {...defaultProps} onUpdate={onUpdate} />)
    fireEvent.click(screen.getByText('-'))
    expect(onUpdate).toHaveBeenCalledWith({ current: 2 })
  })

  it('should increment current when plus clicked', () => {
    const onUpdate = vi.fn()
    render(<FatePointsElement {...defaultProps} onUpdate={onUpdate} />)
    fireEvent.click(screen.getByText('+'))
    expect(onUpdate).toHaveBeenCalledWith({ current: 4 })
  })

  it('should update refresh when changed', () => {
    const onUpdate = vi.fn()
    render(<FatePointsElement {...defaultProps} onUpdate={onUpdate} />)
    fireEvent.change(screen.getByDisplayValue('3'), { target: { value: '5' } })
    expect(onUpdate).toHaveBeenCalledWith({ refresh: 5 })
  })

  it('should show empty tokens when current < refresh', () => {
    const props = { ...defaultProps, element: { ...defaultProps.element, current: 1 } }
    render(<FatePointsElement {...props} />)
    expect(screen.getAllByText('●')).toHaveLength(1)
    expect(screen.getAllByText('○')).toHaveLength(2)
  })

  it('should show extra tokens when current > refresh', () => {
    const props = { ...defaultProps, element: { ...defaultProps.element, current: 5, refresh: 3 } }
    render(<FatePointsElement {...props} />)
    expect(screen.getAllByText('●')).toHaveLength(5)
  })

  it('should hide controls when locked', () => {
    render(<FatePointsElement {...defaultProps} isLocked={true} />)
    expect(screen.queryByText('-')).not.toBeInTheDocument()
    expect(screen.queryByText('+')).not.toBeInTheDocument()
  })

  it('should show refresh label when locked', () => {
    render(<FatePointsElement {...defaultProps} isLocked={true} />)
    expect(screen.getByText('Refresh 3')).toBeInTheDocument()
  })

  it('should hide delete button when locked', () => {
    render(<FatePointsElement {...defaultProps} isLocked={true} />)
    expect(screen.queryByRole('button', { name: /Delete Fate Points/i })).not.toBeInTheDocument()
  })

  it('should show delete button when unlocked', () => {
    render(<FatePointsElement {...defaultProps} />)
    expect(screen.getByRole('button', { name: /Delete Fate Points/i })).toBeInTheDocument()
  })

  it('should call onDelete when delete clicked', () => {
    const onDelete = vi.fn()
    render(<FatePointsElement {...defaultProps} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: /Delete Fate Points/i }))
    expect(onDelete).toHaveBeenCalled()
  })

  it('should prevent decrement below zero', () => {
    const onUpdate = vi.fn()
    const props = { ...defaultProps, element: { ...defaultProps.element, current: 0 } }
    render(<FatePointsElement {...props} onUpdate={onUpdate} />)
    fireEvent.click(screen.getByText('-'))
    expect(onUpdate).toHaveBeenCalledWith({ current: 0 })
  })

  it('should allow increment beyond refresh', () => {
    const onUpdate = vi.fn()
    render(<FatePointsElement {...defaultProps} onUpdate={onUpdate} />)
    fireEvent.click(screen.getByText('+'))
    expect(onUpdate).toHaveBeenCalledWith({ current: 4 })
  })

  it('should clamp refresh between 0 and 10', () => {
    const onUpdate = vi.fn()
    render(<FatePointsElement {...defaultProps} onUpdate={onUpdate} />)
    fireEvent.change(screen.getByDisplayValue('3'), { target: { value: '15' } })
    expect(onUpdate).toHaveBeenCalledWith({ refresh: 10 })
  })

  it('should handle negative refresh input', () => {
    const onUpdate = vi.fn()
    render(<FatePointsElement {...defaultProps} onUpdate={onUpdate} />)
    fireEvent.change(screen.getByDisplayValue('3'), { target: { value: '-5' } })
    expect(onUpdate).toHaveBeenCalledWith({ refresh: 0 })
  })

  it('should handle undefined current and refresh', () => {
    const props = { ...defaultProps, element: { id: '1', type: 'fate-points' } }
    render(<FatePointsElement {...props} />)
    expect(screen.getByDisplayValue('3')).toBeInTheDocument()
  })

  it('should show refresh input when unlocked', () => {
    render(<FatePointsElement {...defaultProps} />)
    expect(screen.getByDisplayValue('3')).toBeInTheDocument()
  })

  it('should have refresh input class', () => {
    render(<FatePointsElement {...defaultProps} />)
    const input = screen.getByDisplayValue('3')
    expect(input).toHaveClass('refresh-input')
  })

  it('should render fate-points container', () => {
    const { container } = render(<FatePointsElement {...defaultProps} />)
    expect(container.querySelector('.fate-points')).toBeInTheDocument()
  })

  it('should update on prop change', () => {
    const { rerender } = render(<FatePointsElement {...defaultProps} />)
    expect(screen.getAllByText('●')).toHaveLength(3)
    
    const newProps = {
      ...defaultProps,
      element: { ...defaultProps.element, current: 5, refresh: 5 }
    }
    rerender(<FatePointsElement {...newProps} />)
    expect(screen.getAllByText('●')).toHaveLength(5)
  })

  it('should handle non-numeric input', () => {
    const onUpdate = vi.fn()
    render(<FatePointsElement {...defaultProps} onUpdate={onUpdate} />)
    fireEvent.change(screen.getByDisplayValue('3'), { target: { value: 'abc' } })
    expect(onUpdate).toHaveBeenCalledWith({ refresh: 0 })
  })

  it('should have correct refresh input min and max', () => {
    render(<FatePointsElement {...defaultProps} />)
    const input = screen.getByDisplayValue('3')
    expect(input).toHaveAttribute('min', '0')
    expect(input).toHaveAttribute('max', '10')
  })
})