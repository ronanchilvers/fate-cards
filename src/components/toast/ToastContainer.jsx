import './Toast.css'

const ToastContainer = ({ toasts, onDismiss, onConfirmChoice }) => {
  const safeToasts = Array.isArray(toasts) ? toasts : []
  const confirmToasts = safeToasts.filter(toast => toast?.kind === 'confirm')
  const alertToasts = safeToasts.filter(toast => toast?.kind !== 'confirm')

  return (
    <>
      {confirmToasts.length > 0 ? (
        <div className="toast-overlay" role="presentation">
          <div className="toast-confirm-viewport">
            {confirmToasts.map((toast, index) => {
              const tone = toast?.tone ?? 'warning'

              return (
                <div
                  key={toast?.id ?? index}
                  className="toast-item"
                  role="alertdialog"
                  data-tone={tone}
                  aria-modal="true"
                >
                  {toast?.title ? <div className="toast-title">{toast.title}</div> : null}
                  {toast?.message ? <div className="toast-message">{toast.message}</div> : null}
                  <div className="toast-actions" role="group" aria-label="Confirmation">
                    <button
                      type="button"
                      className="toast-close"
                      onClick={() => onConfirmChoice?.(toast.id, false)}
                    >
                      {toast?.cancelLabel ?? 'Cancel'}
                    </button>
                    <button
                      type="button"
                      className="toast-close toast-primary"
                      autoFocus
                      onClick={() => onConfirmChoice?.(toast.id, true)}
                    >
                      Ok
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      <div className="toast-viewport" aria-live="polite" aria-atomic="true">
        {alertToasts.map((toast, index) => {
          const tone = toast?.tone ?? 'info'

          return (
            <div
              key={toast?.id ?? index}
              className="toast-item"
              role="status"
              data-tone={tone}
            >
              {toast?.title ? <div className="toast-title">{toast.title}</div> : null}
              {toast?.message ? <div className="toast-message">{toast.message}</div> : null}
              {onDismiss && toast?.id ? (
                <div className="toast-actions">
                  <button
                    type="button"
                    className="toast-close"
                    onClick={() => onDismiss(toast.id)}
                  >
                    Ok
                  </button>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </>
  )
}

export default ToastContainer
