'use client'

import { useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowRight, Loader2, ChevronLeft, RefreshCcw } from 'lucide-react'

/* ─── helpers ─────────────────────────────────────────────────────── */

function formatClerkError(err) {
  if (!err) return 'Something went wrong.'
  const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message
  return msg || String(err)
}

function isAccountNotFound(err) {
  const msg = formatClerkError(err).toLowerCase()
  return msg.includes('no account') || msg.includes('couldn') || msg.includes('identifier') || msg.includes('not found')
}

function setRememberMeFlags(remember) {
  sessionStorage.setItem('calenzo_sess', '1')
  if (remember) localStorage.setItem('calenzo_rmb', '1')
  else localStorage.removeItem('calenzo_rmb')
}

/* ─── Google Logo ─────────────────────────────────────────────────── */

function GoogleLogo() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

/* ─── Remember Me Toggle ──────────────────────────────────────────── */

function RememberMeToggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 group"
    >
      <div
        className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${
          checked ? 'bg-sky-400' : 'bg-slate-700'
        }`}
      >
        <div
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </div>
      <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors select-none">
        Remember me for 30 days
      </span>
    </button>
  )
}

/* ─── OTP Input ───────────────────────────────────────────────────── */

function OtpInput({ value, onChange }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
      placeholder="000000"
      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-white placeholder-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
    />
  )
}

/* ─── Backgrounds ─────────────────────────────────────────────────── */

function AuthBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -left-40 -top-40 h-96 w-96 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)', filter: 'blur(60px)' }}
      />
      <div
        className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', filter: 'blur(60px)' }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)', filter: 'blur(40px)' }}
      />
    </div>
  )
}

/* ─── Main Page ───────────────────────────────────────────────────── */

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()

  const [step, setStep] = useState('email')   // 'email' | 'otp'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  /* Google Sign-In */
  const handleGoogle = async () => {
    if (!isLoaded) return
    setGoogleLoading(true)
    setError('')
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: '/patient/dashboard',
      })
    } catch (err) {
      setError(formatClerkError(err))
      setGoogleLoading(false)
    }
  }

  /* Email — Send OTP */
  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!isLoaded || !email.trim()) return
    setLoading(true)
    setError('')
    setInfo('')
    try {
      await signIn.create({ strategy: 'email_code', identifier: email.trim() })
      setStep('otp')
      setInfo(`A 6-digit code was sent to ${email}`)
    } catch (err) {
      if (isAccountNotFound(err)) {
        setError("No account found with this email. Are you a new patient? Create an account →")
      } else {
        setError(formatClerkError(err))
      }
    } finally {
      setLoading(false)
    }
  }

  /* OTP — Verify */
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!isLoaded || otp.length < 6) return
    setLoading(true)
    setError('')
    try {
      const result = await signIn.attemptFirstFactor({ strategy: 'email_code', code: otp })
      if (result.status === 'complete') {
        setRememberMeFlags(rememberMe)
        await setActive({ session: result.createdSessionId })
        router.push('/patient/dashboard')
      }
    } catch (err) {
      setError('Invalid or expired code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /* Resend OTP */
  const handleResend = async () => {
    setLoading(true)
    setError('')
    try {
      await signIn.create({ strategy: 'email_code', identifier: email.trim() })
      setInfo('A new code was sent to your email.')
      setOtp('')
    } catch (err) {
      setError(formatClerkError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <AuthBackground />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-300 text-xl font-black text-slate-950 shadow-lg shadow-sky-400/25">
            C
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-400">Sign in to your Calenzo account</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-8 shadow-2xl shadow-slate-950/50 backdrop-blur-xl">

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-600/60 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleLogo />}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs font-medium text-slate-600">or continue with email</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          {/* Email / OTP Steps */}
          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.form
                key="email-step"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSendOtp}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError('') }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                    />
                  </div>
                </div>

                <RememberMeToggle checked={rememberMe} onChange={setRememberMe} />

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-400 px-4 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Send verification code
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp-step"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleVerifyOtp}
                className="space-y-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setOtp(''); setError(''); setInfo('') }}
                    className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition"
                  >
                    <ChevronLeft className="h-4 w-4" /> Change email
                  </button>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Enter the 6-digit code
                  </label>
                  <p className="mb-3 text-xs text-slate-500">Sent to <span className="text-sky-400">{email}</span></p>
                  <OtpInput value={otp} onChange={(v) => { setOtp(v); setError('') }} />
                </div>

                <RememberMeToggle checked={rememberMe} onChange={setRememberMe} />

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-400 px-4 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Verify and sign in
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-transparent px-4 py-3 text-sm font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-300 disabled:opacity-50"
                >
                  <RefreshCcw className="h-3.5 w-3.5" /> Resend code
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Status messages */}
          <AnimatePresence>
            {info && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-300"
              >
                {info}
              </motion.p>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
              >
                {error}
                {error.includes('new patient') && (
                  <Link href="/sign-up" className="ml-1 font-semibold text-sky-400 underline underline-offset-2">
                    Create account
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-500">
          New to Calenzo?{' '}
          <Link href="/sign-up" className="font-semibold text-sky-400 hover:text-sky-300 transition">
            Create an account
          </Link>
        </p>
      </motion.div>
    </main>
  )
}
