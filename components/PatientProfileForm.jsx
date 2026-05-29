'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

// Simple submit button with loading state — no useActionState needed
function SubmitButton({ isEdit }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-400 px-4 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? 'Saving...' : isEdit ? 'Update my profile' : 'Save and continue'}
    </button>
  )
}

export function PatientProfileForm({ action, email, defaultValues, error, isEdit, redirectTo }) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <p className="text-sm font-semibold text-sky-300">{isEdit ? 'Edit your details' : 'Almost there!'}</p>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-white sm:text-3xl">
          {isEdit ? 'Update your patient profile' : 'Complete your patient profile'}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {isEdit
            ? 'Your details are pre-filled. Make any changes and save.'
            : 'We save this once so future bookings stay fast. Your care depends on accurate details.'}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
          {decodeURIComponent(error)}
        </div>
      )}

      {/* Form */}
      <form action={action} className="space-y-5">
        {/* Hidden email */}
        <input type="hidden" name="emailHidden" value={email || ''} />
        {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}

        {/* Row 1: Full name + Age */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Full name <span className="text-red-400">*</span></label>
            <input
              name="fullName"
              required
              minLength={2}
              defaultValue={defaultValues?.fullName || ''}
              placeholder="Patient's full name"
              className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950/50 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-4 focus:ring-sky-300/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Age <span className="text-red-400">*</span></label>
            <input
              name="age"
              type="number"
              required
              min="1"
              max="120"
              defaultValue={defaultValues?.age || ''}
              placeholder="e.g. 32"
              className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950/50 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-4 focus:ring-sky-300/10"
            />
          </div>
        </div>

        {/* Row 2: Phone + Gender */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Phone number <span className="text-red-400">*</span></label>
            <input
              name="phone"
              required
              minLength={8}
              defaultValue={defaultValues?.phone || ''}
              placeholder="+91 90000 00000"
              className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950/50 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-4 focus:ring-sky-300/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Gender <span className="text-red-400">*</span></label>
            <select
              name="gender"
              required
              defaultValue={defaultValues?.gender || ''}
              className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950/50 px-3 text-sm text-white outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-300/10"
            >
              <option value="" disabled>Select gender</option>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
              <option>Prefer not to say</option>
            </select>
          </div>
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Email address</label>
          <input
            value={email || ''}
            disabled
            readOnly
            className="h-11 w-full cursor-not-allowed rounded-2xl border border-slate-800 bg-slate-900/40 px-3 text-sm text-slate-500 outline-none"
          />
          <p className="mt-1 text-xs text-slate-600">Auto-filled from your account</p>
        </div>

        {/* Row 3: Address + Emergency */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Address <span className="text-slate-500 font-normal">(optional)</span></label>
            <input
              name="address"
              defaultValue={defaultValues?.address || ''}
              placeholder="Your home address"
              className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950/50 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-4 focus:ring-sky-300/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Emergency contact <span className="text-slate-500 font-normal">(optional)</span></label>
            <input
              name="emergencyContact"
              defaultValue={defaultValues?.emergencyContact || ''}
              placeholder="Emergency contact number"
              className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950/50 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-4 focus:ring-sky-300/10"
            />
          </div>
        </div>

        <SubmitButton isEdit={isEdit} />
      </form>
    </div>
  )
}
