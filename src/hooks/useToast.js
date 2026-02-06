import { useContext } from 'react'
import { ToastContext } from '../components/toast/ToastProvider'

const fallbackToast = {
  alert: () => null,
  confirm: () => Promise.resolve(false)
}

export const useToast = () => {
  const context = useContext(ToastContext)
  return context ?? fallbackToast
}
