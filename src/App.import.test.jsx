import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import App from './App'
import { FILE_CONSTRAINTS } from './constants'

describe('App import size limit', () => {
  let fileReaderSpy
  let alertSpy

  beforeEach(() => {
    fileReaderSpy = vi.spyOn(window, 'FileReader').mockImplementation(() => ({
      readAsText: vi.fn()
    }))

    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    alertSpy.mockRestore()
    fileReaderSpy.mockRestore()
  })

  it('rejects oversized imports before reading the file', () => {
    const { container } = render(<App />)
    const input = container.querySelector('input[type="file"]')
    expect(input).toBeTruthy()

    const oversizeBytes = FILE_CONSTRAINTS.MAX_IMPORT_SIZE + 1
    const oversizeFile = new File(
      [new ArrayBuffer(oversizeBytes)],
      'oversize.json',
      { type: 'application/json' }
    )

    fireEvent.change(input, { target: { files: [oversizeFile] } })

    const maxSizeMb = Math.ceil(FILE_CONSTRAINTS.MAX_IMPORT_SIZE / (1024 * 1024))
    expect(alertSpy).toHaveBeenCalledWith(
      `Import file is too large. Maximum size is ${maxSizeMb} MB.`
    )
    expect(fileReaderSpy).not.toHaveBeenCalled()
  })
})
