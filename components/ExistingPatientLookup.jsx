'use client'

import { useState, useTransition } from 'react'
import { lookupPatientAction } from '@/app/actions'
import { Button, Card, Input, Label } from '@/components/ui'

export function ExistingPatientLookup() {
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState(null)
  const [isPending, startTransition] = useTransition()

  function lookup(event) {
    event.preventDefault()
    startTransition(async () => {
      setResult(await lookupPatientAction(phone))
    })
  }

  return (
    <Card className="mx-auto w-full max-w-md p-6">
      <h2 className="text-xl font-bold text-white">Find saved patient details</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">Use your registered phone number to confirm the clinic already has your profile.</p>
      <form onSubmit={lookup} className="mt-5 space-y-4">
        <div>
          <Label>Registered phone number</Label>
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 90000 00000" />
        </div>
        <Button type="submit" variant="secondary" disabled={isPending} className="w-full">
          {isPending ? 'Checking...' : 'Search patient'}
        </Button>
      </form>
      {result ? (
        <div className={`mt-4 rounded-2xl border p-4 text-sm ${result.ok ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100' : 'border-amber-400/20 bg-amber-400/10 text-amber-100'}`}>
          {result.ok ? `${result.patient.fullName} found. Sign in with email to continue booking with saved details.` : result.error}
        </div>
      ) : null}
    </Card>
  )
}
