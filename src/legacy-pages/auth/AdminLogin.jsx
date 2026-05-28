import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, LockKeyhole, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge, Button, Card, Input } from '../../components/common/UI'
import { loginAdmin } from '../../lib/authApi'

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@calenzo.health')
  const [password, setPassword] = useState('calenzo-demo')
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setLoading(true)

    try {
      await loginAdmin(email, password)
      toast.success('Continue with Clerk sign-in')
      window.location.assign('/admin/login')
    } catch (error) {
      toast.error(error.message || 'Use Clerk sign-in')
      window.location.assign('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell eyebrow="Admin access" title="Run the clinic from one calm command center.">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email" icon={Mail} type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <Input label="Password" icon={LockKeyhole} type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      <p className="mt-5 text-center text-xs leading-5 text-slate-500">
        Production login is handled by Clerk.
      </p>
    </AuthShell>
  )
}

export function AuthShell({ eyebrow, title, children }) {
  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-[1fr_0.95fr]">
      <div className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-xl font-black">Calenzo</span>
        </Link>
        <div>
          <Badge variant="cyan" className="mb-5">Clinic OS</Badge>
          <h1 className="max-w-xl text-5xl font-black tracking-tight">Remove appointment confusion, missed follow-ups, and queue chaos.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">Built for receptionists, doctors, and clinic owners who need an operating system, not another spreadsheet.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md p-6">
          <Link to="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-cyan-300">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xl font-black text-slate-950">Calenzo</span>
          </Link>
          <Badge variant="cyan" className="mb-4">{eyebrow}</Badge>
          <h2 className="mb-6 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
          {children}
        </Card>
      </div>
    </div>
  )
}
