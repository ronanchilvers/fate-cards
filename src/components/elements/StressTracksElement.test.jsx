import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StressTracksElement from './StressTracksElement'

describe('StressTracksElement', () => {
  const defaultProps = {
    element: {
      id: '1',
      type: 'stress-tracks',
      tracks: [
        {
          name: 'Physical',
          boxes: [
            { checked: false, value: 1 },
            { checked: true, value: 2 },
            { checked: false, value: 3 }
          ]
        }
      ]
    },
    isLocked: false,
    onUpdate: vi.fn(),
    onDelete: vi.fn()
  }

  it('should render title', () => {
    render(<StressTracksElement {...defaultProps} />)
    expect(screen.getByText('Stress Tracks')).toBeInTheDocument()
  })

  it('should render track names', () => {
    render(<StressTracksElement {...defaultProps} />)
    expect(screen.getByDisplayValue('Physical')).toBeInTheDocument()
  })

  it('should render stress boxes', () => {
    render(<StressTracksElement {...defaultProps} />)
    const boxes = screen.getAllByDisplayValue('1')
    expect(boxes.length).toBeGreaterThan(0)
  })

  it('should toggle box checked state when clicked', () => {
    const onUpdate = vi.fn()
    render(<StressTracksElement {...defaultProps} onUpdate={onUpdate} />)
    
    const boxes = screen.getAllByRole('button', { hidden: true })
    // Click on a stress box (div with role button)
    const stressBoxes = document.querySelectorAll('.stress-box')
    fireEvent.click(stressBoxes[0])
    
    expect(onUpdate).toHaveBeenCalled()
  })

  it('should change track name when input changes', () => {
    const onUpdate = vi.fn()
    render(<StressTracksElement {...defaultProps} onUpdate={onUpdate} />)
    
    fireEvent.change(screen.getByDisplayValue('Physical'), {
      target: { value: 'Mental' }
    })
    
    expect(onUpdate).toHaveBeenCalled()
  })

  it('should add box when plus button clicked', () => {
    const onUpdate = vi.fn()
    render(<StressTracksElement {...defaultProps} onUpdate={onUpdate} />)
    
    const plusButton = screen.getByRole('button', { name: /add box/i })
    fireEvent.click(plusButton)
    
    expect(onUpdate).toHaveBeenCalled()
    const call = onUpdate.mock.calls[0][0]
    expect(call.tracks[0].boxes.length).toBe(4)
  })

  it('should remove box when minus button clicked', () => {
    const onUpdate = vi.fn()
    render(<StressTracksElement {...defaultProps} onUpdate={onUpdate} />)
    
    const minusButtons = screen.getAllByRole('button', { name: /remove box/i })
    fireEvent.click(minusButtons[0])
    
    expect(onUpdate).toHaveBeenCalled()
    const call = onUpdate.mock.calls[0][0]
    expect(call.tracks[0].boxes.length).toBe(2)
  })

  it('should delete track when delete button clicked', () => {
    const onUpdate = vi.fn()
    render(<StressTracksElement {...defaultProps} onUpdate={onUpdate} />)
    
    fireEvent.click(screen.getByRole('button', { name: 'Delete track' }))
    
    expect(onUpdate).toHaveBeenCalled()
    const call = onUpdate.mock.calls[0][0]
    expect(call.tracks.length).toBe(0)
  })

  it('should change box value when input changes', () => {
    const onUpdate = vi.fn()
    render(<StressTracksElement {...defaultProps} onUpdate={onUpdate} />)
    
    const inputs = screen.getAllByDisplayValue('1')
    fireEvent.change(inputs[0], { target: { value: '5' } })
    
    expect(onUpdate).toHaveBeenCalled()
  })

  it('should disable minus button when only one box', () => {
    const oneBoxElement = {
      ...defaultProps.element,
      tracks: [
        {
          name: 'Physical',
          boxes: [{ checked: false, value: 1 }]
        }
      ]
    }
    render(<StressTracksElement {...defaultProps} element={oneBoxElement} />)
    
    const minusButton = screen.getByRole('button', { name: /remove box/i })
    expect(minusButton).toBeDisabled()
  })

  it('should show add track button when unlocked', () => {
    render(<StressTracksElement {...defaultProps} />)
    expect(screen.getByText('+ Add Track')).toBeInTheDocument()
  })

  it('should add track when add button clicked', () => {
    const onUpdate = vi.fn()
    render(<StressTracksElement {...defaultProps} onUpdate={onUpdate} />)
    
    fireEvent.click(screen.getByText('+ Add Track'))
    
    expect(onUpdate).toHaveBeenCalled()
    const call = onUpdate.mock.calls[0][0]
    expect(call.tracks.length).toBe(2)
  })

  it('should hide controls when locked', () => {
    render(<StressTracksElement {...defaultProps} isLocked={true} />)
    expect(screen.queryByText('+ Add Track')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add box/i })).not.toBeInTheDocument()
  })

  it('should show track names as labels when locked', () => {
    render(<StressTracksElement {...defaultProps} isLocked={true} />)
    expect(screen.getByText('Physical')).toBeInTheDocument()
  })

  it('should show box values as text when locked', () => {
    render(<StressTracksElement {...defaultProps} isLocked={true} />)
    const spans = screen.getAllByText('1')
    expect(spans.length).toBeGreaterThan(0)
  })

  it('should not allow box toggle when locked', () => {
    const onUpdate = vi.fn()
    render(<StressTracksElement {...defaultProps} isLocked={true} onUpdate={onUpdate} />)
    
    const stressBoxes = document.querySelectorAll('.stress-box')
    fireEvent.click(stressBoxes[0])
    
    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('should show delete button when unlocked', () => {
    render(<StressTracksElement {...defaultProps} />)
    expect(screen.getByRole('button', { name: /Delete Stress Tracks/i })).toBeInTheDocument()
  })

  it('should hide delete button when locked', () => {
    render(<StressTracksElement {...defaultProps} isLocked={true} />)
    expect(screen.queryByRole('button', { name: /Delete Stress Tracks/i })).not.toBeInTheDocument()
  })

  it('should call onDelete when delete button clicked', () => {
    const onDelete = vi.fn()
    render(<StressTracksElement {...defaultProps} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: /Delete Stress Tracks/i }))
    expect(onDelete).toHaveBeenCalled()
  })

  it('should handle empty tracks array', () => {
    const emptyElement = { id: '1', type: 'stress-tracks', tracks: [] }
    render(<StressTracksElement {...defaultProps} element={emptyElement} />)
    expect(screen.getByText('Stress Tracks')).toBeInTheDocument()
    expect(screen.getByText('+ Add Track')).toBeInTheDocument()
  })

  it('should handle undefined tracks', () => {
    const undefinedElement = { id: '1', type: 'stress-tracks' }
    render(<StressTracksElement {...defaultProps} element={undefinedElement} />)
    expect(screen.getByText('Stress Tracks')).toBeInTheDocument()
  })

  it('should handle multiple tracks', () => {
    const multiTrackElement = {
      id: '1',
      type: 'stress-tracks',
      tracks: [
        {
          name: 'Physical',
          boxes: [{ checked: false, value: 1 }]
        },
        {
          name: 'Mental',
          boxes: [{ checked: false, value: 1 }]
        }
      ]
    }
    render(<StressTracksElement {...defaultProps} element={multiTrackElement} />)
    expect(screen.getByDisplayValue('Physical')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Mental')).toBeInTheDocument()
  })

  it('should handle box with no value', () => {
    const noValueElement = {
      id: '1',
      type: 'stress-tracks',
      tracks: [
        {
          name: 'Physical',
          boxes: [{ checked: false }]
        }
      ]
    }
    render(<StressTracksElement {...defaultProps} element={noValueElement} />)
    expect(screen.getByDisplayValue('1')).toBeInTheDocument()
  })

  it('should handle track with no boxes', () => {
    const noBoxesElement = {
      id: '1',
      type: 'stress-tracks',
      tracks: [
        {
          name: 'Physical',
          boxes: []
        }
      ]
    }
    render(<StressTracksElement {...defaultProps} element={noBoxesElement} />)
    expect(screen.getByDisplayValue('Physical')).toBeInTheDocument()
  })

  it('should update on prop change', () => {
    const { rerender } = render(<StressTracksElement {...defaultProps} />)
    expect(screen.getByDisplayValue('Physical')).toBeInTheDocument()
    
    const newProps = {
      ...defaultProps,
      element: {
        id: '1',
        type: 'stress-tracks',
        tracks: [
          {
            name: 'Mental',
            boxes: [{ checked: false, value: 1 }]
          }
        ]
      }
    }
    rerender(<StressTracksElement {...newProps} />)
    expect(screen.getByDisplayValue('Mental')).toBeInTheDocument()
  })

  it('should clamp box value to valid range', () => {
    const onUpdate = vi.fn()
    render(<StressTracksElement {...defaultProps} onUpdate={onUpdate} />)
    
    const inputs = screen.getAllByDisplayValue('1')
    fireEvent.change(inputs[0], { target: { value: '150' } })
    
    expect(onUpdate).toHaveBeenCalled()
  })

  it('should handle non-numeric box input', () => {
    const onUpdate = vi.fn()
    render(<StressTracksElement {...defaultProps} onUpdate={onUpdate} />)
    
    const inputs = screen.getAllByDisplayValue('1')
    fireEvent.change(inputs[0], { target: { value: 'abc' } })
    
    expect(onUpdate).toHaveBeenCalled()
    const call = onUpdate.mock.calls[0][0]
    expect(call.tracks[0].boxes[0].value).toBe(1)
  })

  it('should apply checked class to checked boxes', () => {
    const { container } = render(<StressTracksElement {...defaultProps} />)
    const checkedBoxes = container.querySelectorAll('.stress-box.checked')
    expect(checkedBoxes.length).toBeGreaterThan(0)
  })

  it('should have stress-track-header class on headers', () => {
    const { container } = render(<StressTracksElement {...defaultProps} />)
    const headers = container.querySelectorAll('.stress-track-header')
    expect(headers.length).toBeGreaterThan(0)
  })

  it('should have stress-boxes container', () => {
    const { container } = render(<StressTracksElement {...defaultProps} />)
    const boxesContainer = container.querySelector('.stress-boxes')
    expect(boxesContainer).toBeInTheDocument()
  })
})
