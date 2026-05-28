export const DEFAULT_CLINIC_ID = '00000000-0000-0000-0000-000000000001'

export const APP_NAME = 'Calenzo'

export const CLINIC_PROFILE = {
  id: DEFAULT_CLINIC_ID,
  clinic_name: 'Calenzo Care Clinic',
  logo_url: '',
  brand_color: '#155e75',
  doctor_name: 'Dr. Aarav Mehta',
  specialization: 'Family Medicine and Preventive Care',
  phone: '+91 88001 23456',
  whatsapp_number: '+91 88001 23456',
  email: 'care@calenzo.health',
  address: '2nd Floor, Serenity Medical Plaza, Andheri West, Mumbai 400053',
  website_url: 'https://calenzo.health',
  opening_time: '09:00',
  closing_time: '18:30',
  lunch_start: '13:20',
  lunch_end: '14:00',
  new_appointment_duration: 10,
  followup_duration: 5,
  slot_duration: 5,
}

export const APPOINTMENT_TYPES = {
  NEW: 'new',
  FOLLOW_UP: 'follow_up',
}

export const APPOINTMENT_TYPE_META = {
  new: {
    label: 'New Appointment',
    shortLabel: 'New',
    duration: 10,
    description: 'First consultation or a fresh concern',
  },
  follow_up: {
    label: 'Follow-Up Appointment',
    shortLabel: 'Follow-up',
    duration: 5,
    description: 'Review, reports, medication check, or progress update',
  },
}

export const APPOINTMENT_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ARRIVED: 'arrived',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  RESCHEDULED: 'rescheduled',
}

export const APPOINTMENT_STATUS_OPTIONS = Object.values(APPOINTMENT_STATUSES)

export const APPOINTMENT_SOURCES = {
  ONLINE: 'online',
  WALK_IN: 'walk_in',
  PHONE: 'phone',
  WHATSAPP: 'whatsapp',
  MANUAL: 'manual',
}

export const APPOINTMENT_SOURCE_OPTIONS = Object.values(APPOINTMENT_SOURCES)

export const QUEUE_STATUSES = {
  WAITING: 'waiting',
  ARRIVED: 'arrived',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
  CANCELLED: 'cancelled',
}

export const QUEUE_STATUS_OPTIONS = Object.values(QUEUE_STATUSES)

export const FOLLOWUP_STATUSES = {
  NEW: 'new',
  CONTACTED: 'contacted',
  APPOINTMENT_BOOKED: 'appointment_booked',
  FOLLOW_UP_NEEDED: 'follow_up_needed',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
  CONVERTED: 'converted',
  LOST: 'lost',
}

export const FOLLOWUP_STATUS_OPTIONS = Object.values(FOLLOWUP_STATUSES)

export const FOLLOWUP_PRIORITIES = {
  HOT: 'hot',
  WARM: 'warm',
  COLD: 'cold',
}

export const FOLLOWUP_PRIORITY_OPTIONS = Object.values(FOLLOWUP_PRIORITIES)

export const NOTIFICATION_TYPES = {
  CONFIRMATION: 'confirmation',
  DELAY_ALERT: 'delay_alert',
  CANCELLATION: 'cancellation',
  RESCHEDULE: 'reschedule',
  FOLLOW_UP: 'follow_up',
  THANK_YOU: 'thank_you',
  NO_SHOW: 'no_show',
}

export const NOTIFICATION_CHANNELS = {
  WHATSAPP: 'whatsapp',
  EMAIL: 'email',
  SMS: 'sms',
}

export const USER_ROLES = {
  OWNER: 'owner',
  DOCTOR: 'doctor',
  RECEPTIONIST: 'receptionist',
  STAFF: 'staff',
}

export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

export const WORKING_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export const CANCELLATION_REASONS = [
  'Patient requested cancellation',
  'Doctor unavailable',
  'Emergency clinic closure',
  'Patient not reachable',
  'Duplicate appointment',
  'Other',
]

export const WHATSAPP_TEMPLATES = [
  'confirmation',
  'delay_alert',
  'cancellation',
  'reschedule',
  'follow_up',
  'thank_you',
  'no_show',
]

export const DEFAULT_USER = {
  id: 'user-1',
  clinic_id: DEFAULT_CLINIC_ID,
  name: 'Sana Kapoor',
  email: 'admin@calenzo.health',
  phone: '+91 90000 11122',
  role: USER_ROLES.OWNER,
  status: 'active',
}
