'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext({
  success: () => {},
  error: () => {},
})

const tones = {
  success: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100',
  error: 'border-red-400/30 bg-red-400/10 text-red-100',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const pushToast = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((current) => [...current, { id, type, message }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 4200)
  }, [])

  const value = useMemo(() => ({
    success: (message) => pushToast('success', message),
    error: (message) => pushToast('error', message),
  }), [pushToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:bottom-6 sm:right-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold shadow-2xl shadow-black/30 backdrop-blur ${tones[toast.type]}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
