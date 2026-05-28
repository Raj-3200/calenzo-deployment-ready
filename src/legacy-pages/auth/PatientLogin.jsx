import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LockKeyhole, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Input } from '../../components/common/UI'
import { AuthShell } from './AdminLogin'

export default function PatientLogin() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('+91 98765 43210')
  const [answer, setAnswer] = useState('3210')

  function submit(event) {
    event.preventDefault()
    if (!phone.trim() || !answer.trim()) {
      toast.error('Please enter phone number and security answer')
      return
    }
    localStorage.setItem('calenzo_patient_auth', 'true')
    toast.success('Welcome back')
    navigate('/patient')
  }

  return (
    <AuthShell eyebrow="Patient login" title="See appointments, queue status, and tickets.">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Phone number" icon={Phone} value={phone} onChange={(event) => setPhone(event.target.value)} />
        <Input label="Security answer" icon={LockKeyhole} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Last four digits" />
        <Button type="submit" className="w-full">Open Patient Dashboard</Button>
      </form>
      <div className="mt-5 text-center text-sm text-slate-500">
        New patient? <Link className="font-bold text-cyan-700" to="/patient/register">Create access</Link>
      </div>
    </AuthShell>
  )
}
