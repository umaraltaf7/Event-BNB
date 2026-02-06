# Booking & Approval System - Implementation Guide

## Overview
This implementation adds a complete booking & approval system to your existing React + Supabase app with minimal changes to the existing codebase.

## Features Implemented
✅ Booking creation with required fields (phone, ID, date, time, note)
✅ Database-level double booking prevention
✅ Lister approval workflow (confirm/reject with message)
✅ User messaging system
✅ Email notifications on confirmation
✅ RLS policies for security
✅ All data stored in Supabase (no client-side caching)

## Database Setup

### 1. Run the SQL Schema
```bash
# Apply the database schema
psql -h YOUR_DB_HOST -U YOUR_USER -d YOUR_DB -f database/bookings-schema.sql
```

### 2. Set Up RLS Policies
The schema includes all necessary RLS policies:
- Users can only see their own bookings
- Listers can only see bookings for their events
- Only listers can update booking status

## Edge Function Setup

### 1. Deploy Email Function
```bash
# Deploy the Edge Function
supabase functions deploy booking-confirmed

# Set environment variables
supabase secrets set RESEND_API_KEY=your_resend_api_key
```

### 2. Configure Email Service
Update the `from` email in `supabase/functions/booking-confirmed/index.ts` to match your domain.

## Frontend Changes Made

### 1. Updated Stores
- **bookingsStore.js**: Replaced mock with real Supabase integration
- Added methods: `addBooking`, `updateBookingStatus`, `fetchBookingsForLister`

### 2. New Components
- **BookingForm.jsx**: Modal form for booking creation
- **BookingApproval.jsx**: Component for lister approval/rejection

### 3. Updated Pages
- **UserDashboard.jsx**: Added booking form and available events display
- **ListerDashboard.jsx**: Added booking approval interface

## Key Features

### Booking Creation
- Required fields: phone number, ID card number, date, time, optional note
- Status starts as 'pending'
- Database constraint prevents double booking per event/date/time
- Graceful error handling for constraint violations

### Approval Workflow
- Listers see pending bookings for their events
- Can confirm (status → 'confirmed') or reject (status → 'rejected')
- Rejections require a message
- Users see rejection messages in their dashboard

### Security
- All RLS policies enforced at database level
- Users can only access their own data
- Listers only see bookings for their events
- Status updates restricted to listers only

### Email Notifications
- Triggered when booking status changes to 'confirmed'
- Uses Resend (or your preferred email service)
- Professional HTML email templates
- Error handling and logging

## Testing the System

### 1. Create Test Data
```sql
-- Insert a test event (if needed)
INSERT INTO public.events (title, description, location, date, time, price, capacity, category, lister_id)
VALUES ('Test Event', 'Description', 'Test Location', '2024-12-25', '14:00:00', 100, 50, 'Other', 'lister-user-id');
```

### 2. Test User Flow
1. User logs in and goes to dashboard
2. Clicks "Book Now" on an available event
3. Fills out booking form
4. Booking appears as "pending"

### 3. Test Lister Flow
1. Lister logs in and goes to dashboard
2. Clicks "View All Bookings" or "View Bookings" on an event
3. Sees pending booking with user details
4. Can confirm or reject with message

### 4. Test Email
1. Confirm a booking as lister
2. Check that email is sent to user
3. Verify email content and formatting

## Error Handling

### Double Booking Prevention
- Database constraint: `unique_event_date_time`
- Frontend gracefully handles constraint violations
- User-friendly error message: "This time slot is already booked"

### RLS Violations
- All queries include proper user context
- Error messages are logged but not exposed to users
- Fallback to empty results if permissions are missing

## Deployment Checklist

### Database
- [ ] Run bookings-schema.sql
- [ ] Verify RLS policies are active
- [ ] Test unique constraint works

### Edge Functions
- [ ] Deploy booking-confirmed function
- [ ] Set RESEND_API_KEY secret
- [ ] Test email delivery

### Frontend
- [ ] Update imports in components
- [ ] Test booking creation flow
- [ ] Test approval workflow
- [ ] Verify error handling

### Security
- [ ] Confirm RLS policies work correctly
- [ ] Test user isolation
- [ ] Verify lister permissions

## Troubleshooting

### Common Issues
1. **Bookings not appearing**: Check RLS policies and user authentication
2. **Email not sending**: Verify RESEND_API_KEY and Edge Function logs
3. **Double booking allowed**: Ensure unique constraint exists
4. **Permission errors**: Check that users have proper roles in profiles table

### Debugging
- Check browser console for frontend errors
- Review Supabase logs for database errors
- Monitor Edge Function logs for email issues

## Next Steps

1. **Customize email templates** with your branding
2. **Add booking reminders** (Edge Function + cron)
3. **Implement booking modifications** (date/time changes)
4. **Add payment integration** if needed
5. **Create admin dashboard** for oversight

## Support

For issues with:
- Database schema: Check SQL logs
- Edge Functions: Review function logs
- Frontend: Check browser console
- RLS policies: Verify user roles and permissions
