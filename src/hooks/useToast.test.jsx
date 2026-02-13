import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import ToastProvider from '../components/toast/ToastProvider'
import { useToast } from './useToast'

describe('useToast', () => {
  it('returns fallback handlers when no provider is present', async () => {
    const { result } = renderHook(() => useToast())

    expect(result.current.alert()).toBeNull()
    expect(result.current.diceResult()).toBeNull()
    await expect(result.current.confirm()).resolves.toBe(false)
  })

  it('returns context handlers when provider is present', () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: ({ children }) => <ToastProvider>{children}</ToastProvider>
    })

    let id
    act(() => {
      id = result.current.alert({ message: 'Hello' })
    })

    expect(typeof id).toBe('string')
    expect(id).toMatch(/^toast-/)
  })
})