import { Prisma } from '@prisma/client'
import { z } from 'zod'
import {
  ACTIVE_APPOINTMENT_STATUSES,
  ACTIVE_QUEUE_STATUSES,
  appointmentDuration,
  generateAvailableSlots,
  getClinic,
  getPatientForUser,
  getServices,
} from '@/lib/data'
import { prisma } from '@/lib/prisma'
import { notifyQueueRefresh, publishQueueRefresh } from '@/lib/queue-events'
import { confirmationMessage } from '@/lib/whatsapp'
import {
  calculateArrivalWindow,
  dateFromInput,
  formatDate,
  formatTime,
  timeFromInput,
  timeToMinutes,
  todayInput,
} from '@/lib/time'

const LANGUAGE_PROMPTS = {
  en: 'Please choose your language:\n1. English\n2. हिंदी\n3. मराठी',
  hi: 'कृपया अपनी भाषा चुनें:\n1. English\n2. हिंदी\n3. मराठी',
  mr: 'कृपया तुमची भाषा निवडा:\n1. English\n2. हिंदी\n3. मराठी',
}

const COPY = {
  en: {
    patientType: 'Are you a new patient or an existing patient?\n1. New patient\n2. Existing patient',
    signIn: 'Please sign in first so I can use your saved profile. You can continue booking here after sign-in.',
    profileMissing: 'I could not find your patient profile yet. Please complete your profile once, then I can book future visits without asking again.',
    newPatient: 'Please create your account and complete your patient profile once. After that I can help you book appointments quickly.',
    appointmentType: 'What type of appointment do you need?\n1. New Appointment\n2. Follow-Up Appointment',
    service: 'Choose a service by number:',
    date: 'Which date should I check? Send a date like 2026-05-30, or say today/tomorrow.',
    noSlots: 'No slots are available for that date. Try another date.',
    slot: 'Choose an available slot by number:',
    confirm: 'Reply yes to confirm this appointment, or no to change details.',
    confirmed: 'Appointment confirmed.',
    cancelled: 'Okay, I will not book it. Tell me what you want to change.',
    fallback: 'Assistant is temporarily unavailable. You can continue booking using the normal form.',
  },
  hi: {
    patientType: 'आप नए मरीज हैं या मौजूदा मरीज?\n1. नया मरीज\n2. मौजूदा मरीज',
    signIn: 'कृपया पहले साइन इन करें ताकि मैं आपकी सेव की हुई प्रोफाइल इस्तेमाल कर सकूं। साइन इन के बाद आप यहीं से बुकिंग जारी रख सकते हैं।',
    profileMissing: 'मुझे आपकी मरीज प्रोफाइल नहीं मिली। कृपया एक बार प्रोफाइल पूरी करें, फिर आगे दोबारा भरना नहीं पड़ेगा।',
    newPatient: 'कृपया अपना अकाउंट बनाकर मरीज प्रोफाइल एक बार पूरी करें। उसके बाद मैं अपॉइंटमेंट जल्दी बुक करवा दूंगा।',
    appointmentType: 'आपको किस प्रकार की अपॉइंटमेंट चाहिए?\n1. नई अपॉइंटमेंट\n2. फॉलो-अप अपॉइंटमेंट',
    service: 'सेवा नंबर से चुनें:',
    date: 'किस तारीख के स्लॉट देखने हैं? 2026-05-30 जैसा दिन लिखें, या आज/कल लिखें।',
    noSlots: 'इस तारीख पर कोई स्लॉट उपलब्ध नहीं है। दूसरी तारीख आज़माएं।',
    slot: 'उपलब्ध स्लॉट नंबर से चुनें:',
    confirm: 'अपॉइंटमेंट कन्फर्म करने के लिए हां लिखें, या बदलाव के लिए नहीं लिखें।',
    confirmed: 'अपॉइंटमेंट कन्फर्म हो गई।',
    cancelled: 'ठीक है, मैंने बुक नहीं किया। बताइए क्या बदलना है।',
    fallback: 'असिस्टेंट अभी उपलब्ध नहीं है। आप सामान्य फॉर्म से बुकिंग जारी रख सकते हैं।',
  },
  mr: {
    patientType: 'तुम्ही नवीन रुग्ण आहात की आधीपासूनचे रुग्ण?\n1. नवीन रुग्ण\n2. आधीपासूनचे रुग्ण',
    signIn: 'कृपया आधी साइन इन करा, म्हणजे मी तुमची सेव्ह केलेली प्रोफाइल वापरू शकेन. साइन इननंतर तुम्ही इथूनच बुकिंग सुरू ठेवू शकता.',
    profileMissing: 'तुमची रुग्ण प्रोफाइल सापडली नाही. कृपया एकदा प्रोफाइल पूर्ण करा, पुढच्या वेळी पुन्हा भरावे लागणार नाही.',
    newPatient: 'कृपया अकाउंट तयार करून रुग्ण प्रोफाइल एकदा पूर्ण करा. त्यानंतर मी अपॉइंटमेंट पटकन बुक करून देईन.',
    appointmentType: 'तुम्हाला कोणती अपॉइंटमेंट हवी आहे?\n1. नवीन अपॉइंटमेंट\n2. फॉलो-अप अपॉइंटमेंट',
    service: 'सेवा नंबरने निवडा:',
    date: 'कोणत्या तारखेचे स्लॉट पाहायचे? 2026-05-30 असा दिवस लिहा, किंवा आज/उद्या लिहा.',
    noSlots: 'या तारखेला स्लॉट उपलब्ध नाहीत. दुसरी तारीख वापरून पाहा.',
    slot: 'उपलब्ध स्लॉट नंबरने निवडा:',
    confirm: 'अपॉइंटमेंट निश्चित करण्यासाठी हो लिहा, किंवा बदलासाठी नाही लिहा.',
    confirmed: 'अपॉइंटमेंट निश्चित झाली.',
    cancelled: 'ठीक आहे, मी बुक केले नाही. काय बदलायचे ते सांगा.',
    fallback: 'असिस्टंट सध्या उपलब्ध नाही. तुम्ही सामान्य फॉर्म वापरून बुकिंग सुरू ठेवू शकता.',
  },
}

