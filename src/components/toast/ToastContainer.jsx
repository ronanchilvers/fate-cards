import './Toast.css'

const ToastContainer = ({ toasts, onDismiss, onConfirmChoice }) => {
  const safeToasts = Array.isArray(toasts) ? toasts : []
  const confirmToasts = safeToasts.filter(toast => toast?.kind === 'confirm')
  const diceResultToasts = safeToasts.filter(toast => toast?.kind === 'diceResult')
  const alertToasts = safeToasts.filter(toast => toast?.kind !== 'confirm' && toast?.kind !== 'diceResult')

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
        {diceResultToasts.map((toast, index) => {
          const duration = toast?.duration

          return (
            <div
              key={toast?.id ?? index}
              className="toast-item toast-dice-result"
              role="status"
              onClick={() => onDismiss && toast?.id && onDismiss(toast.id)}
              style={{ cursor: onDismiss && toast?.id ? 'pointer' : 'default' }}
            >
              <div className="dice-result-heading">Dice Roll</div>
              <div className="dice-result-content">
                <span className="dice-result-breakdown">{toast?.breakdown ?? ''}</span>
                <span className="dice-result-total">{toast?.total ?? ''}</span>
              </div>
              {duration > 0 ? (
                <div 
                  className="toast-progress-bar" 
                  style={{ animationDuration: `${duration}ms` }}
                />
              ) : null}
            </div>
          )
        })}
        {alertToasts.map((toast, index) => {
          const tone = toast?.tone ?? 'info'
          const duration = toast?.duration

          return (
            <div
              key={toast?.id ?? index}
              className="toast-item"
              role="status"
              data-tone={tone}
              onClick={() => onDismiss && toast?.id && onDismiss(toast.id)}
              style={{ cursor: onDismiss && toast?.id ? 'pointer' : 'default' }}
            >
              {toast?.title ? <div className="toast-title">{toast.title}</div> : null}
              {toast?.message ? <div className="toast-message">{toast.message}</div> : null}
              {duration > 0 ? (
                <div 
                  className="toast-progress-bar" 
                  style={{ animationDuration: `${duration}ms` }}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </>
  )
}

export default ToastContainer
