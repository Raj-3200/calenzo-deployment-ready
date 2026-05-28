import { useMemo, useState } from 'react'
import { Bot, Send, UserRound } from 'lucide-react'
import { Badge, Button, Card, PageHeader } from '../../components/common/UI'
import { demoClinic, demoServices } from '../../data/demoData'

const languages = [
  { key: 'en', label: 'English' },
  { key: 'hi', label: 'Hindi' },
  { key: 'mr', label: 'Marathi' },
]

const replies = {
  en: {
    timing: `The clinic is open from ${demoClinic.opening_time} to ${demoClinic.closing_time}, with lunch from ${demoClinic.lunch_start} to ${demoClinic.lunch_end}.`,
    fee: `Consultation fees start from Rs. ${Math.min(...demoServices.map((service) => service.price))}. You can see service fees on the Services page.`,
    slot: 'Please open Book Appointment, choose your appointment type, date, and the system will show only available slots.',
    queue: 'The live queue shows current token, patients before you, estimated wait, delay, and suggested arrival time.',
    follow: 'For follow-up visits, choose Follow-Up Appointment. It is usually a 5 minute review slot.',
    default: 'I can help with clinic timing, fees, available slots, booking guidance, follow-up instructions, live queue, and appointment help.',
  },
  hi: {
    timing: `Clinic ${demoClinic.opening_time} se ${demoClinic.closing_time} tak open hai. Lunch break ${demoClinic.lunch_start} se ${demoClinic.lunch_end} hai.`,
    fee: `Consultation fee Rs. ${Math.min(...demoServices.map((service) => service.price))} se start hoti hai.`,
    slot: 'Book Appointment page par type, date aur slot select karein. Sirf available slots dikhte hain.',
    queue: 'Live queue me current token, aapke pehle kitne patients hain, wait time aur delay dikhta hai.',
    follow: 'Follow-up ke liye Follow-Up Appointment choose karein. Ye usually 5 minute slot hota hai.',
    default: 'Main timing, fees, slots, booking, follow-up, live queue aur appointment help me madad kar sakta hoon.',
  },
  mr: {
    timing: `Clinic ${demoClinic.opening_time} te ${demoClinic.closing_time} open aahe. Lunch break ${demoClinic.lunch_start} te ${demoClinic.lunch_end} aahe.`,
    fee: `Consultation fee Rs. ${Math.min(...demoServices.map((service) => service.price))} pasun suru hote.`,
    slot: 'Book Appointment page var type, date ani slot select kara. Available slotsach distil.',
    queue: 'Live queue madhe current token, tumchya pudhe patients, wait time ani delay disel.',
    follow: 'Follow-up sathi Follow-Up Appointment select kara. Ha sadharan 5 minute slot aahe.',
    default: 'Mi timing, fees, slots, booking, follow-up, live queue ani appointment help karu shakto.',
  },
}

export default function ChatAssistant() {
  const [language, setLanguage] = useState('en')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'assistant', text: replies.en.default },
  ])

  const placeholder = useMemo(() => {
    if (language === 'hi') return 'Timing, fees, slot ya queue puchhiye...'
    if (language === 'mr') return 'Timing, fees, slot kiwa queue vichara...'
    return 'Ask about timing, fees, slots, queue...'
  }, [language])

  function send(event) {
    event.preventDefault()
    if (!input.trim()) return
    const key = chooseReply(input)
    const response = replies[language][key]
    setMessages((current) => [...current, { role: 'user', text: input }, { role: 'assistant', text: response }])
    setInput('')
  }

  function switchLanguage(key) {
    setLanguage(key)
    setMessages((current) => [...current, { role: 'assistant', text: replies[key].default }])
  }

  return (
    <div className="bg-slate-50 py-10 lg:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="AI Assistant"
          title="Clinic help, in your language."
          description="MVP uses a rule-based assistant UI, ready for real AI integration."
        />
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 bg-white p-4">
            <div className="flex flex-wrap gap-2">
              {languages.map((item) => (
                <button key={item.key} onClick={() => switchLanguage(item.key)} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${language === item.key ? 'bg-cyan-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[520px] overflow-y-auto bg-slate-50 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && <Avatar icon={Bot} />}
                  <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'bg-cyan-700 text-white' : 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-200'}`}>
                    {message.text}
                  </div>
                  {message.role === 'user' && <Avatar icon={UserRound} />}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={send} className="border-t border-slate-100 bg-white p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={placeholder}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-700/10"
              />
              <Button type="submit">
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {['Timing', 'Fees', 'Available slots', 'Live queue', 'Follow-up'].map((chip) => (
                <button key={chip} type="button" onClick={() => setInput(chip)}><Badge variant="slate">{chip}</Badge></button>
              ))}
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

function chooseReply(text) {
  const normalized = text.toLowerCase()
  if (normalized.includes('time') || normalized.includes('timing') || normalized.includes('open')) return 'timing'
  if (normalized.includes('fee') || normalized.includes('price') || normalized.includes('cost')) return 'fee'
  if (normalized.includes('slot') || normalized.includes('available') || normalized.includes('book')) return 'slot'
  if (normalized.includes('queue') || normalized.includes('token') || normalized.includes('wait')) return 'queue'
  if (normalized.includes('follow')) return 'follow'
  return 'default'
}

function Avatar({ icon: Icon }) {
  return (
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-slate-950 text-cyan-300">
      <Icon className="h-4 w-4" />
    </div>
  )
}