const ChatSchema = z.object({
  message: z.string().max(1000).optional().default(''),
  selectedLanguage: z.enum(['en', 'hi', 'mr']).nullable().optional(),
  currentStep: z.string().optional().default('ASK_LANGUAGE'),
  structuredData: z.record(z.string(), z.unknown()).nullable().optional().default({}),
})

const BookingTransactionOptions = {
  maxWait: 10000,
  timeout: 15000,
  isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
}

function copy(language) {
  return COPY[language || 'en'] || COPY.en
}

function languageFromMessage(message) {
  const value = String(message || '').trim().toLowerCase()
  if (value === '1' || value.includes('english')) return 'en'
  if (value === '2' || value.includes('hindi') || value.includes('हिंदी') || value.includes('हिन्दी')) return 'hi'
  if (value === '3' || value.includes('marathi') || value.includes('मराठी') || value.includes('मराठी भाषा')) return 'mr'
  return null
}

function choiceNumber(message) {
  const match = String(message || '').match(/\d+/)
  return match ? Number(match[0]) : null
}

function appointmentTypeFromMessage(message) {
  const value = String(message || '').toLowerCase()
  if (choiceNumber(value) === 2 || value.includes('follow') || value.includes('फॉलो') || value.includes('फालो')) return 'follow_up'
  if (choiceNumber(value) === 1 || value.includes('new') || value.includes('नई') || value.includes('नया') || value.includes('नवीन')) return 'new'
  return null
}

