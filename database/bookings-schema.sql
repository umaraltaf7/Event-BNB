-- ========================================
-- BOOKING & APPROVAL SYSTEM SCHEMA
-- ========================================

-- 1. TYPES
-- ========================================

-- Booking statuses
create type public.booking_status as enum ('pending', 'confirmed', 'rejected', 'cancelled');

-- 2. TABLES
-- ========================================

-- Bookings table (add if missing)
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  phone_number text not null,
  id_card_number text not null,
  booking_date date not null,
  booking_time time without time zone not null,
  note text,
  status public.booking_status not null default 'pending',
  lister_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Prevent double booking per event per date per time
  constraint unique_event_date_time unique (event_id, booking_date, booking_time)
);

-- Indexes for performance
create index bookings_user_id_idx on public.bookings (user_id);
create index bookings_event_id_idx on public.bookings (event_id);
create index bookings_status_idx on public.bookings (status);

-- 3. TRIGGERS
-- ========================================

-- Update the updated_at column automatically
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_bookings_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

-- 4. ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on bookings table
alter table public.bookings enable row level security;

-- Users can see their own bookings
create policy "bookings_select_own"
on public.bookings for select
to authenticated
using (user_id = auth.uid());

-- Listers can see bookings for their events
create policy "bookings_select_event_lister"
on public.bookings for select
to authenticated
using (
  exists (
    select 1 from public.events e
    where e.id = bookings.event_id
      and e.lister_id = auth.uid()
  )
);

-- Users can create bookings for themselves
create policy "bookings_insert_own"
on public.bookings for insert
to authenticated
with check (user_id = auth.uid());

-- Only listers can update booking status
create policy "bookings_update_lister_only"
on public.bookings for update
to authenticated
using (
  exists (
    select 1 from public.events e
    where e.id = bookings.event_id
      and e.lister_id = auth.uid()
  )
);

-- 5. EDGE FUNCTION TRIGGER FOR EMAIL NOTIFICATIONS
-- ========================================

create or replace function public.handle_booking_status_change()
returns trigger
language plpgsql
as $$
begin
  -- Only trigger when status changes to 'confirmed'
  if old.status is distinct from new.status and new.status = 'confirmed' then
    -- This will be handled by the Edge Function
    -- The Edge Function will be triggered by a database webhook or called directly
    perform http.post(
      url := 'https://your-project-ref.supabase.co/functions/v1/booking-confirmed',
      body := jsonb_build_object('record', new),
      headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key', true))
    );
  end if;
  return new;
end;
$$;

-- Optional: Create trigger for email notifications (commented out - use Edge Function instead)
-- create trigger booking_status_change_notification
-- after update on public.bookings
-- for each row
-- execute function public.handle_booking_status_change();

-- 6. SAMPLE DATA (OPTIONAL)
-- ========================================

-- Uncomment to insert sample data for testing
-- INSERT INTO public.bookings (user_id, event_id, phone_number, id_card_number, booking_date, booking_time, note)
-- VALUES 
--   ('user-uuid-here', 'event-uuid-here', '+1234567890', 'ID123456', '2024-12-25', '14:00:00', 'Sample booking note');

-- ========================================
-- NOTES:
-- ========================================
-- 1. This assumes 'events' and 'profiles' tables already exist
-- 2. RLS policies ensure users only see their own bookings
-- 3. Listers can only update bookings for their events
-- 4. Unique constraint prevents double booking
-- 5. Email notifications should be handled by Edge Functions
-- 6. All data is stored in Supabase - no client-side caching
