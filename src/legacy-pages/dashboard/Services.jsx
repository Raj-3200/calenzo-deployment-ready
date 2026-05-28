import { useState } from 'react'
import { Clock3, Edit3, Plus, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge, Button, Card, Input, Modal, PageHeader, Textarea } from '../../components/common/UI'
import { demoServices } from '../../data/demoData'

export default function ServicesAdmin() {
  const [services, setServices] = useState(demoServices)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', duration: 10, price: 500, status: 'active' })

  function open(service = null) {
    setEditing(service || {})
    setForm(service || { title: '', description: '', duration: 10, price: 500, status: 'active' })
  }

  function save() {
    if (!form.title.trim()) {
      toast.error('Service name is required')
      return
    }
    if (form.id) {
      setServices((current) => current.map((service) => service.id === form.id ? { ...service, ...form } : service))
    } else {
      setServices((current) => [{ ...form, id: `srv-${Date.now()}`, clinic_id: current[0]?.clinic_id }, ...current])
    }
    setEditing(null)
    toast.success('Service saved')
  }

  function toggle(id) {
    setServices((current) => current.map((service) => service.id === id ? { ...service, status: service.status === 'active' ? 'inactive' : 'active' } : service))
  }

  return (
    <div>
      <PageHeader
        eyebrow="Catalog"
        title="Services"
        description="Manage service duration, pricing, and status used by smart slot generation."
        action={<Button onClick={() => open()}><Plus className="h-4 w-4" />Add Service</Button>}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id} hover className={`p-5 ${service.status === 'inactive' ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between">
              <Badge variant={service.status === 'active' ? 'green' : 'slate'}>{service.status}</Badge>
              <button onClick={() => toggle(service.id)} className="text-slate-500 hover:text-cyan-700">
                {service.status === 'active' ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
              </button>
            </div>
            <h2 className="mt-5 text-xl font-black text-slate-950">{service.title}</h2>
            <p className="mt-3 min-h-16 text-sm leading-6 text-slate-500">{service.description}</p>
            <div className="mt-5 flex items-center gap-3">
              <Badge variant="cyan"><Clock3 className="h-3.5 w-3.5" />{service.duration} min</Badge>
              <Badge variant="slate">Rs. {service.price}</Badge>
            </div>
            <Button className="mt-5 w-full" variant="secondary" onClick={() => open(service)}><Edit3 className="h-4 w-4" />Edit</Button>
          </Card>
        ))}
      </div>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title={form.id ? 'Edit service' : 'Add service'} size="md">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <Textarea label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Duration minutes" type="number" value={form.duration} onChange={(event) => setForm({ ...form, duration: Number(event.target.value) })} />
            <Input label="Price" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>Save Service</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
