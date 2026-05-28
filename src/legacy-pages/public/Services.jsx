import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Clock3, IndianRupee, ShieldCheck, Stethoscope } from 'lucide-react'
import { Badge, Button, Card } from '../../components/common/UI'
import { demoClinic, demoServices } from '../../data/demoData'

export default function Services() {
  return (
    <div className="bg-slate-50 py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <Badge variant="cyan" className="mb-4">Clinic services</Badge>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Simple booking for every visit type.</h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Choose the care you need. Calenzo handles duration, slot availability, token, and arrival window automatically.
            </p>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-950">{demoClinic.doctor_name}</h2>
                <p className="mt-1 text-sm text-slate-500">{demoClinic.specialization}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{demoClinic.address}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {demoServices.map((service, index) => (
            <motion.div key={service.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <Card hover className="flex h-full flex-col p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-cyan-300">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <Badge variant="green">Active</Badge>
                </div>
                <h2 className="mt-6 text-xl font-black text-slate-950">{service.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">{service.description}</p>
                <div className="mt-6 flex items-center gap-3">
                  <Badge variant="cyan"><Clock3 className="h-3.5 w-3.5" />{service.duration} min</Badge>
                  <Badge variant="slate"><IndianRupee className="h-3.5 w-3.5" />Rs. {service.price}</Badge>
                </div>
                <Link to={`/book?service=${service.id}`} className="mt-6">
                  <Button className="w-full">
                    Book this service
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
