'use client'

import { useRef } from 'react'
import { useToast } from '@/components/ToastProvider'

export function ActionForm({ action, successMessage, children, resetOnSuccess = false, ...props }) {
  const formRef = useRef(null)
  const toast = useToast()

  async function handleAction(formData) {
    try {
      const result = await action(formData)
      if (result?.ok === false) {
        toast.error(result.error || 'Something went wrong.')
      } else if (successMessage) {
        toast.success(successMessage)
      }
      if (resetOnSuccess && result?.ok !== false) formRef.current?.reset()
      return result
    } catch (error) {
      toast.error(error?.message || 'Something went wrong.')
    }
  }

  return (
    <form ref={formRef} action={handleAction} {...props}>
      {children}
    </form>
  )
}
