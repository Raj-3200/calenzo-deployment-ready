'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui'

export function ConfirmDialog({ trigger, title, description, confirmLabel = 'Confirm', variant = 'danger', onConfirm }) {
  const dialogRef = useRef(null)
  const [pending, setPending] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  function open() {
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
  }

  async function handleConfirm() {
    setPending(true)
    try {
      await onConfirm()
      close()
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      {trigger(open)}
      <dialog
        ref={dialogRef}
        onClose={close}
        className="fixed inset-0 m-auto w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-white backdrop:bg-black/60"
      >
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={close}>
            Cancel
          </Button>
          <Button variant={variant} size="sm" disabled={pending} onClick={handleConfirm}>
            {pending ? 'Processing...' : confirmLabel}
          </Button>
        </div>
      </dialog>
    </>
  )
}
