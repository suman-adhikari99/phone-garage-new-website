create table if not exists public.repair_bookings (
  id bigserial primary key,
  booking_ref text not null unique,
  status text not null default 'new',
  created_at bigint not null,
  brand_id text,
  brand_name text,
  model_id text,
  model_name text,
  service_id text,
  service_slug text,
  service_name text,
  customer_service_name text,
  inspection_service_name text,
  estimated_cost text,
  estimated_time text,
  appointment_date text not null,
  appointment_time text not null,
  store_location text not null,
  submission_source text,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  company text,
  issue_notes text,
  inspection_notes text,
  quote_line_items text,
  quote_generated_at bigint
);

create index if not exists idx_repair_bookings_created_at
  on public.repair_bookings(created_at desc);

create table if not exists public.booking_submission_idempotency (
  idempotency_key text primary key,
  booking_ref text,
  created_at bigint not null,
  updated_at bigint not null
);

create index if not exists idx_booking_submission_idempotency_created_at
  on public.booking_submission_idempotency(created_at desc);

create table if not exists public.booking_owner_notifications (
  booking_ref text primary key,
  status text not null default 'pending',
  attempts integer not null default 0,
  resend_message_id text,
  last_error text,
  last_attempt_at bigint,
  sent_at bigint,
  created_at bigint not null,
  updated_at bigint not null
);

create index if not exists idx_booking_owner_notifications_status_updated
  on public.booking_owner_notifications(status, updated_at desc);

create table if not exists public.google_reviews_meta (
  key text primary key,
  value text not null
);

create table if not exists public.google_reviews (
  id text primary key,
  place_id text not null,
  sort_order integer not null,
  author_name text not null,
  author_photo_url text not null,
  rating double precision not null,
  text text not null,
  relative_date text not null,
  published_at text not null,
  fetched_at bigint not null
);

create or replace function public.reserve_booking_submission_idempotency(
  p_idempotency_key text,
  p_created_at bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_booking_ref text;
begin
  insert into public.booking_submission_idempotency (
    idempotency_key,
    booking_ref,
    created_at,
    updated_at
  )
  values (
    p_idempotency_key,
    null,
    p_created_at,
    p_created_at
  )
  on conflict (idempotency_key) do nothing;

  if found then
    return jsonb_build_object('status', 'acquired');
  end if;

  select booking_ref
  into existing_booking_ref
  from public.booking_submission_idempotency
  where idempotency_key = p_idempotency_key
  limit 1;

  if existing_booking_ref is not null and btrim(existing_booking_ref) <> '' then
    return jsonb_build_object(
      'status',
      'replay',
      'bookingRef',
      existing_booking_ref
    );
  end if;

  return jsonb_build_object('status', 'in_progress');
end;
$$;

revoke all on function public.reserve_booking_submission_idempotency(text, bigint)
from public, anon, authenticated;
grant execute on function public.reserve_booking_submission_idempotency(text, bigint)
to service_role;

alter table public.repair_bookings enable row level security;
alter table public.booking_submission_idempotency enable row level security;
alter table public.booking_owner_notifications enable row level security;
alter table public.google_reviews_meta enable row level security;
alter table public.google_reviews enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'booking-uploads',
  'booking-uploads',
  false,
  4194304,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
