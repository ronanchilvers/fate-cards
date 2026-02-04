import ElementWrapper from './ElementWrapper'
import Icon from '../icons/Icon'

/**
 * Stress Tracks element renderer
 * Manages multiple stress tracks with toggleable boxes
 * 
 * @param {Object} props
 * @param {Object} props.element - Element data {id, type, tracks: Array<{name, boxes: Array<{checked, value}>}>}
 * @param {boolean} props.isLocked - Whether card is locked
 * @param {Function} props.onUpdate - Called with updates object
 * @param {Function} props.onDelete - Called to delete element
 * @param {boolean} props.showDragHandle - Whether to show drag handle
 * @param {Object} props.dragHandleProps - Props applied to drag handle button
 */
function StressTracksElement({ element, isLocked, onUpdate, onDelete, showDragHandle, dragHandleProps }) {
  // Defensive: ensure tracks is an array
  const tracks = element.tracks || []

  const handleTrackNameChange = (trackIndex, newName) => {
    const newTracks = [...tracks]
    newTracks[trackIndex] = { ...tracks[trackIndex], name: newName }
    onUpdate({ tracks: newTracks })
  }

  const handleAddBox = (trackIndex) => {
    const newTracks = [...tracks]
    newTracks[trackIndex] = {
      ...tracks[trackIndex],
      boxes: [...(tracks[trackIndex].boxes || []), { checked: false, value: 1 }]
    }
    onUpdate({ tracks: newTracks })
  }

  const handleRemoveBox = (trackIndex) => {
    const track = tracks[trackIndex]
    if ((track.boxes || []).length > 1) {
      const newTracks = [...tracks]
      newTracks[trackIndex] = {
        ...track,
        boxes: track.boxes.slice(0, -1)
      }
      onUpdate({ tracks: newTracks })
    }
  }

  const handleDeleteTrack = (trackIndex) => {
    const newTracks = tracks.filter((_, i) => i !== trackIndex)
    onUpdate({ tracks: newTracks })
  }

  const handleToggleBox = (trackIndex, boxIndex) => {
    const newTracks = [...tracks]
    const newBoxes = [...(tracks[trackIndex].boxes || [])]
    newBoxes[boxIndex] = { ...newBoxes[boxIndex], checked: !newBoxes[boxIndex].checked }
    newTracks[trackIndex] = { ...tracks[trackIndex], boxes: newBoxes }
    onUpdate({ tracks: newTracks })
  }

  const handleBoxValueChange = (trackIndex, boxIndex, newValue) => {
    const newTracks = [...tracks]
    const newBoxes = [...(tracks[trackIndex].boxes || [])]
    newBoxes[boxIndex] = { ...newBoxes[boxIndex], value: parseInt(newValue) || 1 }
    newTracks[trackIndex] = { ...tracks[trackIndex], boxes: newBoxes }
    onUpdate({ tracks: newTracks })
  }

  const handleAddTrack = () => {
    const newTracks = [
      ...tracks,
      {
        name: 'New Track',
        boxes: [
          { checked: false, value: 1 },
          { checked: false, value: 2 },
          { checked: false, value: 3 }
        ]
      }
    ]
    onUpdate({ tracks: newTracks })
  }

  return (
    <ElementWrapper
      title="Stress Tracks"
      isLocked={isLocked}
      onDelete={onDelete}
      showDragHandle={showDragHandle}
      dragHandleProps={dragHandleProps}
    >
      {tracks.map((track, trackIndex) => (
        <div key={trackIndex} className="stress-track">
          <div className="stress-track-header">
            {!isLocked ? (
              <input
                type="text"
                value={track.name || ''}
                onChange={(e) => handleTrackNameChange(trackIndex, e.target.value)}
                className="stress-track-name-input"
                placeholder="Track name"
              />
            ) : (
              <label>{track.name || ''}</label>
            )}
            {!isLocked && (
              <div className="stress-track-controls">
                <button
                  onClick={() => handleAddBox(trackIndex)}
                  className="stress-control-btn"
                  title="Add box"
                  aria-label="Add box"
                >
                  <Icon name="add" size={14} aria-hidden="true" />
                </button>
                <button
                  onClick={() => handleRemoveBox(trackIndex)}
                  className="stress-control-btn"
                  title="Remove box"
                  disabled={(track.boxes || []).length <= 1}
                  aria-label="Remove box"
                >
                  <Icon name="remove" size={14} aria-hidden="true" />
                </button>
                <button
                  onClick={() => handleDeleteTrack(trackIndex)}
                  className="stress-control-btn stress-delete-btn"
                  title="Delete track"
                  aria-label="Delete track"
                >
                  <Icon name="delete" size={14} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
          <div className="stress-boxes">
            {(track.boxes || []).map((box, boxIndex) => (
              <div
                key={boxIndex}
                className={`stress-box ${box.checked ? 'checked' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={() => !isLocked && handleToggleBox(trackIndex, boxIndex)}
              >
                {!isLocked ? (
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={box.value || 1}
                    onChange={(e) => {
                      e.stopPropagation()
                      handleBoxValueChange(trackIndex, boxIndex, e.target.value)
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="stress-box-value"
                  />
                ) : (
                  <span>{box.value || 1}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {!isLocked && (
        <button
          onClick={handleAddTrack}
          className="add-stress-track-btn"
        >
          + Add Track
        </button>
      )}
    </ElementWrapper>
  )
}

export default StressTracksElement
