import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ToastContainer from './ToastContainer'

export const ToastContext = createContext(null)

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())
  const idRef = useRef(0)
  const confirmQueueRef = useRef([])
  const confirmActiveRef = useRef(null)

  useEffect(() => {
    return () => {
      timersRef.current.forEach(timeoutId => clearTimeout(timeoutId))
      timersRef.current.clear()
      confirmQueueRef.current = []
      confirmActiveRef.current = null
    }
  }, [])

  const removeToast = useCallback((toastId) => {
    if (!toastId) return
    setToasts(prev => {
      const toast = prev.find(item => item.id === toastId)
      if (toast?.onDismiss) {
        toast.onDismiss()
      }
      return prev.filter(item => item.id !== toastId)
    })
    const timeoutId = timersRef.current.get(toastId)
    if (timeoutId) {
      clearTimeout(timeoutId)
      timersRef.current.delete(toastId)
    }
  }, [])

  const alert = useCallback((options) => {
    const payload = typeof options === 'string' ? { message: options } : (options ?? {})
    const title = typeof payload.title === 'string' ? payload.title : ''
    const message = typeof payload.message === 'string' ? payload.message : ''
    if (!title && !message) return null

    const tone = typeof payload.tone === 'string' ? payload.tone : 'info'
    const duration = Number.isFinite(payload.duration) ? payload.duration : 5000
    const onDismiss = typeof payload.onDismiss === 'function' ? payload.onDismiss : null
    const id = `toast-${idRef.current++}`

    setToasts(prev => ([
      ...prev,
      { id, kind: 'alert', title, message, tone, onDismiss, duration: duration > 0 ? duration : null }
    ]))

    if (duration > 0) {
      const timeoutId = setTimeout(() => removeToast(id), duration)
      timersRef.current.set(id, timeoutId)
    }

    return id
  }, [removeToast])

  const diceResult = useCallback((options) => {
    const payload = options ?? {}
    const breakdown = typeof payload.breakdown === 'string' ? payload.breakdown : ''
    const total = typeof payload.total === 'string' ? payload.total : ''
    if (!breakdown && !total) return null

    const duration = Number.isFinite(payload.duration) ? payload.duration : 10000
    const onDismiss = typeof payload.onDismiss === 'function' ? payload.onDismiss : null
    const id = `toast-${idRef.current++}`

    setToasts(prev => ([
      ...prev,
      { id, kind: 'diceResult', breakdown, total, onDismiss, duration: duration > 0 ? duration : null }
    ]))

    if (duration > 0) {
      const timeoutId = setTimeout(() => removeToast(id), duration)
      timersRef.current.set(id, timeoutId)
    }

    return id
  }, [removeToast])

  const clearConfirmToast = useCallback((toastId) => {
    if (!toastId) return
    setToasts(prev => prev.filter(toast => toast.id !== toastId))
  }, [])

  const showNextConfirm = useCallback(() => {
    if (confirmActiveRef.current || confirmQueueRef.current.length === 0) return

    const nextItem = confirmQueueRef.current.shift()
    confirmActiveRef.current = nextItem

    const { options } = nextItem
    const payload = typeof options === 'string' ? { message: options } : (options ?? {})
    const title = typeof payload.title === 'string' ? payload.title : 'Confirm'
    const message = typeof payload.message === 'string' ? payload.message : ''
    const confirmLabel = typeof payload.confirmLabel === 'string' ? payload.confirmLabel : 'Confirm'
    const cancelLabel = typeof payload.cancelLabel === 'string' ? payload.cancelLabel : 'Cancel'
    const tone = typeof payload.tone === 'string' ? payload.tone : 'warning'
    const id = `toast-${idRef.current++}`

    confirmActiveRef.current.toastId = id

    setToasts(prev => ([
      ...prev,
      {
        id,
        kind: 'confirm',
        title,
        message,
        tone,
        confirmLabel,
        cancelLabel
      }
    ]))
  }, [])

  const resolveConfirm = useCallback((didConfirm) => {
    const active = confirmActiveRef.current
    if (!active) return

    confirmActiveRef.current = null

    if (active.toastId) {
      clearConfirmToast(active.toastId)
    }

    if (typeof active.resolve === 'function') {
      active.resolve(Boolean(didConfirm))
    }

    showNextConfirm()
  }, [clearConfirmToast, showNextConfirm])

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      confirmQueueRef.current.push({ options, resolve })
      showNextConfirm()
    })
  }, [showNextConfirm])

  const handleConfirmChoice = useCallback((toastId, didConfirm) => {
    const active = confirmActiveRef.current
    if (!active || active.toastId !== toastId) return
    resolveConfirm(didConfirm)
  }, [resolveConfirm])

  const value = useMemo(() => ({ alert, confirm, diceResult }), [alert, confirm, diceResult])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer
        toasts={toasts}
        onDismiss={removeToast}
        onConfirmChoice={handleConfirmChoice}
      />
    </ToastContext.Provider>
  )
}

export default ToastProvider
