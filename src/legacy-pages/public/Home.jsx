import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  BellRing,
  CalendarCheck2,
  ChevronDown,
  Clock3,
  Headphones,
  MessageCircle,
  MonitorCheck,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TimerReset,
  UsersRound,
} from 'lucide-react'
import { Badge, Button, Card, SoftPanel } from '../../components/common/UI'
import heroImage from '../../assets/calenzo-hero.png'

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
}

export default function Home() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <HowItWorks />
      <VirtualWindowPreview />
      <SmartScheduling />
      <WhatsAppAutomation />
      <ReceptionDashboard />
      <PatientExperience />
      <ClinicBenefits />
      <FAQ />
      <FinalCTA />
    </div>
  )
}

function Hero() {
  return (
    <section className="relative border-b border-cyan-900/10 bg-white">
      <div className="absolute inset-0 surface-grid opacity-70" />
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-14">
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl">
          <Badge variant="cyan" className="mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered clinic operations
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Book clinic appointments without waiting room chaos.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Calenzo helps patients book easily, track live queue status, and receive timely updates while clinics manage appointments, walk-ins, and follow-ups from one intelligent dashboard.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/book">
              <Button size="lg" className="w-full sm:w-auto">
                Book Appointment
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/queue">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Check Live Queue
              </Button>
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-xl">
            {[
              ['15m', 'Delay alert'],
              ['005', 'Live token'],
              ['98%', 'Less calls'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-xl font-black text-slate-950">{value}</p>
                <p className="text-xs font-semibold text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, duration: 0.7 }} className="relative">
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 shadow-2xl">
            <img src={heroImage} alt="Modern clinic reception desk with appointment queue software" className="h-[420px] w-full object-cover opacity-95 sm:h-[540px]" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <HeroMetric icon={CalendarCheck2} label="Booked" value="32 today" />
                <HeroMetric icon={TimerReset} label="Queue" value="4 waiting" pulse />
                <HeroMetric icon={MessageCircle} label="WhatsApp" value="Ready" />
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 30, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="absolute -right-2 top-8 hidden w-64 rounded-2xl border border-white/70 bg-white/95 p-4 shadow-xl backdrop-blur lg:block"
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">Virtual window</p>
            <p className="mt-2 text-sm font-bold text-slate-950">You are 4 patients away</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/3 rounded-full bg-cyan-700" />
            </div>
            <p className="mt-3 text-xs text-slate-500">Please arrive around 12:20 PM.</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function HeroMetric({ icon: Icon, label, value, pulse }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white backdrop-blur">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-cyan-300" />
        {pulse && <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_8px_rgba(52,211,153,0.14)]" />}
      </div>
      <p className="mt-3 text-xs text-slate-300">{label}</p>
      <p className="text-sm font-black">{value}</p>
    </div>
  )
}

function ProblemSection() {
  const problems = [
    { icon: UsersRound, title: 'Waiting room crowding', text: 'Patients arrive too early because they cannot see queue movement.' },
    { icon: Headphones, title: 'Missed calls all day', text: 'Reception spends clinic hours answering the same timing questions.' },
    { icon: BellRing, title: 'Delayed updates', text: 'A 15 minute delay silently becomes frustrated patients and no-shows.' },
    { icon: MessageCircle, title: 'Manual WhatsApp handling', text: 'Confirmations, reschedules, and follow-ups live in scattered chat threads.' },
  ]

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...reveal} className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-red-600">The clinic pain</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Most clinics do not have an appointment problem. They have an operations visibility problem.</h2>
        </motion.div>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {problems.map((item, index) => (
            <motion.div key={item.title} {...reveal} transition={{ delay: index * 0.06, duration: 0.45 }}>
              <Card className="h-full p-5">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-red-600">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-black text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SolutionSection() {
  const flows = [
    ['Book', 'Patient selects type, doctor/service, date, slot, and details in a mobile-first flow.'],
    ['Queue', 'Calenzo generates a token, arrival window, and live queue entry automatically.'],
    ['Alert', 'WhatsApp-ready messages cover confirmation, delay, cancellation, reschedule, and follow-up.'],
    ['Operate', 'Reception and doctor work from one dashboard with queue, notes, and status actions.'],
  ]

  return (
    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <motion.div {...reveal}>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-700">Calenzo solution</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">A calm operating system for the daily clinic rush.</h2>
          <p className="mt-5 text-base leading-7 text-slate-600">
            Calenzo connects online booking, walk-ins, live queue, WhatsApp communication, follow-up recovery, and analytics into a reusable SaaS architecture built around clinic_id from day one.
          </p>
        </motion.div>
        <div className="grid gap-3">
          {flows.map(([title, text], index) => (
            <motion.div key={title} {...reveal} transition={{ delay: index * 0.05, duration: 0.45 }} className="grid grid-cols-[auto_1fr] gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white">{index + 1}</div>
              <div>
                <h3 className="font-black text-slate-950">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="bg-slate-950 py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...reveal} className="max-w-2xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-300">How it works</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">From booking to consultation, every status has a home.</h2>
        </motion.div>
        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {[
            ['1', 'Patient books', 'Large mobile controls, clear appointment type, smart slot availability.'],
            ['2', 'Token is created', 'Daily token resets per clinic and links appointment, patient, and queue.'],
            ['3', 'Queue stays live', 'Arrived, in-progress, skipped, recall, delay, and completed states update the window.'],
            ['4', 'Follow-up closes loop', 'Pending follow-ups and WhatsApp templates prevent patients from being forgotten.'],
          ].map(([number, title, text]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-4xl font-black text-cyan-300">{number}</p>
              <h3 className="mt-4 font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function VirtualWindowPreview() {
  return (
    <PreviewBand
      eyebrow="Virtual window"
      title="Patients know when to leave home."
      text="Queue language stays human: current token, patients before you, delay alerts, estimated wait, and suggested arrival time."
      icon={TimerReset}
      reverse
    >
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Live Queue</p>
            <h3 className="mt-2 text-2xl font-black text-slate-950">Token 005</h3>
          </div>
          <Badge variant="amber">15m delay</Badge>
        </div>
        <div className="mt-6 rounded-2xl bg-cyan-50 p-5 text-center">
          <p className="text-sm font-semibold text-cyan-800">You are</p>
          <p className="text-5xl font-black text-cyan-900">4</p>
          <p className="text-sm font-semibold text-cyan-800">patients away</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Info label="Estimated wait" value="32 min" />
          <Info label="Arrive around" value="12:20 PM" />
        </div>
      </div>
    </PreviewBand>
  )
}

function SmartScheduling() {
  return (
    <PreviewBand
      eyebrow="Smart scheduling"
      title="Slots respect clinic reality, not just a calendar grid."
      text="Working hours, lunch break, appointment duration, existing bookings, walk-ins, closed days, and duplicate prevention all shape availability."
      icon={CalendarCheck2}
    >
      <SoftPanel className="p-5">
        <div className="grid grid-cols-4 gap-2">
          {['09:00', '09:10', '09:20', '09:30', '09:40', '09:50', '10:00', '10:10', '13:20', '14:00', '14:10', '14:20'].map((time, index) => {
            const unavailable = index === 2 || index === 8
            return (
              <div key={time} className={`rounded-xl border px-3 py-3 text-center text-xs font-black ${unavailable ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-cyan-200 bg-white text-cyan-800'}`}>
                {time}
              </div>
            )
          })}
        </div>
        <div className="mt-5 rounded-2xl bg-white p-4">
          <p className="text-sm font-black text-slate-950">Closed day handling</p>
          <p className="mt-1 text-sm text-slate-500">Sunday selected. Suggested next available day: Monday.</p>
        </div>
      </SoftPanel>
    </PreviewBand>
  )
}

function WhatsAppAutomation() {
  return (
    <PreviewBand
      eyebrow="WhatsApp automation"
      title="One-click messages for the moments clinics repeat every day."
      text="Calenzo prepares confirmation, delay, cancellation, reschedule, follow-up, thank-you, and no-show messages with patient and token context."
      icon={MessageCircle}
      reverse
    >
      <Card className="p-5">
        {['Confirmation sent with token 005', 'Delay alert ready for 4 affected patients', 'Follow-up reminder due tomorrow'].map((message, index) => (
          <div key={message} className={`flex items-center gap-3 ${index > 0 ? 'mt-4 border-t border-slate-100 pt-4' : ''}`}>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-950">{message}</p>
              <p className="text-xs text-slate-500">WhatsApp template generated</p>
            </div>
          </div>
        ))}
      </Card>
    </PreviewBand>
  )
}

function ReceptionDashboard() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...reveal} className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <Badge variant="dark" className="mb-5">Receptionist dashboard</Badge>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">A real-time command center, not a spreadsheet wearing lipstick.</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Reception can search, filter, mark arrived, start consultation, skip, recall, reschedule, cancel, add notes, export CSV, and send WhatsApp actions without leaving the daily workflow.
            </p>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-4 shadow-xl">
            <div className="grid gap-3 md:grid-cols-3">
              <Info label="Today" value="32 appts" />
              <Info label="Waiting" value="4 patients" />
              <Info label="Avg wait" value="18 min" />
            </div>
            <div className="mt-4 space-y-3">
              {['Token 003 - Arrived', 'Token 004 - Waiting', 'Token 005 - Waiting'].map((item, index) => (
                <div key={item} className="flex items-center justify-between rounded-2xl bg-white p-4">
                  <p className="text-sm font-black text-slate-950">{item}</p>
                  <Button size="xs" variant={index === 0 ? 'primary' : 'secondary'}>{index === 0 ? 'Start' : 'Mark arrived'}</Button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function PatientExperience() {
  return (
    <section className="bg-cyan-950 py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...reveal} className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-300">Patient experience</p>
          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black sm:text-4xl">Patients get clarity before they step into the clinic.</h2>
        </motion.div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            [ShieldCheck, 'Trust-building confirmation', 'Token, appointment time, arrival window, address, and contact details are clear.'],
            [Clock3, 'Live queue before leaving', 'Patients can avoid sitting in a crowded waiting room unnecessarily.'],
            [Stethoscope, 'Simple language', 'No clinic jargon. Just clear next steps and friendly instructions.'],
          ].map(([Icon, title, text]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.05] p-6">
              <Icon className="h-8 w-8 text-cyan-300" />
              <h3 className="mt-5 font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-cyan-50/70">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ClinicBenefits() {
  const benefits = [
    'Reduce phone calls about queue status',
    'Prevent duplicate slot booking',
    'Recover missed follow-ups',
    'Track no-shows and repeat patients',
    'Handle walk-ins without breaking schedule',
    'Understand demand by service, source, and hour',
  ]

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div {...reveal} className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-700">Clinic benefits</p>
              <h2 className="mt-3 text-3xl font-black text-slate-950">Small clinic team. SaaS-level control.</h2>
            </div>
            <MonitorCheck className="h-12 w-12 text-cyan-700" />
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-700">
                {benefit}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function FAQ() {
  const [open, setOpen] = useState(0)
  const faqs = [
    ['Can patients book without creating an account?', 'Yes. The booking flow only asks for the information needed to create the appointment and patient record.'],
    ['Does Calenzo support walk-ins?', 'Yes. Reception can add walk-ins, generate the next token, allocate the nearest available slot, and keep the live queue intact.'],
    ['How does the live queue help?', 'Patients can see the current token, their position, estimated wait, delay, and suggested arrival time before leaving home.'],
    ['Is it SaaS-ready for multiple clinics?', 'Yes. The data model includes clinic_id across core tables so the first clinic can grow into a multi-clinic platform.'],
  ]

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div {...reveal} className="text-center">
          <h2 className="text-3xl font-black text-slate-950">Questions clinics ask before switching</h2>
        </motion.div>
        <div className="mt-8 space-y-3">
          {faqs.map(([question, answer], index) => (
            <div key={question} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <button onClick={() => setOpen(open === index ? null : index)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                <span className="text-sm font-black text-slate-950">{question}</span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open === index ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {open === index && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-6 text-slate-500">{answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-300">Start with one clinic</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Give patients clarity and your clinic a command center.</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/book">
              <Button size="lg" className="w-full bg-white text-slate-950 hover:bg-cyan-50">Book Appointment</Button>
            </Link>
            <Link to="/admin/login">
              <Button size="lg" variant="secondary" className="w-full border-white/20 bg-white/10 text-white hover:bg-white/15">Admin Login</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function PreviewBand({ eyebrow, title, text, icon: Icon, children, reverse = false }) {
  return (
    <section className="bg-white py-20">
      <div className={`mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <motion.div {...reveal}>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
            <Icon className="h-6 w-6" />
          </div>
          <p className="mt-6 text-sm font-black uppercase tracking-[0.2em] text-cyan-700">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">{text}</p>
        </motion.div>
        <motion.div {...reveal}>{children}</motion.div>
      </div>
    </section>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  )
}
