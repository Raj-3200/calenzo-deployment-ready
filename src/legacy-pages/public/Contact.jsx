import { MapPin, Mail, MessageCircle, Phone, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge, Button, Card, Input, Textarea, WhatsAppButton } from '../../components/common/UI'
import { demoClinic } from '../../data/demoData'

export default function Contact() {
  function submit(event) {
    event.preventDefault()
    toast.success('Message received. The clinic will contact you shortly.')
  }

  return (
    <div className="bg-slate-50 py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <Badge variant="cyan" className="mb-4">Contact clinic</Badge>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Need help with booking, queue, or follow-up?</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">Reach the clinic directly or send a quick message. For urgent queue questions, WhatsApp is the fastest route.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <ContactCard icon={Phone} label="Phone" value={demoClinic.phone} />
            <ContactCard icon={MessageCircle} label="WhatsApp" value={demoClinic.whatsapp_number} />
            <ContactCard icon={Mail} label="Email" value={demoClinic.email} />
            <ContactCard icon={MapPin} label="Address" value={demoClinic.address} />
            <WhatsAppButton phone={demoClinic.whatsapp_number} message="Hi, I need help with my appointment.">Message on WhatsApp</WhatsAppButton>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-black text-slate-950">Send a message</h2>
            <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input label="Full name" required placeholder="Your name" />
              <Input label="Phone number" required placeholder="+91 98765 43210" />
              <Input label="Email optional" type="email" placeholder="you@example.com" className="sm:col-span-2" />
              <div className="sm:col-span-2">
                <Textarea label="Message" required placeholder="How can the clinic help?" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ContactCard({ icon: Icon, label, value }) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
          <p className="mt-1 text-sm font-bold leading-6 text-slate-950">{value}</p>
        </div>
      </div>
    </Card>
  )
}