function patientTypeFromMessage(message) {
  const value = String(message || '').toLowerCase()
  if (choiceNumber(value) === 1 || value.includes('new') || value.includes('नया') || value.includes('नवीन')) return 'new'
  if (choiceNumber(value) === 2 || value.includes('existing') || value.includes('मौजूदा') || value.includes('पुराना') || value.includes('आधी')) return 'existing'
  return null
}

function yesNo(message) {
  const value = String(message || '').trim().toLowerCase()
  if (['yes', 'y', 'confirm', 'ok', 'okay', 'हाँ', 'हां', 'हा', 'हो', 'चालेल'].some((word) => value.includes(word))) return true
  if (['no', 'n', 'cancel', 'नहीं', 'नही', 'नाही', 'नको'].some((word) => value.includes(word))) return false
  return null
}

function parseDate(message) {
  const value = String(message || '').trim().toLowerCase()
  const base = new Date(`${todayInput()}T00:00:00.000Z`)
  if (value.includes('today') || value.includes('आज')) return todayInput()
  if (value.includes('tomorrow') || value.includes('कल') || value.includes('उद्या')) {
    base.setUTCDate(base.getUTCDate() + 1)
    return base.toISOString().slice(0, 10)
  }

  const iso = value.match(/\d{4}-\d{2}-\d{2}/)?.[0]
  if (iso) return iso

  const local = value.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/)
  if (local) {
    const [, day, month, year] = local
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  return null
}

function serviceListText(services) {
  return services.map((service, index) => {
    const price = service.price ? ` - Rs. ${service.price.toString()}` : ''
    return `${index + 1}. ${service.title} (${service.duration} min${price})`
  }).join('\n')
}

function slotListText(slots) {
  return slots.slice(0, 8).map((slot, index) => `${index + 1}. ${slot.label}`).join('\n')
}

function findService(message, services) {
  const index = choiceNumber(message)
  if (index && services[index - 1]) return services[index - 1]

  const value = String(message || '').toLowerCase()
  return services.find((service) => service.title.toLowerCase().includes(value) || value.includes(service.title.toLowerCase())) || null
}

function findSlot(message, slots) {
  const index = choiceNumber(message)
  if (index && slots[index - 1]) return slots[index - 1]

  const value = String(message || '').trim()
  return slots.find((slot) => slot.time === value || slot.label.toLowerCase() === value.toLowerCase()) || null
}

function appointmentSummary({ patient, service, appointmentType, date, slot }, language) {
  if (language === 'hi') {
    const typeLabel = appointmentType === 'follow_up' ? 'फॉलो-अप अपॉइंटमेंट' : 'नई अपॉइंटमेंट'
    return `कृपया पुष्टि करें:\nमरीज: ${patient.fullName}\nप्रकार: ${typeLabel}\nसेवा: ${service.title}\nतारीख: ${date}\nसमय: ${slot.label}`
  }
  if (language === 'mr') {
    const typeLabel = appointmentType === 'follow_up' ? 'फॉलो-अप अपॉइंटमेंट' : 'नवीन अपॉइंटमेंट'
    return `कृपया खात्री करा:\nरुग्ण: ${patient.fullName}\nप्रकार: ${typeLabel}\nसेवा: ${service.title}\nतारीख: ${date}\nवेळ: ${slot.label}`
  }
  const typeLabel = appointmentType === 'follow_up' ? 'Follow-Up Appointment' : 'New Appointment'
  return `Please confirm:\nPatient: ${patient.fullName}\nType: ${typeLabel}\nService: ${service.title}\nDate: ${date}\nTime: ${slot.label}`
}

async function polishReply(reply, language) {
  const key = process.env.GEMINI_API_KEY
  if (!key) return reply

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: [
              'Rewrite the following clinic assistant message warmly and concisely.',
              'Do not add new facts, slots, prices, links, or confirmation details.',
              `Language: ${language}`,
              reply,
            ].join('\n'),
          }],
        }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 220 },
      }),
    })

    if (!response.ok) return reply
    const data = await response.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || reply
  } catch {
    return reply
  }
}

