-- Calenzo Neon PostgreSQL schema
-- Run with: npm run db:migrate

create extension if not exists pgcrypto;

create table if not exists clinics (
  id uuid primary key default gen_random_uuid(),
  clinic_name text not null,
  logo_url text,
  brand_color text default '#155e75',
  doctor_name text not null,
  specialization text,
  phone text not null,
  whatsapp_number text,
  email text,
  address text,
  website_url text,
  opening_time time default '09:00',
  closing_time time default '18:30',
  lunch_start time default '13:20',
  lunch_end time default '14:00',
  new_appointment_duration integer default 10 check (new_appointment_duration > 0),
  followup_duration integer default 5 check (followup_duration > 0),
  slot_duration integer default 5 check (slot_duration > 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  role text not null check (role in ('owner', 'doctor', 'receptionist', 'staff')),
  status text default 'active' check (status in ('active', 'inactive', 'invited')),
  password_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (clinic_id, email)
);

create table if not exists auth_sessions (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  session_token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  full_name text not null,
  age integer check (age is null or age > 0),
  phone text not null,
  email text,
  security_question text,
  security_answer_hash text,
  total_visits integer default 0,
  last_visit timestamptz,
  no_show_count integer default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (clinic_id, phone)
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  title text not null,
  description text,
  duration integer not null default 10 check (duration > 0),
  price numeric(10, 2),
  status text default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  appointment_type text not null check (appointment_type in ('new', 'follow_up')),
  token_number integer not null,
  appointment_date date not null,
  appointment_time time not null,
  arrival_window_start time,
  arrival_window_end time,
  status text default 'confirmed' check (status in ('pending', 'confirmed', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled')),
  source text default 'online' check (source in ('online', 'walk_in', 'phone', 'whatsapp', 'manual')),
  message text,
  internal_notes text,
  cancellation_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (clinic_id, appointment_date, token_number)
);

create unique index if not exists appointments_unique_active_slot
  on appointments (clinic_id, appointment_date, appointment_time)
  where status not in ('cancelled', 'no_show', 'rescheduled');

create table if not exists queue (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  appointment_id uuid not null references appointments(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  token_number integer not null,
  queue_date date not null,
  current_status text default 'waiting' check (current_status in ('waiting', 'arrived', 'in_progress', 'completed', 'skipped', 'cancelled')),
  estimated_wait_time integer default 0,
  delay_minutes integer default 0,
  position integer,
  updated_at timestamptz default now(),
  unique (clinic_id, appointment_id)
);

create table if not exists follow_ups (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  status text default 'new' check (status in ('new', 'contacted', 'appointment_booked', 'follow_up_needed', 'completed', 'no_show', 'converted', 'lost')),
  priority text default 'warm' check (priority in ('hot', 'warm', 'cold')),
  last_contacted_at timestamptz,
  next_followup_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  appointment_id uuid references appointments(id) on delete set null,
  type text not null check (type in ('confirmation', 'delay_alert', 'cancellation', 'reschedule', 'follow_up', 'thank_you', 'no_show')),
  channel text not null check (channel in ('whatsapp', 'email', 'sms')),
  recipient text not null,
  message text not null,
  status text default 'pending' check (status in ('pending', 'ready', 'sent', 'failed')),
  sent_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists availability (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  doctor_id uuid references users(id) on delete cascade,
  day_of_week text not null check (day_of_week in ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  start_time time not null,
  end_time time not null,
  break_start time,
  break_end time,
  is_available boolean default true
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

create index if not exists users_clinic_idx on users(clinic_id);
create index if not exists auth_sessions_user_idx on auth_sessions(user_id);
create index if not exists auth_sessions_expires_idx on auth_sessions(expires_at);
create index if not exists patients_clinic_name_idx on patients(clinic_id, full_name);
create index if not exists services_clinic_idx on services(clinic_id);
create index if not exists appointments_clinic_date_idx on appointments(clinic_id, appointment_date);
create index if not exists appointments_patient_idx on appointments(patient_id);
create index if not exists appointments_status_idx on appointments(clinic_id, status);
create index if not exists queue_clinic_date_idx on queue(clinic_id, queue_date);
create index if not exists queue_status_idx on queue(clinic_id, current_status);
create index if not exists followups_clinic_status_idx on follow_ups(clinic_id, status);
create index if not exists notifications_clinic_created_idx on notifications(clinic_id, created_at desc);
create index if not exists availability_clinic_day_idx on availability(clinic_id, day_of_week);
create index if not exists audit_logs_clinic_created_idx on audit_logs(clinic_id, created_at desc);

insert into clinics (
  id,
  clinic_name,
  brand_color,
  doctor_name,
  specialization,
  phone,
  whatsapp_number,
  email,
  address,
  website_url
) values (
  '00000000-0000-0000-0000-000000000001',
  'Calenzo Care Clinic',
  '#155e75',
  'Dr. Aarav Mehta',
  'Family Medicine and Preventive Care',
  '+91 88001 23456',
  '+91 88001 23456',
  'care@calenzo.health',
  '2nd Floor, Serenity Medical Plaza, Andheri West, Mumbai 400053',
  'https://calenzo.health'
) on conflict (id) do update set
  clinic_name = excluded.clinic_name,
  doctor_name = excluded.doctor_name,
  updated_at = now();

insert into services (id, clinic_id, title, description, duration, price, status) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'General Consultation', 'New symptoms, routine concerns, preventive advice, and first-time doctor consultation.', 10, 600, 'active'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Follow-Up Consultation', 'Quick review of reports, medicines, recovery progress, or ongoing treatment plan.', 5, 350, 'active'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Diabetes Review', 'Blood sugar review, lifestyle check-in, medication tuning, and next follow-up planning.', 10, 700, 'active'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Preventive Health Check', 'Vitals, risk review, screening guidance, and a practical preventive care plan.', 10, 900, 'active'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Vaccination Visit', 'Vaccination counselling, dose administration window, and post-visit instructions.', 5, 250, 'active')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  duration = excluded.duration,
  price = excluded.price,
  status = excluded.status,
  updated_at = now();

insert into users (id, clinic_id, name, email, phone, role, status, password_hash) values
  (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Sana Kapoor',
    'admin@calenzo.health',
    '+91 90000 11122',
    'owner',
    'active',
    crypt('calenzo-demo', gen_salt('bf'))
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Dr. Aarav Mehta',
    'doctor@calenzo.health',
    '+91 90000 11123',
    'doctor',
    'active',
    crypt('doctor-demo', gen_salt('bf'))
  )
on conflict (clinic_id, email) do update set
  name = excluded.name,
  phone = excluded.phone,
  role = excluded.role,
  status = excluded.status,
  password_hash = coalesce(users.password_hash, excluded.password_hash),
  updated_at = now();
