import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HelpCircle, Mail, Phone, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Input } from '../../components/common/UI'
import { AuthShell } from './AdminLogin'

export default function PatientRegister() {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    security_question: 'Last four digits of phone',
    security_answer: '',
  })

  function submit(event) {
    event.preventDefault()
    if (!form.full_name || !form.phone || !form.security_answer) {
      toast.error('Please complete required fields')
      return
    }
    toast.success('Continue with Clerk sign-up')
    window.location.assign('/patient/register')
  }

  return (
    <AuthShell eyebrow="Patient register" title="Create simple access for your appointment history.">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Full name" icon={UserRound} value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} />
        <Input label="Phone number" icon={Phone} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        <Input label="Email optional" icon={Mail} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <Input label="Security question" icon={HelpCircle} value={form.security_question} onChange={(event) => setForm({ ...form, security_question: event.target.value })} />
        <Input label="Security answer" value={form.security_answer} onChange={(event) => setForm({ ...form, security_answer: event.target.value })} />
        <Button type="submit" className="w-full">Create Patient Access</Button>
      </form>
      <div className="mt-5 text-center text-sm text-slate-500">
        Already registered? <Link className="font-bold text-cyan-700" to="/patient/login">Login</Link>
      </div>
    </AuthShell>
  )
}