async function createAiBooking({ patient, service, appointmentType, date, slot }) {
  const clinic = await getClinic()
  const appointmentDate = dateFromInput(date)
  const appointmentTime = timeFromInput(slot.time)
  const duration = appointmentDuration({ appointmentType, clinic, service })
  const slotStart = timeToMinutes(slot.time)
  const arrivalWindow = calculateArrivalWindow(slot.time)

  const result = await prisma.$transaction(async (tx) => {
    const activeAppointments = await tx.appointment.findMany({
      where: {
        clinicId: clinic.id,
        appointmentDate,
        status: { in: ACTIVE_APPOINTMENT_STATUSES },
      },
      include: { service: true },
    })

    const clashes = activeAppointments.some((appointment) => {
      const start = timeToMinutes(appointment.appointmentTime)
      const bookedDuration = appointmentDuration({
        appointmentType: appointment.appointmentType,
        clinic,
        service: appointment.service,
      })
      return slotStart < start + bookedDuration && slotStart + duration > start
    })

    if (clashes) throw new Error('This slot is no longer available.')

    const maxToken = await tx.appointment.aggregate({
      where: { clinicId: clinic.id, appointmentDate },
      _max: { tokenNumber: true },
    })
    const tokenNumber = (maxToken._max.tokenNumber || 0) + 1

    const appointment = await tx.appointment.create({
      data: {
        clinicId: clinic.id,
        patientId: patient.id,
        serviceId: service.id,
        appointmentType,
        tokenNumber,
        appointmentDate,
        appointmentTime,
        arrivalWindowStart: timeFromInput(arrivalWindow.start),
        arrivalWindowEnd: timeFromInput(arrivalWindow.end),
        status: 'confirmed',
        source: 'online',
        message: 'Booked through Calenzo AI assistant.',
      },
    })

    const queueCount = await tx.queueItem.count({
      where: { clinicId: clinic.id, queueDate: appointmentDate, status: { in: ACTIVE_QUEUE_STATUSES } },
    })

    await tx.queueItem.create({
      data: {
        clinicId: clinic.id,
        appointmentId: appointment.id,
        patientId: patient.id,
        tokenNumber,
        queueDate: appointmentDate,
        status: 'waiting',
        position: queueCount + 1,
        estimatedWaitTime: queueCount * duration,
      },
    })

    await tx.notification.create({
      data: {
        clinicId: clinic.id,
        patientId: patient.id,
        appointmentId: appointment.id,
        type: 'confirmation',
        channel: 'whatsapp',
        recipient: patient.phone,
        message: confirmationMessage({ clinic, patient, appointment, service }),
        status: 'ready',
      },
    })

    await notifyQueueRefresh(tx, clinic.id)

    return { appointment, tokenNumber }
  }, BookingTransactionOptions)

  publishQueueRefresh()

  return {
    appointment: result.appointment,
    tokenNumber: result.tokenNumber,
    arrivalWindow,
    ticketLink: `/ticket/${result.appointment.id}`,
    queueLink: `/queue/${result.appointment.id}`,
  }
}

export async function handleAiChat({ input, session }) {
  const parsed = ChatSchema.safeParse(input || {})
  if (!parsed.success) {
    const fallbackLanguage = languageFromMessage(input?.message) || input?.selectedLanguage || 'en'
    return {
      reply: copy(fallbackLanguage).fallback,
      selectedLanguage: fallbackLanguage,
      nextStep: 'ASK_LANGUAGE',
      action: 'ASK_LANGUAGE',
      structuredData: {},
    }
  }

  const message = parsed.data.message
  const language = parsed.data.selectedLanguage || languageFromMessage(message)
  const c = copy(language)
  const state = parsed.data.structuredData || {}
  const currentStep = parsed.data.currentStep || 'ASK_LANGUAGE'

  if (!language || currentStep === 'ASK_LANGUAGE') {
    const chosen = languageFromMessage(message)
    if (!chosen) {
      return {
        reply: LANGUAGE_PROMPTS.en,
        selectedLanguage: null,
        nextStep: 'ASK_LANGUAGE',
        action: 'ASK_LANGUAGE',
        structuredData: {},
      }
    }
    return {
      reply: `${LANGUAGE_PROMPTS[chosen]}\n\n${copy(chosen).patientType}`,
      selectedLanguage: chosen,
      nextStep: 'ASK_PATIENT_TYPE',
      action: 'SET_LANGUAGE',
      structuredData: {},
    }
  }

  if (currentStep === 'ASK_PATIENT_TYPE') {
    const patientType = patientTypeFromMessage(message)
    if (!patientType) {
      return { reply: c.patientType, selectedLanguage: language, nextStep: 'ASK_PATIENT_TYPE', action: 'ASK_PATIENT_TYPE', structuredData: state }
    }

    if (patientType === 'new') {
      return {
        reply: c.newPatient,
        selectedLanguage: language,
        nextStep: 'SHOW_PROFILE_LINK',
        action: 'SHOW_PROFILE_LINK',
        structuredData: { ...state, patientType },
      }
    }

    if (!session?.user?.id) {
      return { reply: c.signIn, selectedLanguage: language, nextStep: 'REQUIRE_SIGN_IN', action: 'REQUIRE_SIGN_IN', structuredData: { ...state, patientType } }
    }

    const patient = await getPatientForUser(session.user)
    if (!patient) {
      return { reply: c.profileMissing, selectedLanguage: language, nextStep: 'SHOW_PROFILE_LINK', action: 'SHOW_PROFILE_LINK', structuredData: { ...state, patientType } }
    }

    return {
      reply: `${c.appointmentType}`,
      selectedLanguage: language,
      nextStep: 'ASK_APPOINTMENT_TYPE',
      action: 'ASK_APPOINTMENT_TYPE',
      structuredData: { ...state, patientType, patientId: patient.id },
    }
  }

  if (currentStep === 'ASK_APPOINTMENT_TYPE') {
    const appointmentType = appointmentTypeFromMessage(message)
    if (!appointmentType) {
      return { reply: c.appointmentType, selectedLanguage: language, nextStep: 'ASK_APPOINTMENT_TYPE', action: 'ASK_APPOINTMENT_TYPE', structuredData: state }
    }

    const services = await getServices()
    return {
      reply: `${c.service}\n${serviceListText(services)}`,
      selectedLanguage: language,
      nextStep: 'FETCH_SERVICES',
      action: 'FETCH_SERVICES',
      structuredData: {
        ...state,
        appointmentType,
        services: services.map((service) => ({
          id: service.id,
          title: service.title,
          duration: service.duration,
          price: service.price?.toString() || null,
        })),
      },
    }
  }

  if (currentStep === 'FETCH_SERVICES') {
    const services = await getServices()
    const service = findService(message, services)
    if (!service) {
      return { reply: `${c.service}\n${serviceListText(services)}`, selectedLanguage: language, nextStep: 'FETCH_SERVICES', action: 'FETCH_SERVICES', structuredData: state }
    }

    return {
      reply: c.date,
      selectedLanguage: language,
      nextStep: 'ASK_DATE',
      action: 'ASK_DATE',
      structuredData: { ...state, serviceId: service.id, serviceTitle: service.title },
    }
  }

  if (currentStep === 'ASK_DATE') {
    const date = parseDate(message)
    if (!date) {
      return { reply: c.date, selectedLanguage: language, nextStep: 'ASK_DATE', action: 'ASK_DATE', structuredData: state }
    }

    const slots = await generateAvailableSlots({
      date,
      appointmentType: state.appointmentType || 'new',
      serviceId: state.serviceId || null,
    })

    if (!slots.slots?.length) {
      return {
        reply: `${c.noSlots}${slots.nextAvailableDate ? ` ${slots.nextAvailableDate}` : ''}`,
        selectedLanguage: language,
        nextStep: 'ASK_DATE',
        action: 'FETCH_SLOTS',
        structuredData: { ...state, date },
      }
    }

    return {
      reply: `${c.slot}\n${slotListText(slots.slots)}`,
      selectedLanguage: language,
      nextStep: 'FETCH_SLOTS',
      action: 'FETCH_SLOTS',
      structuredData: {
        ...state,
        date,
        slots: slots.slots.slice(0, 8).map((slot) => ({ time: slot.time, label: slot.label })),
      },
    }
  }

  if (currentStep === 'FETCH_SLOTS') {
    const slot = findSlot(message, state.slots || [])
    if (!slot) {
      return { reply: `${c.slot}\n${slotListText(state.slots || [])}`, selectedLanguage: language, nextStep: 'FETCH_SLOTS', action: 'FETCH_SLOTS', structuredData: state }
    }

    const [patient, services] = await Promise.all([
      session?.user?.id ? getPatientForUser(session.user) : null,
      getServices(),
    ])
    const service = services.find((item) => item.id === state.serviceId)
    if (!patient) {
      return { reply: c.profileMissing, selectedLanguage: language, nextStep: 'SHOW_PROFILE_LINK', action: 'SHOW_PROFILE_LINK', structuredData: state }
    }
    if (!service) {
      return { reply: `${c.service}\n${serviceListText(services)}`, selectedLanguage: language, nextStep: 'FETCH_SERVICES', action: 'FETCH_SERVICES', structuredData: state }
    }

    return {
      reply: `${appointmentSummary({ patient, service, appointmentType: state.appointmentType, date: state.date, slot }, language)}\n\n${c.confirm}`,
      selectedLanguage: language,
      nextStep: 'CONFIRM_BOOKING',
      action: 'CONFIRM_BOOKING',
      structuredData: { ...state, slot },
    }
  }

  if (currentStep === 'CONFIRM_BOOKING') {
    const decision = yesNo(message)
    if (decision !== true) {
      return { reply: c.cancelled, selectedLanguage: language, nextStep: 'ASK_APPOINTMENT_TYPE', action: 'ASK_APPOINTMENT_TYPE', structuredData: {} }
    }

    const [patient, services] = await Promise.all([
      session?.user?.id ? getPatientForUser(session.user) : null,
      getServices(),
    ])
    const service = services.find((item) => item.id === state.serviceId)
    if (!patient || !service || !state.date || !state.slot?.time) {
      return { reply: c.profileMissing, selectedLanguage: language, nextStep: 'SHOW_PROFILE_LINK', action: 'SHOW_PROFILE_LINK', structuredData: state }
    }

    const booking = await createAiBooking({
      patient,
      service,
      appointmentType: state.appointmentType || 'new',
      date: state.date,
      slot: state.slot,
    })

    const reply = [
      c.confirmed,
      `Token: #${booking.tokenNumber}`,
      `Date: ${formatDate(booking.appointment.appointmentDate)}`,
      `Time: ${formatTime(booking.appointment.appointmentTime)}`,
      `Arrival: ${booking.arrivalWindow.start} - ${booking.arrivalWindow.end}`,
      `Ticket: ${booking.ticketLink}`,
      `Queue: ${booking.queueLink}`,
    ].join('\n')

    return {
      reply: await polishReply(reply, language),
      selectedLanguage: language,
      nextStep: 'SHOW_CONFIRMATION',
      action: 'SHOW_CONFIRMATION',
      structuredData: { appointmentId: booking.appointment.id, tokenNumber: booking.tokenNumber },
    }
  }

  return {
    reply: c.patientType,
    selectedLanguage: language,
    nextStep: 'ASK_PATIENT_TYPE',
    action: 'ASK_PATIENT_TYPE',
    structuredData: {},
  }
}
